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