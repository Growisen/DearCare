"use server"

import { createSupabaseServerClient } from './auth'
import { StaffSalary } from '@/types/staffSalary.types'

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
}

interface AttendanceRecord {
  id: number;
  date: string;
  total_hours: string | null;
  assigned_id: number;
  nurse_client: NurseClient | NurseClient[] | null;
}

export async function fetchNurseHoursWorked(
    dateFrom?: string,
    dateTo?: string,
    organization?: string
): Promise<{ 
    success: boolean; 
    data: StaffSalary[]; 
    error?: string 
}> {
    try {
    const supabase = await createSupabaseServerClient();

    let normalizedOrganization = organization;
    if (organization) {
        if (organization.toLowerCase().includes('dearcare')) {
            normalizedOrganization = "Dearcare_Llp";
        } else if (organization.toLowerCase().includes('tata')) {
            normalizedOrganization = "Tata_Homenursing";
        }
    } else {
        normalizedOrganization = "all";
    }
    
    let attendanceQuery = supabase
        .from('attendence_individual')
        .select(`
        id,
        date,
        total_hours,
        assigned_id,
        nurse_client:assigned_id (
            nurse_id,
            nurse:nurse_id (
            nurse_id,
            first_name,
            last_name,
            nurse_reg_no,
            admitted_type
            )
        )
        `);
    
    if (dateFrom) {
        attendanceQuery = attendanceQuery.gte('date', dateFrom);
    }
    
    if (dateTo) {
        attendanceQuery = attendanceQuery.lte('date', dateTo);
    }
    
    if (normalizedOrganization && normalizedOrganization !== 'all') {
      attendanceQuery = attendanceQuery.eq('nurse_client.nurse.admitted_type', normalizedOrganization);
  }
    
    const { data: attendanceRecords, error: attendanceError } = await attendanceQuery;
    
    if (attendanceError) {
        throw new Error(attendanceError.message);
    }
    
    const nurseHoursMap = new Map<number, {
        id: number;
        name: string;
        regNo: string;
        hours: number;
        organization: string;
    }>();
    
    attendanceRecords.forEach((record: AttendanceRecord) => {
        if (record.nurse_client) {
          const nurseClientArray = Array.isArray(record.nurse_client) 
            ? record.nurse_client 
            : [record.nurse_client];
          
            nurseClientArray.forEach(nurseClient => {
                let nurse = nurseClient.nurse;
                
                if (!nurseClient) {
                  return;
                }
                
                if (!nurse) {
                  return;
                }
                
                if (Array.isArray(nurse)) {
                  nurse = nurse[0];
                  if (!nurse) {
                    return;
                  }
                }
                
                if (normalizedOrganization && normalizedOrganization !== 'all' && nurse.admitted_type !== normalizedOrganization) {
                  return;
                }
              
                
                const nurseId = nurse.nurse_id;
                
                if (!nurseHoursMap.has(nurseId)) {
                  nurseHoursMap.set(nurseId, {
                    id: nurseId,
                    name: `${nurse.first_name} ${nurse.last_name}`,
                    regNo: nurse.nurse_reg_no || '',
                    hours: 0,
                    organization: nurse.admitted_type || ''
                  });
                }
            
            const nurseData = nurseHoursMap.get(nurseId)!;
            
            if (record.total_hours) {
              const [hours, minutes] = record.total_hours.split(':').map(Number);
              nurseData.hours += hours + (minutes / 60);
            }
          });
        }
      });
    
      const processedData: StaffSalary[] = Array.from(nurseHoursMap.values()).map(nurse => {
        const totalHoursDecimal = nurse.hours;
        const hours = Math.floor(totalHoursDecimal);
        const minutes = Math.round((totalHoursDecimal - hours) * 60);
        
        const formattedHours = `${hours}hrs:${minutes.toString().padStart(2, '0')}min`;
        
        return {
          id: nurse.id,
          name: nurse.name,
          regNo: nurse.regNo,
          hours: formattedHours,
          salary: 0
        };
      });
    
    return {
      success: true,
      data: processedData
    };
  } catch (error) {
    console.error('Error fetching nurse hours worked:', error);
    return {
      success: false,
      data: [],
      error: error instanceof Error ? error.message : 'An unknown error occurred'
    };
  }
}