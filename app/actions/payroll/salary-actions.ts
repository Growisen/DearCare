"use server";

import { createSupabaseServerClient } from '@/app/actions/authentication/auth';
import { StaffSalary } from '@/types/staffSalary.types';
import { logger } from '@/utils/logger';

interface Nurse {
  nurse_id: number;
  first_name: string;
  last_name: string;
  nurse_reg_no: string | null;
  admitted_type: string | null;
}

interface NurseClient {
  nurse_id: number;
  nurse: Nurse | Nurse[];
  shift_start_time?: string | null;
  shift_end_time?: string | null;
}

interface AttendanceRecord {
  id: number;
  date: string;
  total_hours: string | null;
  assigned_id: number;
  nurse_client: NurseClient | NurseClient[] | null;
  start_time?: string | null; // This is check_in time
  end_time?: string | null;   // This is check_out time
}

export async function fetchNurseHoursWorked(
  dateFrom?: string,
  dateTo?: string,
  organization?: string
): Promise<{
  success: boolean;
  data: (StaffSalary & { missingFields?: Array<{ field: string; date: string }>; })[];
  error?: string;
}> {
  try {
    const supabase = await createSupabaseServerClient();

    // Normalize organization
    let normalizedOrganization = "all";
    if (organization) {
      const lowerOrg = organization.toLowerCase();
      if (lowerOrg.includes("dearcare")) {
        normalizedOrganization = "Dearcare_Llp";
      } else if (lowerOrg.includes("tata")) {
        normalizedOrganization = "Tata_Homenursing";
      }
    }

    // Build query - Include all fields you want to check for missing values
    let attendanceQuery = supabase
      .from("attendence_individual")
      .select(`
        id,
        date,
        total_hours,
        start_time,
        end_time,
        assigned_id,
        nurse_client:assigned_id (
          nurse_id,
          shift_start_time,
          shift_end_time,
          nurse:nurse_id (
            nurse_id,
            first_name,
            last_name,
            nurse_reg_no,
            admitted_type
          )
        )
      `);

    if (dateFrom) attendanceQuery = attendanceQuery.gte("date", dateFrom);
    if (dateTo) attendanceQuery = attendanceQuery.lte("date", dateTo);
    if (normalizedOrganization !== "all") {
      attendanceQuery = attendanceQuery.eq(
        "nurse_client.nurse.admitted_type",
        normalizedOrganization
      );
    }

    // Execute query
    const { data: attendanceRecords, error: attendanceError } =
      await attendanceQuery;
    if (attendanceError) throw new Error(attendanceError.message);

    const nurseHoursMap = new Map<
      number,
      { id: number; name: string; regNo: string; hours: number; organization: string }
    >();
    const nurseMissingFieldsMap = new Map<number, Array<{ field: string, date: string }>>();

    const addMissingFields = (nurseId: number, fields: string[], date: string) => {
      if (!nurseMissingFieldsMap.has(nurseId)) {
        nurseMissingFieldsMap.set(nurseId, []);
      }
      fields.forEach((f) => {
        nurseMissingFieldsMap.get(nurseId)!.push({ field: f, date });
      });
    };

    const isFieldMissing = (value: unknown): boolean => {
      return value === null || value === undefined || value === '';
    };

    attendanceRecords.forEach((record: AttendanceRecord) => {
      if (!record.nurse_client) return;

      const nurseClients = Array.isArray(record.nurse_client)
        ? record.nurse_client
        : [record.nurse_client];

      nurseClients.forEach((nurseClient) => {
        if (!nurseClient?.nurse) return;

        const nurse = Array.isArray(nurseClient.nurse)
          ? nurseClient.nurse[0]
          : nurseClient.nurse;
        if (!nurse) return;

        const nurseId = nurse.nurse_id;
        if (!nurseHoursMap.has(nurseId)) {
          nurseHoursMap.set(nurseId, {
            id: nurseId,
            name: `${nurse.first_name} ${nurse.last_name}`,
            regNo: nurse.nurse_reg_no || "",
            hours: 0,
            organization: nurse.admitted_type || "",
          });
        }

        const missingFields: string[] = [];
        if (isFieldMissing(record.start_time)) missingFields.push("check_in");
        if (isFieldMissing(record.end_time)) missingFields.push("check_out");
        if (isFieldMissing(record.total_hours)) missingFields.push("total_hours");
        
        if (isFieldMissing(nurseClient.shift_start_time)) missingFields.push("shift_start_time");
        if (isFieldMissing(nurseClient.shift_end_time)) missingFields.push("shift_end_time");
        
        if (missingFields.length > 0) {
          addMissingFields(nurseId, missingFields, record.date);
        }

        if (record.total_hours && !isFieldMissing(record.total_hours)) {
          const [h, m] = record.total_hours.split(":").map(Number);
          if (!isNaN(h) && !isNaN(m)) {
            nurseHoursMap.get(nurseId)!.hours += h + m / 60;
          }
        }
      });
    });

    const processedData: (StaffSalary & { missingFields?: Array<{ field: string, date: string }> })[] = Array.from(
      nurseHoursMap.values()
    ).map((nurse) => {
      const totalHours = nurse.hours;
      let hours = Math.floor(totalHours);
      let minutes = Math.round((totalHours - hours) * 60);

      if (minutes === 60) {
        hours += 1;
        minutes = 0;
      }

      return {
        id: nurse.id,
        name: nurse.name,
        regNo: nurse.regNo,
        hours: `${hours}hrs:${minutes.toString().padStart(2, "0")}min`,
        salary: 0,
        missingFields: nurseMissingFieldsMap.get(nurse.id) ?? [],
      };
    });

    return { success: true, data: processedData };
  } catch (error) {
    logger.error("Error fetching nurse hours worked:", error);
    return {
      success: false,
      data: [],
      error: error instanceof Error ? error.message : "An unknown error occurred",
    };
  }
}

