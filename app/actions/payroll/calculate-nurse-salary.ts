"use server";

import { createSupabaseServerClient } from "@/app/actions/authentication/auth";
import { getOrgMappings } from "@/app/utils/org-utils";
import { SupabaseClient } from '@supabase/supabase-js';

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

interface AssignmentData {
  salary_per_day: number;
  standard_shift_hours: number;
}

interface SkippedRecord {
  id: number;
  date: string;
  reason: string;
}

interface SalaryPayment {
  id: number;
  pay_period_start: string;
  pay_period_end: string;
}

interface CalculationResult {
  success: boolean;
  error?: string;
  nurseId?: number;
  startDate?: string;
  endDate?: string;
  salary: number;
  netSalary?: number;
  daysWorked: number;
  hoursWorked: number;
  skippedRecords: SkippedRecord[];
  info?: string;
  overlappingPayments?: SalaryPayment[];
}

/**
 * Check if two date ranges overlap
 */
function hasDateOverlap(
  start1: string,
  end1: string,
  start2: string,
  end2: string
): boolean {
  return start1 <= end2 && end1 >= start2;
}

/**
 * Check for overlapping salary payments
 */
async function checkOverlappingPayments(
  supabase: SupabaseClient,
  nurseId: number,
  startDate: string,
  endDate: string,
  excludeId?: number
): Promise<{ hasOverlap: boolean; overlapping?: SalaryPayment[]; error?: string }> {
  const query = supabase
    .from("salary_payments")
    .select("id, pay_period_start, pay_period_end")
    .eq("nurse_id", nurseId);

  if (excludeId) {
    query.neq("id", excludeId);
  }

  const { data: payments, error } = await query;

  if (error) {
    return { hasOverlap: false, error: error.message };
  }

  const overlapping = payments?.filter((payment: SalaryPayment) =>
    hasDateOverlap(
      startDate,
      endDate,
      payment.pay_period_start,
      payment.pay_period_end
    )
  );

  return {
    hasOverlap: overlapping && overlapping.length > 0,
    overlapping: overlapping || undefined,
  };
}

/**
 * Build salary breakdown info string
 */
function buildSalaryInfo(
  daysWorked: number,
  salaryDayMap: Map<number, number>,
  skippedRecords: SkippedRecord[]
): string {
  let info = `${daysWorked} days`;

  if (salaryDayMap.size > 0) {
    const breakdown = Array.from(salaryDayMap.entries())
      .map(([salary, count]) => `${count} days (${salary}/day)`)
      .join(", ");
    info += ` [${breakdown}]`;
  }

  if (skippedRecords.length > 0) {
    const missingDataCount = skippedRecords.filter(
      (r) => r.reason === "Missing attendance data"
    ).length;
    const invalidHoursCount = skippedRecords.filter(
      (r) => r.reason === "Invalid or zero worked hours"
    ).length;
    const noAssignmentCount = skippedRecords.filter(
      (r) => r.reason === "No valid nurse_client assignment"
    ).length;

    info += ` | SKIPPED: ${skippedRecords.length} records`;
    const details: string[] = [];
    if (missingDataCount > 0) details.push(`${missingDataCount} missing data`);
    if (invalidHoursCount > 0) details.push(`${invalidHoursCount} invalid hours`);
    if (noAssignmentCount > 0) details.push(`${noAssignmentCount} no assignment`);
    if (details.length > 0) {
      info += ` (${details.join(", ")})`;
    }
  }

  return info;
}

/**
 * Validate date range
 */
