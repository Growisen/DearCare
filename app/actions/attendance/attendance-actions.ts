"use server"

import { createSupabaseServerClient } from '@/app/actions/authentication/auth'
import { logger } from '@/utils/logger';

/**
 * TYPES & INTERFACES
 * -----------------
 */
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

export interface AttendanceRecordById {
  id?: number;
  date: string;
  checkIn: string | null;
  checkOut: string | null;
  totalHours: string | number;
  status: string;
  notes?: string;
  location?: string | null;
  isAdminAction?: boolean;
  assignmentId?: number;
  shiftStartTime?: string | null;
  shiftEndTime?: string | null;
} 

export interface MarkAttendanceParams {
  assignmentId: number;
  date: string; // 'YYYY-MM-DD'
  checkIn: string; // 'HH:mm'
  checkOut: string; // 'HH:mm'
  isAdminAction?: boolean;
}

export interface UnmarkAttendanceParams {
  id?: number;
  assignmentId?: number;
  date?: string;
}

interface Nurse {
  nurse_id: number;
  first_name: string;
  last_name: string;
  admitted_type: "Dearcare_Llp" | "Tata_Homenursing";
}

interface NurseClient {
  id: number;
  nurse_id: number;
  shift_start_time: string;
  shift_end_time: string;
  nurse: Nurse | Nurse[];
}

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

/**
 * HELPER FUNCTIONS
 * ---------------
 */

// Convert 24-hour format to 12-hour format
function convertTo12HourFormat(time24: string | null): string {
  if (!time24) return '';
  
  try {
    const [hours, minutes] = time24.split(':').map(num => parseInt(num, 10));
    
    if (isNaN(hours) || isNaN(minutes)) return '';
    
    const period = hours >= 12 ? 'PM' : 'AM';
    const hour12 = hours % 12 || 12; 
    
    return `${hour12}:${minutes.toString().padStart(2, '0')} ${period}`;
  } catch (error) {
    logger.error('Error converting time format:', error);
    return '';
  }
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

function calculateHoursWorked(
  totalHours: string | null,
  startTime: string | null = null,
  endTime: string | null = null
): number | string {
  if (!totalHours && (!startTime || !endTime)) {
    return 0;
  }
  
  if (totalHours) {
    if (totalHours.includes(':')) {
      const [hours, minutes] = totalHours.split(':').map(Number);
      if (hours === 0) {
        return `${minutes} min`;
      } else {
        return `${hours}h${minutes > 0 ? ' ' + minutes + 'm' : ''}`;
      }
    } else {
      const numHours = parseFloat(totalHours);
      return `${numHours}h`;
    }
  }
  
  const start = new Date(`1970-01-01T${startTime}`);
  const end = new Date(`1970-01-01T${endTime}`);
  const totalHoursValue = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
  
  const hours = Math.floor(totalHoursValue);
  const minutes = Math.round((totalHoursValue - hours) * 60);
  
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
    logger.error("Error parsing location data:", e);
    return location;
  }
}

function processAttendanceRecord(record: RawAttendanceRecord): AttendanceRecord {
  const nurseClient = record.nurse_client && 
    (Array.isArray(record.nurse_client) ? record.nurse_client[0] : record.nurse_client);
  
  const nurse = nurseClient?.nurse &&
    (Array.isArray(nurseClient.nurse) ? nurseClient.nurse[0] : nurseClient.nurse);
  
  const nurseName = nurse?.first_name && nurse?.last_name
    ? `${nurse.first_name} ${nurse.last_name}`
    : 'Unknown Nurse';
    
  const actualStart = record.start_time ? convertTo12HourFormat(record.start_time) : '';
  const actualEnd = record.end_time ? convertTo12HourFormat(record.end_time) : '';
  const scheduledStart = nurseClient?.shift_start_time ? convertTo12HourFormat(nurseClient.shift_start_time) : '';
  const scheduledEnd = nurseClient?.shift_end_time ? convertTo12HourFormat(nurseClient.shift_end_time) : '';

  let status = 'Absent';
  if (record.start_time) {
    status = 'Present';
    
    if (nurseClient?.shift_start_time && record.start_time) {
      const [shiftH, shiftM] = nurseClient.shift_start_time.split(':').map(Number);
      const [actualH, actualM] = record.start_time.split(':').map(Number);
      
      const expectedMinutes = shiftH * 60 + shiftM;
      const actualMinutes = actualH * 60 + actualM;
      
      if (actualMinutes > expectedMinutes + 15) {
        status = 'Late';
      }
    }
  }

  const hoursWorked = calculateHoursWorked(
    record.total_hours,
    record.start_time, 
    record.end_time
  );

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

/**
 * CORE ATTENDANCE FUNCTIONS
 * ------------------------
 */

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
      logger.error('Error fetching nurse assignment:', assignmentError);
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
      logger.error('Error fetching assignment attendance:', error);
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
        logger.error('Error checking leave status:', leaveError);
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
    logger.error('Error checking attendance status:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error checking attendance status'
    };
  }
}