export async function fetchSalaryConfig(nurseId: number) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from('salary_configurations')
    .select('id, hourly_rate')
    .eq('nurse_id', nurseId)
    .eq('is_active', true)
    .order('updated_at', { ascending: false })
    .limit(1)
    .single();

  if (error || !data) {
    return {
      id: null,
      hourlyRate: 0,
    };
  }

  return {
    id: data.id,
    hourlyRate: Number(data.hourly_rate) || 0,
  };
}

export async function upsertSalaryConfig({
  nurseId,
  hourlyRate,
  configId = null,
}: {
  nurseId: number;
  hourlyRate: number;
  configId?: number | null;
}) {
  const supabase = await createSupabaseServerClient();
  const user = await supabase.auth.getUser();
  
  if (configId) {
    // Update existing config
    const { data, error } = await supabase
      .from('salary_configurations')
      .update({
        hourly_rate: hourlyRate,
        updated_by: user.data.user?.id,
        updated_at: new Date().toISOString(),
      })
      .eq('id', configId)
      .eq('nurse_id', nurseId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update salary config: ${error.message}`);
    }
    return data;
  } else {
    // Create new config
    const { data, error } = await supabase
      .from('salary_configurations')
      .insert([{
        nurse_id: nurseId,
        hourly_rate: hourlyRate,
        is_active: true,
        created_by: user.data.user?.id,
        updated_by: user.data.user?.id,
      }])
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create salary config: ${error.message}`);
    }
    return data;
  }
}

