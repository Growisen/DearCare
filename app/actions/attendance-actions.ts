"use server"

import { createSupabaseServerClient } from './auth'

export type AttendanceRecord = {
  id: number;
  nurseName: string;
  date: string;
  shiftStart: string;
  shiftEnd: string;
  scheduledStart: string;
  scheduledEnd: string;
  hoursWorked: number | string;
  status: string;
  location: string | null;
  nurseId: number | null;
}

interface Nurse {
  nurse_id: number;
  first_name: string;
  last_name: string;
}

interface NurseClient {
  id: number;
  nurse_id: number;
  shift_start_time: string;
  shift_end_time: string;
  nurse: Nurse | Nurse[];
}

// Update the RawAttendanceRecord interface to match the actual data structure
interface RawAttendanceRecord {
  id: number;
  date: string;
  start_time: string | null;
  end_time: string | null;
  total_hours: string | null;
  location: string | null;
  nurse_client: NurseClient | NurseClient[] | null;
}

export interface AssignmentAttendanceDetails {
  id?: number;
  checked_in: boolean;
  check_in_time?: string;
  check_out_time?: string;
  location?: string | null;
  total_hours?: string | null;
  on_leave?: boolean;
  leave_type?: string;
}


// Convert 24-hour format to 12-hour format
function convertTo12HourFormat(time24: string | null): string {
  if (!time24) return '';
  
  try {
    const [hours, minutes] = time24.split(':').map(num => parseInt(num, 10));
    
    if (isNaN(hours) || isNaN(minutes)) return '';
    
    const period = hours >= 12 ? 'PM' : 'AM';
    const hour12 = hours % 12 || 12; // Convert 0 to 12 for 12 AM
    
    return `${hour12}:${minutes.toString().padStart(2, '0')} ${period}`;
  } catch (error) {
    console.error('Error converting time format:', error);
    return '';
  }
}

// export async function fetchStaffAttendance(date?: string): Promise<{ success: boolean; data: AttendanceRecord[]; error?: string }> {
//   try {
//     const supabase = await createSupabaseServerClient();
    
//     const targetDate = date || new Date().toISOString().split('T')[0];
    
//     // Improved query with better joins
//     const { data, error } = await supabase
//       .from('attendence_individual')
//       .select(`
//           id,
//           date,
//           start_time,
//           end_time,
//           total_hours,
//           location,
//           nurse_client:assigned_id (
//             id,
//             nurse_id,
//             shift_start_time,
//             shift_end_time,
//             nurse:nurse_id (
//                 nurse_id,
//                 first_name,
//                 last_name
//             )
//           )
//       `)
//       .eq('date', targetDate);
    
//     if (error) throw new Error(error.message);
    
    
//     const formattedData: AttendanceRecord[] = (data as RawAttendanceRecord[]).map(record => {
//       const actualStart = record.start_time ? convertTo12HourFormat(record.start_time) : '';
//       const actualEnd = record.end_time ? convertTo12HourFormat(record.end_time) : '';
      

//       let nurseClient = null;
//       if (record.nurse_client) {
//         if (Array.isArray(record.nurse_client)) {

//           nurseClient = record.nurse_client.length > 0 ? record.nurse_client[0] : null;
//         } else {

//           nurseClient = record.nurse_client;
//         }
//       }
      
//       const scheduledStart = nurseClient?.shift_start_time ? convertTo12HourFormat(nurseClient.shift_start_time) : '';
//       const scheduledEnd = nurseClient?.shift_end_time ? convertTo12HourFormat(nurseClient.shift_end_time) : '';

//       let status = 'Absent';
//       if (record.start_time) {
//           status = 'Present';

//           if (nurseClient?.shift_start_time && record.start_time) {
//             const expectedMinutes = parseInt(nurseClient.shift_start_time.split(':')[0]) * 60 + parseInt(nurseClient.shift_start_time.split(':')[1]);
//             const actualMinutes = parseInt(record.start_time.split(':')[0]) * 60 + parseInt(record.start_time.split(':')[1]);

//             if (actualMinutes > expectedMinutes + 15) {
//                 status = 'Late';
//             }
//           }
//       }

//       let nurse = null;
//       if (nurseClient?.nurse) {
//         if (Array.isArray(nurseClient.nurse)) {