export async function markAttendance({
  assignmentId,
  date,
  checkIn,
  checkOut,
  isAdminAction = false,
}: MarkAttendanceParams): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    const supabase = await createSupabaseServerClient();

    const { data: existing, error: fetchError } = await supabase
      .from('attendence_individual')
      .select('id')
      .eq('assigned_id', assignmentId)
      .eq('date', date)
      .maybeSingle();

    if (fetchError && fetchError.code !== 'PGRST116') {
      return { success: false, message: fetchError.message };
    }

    let totalHours: string | null = null;
    if (checkIn && checkOut) {
      const [inH, inM] = checkIn.split(':').map(Number);
      const [outH, outM] = checkOut.split(':').map(Number);
      const inMinutes = inH * 60 + inM;
      const outMinutes = outH * 60 + outM;
      const diff = outMinutes - inMinutes;
      if (diff > 0) {
        const hours = Math.floor(diff / 60);
        const minutes = diff % 60;
        totalHours = `${hours}:${minutes.toString().padStart(2, '0')}`;
      }
    }

    if (existing) {
      const { error: updateError } = await supabase
        .from('attendence_individual')
        .update({
          start_time: checkIn,
          end_time: checkOut,
          is_admin_action: isAdminAction,
          total_hours: totalHours,
        })
        .eq('id', existing.id);

      if (updateError) {
        return { success: false, message: updateError.message };
      }
      return { success: true, message: 'Attendance updated successfully' };
    } else {
      const { error: insertError } = await supabase
        .from('attendence_individual')
        .insert([{
          assigned_id: assignmentId,
          date,
          start_time: checkIn,
          end_time: checkOut,
          is_admin_action: isAdminAction,
          total_hours: totalHours,
        }]);

      if (insertError) {
        return { success: false, message: insertError.message };
      }
      return { success: true, message: 'Attendance marked successfully' };
    }
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to mark attendance',
    };
  }
}

export async function unmarkAttendance({
  id,
  assignmentId,
  date,
}: UnmarkAttendanceParams): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    const supabase = await createSupabaseServerClient();

    let recordId = id;

    if (!recordId) {
      if (!assignmentId || !date) {
        return { 
          success: false, 
          message: 'Either record ID or both assignment ID and date must be provided' 
        };
      }

      const { data: existing, error: fetchError } = await supabase
        .from('attendence_individual')
        .select('id')
        .eq('assigned_id', assignmentId)
        .eq('date', date)
        .maybeSingle();

      if (fetchError) {
        return { success: false, message: fetchError.message };
      }

      if (!existing) {
        return { 
          success: false, 
          message: 'No attendance record found for the specified date' 
        };
      }

      recordId = existing.id;
    }

    const { error: deleteError } = await supabase
      .from('attendence_individual')
      .delete()
      .eq('id', recordId);

    if (deleteError) {
      return { success: false, message: deleteError.message };
    }

    return { success: true, message: 'Attendance record deleted successfully' };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to delete attendance record',
    };
  }
}

/**
 * ADMIN ACTIONS
 * ------------
 */