function validateDateRange(startDate: string, endDate: string): string | null {
  if (startDate > endDate) {
    return "Start date must be before or equal to end date";
  }
  return null;
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
}): Promise<CalculationResult> {
  const supabase = await createSupabaseServerClient();

  const dateError = validateDateRange(startDate, endDate);
  if (dateError) {
    return {
      success: false,
      error: dateError,
      salary: 0,
      daysWorked: 0,
      hoursWorked: 0,
      skippedRecords: [],
    };
  }

  console.log(`Calculating salary for nurseId=${nurseId}, startDate=${startDate}, endDate=${endDate}, id=${id}`);

  const overlapCheck = await checkOverlappingPayments(
    supabase,
    nurseId,
    startDate,
    endDate,
    id
  );

  if (overlapCheck.error) {
    return {
      success: false,
      error: overlapCheck.error,
      salary: 0,
      daysWorked: 0,
      hoursWorked: 0,
      skippedRecords: [],
    };
  }

  if (overlapCheck.hasOverlap) {
    console.log("Overlapping payments found:", overlapCheck.overlapping);
    return {
      success: false,
      error: "A salary payment for this nurse already exists for an overlapping period.",
      salary: 0,
      daysWorked: 0,
      hoursWorked: 0,
      skippedRecords: [],
      overlappingPayments: overlapCheck.overlapping,
    };
  }

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

  // Build assignment map and collect valid IDs
  const assignmentMap = new Map<number, AssignmentData>();
  const assignmentIds: number[] = [];
  const skippedAssignments: Array<{ id: number; reason: string }> = [];

  for (const assignment of nurseClients ?? []) {
    if (
      !assignment.shift_start_time ||
      !assignment.shift_end_time ||
      !assignment.salary_per_day
    ) {
      skippedAssignments.push({
        id: assignment.id,
        reason: "Missing shift or salary data",
      });
      continue;
    }

    const shiftHours = calculateShiftHours(
      assignment.shift_start_time,
      assignment.shift_end_time
    );

    if (shiftHours <= 0) {
      skippedAssignments.push({
        id: assignment.id,
        reason: "Invalid shift hours",
      });
      continue;
    }

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
      info: "0 days | No valid assignments found",
    };
  }

  const { data: attendanceRecords, error: attendanceError } = await supabase
    .from("attendence_individual")
    .select("id, date, total_hours, assigned_id, start_time, end_time")
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

  // Process attendance records
  let totalSalary = 0;
  let totalBillableHours = 0;
  let totalActualHours = 0;
  let daysWorked = 0;
  const skippedRecords: SkippedRecord[] = [];
  const salaryDayMap = new Map<number, number>();

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

    // Trim and validate attendance data
    const startTime = record.start_time?.trim();
    const endTime = record.end_time?.trim();
    const totalHours = record.total_hours?.trim();

    if (!startTime || !endTime || !totalHours) {
      skippedRecords.push({
        id: record.id,
        date: record.date,
        reason: "Missing attendance data",
      });
      continue;
    }

    const workedHours = parseWorkedHours(totalHours);

    if (workedHours <= 0) {
      skippedRecords.push({
        id: record.id,
        date: record.date,
        reason: "Invalid or zero worked hours",
      });
      continue;
    }

    // Calculate billable hours (capped at standard shift hours)
    const billableHours = Math.min(workedHours, assignment.standard_shift_hours);
    const hourlyRate = assignment.salary_per_day / assignment.standard_shift_hours;
    const dayEarnings = billableHours * hourlyRate;

    totalSalary += dayEarnings;
    totalBillableHours += billableHours;
    totalActualHours += workedHours;
    daysWorked += 1;

    // Track days per salary rate
    const prev = salaryDayMap.get(assignment.salary_per_day) || 0;
    salaryDayMap.set(assignment.salary_per_day, prev + 1);
  }

  // Build info string
  const info = buildSalaryInfo(daysWorked, salaryDayMap, skippedRecords);

  // Calculate average hourly rate
  const averageHourlyRate =
    totalActualHours > 0
      ? Number((totalSalary / totalActualHours).toFixed(2))
      : 0;

  // Round values
  const finalSalary = Number(totalSalary.toFixed(2));
  const finalHours = Number(totalBillableHours.toFixed(2));

  // Prepare payment data
  const paymentData = {
    nurse_id: nurseId,
    pay_period_start: startDate,
    pay_period_end: endDate,
    days_worked: daysWorked,
    hours_worked: finalHours,
    salary: finalSalary,
    net_salary: finalSalary,
    payment_status: "pending",
    info,
    reviewed: false,
    skipped_records_count: skippedRecords.length,
    skipped_records_details: skippedRecords.length > 0 ? skippedRecords : null,
    average_hourly_rate: averageHourlyRate,
  };

  // Insert or update salary payment
  let upsertError;
  if (id) {
    const { error } = await supabase
      .from("salary_payments")
      .update(paymentData)
      .eq("id", id);
    upsertError = error;
  } else {
    const { error } = await supabase
      .from("salary_payments")
      .insert([paymentData]);
    upsertError = error;
  }

  if (upsertError) {
    return {
      success: false,
      error: upsertError.message,
      salary: finalSalary,
      daysWorked,
      hoursWorked: finalHours,
      skippedRecords,
      info,
    };
  }

  return {
    success: true,
    nurseId,
    startDate,
    endDate,
    salary: finalSalary,
    netSalary: finalSalary,
    daysWorked,
    hoursWorked: finalHours,
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