//           nurse = nurseClient.nurse.length > 0 ? nurseClient.nurse[0] : null;
//         } else {

//           nurse = nurseClient.nurse;
//         }
//       }
        
//       const nurseName = nurse?.first_name && nurse?.last_name
//         ? `${nurse.first_name} ${nurse.last_name}`
//         : 'Unknown Nurse';

//             let hoursWorked: number | string = 0;
//       if (record.total_hours) {
//           if (record.total_hours.includes(':')) {
//               const [hours, minutes] = record.total_hours.split(':').map(Number);
              
//               // Format based on whether there are hours or just minutes
//               if (hours === 0) {
//                   hoursWorked = `${minutes} min`;
//               } else {
//                   hoursWorked = `${hours}h${minutes > 0 ? ' ' + minutes + 'm' : ''}`;
//               }
//           } else {
//               const numHours = parseFloat(record.total_hours);
//               hoursWorked = `${numHours}h`;
//           }
//       } else if (record.start_time && record.end_time) {
//           const start = new Date(`1970-01-01T${record.start_time}`);
//           const end = new Date(`1970-01-01T${record.end_time}`);
//           const totalHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
          
//           // Calculate hours and minutes
//           const hours = Math.floor(totalHours);
//           const minutes = Math.round((totalHours - hours) * 60);
          
//           if (hours === 0) {
//               hoursWorked = `${minutes} min`;
//           } else {
//               hoursWorked = `${hours}h${minutes > 0 ? ' ' + minutes + 'm' : ''}`;
//           }
//       }


//       let locationInfo = record.location;
//       try {
//         if (record.location && typeof record.location === 'string' && 
//             (record.location.startsWith('{') || record.location.startsWith('['))) {
//           const locationObj = JSON.parse(record.location);
//           locationInfo = `${locationObj.latitude}, ${locationObj.longitude}`;
//         }
//       } catch (e) {
//         console.error("Error parsing location data:", e);
//       }

//       return {
//           id: record.id,
//           nurseName,
//           date: record.date,
//           shiftStart: actualStart,
//           shiftEnd: actualEnd,
//           scheduledStart,
//           scheduledEnd,
//           hoursWorked, 
//           status,
//           location: locationInfo
//       };
//     });
    
//     return {
//       success: true,
//       data: formattedData
//     };
//   } catch (error) {
//     console.error('Error fetching attendance records:', error);
//     return {
//       success: false,
//       data: [],
//       error: error instanceof Error ? error.message : 'An unknown error occurred'
//     };
//   }
// }


interface RawAttendanceRecord {
  id: number;
  date: string;
  start_time: string | null;
  end_time: string | null;
  total_hours: string | null;
  location: string | null;
  assigned_id: number | null;
  nurse_client: NurseClient | NurseClient[] | null;
}

export async function fetchStaffAttendance(
  date?: string,
  page: number = 1,
  pageSize: number = 50,
  includeAbsent: boolean = true
): Promise<{ 
  success: boolean; 
  data: AttendanceRecord[]; 
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalRecords: number;
    pageSize: number;
  };
  error?: string 
}> {
  try {
    const supabase = await createSupabaseServerClient();
    const targetDate = date || new Date().toISOString().split('T')[0];
    
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    
    const attendanceQuery = supabase
      .from('attendence_individual')
      .select(`
        id,
        date,
        start_time,
        end_time,
        total_hours,
        location,
        assigned_id,
        nurse_client:assigned_id (
          id,
          nurse_id,
          shift_start_time,
          shift_end_time,
          nurse:nurse_id (
            nurse_id,
            first_name,
            last_name
          )
        )
      `, { count: 'exact' })
      .eq('date', targetDate);
    
    if (!includeAbsent) {
      attendanceQuery.range(from, to);
    }
    
    const { data: attendanceData, error: attendanceError, count: attendanceCount } = await attendanceQuery;
    
    if (attendanceError) throw new Error(attendanceError.message);
    
    const presentAssignmentIds = new Set((attendanceData as RawAttendanceRecord[])
      .map(record => record.assigned_id)
      .filter(id => id !== null));
    
    const formattedAttendanceData: AttendanceRecord[] = (attendanceData as RawAttendanceRecord[]).map(record => {
      return processAttendanceRecord(record);
    });
    
    let absentRecords: AttendanceRecord[] = [];
    
    if (includeAbsent) {
      const { data: scheduledNurses, error: scheduledError } = await supabase
        .from('nurse_client')
        .select(`
          id,
          nurse_id,
          shift_start_time,
          shift_end_time,
          start_date,
          end_date,
          nurse:nurse_id (
            nurse_id,
            first_name,
            last_name
          )
        `, { count: 'exact' })
        .lte('start_date', targetDate)
        .gte('end_date', targetDate);
      
      if (scheduledError) throw new Error(scheduledError.message);
      
      if (scheduledNurses) {
        absentRecords = await Promise.all(scheduledNurses
          .filter(assignment => !presentAssignmentIds.has(assignment.id))
          .map(assignment => processAbsentNurse(assignment, targetDate))
        );
      }
    }
    
    let allRecords = [...formattedAttendanceData];
    if (includeAbsent) {
      allRecords = [...formattedAttendanceData, ...absentRecords];
      
      const totalRecords = allRecords.length;
      allRecords = allRecords.slice(from, from + pageSize);
      
      return {
        success: true,
        data: allRecords,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalRecords / pageSize),
          totalRecords,
          pageSize
        }
      };
    }
    
    return {
      success: true,
      data: formattedAttendanceData,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil((attendanceCount || 0) / pageSize),
        totalRecords: attendanceCount || 0,
        pageSize
      }
    };
  } catch (error) {
    console.error('Error fetching attendance records:', error);
    return {
      success: false,
      data: [],
      error: error instanceof Error ? error.message : 'An unknown error occurred'
    };
  }
}

