"use server";

import { createSupabaseServerClient } from "@/app/actions/authentication/auth";

function calculateShiftHours(startTime: string, endTime: string): number {
  try {
    const [startHour, startMin] = startTime.split(":").map(Number);
    const [endHour, endMin] = endTime.split(":").map(Number);

    if (
      isNaN(startHour) ||
      isNaN(startMin) ||
      isNaN(endHour) ||
      isNaN(endMin)
    ) {
      throw new Error(`Invalid time format: ${startTime} - ${endTime}`);
    }

    // Special case: 00:00 to 00:00 means 24h shift
    if (
      startHour === 0 &&
      startMin === 0 &&
      endHour === 0 &&
      endMin === 0
    ) {
      return 24;
    }

    const startMinutes = startHour * 60 + startMin;
    let endMinutes = endHour * 60 + endMin;

    if (endMinutes < startMinutes) {
      endMinutes += 24 * 60;
    }

    return Math.max(0, (endMinutes - startMinutes) / 60);
  } catch {
    return 8;
  }
}

function parseWorkedHours(hoursStr: string | null): number {
  if (!hoursStr || typeof hoursStr !== "string") return 0;
  try {
    const [hours, minutes = 0] = hoursStr.split(":").map(Number);
    if (isNaN(hours) || isNaN(minutes)) return 0;
    return Math.max(0, hours + minutes / 60);
  } catch {
    return 0;
  }
}

export async function calculateNurseSalary({
  nurseId,
  startDate,
  endDate,
  id, // <-- add id to the argument list
}: {
  nurseId: number;
  startDate: string;
  endDate: string;
  id?: number; // <-- make id optional
}) {
  const supabase = await createSupabaseServerClient();

  // 1. Get nurse_client assignments for this nurse
  const { data: nurseClients, error: nurseClientError } = await supabase
    .from("nurse_client")
    .select(
      `
      id,
      nurse_id,
      salary_per_day,
      shift_start_time,
      shift_end_time
    `
    )
    .eq("nurse_id", nurseId);

  if (nurseClientError) {
    return {
      success: false,
      error: nurseClientError.message,
      salary: 0,
      daysWorked: 0,
      hoursWorked: 0,
      skippedRecords: [],
    };
  }

  // 2. Map assignments for quick lookup and collect assignment IDs
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const assignmentMap = new Map<number, any>();
  const assignmentIds: number[] = [];
  for (const assignment of nurseClients ?? []) {
    if (
      !assignment.shift_start_time ||
      !assignment.shift_end_time ||
      !assignment.salary_per_day
    ) {
      continue;
    }
    const shiftHours = calculateShiftHours(
      assignment.shift_start_time,
      assignment.shift_end_time
    );
    if (shiftHours <= 0) continue;
    assignmentMap.set(assignment.id, {
      salary_per_day: assignment.salary_per_day,
      standard_shift_hours: shiftHours,
    });
    assignmentIds.push(assignment.id);
  }

  if (assignmentIds.length === 0) {
    return {
      success: true,
      nurseId,
      startDate,
      endDate,
      salary: 0,
      daysWorked: 0,
      hoursWorked: 0,
      skippedRecords: [],
    };
  }

  // 3. Get attendance records for these assignments in the period
  const { data: attendanceRecords, error: attendanceError } = await supabase
    .from("attendence_individual")
    .select(
      "id, date, total_hours, assigned_id, start_time, end_time"
    )
    .in("assigned_id", assignmentIds)
    .gte("date", startDate)
    .lte("date", endDate);

  if (attendanceError) {
    return {
      success: false,
      error: attendanceError.message,
      salary: 0,
      daysWorked: 0,
      hoursWorked: 0,
      skippedRecords: [],
    };
  }

  let totalSalary = 0;
  let totalHours = 0;
  let daysWorked = 0;
  const skippedRecords: Array<{ id: number; date: string; reason: string }> = [];

  for (const record of attendanceRecords ?? []) {
    const assignment = assignmentMap.get(record.assigned_id);
    if (!assignment) {
      skippedRecords.push({
        id: record.id,
        date: record.date,
        reason: "No valid nurse_client assignment",
      });
      continue;
    }
    if (
      !record.start_time ||
      !record.end_time ||
      !record.total_hours ||
      record.start_time.trim() === "" ||
      record.end_time.trim() === "" ||
      record.total_hours.trim() === ""
    ) {
      skippedRecords.push({
        id: record.id,
        date: record.date,
        reason: "Missing attendance data",
      });
      continue;
    }
    const workedHours = parseWorkedHours(record.total_hours);
    if (workedHours <= 0) {
      skippedRecords.push({
        id: record.id,
        date: record.date,
        reason: "Invalid or zero worked hours",
      });
      continue;
    }
    const billableHours = Math.min(
      workedHours,
      assignment.standard_shift_hours
    );
    const hourlyRate =
      assignment.salary_per_day / assignment.standard_shift_hours;
    const dayEarnings = billableHours * hourlyRate;

    totalSalary += dayEarnings;
    totalHours += billableHours;
    daysWorked += 1;
  }

  // Add info field similar to edge function
  let info = `${daysWorked} days, ${totalHours.toFixed(2)} hours`;
  if (skippedRecords.length > 0) {
    const missingDataCount = skippedRecords.filter(r => r.reason === "Missing attendance data").length;
    const invalidHoursCount = skippedRecords.filter(r => r.reason === "Invalid or zero worked hours").length;
    info += ` | SKIPPED: ${skippedRecords.length} records (${missingDataCount} missing data, ${invalidHoursCount} invalid hours)`;
  }

  // Upsert or update salary_payments table with the current calculation
  let upsertError;
  if (id) {
    // Update existing record
    const { error } = await supabase
      .from("salary_payments")
      .update({
        nurse_id: nurseId,
        pay_period_start: startDate,
        pay_period_end: endDate,
        days_worked: daysWorked,
        hours_worked: Number(totalHours.toFixed(2)),
        salary: Number(totalSalary.toFixed(2)),
        payment_status: "pending",
        info,
        reviewed: false,
        skipped_records_count: skippedRecords.length,
        skipped_records_details: skippedRecords.length > 0 ? skippedRecords : null,
      })
      .eq("id", id);
    upsertError = error;
  } else {
    // Insert new record
    const { error } = await supabase
      .from("salary_payments")
      .insert([
        {
          nurse_id: nurseId,
          pay_period_start: startDate,
          pay_period_end: endDate,
          days_worked: daysWorked,
          hours_worked: Number(totalHours.toFixed(2)),
          salary: Number(totalSalary.toFixed(2)),
          payment_status: "pending",
          info,
          reviewed: false,
          skipped_records_count: skippedRecords.length,
          skipped_records_details: skippedRecords.length > 0 ? skippedRecords : null,
        }
      ]);
    upsertError = error;
  }

  if (upsertError) {
    return {
      success: false,
      error: upsertError.message,
      salary: Number(totalSalary.toFixed(2)),
      daysWorked,
      hoursWorked: Number(totalHours.toFixed(2)),
      skippedRecords,
      info,
    };
  }

  return {
    success: true,
    nurseId,
    startDate,
    endDate,
    salary: Number(totalSalary.toFixed(2)),
    daysWorked,
    hoursWorked: Number(totalHours.toFixed(2)),
    skippedRecords,
    info,
  };
}