export async function adminCheckInNurse(
  assignmentId: number
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
      logger.error('Error checking existing attendance:', checkError);
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
          assigned_id: assignmentId,
          is_admin_action: true
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
    logger.error('Error during admin check-in:', error);
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
        is_admin_action: true
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
    logger.error('Error during admin check-out:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

export async function markLongShiftAttendance(
  assignmentId: number,
): Promise<{ 
  success: boolean; 
  error?: string;
}> {
  try {
    const supabase = await createSupabaseServerClient();
    const today = new Date().toISOString().split('T')[0];
    
    const { data: assignmentData, error: assignmentError } = await supabase
      .from('nurse_client')
      .select('shift_start_time, shift_end_time')
      .eq('id', assignmentId)
      .single();
    
    if (assignmentError) {
      logger.error('Error fetching shift details:', assignmentError);
      return {
        success: false,
        error: assignmentError.message
      };
    }

    let totalHours = '0:00';
    if (assignmentData.shift_start_time && assignmentData.shift_end_time) {
      const [startHours, startMinutes] = assignmentData.shift_start_time.split(':').map(Number);
      const [endHours, endMinutes] = assignmentData.shift_end_time.split(':').map(Number);
      
      let diffMinutes = (endHours * 60 + endMinutes) - (startHours * 60 + startMinutes);
      if (diffMinutes < 0) diffMinutes += 24 * 60;
      
      const hours = Math.floor(diffMinutes / 60);
      const minutes = diffMinutes % 60;
      
      totalHours = `${hours}:${minutes.toString().padStart(2, '0')}`;
    }
    
    const { data: existingRecord, error: checkError } = await supabase
      .from('attendence_individual')
      .select('id')
      .eq('date', today)
      .eq('assigned_id', assignmentId)
      .maybeSingle();
    
    if (checkError) {
      logger.error('Error checking existing attendance:', checkError);
      return {
        success: false,
        error: checkError.message
      };
    }
    
    if (existingRecord) {
      const { error: updateError } = await supabase
        .from('attendence_individual')
        .update({
          start_time: assignmentData.shift_start_time,
          end_time: assignmentData.shift_end_time,
          total_hours: totalHours,
          is_admin_action: true
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
          start_time: assignmentData.shift_start_time,
          end_time: assignmentData.shift_end_time,
          assigned_id: assignmentId,
          total_hours: totalHours,
          is_admin_action: true
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
    logger.error('Error during long shift attendance marking:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

/**
 * REPORTING FUNCTIONS
 * -----------------
 */

export async function fetchStaffAttendance(
  date?: string,
  page: number = 1,
  pageSize: number = 50,
  includeAbsent: boolean = true,
  admittedType?: string,
  searchTerm?: string
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
    
    let attendanceQuery = supabase
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
            last_name,
            full_name, 
            nurse_reg_no,
            nurse_prev_reg_no,
            admitted_type
          )
        )
      `, { count: 'exact' })
      .eq('date', targetDate)
      .not('nurse_client', 'is', null);
      
    if (admittedType) {
      attendanceQuery = attendanceQuery.eq('nurse_client.nurse.admitted_type', admittedType);
    }
    
    if (!includeAbsent) {
      attendanceQuery.range(from, to);
    }
    
    const { data: attendanceData, error: attendanceError } = await attendanceQuery;
    
    if (attendanceError) throw new Error(attendanceError.message);
    
    const validAttendanceData = attendanceData.filter(record => {
      const nurseClient = record.nurse_client && 
        (Array.isArray(record.nurse_client) ? record.nurse_client[0] : record.nurse_client);
        
      const nurse = nurseClient?.nurse &&
        (Array.isArray(nurseClient.nurse) ? nurseClient.nurse[0] : nurseClient.nurse);
        
      return nurse && nurse.first_name && 
        (!admittedType || nurse.admitted_type === admittedType);
    });
    
    const presentAssignmentIds = new Set(
      validAttendanceData
        .filter(record => record.assigned_id !== null)
        .map(record => record.assigned_id)
    );
    
    const formattedAttendanceData = validAttendanceData.map(processAttendanceRecord);
    
    let absentRecords: AttendanceRecord[] = [];
    if (includeAbsent) {
      let nurseClientQuery = supabase
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
            last_name,
            admitted_type
          )
        `)
        .lte('start_date', targetDate)
        .gte('end_date', targetDate)
        .not('nurse', 'is', null);
      
      if (admittedType) {
        nurseClientQuery = nurseClientQuery.eq('nurse.admitted_type', admittedType);
      }
      
      const { data: scheduledNurses, error: scheduledError } = await nurseClientQuery;
      
      if (scheduledError) throw new Error(scheduledError.message);
      
      if (scheduledNurses && scheduledNurses.length > 0) {
        const validScheduledNurses = scheduledNurses.filter(assignment => {
          const nurse = assignment.nurse && 
            (Array.isArray(assignment.nurse) ? assignment.nurse[0] : assignment.nurse);
          
          return nurse && nurse.first_name && 
            (!admittedType || nurse.admitted_type === admittedType);
        });
                
        const absentNurses = validScheduledNurses.filter(
          assignment => !presentAssignmentIds.has(assignment.id)
        );
        
        if (absentNurses.length > 0) {
          const nurseIds = absentNurses.map(assignment => assignment.nurse_id).filter(Boolean);
          
          const { data: leaveData } = await supabase
            .from('nurse_leave_requests')
            .select('nurse_id, leave_type')
            .eq('status', 'approved')
            .lte('start_date', targetDate)
            .gte('end_date', targetDate)
            .in('nurse_id', nurseIds);
            
          const leaveMap = new Map();
          if (leaveData) {
            leaveData.forEach(leave => {
              leaveMap.set(leave.nurse_id, leave.leave_type);
            });
          }
          
          absentRecords = absentNurses.map(assignment => {
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
            
            const scheduledStart = assignment.shift_start_time 
              ? convertTo12HourFormat(assignment.shift_start_time) 
              : '';
            const scheduledEnd = assignment.shift_end_time 
              ? convertTo12HourFormat(assignment.shift_end_time) 
              : '';
            
            let status = 'Absent';
            if (nurseId && leaveMap.has(nurseId)) {
              status = `On Leave (${formatLeaveType(leaveMap.get(nurseId))})`;
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
              status,
              location: null,
              nurseId
            };
          });
        }
      }
    }

    if (searchTerm && searchTerm.trim() !== "") {
      const searchLower = searchTerm.trim().toLowerCase();
      absentRecords = absentRecords.filter(record => 
        record.nurseName.toLowerCase().includes(searchLower)
      );
    }
    
    let allRecords = [...formattedAttendanceData, ...absentRecords];
    const totalRecords = allRecords.length;
    
    allRecords.sort((a, b) => a.nurseName.localeCompare(b.nurseName));
    
    if (includeAbsent) {
      allRecords = allRecords.slice(from, from + pageSize);
    }
    
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
  } catch (error) {
    logger.error('Error fetching attendance records:', error);
    return {
      success: false,
      data: [],
      error: error instanceof Error ? error.message : 'An unknown error occurred'
    };
  }
}

export async function getAttendanceRecords(
  assignmentId: number,
  page: number = 1,
  pageSize: number = 10,
  startDate?: string,
  endDate?: string
): Promise<{
  success: boolean;
  data?: AttendanceRecordById[];
  count?: number;
  error?: string;
}> {
  try {
    const supabase = await createSupabaseServerClient();
    
    const { data: assignmentData, error: assignmentError } = await supabase
      .from('nurse_client')
      .select('nurse_id, shift_start_time, shift_end_time, start_date, end_date, salary_per_day')
      .eq('id', assignmentId)
      .single();
    
    if (assignmentError) {
      return {
        success: false,
        error: assignmentError.message
      };
    }

    const now = new Date().toISOString().split('T')[0];
    const queryStartDate = startDate || assignmentData.start_date;
    const queryEndDate = endDate || (now < assignmentData.end_date ? now : assignmentData.end_date);
    
    const { data: attendanceData, error } = await supabase
      .from('attendence_individual')
      .select('id, date, start_time, end_time, total_hours, is_admin_action, location', { count: 'exact' })
      .eq('assigned_id', assignmentId)
      .order('date', { ascending: false });
    
    if (error) {
      return {
        success: false,
        error: error.message
      };
    }
    
    const attendanceDates = new Map();
    attendanceData.forEach(record => {
      attendanceDates.set(record.date, record);
    });
    
    const allDates: string[] = [];
    const currentDate = new Date(queryStartDate);
    const lastDate = new Date(queryEndDate);
    
    while (currentDate <= lastDate) {
      allDates.push(currentDate.toISOString().split('T')[0]);
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    const completeRecords: AttendanceRecordById[] = await Promise.all(allDates.map(async (date) => {
      const record = attendanceDates.get(date);
      
      if (record) {
        let status = 'Absent';
        
        if (record.start_time) {
          if (assignmentData.shift_start_time) {
            const scheduledStart = assignmentData.shift_start_time.split(':').map(Number);
            const actualStart = record.start_time.split(':').map(Number);
            
            const scheduledMinutes = scheduledStart[0] * 60 + scheduledStart[1];
            const actualMinutes = actualStart[0] * 60 + actualStart[1];
            
            if (actualMinutes > scheduledMinutes + 15) {
              status = 'Late';
            } else {
              status = record.end_time ? 'Present' : 'Checked In';
            }
          } else {
            status = record.end_time ? 'Present' : 'Checked In';
          }
        }
        
        return {
          id: record.id,
          date: record.date,
          checkIn: record.start_time ? record.start_time : null,
          checkOut: record.end_time ? record.end_time : null,
          totalHours: calculateHoursWorked(
            record.total_hours,
            record.start_time, 
            record.end_time
          ),
          status: status,
          location: parseLocation(record.location),
          isAdminAction: !!record.is_admin_action,
          notes: record.notes,
          salaryPerDay: assignmentData.salary_per_day || null
        };
      } else {
        let status = 'Absent';
        
        if (assignmentData.nurse_id) {
          const { data: leaveData } = await supabase
            .from('nurse_leave_requests')
            .select('leave_type')
            .eq('nurse_id', assignmentData.nurse_id)
            .eq('status', 'approved')
            .lte('start_date', date)
            .gte('end_date', date)
            .maybeSingle();
          
          if (leaveData) {
            status = `On Leave (${formatLeaveType(leaveData.leave_type)})`;
          }
        }
        
        return {
          id: undefined,
          date: date,
          checkIn: null,
          checkOut: null,
          totalHours: 0,
          status: status,
          location: null,
          isAdminAction: false
        };
      }
    }));
    
    completeRecords.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    const totalRecords = completeRecords.length;
    const paginatedRecords = completeRecords.slice((page - 1) * pageSize, page * pageSize);
    
    return {
      success: true,
      data: paginatedRecords,
      count: totalRecords
    };
  } catch (error) {
    logger.error('Failed to fetch attendance records:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unknown error occurred'
    };
  }
}


export async function getNurseAttendanceRecordsByDate(
  nurseId: number,
  startDate: string,
  endDate: string,
  page: number = 1,
  pageSize: number = 10
): Promise<{
  success: boolean;
  data?: (AttendanceRecordById & { salaryPerDay?: number })[];
  count?: number;
  totalPages?: number;
  currentPage?: number;
  error?: string;
}> {
  try {
    const supabase = await createSupabaseServerClient();

    // 1. Find all assignments for this nurse within the date range
    const { data: assignments, error: assignmentError } = await supabase
      .from('nurse_client')
      .select('id, shift_start_time, shift_end_time, start_date, end_date, salary_per_day')
      .eq('nurse_id', nurseId)
      .or(`start_date.lte.${endDate},end_date.gte.${startDate}`);

    if (assignmentError) {
      return { success: false, error: assignmentError.message };
    }
    if (!assignments || assignments.length === 0) {
      return { success: true, data: [], count: 0, totalPages: 0, currentPage: page };
    }

    // 2. Build a map of date => assignment for each day in the range
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const dateAssignmentMap: Record<string, any> = {};
    const allDates: string[] = [];
    const currentDate = new Date(startDate);
    const lastDate = new Date(endDate);

    while (currentDate <= lastDate) {
      const dateStr = currentDate.toISOString().split('T')[0];
      // Find assignment active on this date
      const assignment = assignments.find(a =>
        a.start_date <= dateStr && a.end_date >= dateStr
      );
      if (assignment) {
        dateAssignmentMap[dateStr] = assignment;
      }
      allDates.push(dateStr);
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // 3. Fetch all attendance records for this nurse in the date range
    const assignmentIds = assignments.map(a => a.id);
    const { data: attendanceData, error: attendanceError } = await supabase
      .from('attendence_individual')
      .select('id, date, start_time, end_time, total_hours, is_admin_action, location, assigned_id')
      .in('assigned_id', assignmentIds)
      .gte('date', startDate)
      .lte('date', endDate);

    if (attendanceError) {
      return { success: false, error: attendanceError.message };
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const attendanceMap = new Map<string, any>();
      attendanceData.forEach(record => {
        attendanceMap.set(record.date, record);
      });

    const results: ((AttendanceRecordById & { salaryPerDay?: number }) | null)[] = await Promise.all(allDates.map(async date => {
      const assignment = dateAssignmentMap[date];
      if (!assignment) {
        return null;
      }
      const record = attendanceMap.get(date);

      const shiftStartTime = assignment.shift_start_time || null;
      const shiftEndTime = assignment.shift_end_time || null;
      const salaryPerDay = assignment.salary_per_day ?? null;

      if (record) {
        let status = 'Absent';
        if (record.start_time) {
          if (assignment.shift_start_time) {
            const scheduledStart = assignment.shift_start_time.split(':').map(Number);
            const actualStart = record.start_time.split(':').map(Number);
            const scheduledMinutes = scheduledStart[0] * 60 + scheduledStart[1];
            const actualMinutes = actualStart[0] * 60 + actualStart[1];
            if (actualMinutes > scheduledMinutes + 15) {
              status = 'Late';
            } else {
              status = record.end_time ? 'Present' : 'Checked In';
            }
          } else {
            status = record.end_time ? 'Present' : 'Checked In';
          }
        }
        return {
          id: record.id,
          date,
          checkIn: record.start_time || null,
          checkOut: record.end_time || null,
          totalHours: calculateHoursWorked(
            record.total_hours,
            record.start_time,
            record.end_time
          ),
          status,
          location: parseLocation(record.location),
          isAdminAction: !!record.is_admin_action,
          notes: record.notes,
          assignmentId: assignment.id,
          shiftStartTime,
          shiftEndTime,
          salaryPerDay
        };
      } else {
        let status = 'Absent';
        const { data: leaveData } = await supabase
          .from('nurse_leave_requests')
          .select('leave_type')
          .eq('nurse_id', nurseId)
          .eq('status', 'approved')
          .lte('start_date', date)
          .gte('end_date', date)
          .maybeSingle();

        if (leaveData) {
          status = `On Leave (${formatLeaveType(leaveData.leave_type)})`;
        }

        return {
          id: undefined,
          date,
          checkIn: null,
          checkOut: null,
          totalHours: 0,
          status,
          location: null,
          isAdminAction: false,
          assignmentId: assignment.id,
          shiftStartTime,
          shiftEndTime,
          salaryPerDay
        };
      }
    }));
    const filteredResults = results.filter(Boolean) as (AttendanceRecordById & { salaryPerDay?: number })[];
    filteredResults.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const totalRecords = filteredResults.length;
    const totalPages = Math.ceil(totalRecords / pageSize);
    const paginatedResults = filteredResults.slice((page - 1) * pageSize, page * pageSize);

    return {
      success: true,
      data: paginatedResults,
      count: totalRecords,
      totalPages,
      currentPage: page
    };
  } catch (error) {
    logger.error('Failed to fetch nurse attendance records:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unknown error occurred'
    };
  }
}