function processAttendanceRecord(record: RawAttendanceRecord): AttendanceRecord {
  const actualStart = record.start_time ? convertTo12HourFormat(record.start_time) : '';
  const actualEnd = record.end_time ? convertTo12HourFormat(record.end_time) : '';
  
  let nurseClient = null;
  if (record.nurse_client) {
    nurseClient = Array.isArray(record.nurse_client) 
      ? (record.nurse_client.length > 0 ? record.nurse_client[0] : null)
      : record.nurse_client;
  }
  
  const scheduledStart = nurseClient?.shift_start_time ? convertTo12HourFormat(nurseClient.shift_start_time) : '';
  const scheduledEnd = nurseClient?.shift_end_time ? convertTo12HourFormat(nurseClient.shift_end_time) : '';

  let status = 'Absent';
  if (record.start_time) {
    status = 'Present';
    
    if (nurseClient?.shift_start_time && record.start_time) {
      const expectedMinutes = parseInt(nurseClient.shift_start_time.split(':')[0]) * 60 
        + parseInt(nurseClient.shift_start_time.split(':')[1]);
      const actualMinutes = parseInt(record.start_time.split(':')[0]) * 60 
        + parseInt(record.start_time.split(':')[1]);
      
      if (actualMinutes > expectedMinutes + 15) {
        status = 'Late';
      }
    }
  }

  let nurse = null;
  if (nurseClient?.nurse) {
    nurse = Array.isArray(nurseClient.nurse)
      ? (nurseClient.nurse.length > 0 ? nurseClient.nurse[0] : null)
      : nurseClient.nurse;
  }
    
  const nurseName = nurse?.first_name && nurse?.last_name
    ? `${nurse.first_name} ${nurse.last_name}`
    : 'Unknown Nurse';

  const hoursWorked = calculateHoursWorked(record);

  const locationInfo = parseLocation(record.location);

  return {
    id: record.id,
    nurseName,
    date: record.date,
    shiftStart: actualStart,
    shiftEnd: actualEnd,
    scheduledStart,
    scheduledEnd,
    hoursWorked, 
    status,
    location: locationInfo,
    nurseId: nurse?.nurse_id || null
  };
}

interface NurseAssignment {
  id: number;
  nurse_id: number;
  shift_start_time: string;
  shift_end_time: string;
  start_date: string;
  end_date: string;
  nurse: Nurse | Nurse[];
}