export async function saveSalaryPayment({
  nurseId,
  salaryConfigId,
  payPeriodStart,
  payPeriodEnd,
  basePay = 0,
  hourlyRate = 0,
  hoursWorked = 0,
  hourlyPay = 0,
  allowance = 0,
  bonus = 0,
  grossSalary,
  deductions = 0,
  netSalary,
  paymentStatus = 'pending',
  notes = '',
}: {
  nurseId: number;
  salaryConfigId?: number | null;
  payPeriodStart: string;
  payPeriodEnd: string;
  basePay?: number;
  hourlyRate?: number;
  hoursWorked?: number;
  hourlyPay?: number;
  allowance?: number;
  bonus?: number;
  grossSalary: number;
  deductions?: number;
  netSalary: number;
  paymentStatus?: 'pending' | 'paid' | 'cancelled';
  transactionReference?: string;
  notes?: string;
  createdBy?: string;
}) {
  const supabase = await createSupabaseServerClient();
  const user = await supabase.auth.getUser();
  
  const { data, error } = await supabase
    .from('salary_payments')
    .insert([{
      nurse_id: nurseId,
      salary_config_id: salaryConfigId,
      pay_period_start: payPeriodStart,
      pay_period_end: payPeriodEnd,
      base_pay: basePay,
      hourly_rate: hourlyRate,
      hours_worked: hoursWorked,
      hourly_pay: hourlyPay,
      allowance: allowance,
      bonus: bonus,
      gross_salary: grossSalary,
      deductions: deductions,
      net_salary: netSalary,
      payment_status: paymentStatus,
      notes: notes,
      created_by: user.data.user?.id,
      updated_by: user.data.user?.id,
    }])
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to save salary payment: ${error.message}`);
  }
  return data;
}

export async function saveSalaryPaymentWithConfig({
  nurseId,
  payPeriodStart,
  payPeriodEnd,
  hourlyRate,
  hoursWorked,
  currentConfigId = null,
  shouldUpdateConfig = false,
  basePay = 0,
  allowance = 0,
  bonus = 0,
  deductions = 0,
  paymentStatus = 'pending',
  notes = '',
}: {
  nurseId: number;
  payPeriodStart: string;
  payPeriodEnd: string;
  hourlyRate: number;
  hoursWorked: number;
  currentConfigId?: number | null;
  shouldUpdateConfig?: boolean;
  basePay?: number;
  allowance?: number;
  bonus?: number;
  deductions?: number;
  paymentStatus?: 'pending' | 'paid' | 'cancelled';
  notes?: string;
}) {  
  try {
    // Start a transaction-like approach
    let salaryConfigId = currentConfigId;
    
    // Update or create salary config if needed
    if (shouldUpdateConfig || hourlyRate > 0) {
      const configData = await upsertSalaryConfig({
        nurseId,
        hourlyRate,
        configId: currentConfigId,
      });
      salaryConfigId = configData.id;
    }

    const hourlyPay = hourlyRate * hoursWorked;
    const grossSalary = basePay + hourlyPay + allowance + bonus;
    const netSalary = grossSalary - deductions;

    const paymentData = await saveSalaryPayment({
      nurseId,
      salaryConfigId,
      payPeriodStart,
      payPeriodEnd,
      basePay,
      hourlyRate,
      hoursWorked,
      hourlyPay,
      allowance,
      bonus,
      grossSalary,
      deductions,
      netSalary,
      paymentStatus,
      notes,
    });

    return {
      payment: paymentData,
      configId: salaryConfigId,
      grossSalary,
      netSalary,
    };
  } catch (error) {
    console.error('Error in saveSalaryPaymentWithConfig:', error);
    throw error;
  }
}


export async function fetchNurseSalaryPayments(nurseId: number) {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from('salary_payments')
    .select(`
      id,
      pay_period_start,
      pay_period_end,
      pay_date,
      hourly_rate,
      hours_worked,
      hourly_pay,
      net_salary,
      payment_status,
      payment_method,
      transaction_reference,
      notes,
      created_at,
      updated_at,
      salary_config:salary_config_id (
        id,
        hourly_rate
      )
    `)
    .eq('nurse_id', nurseId)
    .order('pay_period_end', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch salary payments: ${error.message}`);
  }

  console.log(data);

  return data ?? [];
}