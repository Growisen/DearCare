"use server";

import { createSupabaseServerClient } from "@/app/actions/authentication/auth";
import { getOrgMappings } from "@/app/utils/org-utils";

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
  id,
}: {
  nurseId: number;
  startDate: string;
  endDate: string;
  id?: number;
}) {
  const supabase = await createSupabaseServerClient();

  const { data: nurseClients, error: nurseClientError } = await supabase
    .from("nurse_client")
    .select(
      `
      id,
      nurse_id,
      salary_per_day,
      shift_start_time,
      shift_end_time,
      attendance_mode,
      calculated_attendance_days,
      shift_start_datetime,
      shift_end_datetime,
      start_date,
      end_date
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const assignmentMap = new Map<number, any>();
  const assignmentIds: number[] = [];
  const shiftBasedAssignments: number[] = [];
  for (const assignment of nurseClients ?? []) {
    // Check if this is a shift-based assignment
    if (assignment.attendance_mode === 'shift_based') {
      // Handle shift-based attendance
      if (!assignment.salary_per_day) continue;
      
      assignmentMap.set(assignment.id, {
        salary_per_day: assignment.salary_per_day,
        attendance_mode: 'shift_based',
        calculated_attendance_days: assignment.calculated_attendance_days || 0,
        shift_start_datetime: assignment.shift_start_datetime,
        shift_end_datetime: assignment.shift_end_datetime,
      });
      shiftBasedAssignments.push(assignment.id);
    } else {
      // Handle daily attendance (existing logic)
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
        attendance_mode: 'daily',
      });
      assignmentIds.push(assignment.id);
    }
  }

  if (assignmentIds.length === 0 && shiftBasedAssignments.length === 0) {
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

  // Initialize calculation variables
  let totalSalary = 0;
  let totalBillableHours = 0;
  let totalActualHours = 0;
  let daysWorked = 0;
  const skippedRecords: Array<{ id: number; date: string; reason: string }> = [];
  const salaryDayMap = new Map<number, number>();

  // ============================================================================
  // PART 1: Calculate salary for SHIFT-BASED assignments
  // ============================================================================
  
  for (const assignmentId of shiftBasedAssignments) {
    const assignment = assignmentMap.get(assignmentId);
    if (!assignment) continue;

    // Check if shift is within the salary calculation period
    if (assignment.shift_start_datetime && assignment.shift_end_datetime) {
      const shiftStart = new Date(assignment.shift_start_datetime);
      const shiftEnd = new Date(assignment.shift_end_datetime);
      const periodStart = new Date(startDate);
      const periodEnd = new Date(endDate);

      // Only include shifts that overlap with the calculation period
      if (shiftEnd >= periodStart && shiftStart <= periodEnd) {
        const attendanceDays = assignment.calculated_attendance_days || 0;
        
        if (attendanceDays > 0) {
          const shiftSalary = attendanceDays * assignment.salary_per_day;
          totalSalary += shiftSalary;
          
          // Convert days to hours for display (assuming 24 hours per day)
          const shiftHours = attendanceDays * 24;
          totalBillableHours += shiftHours;
          totalActualHours += shiftHours;
          
          // Track days worked
          daysWorked += attendanceDays;
          
          // Track salary breakdown
          const prev = salaryDayMap.get(assignment.salary_per_day) || 0;
          salaryDayMap.set(assignment.salary_per_day, prev + attendanceDays);
        }
      }
    } else if (!assignment.shift_start_datetime) {
      // Shift not started yet - skip with reason
      skippedRecords.push({
        id: assignmentId,
        date: startDate,
        reason: "Shift-based assignment not started",
      });
    } else if (!assignment.shift_end_datetime) {
      // Shift in progress - skip with reason
      skippedRecords.push({
        id: assignmentId,
        date: startDate,
        reason: "Shift-based assignment still in progress",
      });
    }
  }

  // ============================================================================
  // PART 2: Calculate salary for DAILY attendance assignments
  // ============================================================================

  if (assignmentIds.length > 0) {
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
        salary: Number(totalSalary.toFixed(2)),
        daysWorked,
        hoursWorked: Number(totalBillableHours.toFixed(2)),
        skippedRecords,
      };
    }

    for (const record of attendanceRecords ?? []) {
      const assignment = assignmentMap.get(record.assigned_id);
      if (!assignment || assignment.attendance_mode !== 'daily') {
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
      totalBillableHours += billableHours;
      totalActualHours += workedHours;
      daysWorked += 1;

      const prev = salaryDayMap.get(assignment.salary_per_day) || 0;
      salaryDayMap.set(assignment.salary_per_day, prev + 1);
    }
  }

  let salaryBreakdown = "";
  if (salaryDayMap.size > 0) {
    salaryBreakdown = Array.from(salaryDayMap.entries())
      .map(([salary, count]) => {
        // Format fractional days properly (e.g., 1.5 days instead of 1.50 days)
        const formattedCount = count % 1 === 0 ? count.toString() : count.toFixed(2);
        return `${formattedCount} days (${salary}/day)`;
      })
      .join(", ");
  }

  // Round daysWorked for display
  const roundedDaysWorked = Math.round(daysWorked * 100) / 100;

  let info = `${roundedDaysWorked} days`;
  if (salaryBreakdown) {
    info += ` [${salaryBreakdown}]`;
  }
  if (skippedRecords.length > 0) {
    const missingDataCount = skippedRecords.filter(r => r.reason === "Missing attendance data").length;
    const invalidHoursCount = skippedRecords.filter(r => r.reason === "Invalid or zero worked hours").length;
    const shiftNotStartedCount = skippedRecords.filter(r => r.reason === "Shift-based assignment not started").length;
    const shiftInProgressCount = skippedRecords.filter(r => r.reason === "Shift-based assignment still in progress").length;
    
    const skipReasons: string[] = [];
    if (missingDataCount > 0) skipReasons.push(`${missingDataCount} missing data`);
    if (invalidHoursCount > 0) skipReasons.push(`${invalidHoursCount} invalid hours`);
    if (shiftNotStartedCount > 0) skipReasons.push(`${shiftNotStartedCount} shift not started`);
    if (shiftInProgressCount > 0) skipReasons.push(`${shiftInProgressCount} shift in progress`);
    
    info += ` | SKIPPED: ${skippedRecords.length} records (${skipReasons.join(", ")})`;
  }

  const averageHourlyRate = totalActualHours > 0 ? Number((totalSalary / totalActualHours).toFixed(2)) : 0;

  let upsertError;
  if (id) {
    const { error } = await supabase
      .from("salary_payments")
      .update({
        nurse_id: nurseId,
        pay_period_start: startDate,
        pay_period_end: endDate,
        days_worked: roundedDaysWorked,
        hours_worked: Number(totalBillableHours.toFixed(2)),
        salary: Number(totalSalary.toFixed(2)),
        net_salary: Number(totalSalary.toFixed(2)),
        payment_status: "pending",
        info,
        reviewed: false,
        skipped_records_count: skippedRecords.length,
        skipped_records_details: skippedRecords.length > 0 ? skippedRecords : null,
        average_hourly_rate: averageHourlyRate,
      })
      .eq("id", id);
    upsertError = error;
  } else {
    const { error } = await supabase
      .from("salary_payments")
      .insert([
        {
          nurse_id: nurseId,
          pay_period_start: startDate,
          pay_period_end: endDate,
          days_worked: daysWorked,
          hours_worked: Number(totalBillableHours.toFixed(2)),
          salary: Number(totalSalary.toFixed(2)),
          net_salary: Number(totalSalary.toFixed(2)),
          payment_status: "pending",
          info,
          reviewed: false,
          skipped_records_count: skippedRecords.length,
          skipped_records_details: skippedRecords.length > 0 ? skippedRecords : null,
          average_hourly_rate: averageHourlyRate,
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
      hoursWorked: Number(totalBillableHours.toFixed(2)),
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
    netSalary: Number(totalSalary.toFixed(2)),
    daysWorked,
    hoursWorked: Number(totalBillableHours.toFixed(2)),
    skippedRecords,
    info,
  };
}


export async function addNurseBonus({
  paymentId,
  bonusAmount,
  bonusReason,
}: {
  paymentId: number;
  bonusAmount: number;
  bonusReason: string;
}) {
  if (!paymentId || bonusAmount <= 0) {
    return {
      success: false,
      error: "Invalid payment ID or bonus amount",
    };
  }

  const supabase = await createSupabaseServerClient();

  const { data: paymentRecord, error: fetchError } = await supabase
    .from("salary_payments")
    .select("id, salary, bonus, deduction, info, net_salary")
    .eq("id", paymentId)
    .single();

  if (fetchError) {
    return {
      success: false,
      error: fetchError.message,
    };
  }

  if (!paymentRecord) {
    return {
      success: false,
      error: "Payment record not found",
    };
  }

  const currentBonus = paymentRecord.bonus || 0;
  const newBonus = currentBonus + bonusAmount;
  
  const baseSalary = paymentRecord.salary || 0;
  const currentDeduction = paymentRecord.deduction || 0;
  const newNetSalary = baseSalary + newBonus - currentDeduction;

  let updatedInfo = paymentRecord.info || "";
  const bonusInfo = ` | BONUS: ${bonusAmount.toFixed(2)} (${bonusReason})`;
  
  updatedInfo += bonusInfo;

  const { error: updateError } = await supabase
    .from("salary_payments")
    .update({
      bonus: newBonus,
      net_salary: newNetSalary,
      info: updatedInfo,
    })
    .eq("id", paymentId);

  if (updateError) {
    return {
      success: false,
      error: updateError.message,
    };
  }

  return {
    success: true,
    paymentId,
    previousBonus: currentBonus,
    newBonus,
    bonusAmount,
    bonusReason,
    baseSalary,
    netSalary: newNetSalary,
    updatedInfo,
  };
}



export async function addNurseSalaryDeduction({
  paymentId,
  deductionAmount,
  deductionReason,
}: {
  paymentId: number;
  deductionAmount: number;
  deductionReason: string;
}) {
  if (!paymentId || deductionAmount <= 0) {
    return {
      success: false,
      error: "Invalid payment ID or deduction amount",
    };
  }

  const supabase = await createSupabaseServerClient();

  const { data: paymentRecord, error: fetchError } = await supabase
    .from("salary_payments")
    .select("id, salary, deduction, info, net_salary, bonus")
    .eq("id", paymentId)
    .single();

  if (fetchError) {
    return {
      success: false,
      error: fetchError.message,
    };
  }

  if (!paymentRecord) {
    return {
      success: false,
      error: "Payment record not found",
    };
  }

  const currentDeduction = paymentRecord.deduction || 0;
  const newDeduction = currentDeduction + deductionAmount;

  const baseSalary = paymentRecord.salary || 0;
  const bonus = paymentRecord.bonus || 0;
  const newNetSalary = baseSalary + bonus - newDeduction;

  let updatedInfo = paymentRecord.info || "";
  const deductionInfo = ` | DEDUCTION: ${deductionAmount.toFixed(2)} (${deductionReason})`;

  if (!updatedInfo.includes(" | DEDUCTION:")) {
    updatedInfo += deductionInfo;
  } else {
    updatedInfo += deductionInfo;
  }

  const { error: updateError } = await supabase
    .from("salary_payments")
    .update({
      deduction: newDeduction,
      net_salary: newNetSalary,
      info: updatedInfo,
    })
    .eq("id", paymentId);

  if (updateError) {
    return {
      success: false,
      error: updateError.message,
    };
  }

  return {
    success: true,
    paymentId,
    previousDeduction: currentDeduction,
    newDeduction,
    deductionAmount,
    deductionReason,
    baseSalary,
    bonus,
    netSalary: newNetSalary,
    updatedInfo,
  };
}


interface NurseInfo {
  nurse_id: number;
  first_name: string;
  last_name: string;
  nurse_reg_no: string;
}

export interface SalaryPaymentRecord {
  id: number;
  nurse_id: number;
  pay_period_start: string;
  pay_period_end: string;
  days_worked: number;
  hours_worked: number;
  salary: number;
  net_salary: number;
  payment_status: string;
  info: string;
  reviewed: boolean;
  skipped_records_count: number;
  skipped_records_details: unknown;
  bonus?: number;
  nurses?: NurseInfo;
  name: string;
  nurse_reg_no: string;
  [key: string]: unknown;
}


export async function fetchSalaryPaymentsWithNurseInfo({
  page = 1,
  pageSize = 20,
  search = "",
}: {
  page?: number;
  pageSize?: number;
  search?: string;
}) {
  const supabase = await createSupabaseServerClient();

  const { data: { user } } = await supabase.auth.getUser();
  const organization = user?.user_metadata?.organization;
  const { nursesOrg } = getOrgMappings(organization);

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  console.log("Fetching salary payments for nursesOrg:", nursesOrg);

  let query = supabase
  .from("salary_payments")
  .select(`
    *,
    nurses!inner (
      nurse_id,
      first_name,
      last_name,
      nurse_reg_no,
      admitted_type
    )
  `)
  .eq("nurses.admitted_type", nursesOrg);


  query = query.range(from, to);

  const { data, error } = await query;


  console.log("Fetched salary payments data:", data, "Error:", error);

  if (error) {
    return {
      success: false,
      error: error.message,
      records: [],
      page,
      pageSize,
      total: 0,
    };
  }

  // Filter in JS if search is provided
  let records = (data ?? []);
  if (search.trim()) {
    const lowerSearch = search.trim().toLowerCase();
    records = records.filter((record: SalaryPaymentRecord) => {
      const nurse = record.nurses;
      return nurse &&
        (
          nurse.first_name?.toLowerCase().includes(lowerSearch) ||
          nurse.last_name?.toLowerCase().includes(lowerSearch) ||
          nurse.nurse_reg_no?.toLowerCase().includes(lowerSearch)
        );
    });
  }

  records = records.map((record: SalaryPaymentRecord) => ({
    ...record,
    name: record.nurses
      ? `${record.nurses.first_name} ${record.nurses.last_name}`.trim()
      : "",
    nurse_reg_no: record.nurses?.nurse_reg_no ?? "",
    nurse_id: record.nurses?.nurse_id ?? record.nurse_id,
  }));

  return {
    success: true,
    records,
    page,
    pageSize,
    total: records.length,
  };
}