async function processAbsentNurse(assignment: NurseAssignment, targetDate: string): Promise<AttendanceRecord> {
  let nurse = null;
  if (assignment.nurse) {
    nurse = Array.isArray(assignment.nurse)
      ? (assignment.nurse.length > 0 ? assignment.nurse[0] : null)
      : assignment.nurse;
  }
  
  const nurseId = nurse?.nurse_id || null;
  const nurseName = nurse?.first_name && nurse?.last_name
    ? `${nurse.first_name} ${nurse.last_name}`
    : 'Unknown Nurse';
  
  const scheduledStart = assignment.shift_start_time ? convertTo12HourFormat(assignment.shift_start_time) : '';
  const scheduledEnd = assignment.shift_end_time ? convertTo12HourFormat(assignment.shift_end_time) : '';
  
  let status = 'Absent';
  if (nurseId) {
    const supabase = await createSupabaseServerClient();
    const { data } = await supabase
      .from('nurse_leave_requests')
      .select('leave_type')
      .eq('nurse_id', nurseId)
      .eq('status', 'approved')
      .lte('start_date', targetDate)
      .gte('end_date', targetDate)
      .limit(1);
    
    if (data && data.length > 0) {
      status = `On Leave (${formatLeaveType(data[0].leave_type)})`;
    }
  }
  
  return {
    id: -assignment.id,
    nurseName,
    date: targetDate,
    shiftStart: '',
    shiftEnd: '',
    scheduledStart,
    scheduledEnd,
    hoursWorked: 0,
    status: status,
    location: null,
    nurseId
  };
}

function formatLeaveType(type: string): string {
  const mapping: Record<string, string> = {
    'sick': 'Sick Leave',
    'annual': 'Annual Leave',
    'personal': 'Personal Leave',
    'casual': 'Casual Leave',
    'maternity': 'Maternity Leave',
    'paternity': 'Paternity Leave',
    'unpaid': 'Unpaid Leave'
  }
  return mapping[type] || type;
}

function calculateHoursWorked(record: RawAttendanceRecord): number | string {
  if (!record.total_hours && (!record.start_time || !record.end_time)) {
    return 0;
  }
  
  if (record.total_hours) {
    if (record.total_hours.includes(':')) {
      const [hours, minutes] = record.total_hours.split(':').map(Number);
      if (hours === 0) {
        return `${minutes} min`;
      } else {
        return `${hours}h${minutes > 0 ? ' ' + minutes + 'm' : ''}`;
      }
    } else {
      const numHours = parseFloat(record.total_hours);
      return `${numHours}h`;
    }
  }
  
  const start = new Date(`1970-01-01T${record.start_time}`);
  const end = new Date(`1970-01-01T${record.end_time}`);
  const totalHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
  
  const hours = Math.floor(totalHours);
  const minutes = Math.round((totalHours - hours) * 60);
  
  if (hours === 0) {
    return `${minutes} min`;
  } else {
    return `${hours}h${minutes > 0 ? ' ' + minutes + 'm' : ''}`;
  }
}

function parseLocation(location: string | null): string | null {
  if (!location) return null;
  
  try {
    if (typeof location === 'string' && (location.startsWith('{') || location.startsWith('['))) {
      const locationObj = JSON.parse(location);
      return `${locationObj.latitude}, ${locationObj.longitude}`;
    }
    return location;
  } catch (e) {
    console.error("Error parsing location data:", e);
    return location;
  }
}

export async function getTodayAttendanceForAssignment(
  assignmentId: number
): Promise<{
  success: boolean;
  data?: AssignmentAttendanceDetails;
  error?: string;
}> {
  try {
    const supabase = await createSupabaseServerClient();
    const today = new Date().toISOString().split('T')[0];
    
    // First, get the nurse ID associated with this assignment
    const { data: assignmentData, error: assignmentError } = await supabase
      .from('nurse_client')
      .select('nurse_id')
      .eq('id', assignmentId)
      .single();
    
    if (assignmentError) {
      console.error('Error fetching nurse assignment:', assignmentError);
      return {
        success: false,
        error: assignmentError.message
      };
    }
    
    const nurseId = assignmentData?.nurse_id;
    
    // Check if there's an attendance record for today
    const { data, error } = await supabase
      .from('attendence_individual')
      .select('id, start_time, end_time, total_hours, location')
      .eq('date', today)
      .eq('assigned_id', assignmentId)
      .maybeSingle();
    
    if (error) {
      console.error('Error fetching assignment attendance:', error);
      return {
        success: false,
        error: error.message
      };
    }
    
    // Check if the nurse is on approved leave for today
    let onLeave = false;
    let leaveType = '';
    
    if (nurseId) {
      const { data: leaveData, error: leaveError } = await supabase
        .from('nurse_leave_requests')
        .select('leave_type')
        .eq('nurse_id', nurseId)
        .eq('status', 'approved')
        .lte('start_date', today)
        .gte('end_date', today)
        .maybeSingle();
      
      if (leaveError) {
        console.error('Error checking leave status:', leaveError);
      } else if (leaveData) {
        onLeave = true;
        leaveType = formatLeaveType(leaveData.leave_type);
      }
    }
    
    if (!data) {
      return {
        success: true,
        data: {
          checked_in: false,
          on_leave: onLeave,
          leave_type: leaveType || undefined
        }
      };
    }
    
    return {
      success: true,
      data: {
        id: data.id,
        checked_in: !!data.start_time,
        check_in_time: data.start_time || undefined,
        check_out_time: data.end_time || undefined,
        location: data.location,
        total_hours: data.total_hours,
        on_leave: onLeave,
        leave_type: leaveType || undefined
      }
    };
  } catch (error) {
    console.error('Error checking attendance status:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error checking attendance status'
    };
  }
}

export async function adminCheckInNurse(
  assignmentId: number,
  // nurseId: number
): Promise<{ 
  success: boolean; 
  error?: string;
}> {
  try {
    const supabase = await createSupabaseServerClient();
    const today = new Date().toISOString().split('T')[0];
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    
    const { data: existingRecord, error: checkError } = await supabase
      .from('attendence_individual')
      .select('id')
      .eq('date', today)
      .eq('assigned_id', assignmentId)
      .maybeSingle();
    
    if (checkError) {
      console.error('Error checking existing attendance:', checkError);
      return {
        success: false,
        error: checkError.message
      };
    }
    
    if (existingRecord) {
      const { error: updateError } = await supabase
        .from('attendence_individual')
        .update({
          start_time: currentTime,
          is_admin_action: true
          // admin_action_notes: `Admin check-in at ${currentTime}`
        })
        .eq('id', existingRecord.id);
      
      if (updateError) {
        return {
          success: false,
          error: updateError.message
        };
      }
    } else {
      const { error: insertError } = await supabase
        .from('attendence_individual')
        .insert({
          date: today,
          start_time: currentTime,
          // nurse_id: nurseId,
          assigned_id: assignmentId,
          is_admin_action: true
          // admin_action_notes: `Admin check-in at ${currentTime}`
        });
      
      if (insertError) {
        return {
          success: false,
          error: insertError.message
        };
      }
    }
    
    return {
      success: true
    };
  } catch (error) {
    console.error('Error during admin check-in:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

export async function adminCheckOutNurse(
  attendanceId: number
): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const supabase = await createSupabaseServerClient();
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    
    // Fetch the attendance record to get check-in time
    const { data: attendance, error: fetchError } = await supabase
      .from('attendence_individual')
      .select('start_time')
      .eq('id', attendanceId)
      .single();
    
    if (fetchError || !attendance) {
      return {
        success: false,
        error: fetchError?.message || 'Attendance record not found'
      };
    }
    
    // Calculate hours worked
    let totalHours = '0:00';
    if (attendance.start_time) {
      const [startHours, startMinutes] = attendance.start_time.split(':').map(Number);
      const startTotalMinutes = startHours * 60 + startMinutes;
      
      const [endHours, endMinutes] = currentTime.split(':').map(Number);
      const endTotalMinutes = endHours * 60 + endMinutes;
      
      const diffMinutes = endTotalMinutes - startTotalMinutes;
      const hours = Math.floor(diffMinutes / 60);
      const minutes = diffMinutes % 60;
      
      totalHours = `${hours}:${minutes.toString().padStart(2, '0')}`;
    }
    
    // Update the attendance record with check-out time and total hours
    const { error: updateError } = await supabase
      .from('attendence_individual')
      .update({
        end_time: currentTime,
        total_hours: totalHours,
        is_admin_action: true,
        // admin_action_notes: (attendance.admin_action_notes || '') + ` | Admin check-out at ${currentTime}`
      })
      .eq('id', attendanceId);
    
    if (updateError) {
      return {
        success: false,
        error: updateError.message
      };
    }
    
    return {
      success: true
    };
  } catch (error) {
    console.error('Error during admin check-out:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}