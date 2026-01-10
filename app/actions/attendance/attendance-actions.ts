"use server"

import { logger } from '@/utils/logger';
import { getAuthenticatedClient } from '@/app/actions/helpers/auth.helper';

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
  date: string;
  checkIn: string;
  checkOut: string;
  isAdminAction?: boolean;
}

export interface UnmarkAttendanceParams {
  id?: number;
  assignmentId?: number;
  date?: string;
}

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

export async function getTodayAttendanceForAssignment(
  assignmentId: number
): Promise<{
  success: boolean;
  data?: AssignmentAttendanceDetails;
  error?: string;
}> {
  try {
    const { supabase } = await getAuthenticatedClient();
    const today = new Date().toISOString().split('T')[0];
    
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
    const { supabase } = await getAuthenticatedClient();

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
    const { supabase } = await getAuthenticatedClient();

    let recordId = id;
    let createdAt: string | null = null;

    if (!recordId) {
      if (!assignmentId || !date) {
        return { 
          success: false, 
          message: 'Either record ID or both assignment ID and date must be provided' 
        };
      }

      const { data: existing, error: fetchError } = await supabase
        .from('attendence_individual')
        .select('id, created_at')
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
      createdAt = existing.created_at;
    } else {
      const { data: record, error: fetchError } = await supabase
        .from('attendence_individual')
        .select('created_at')
        .eq('id', recordId)
        .maybeSingle();

      if (fetchError) {
        return { success: false, message: fetchError.message };
      }
      createdAt = record?.created_at;
    }

    if (!createdAt) {
      return { success: false, message: 'Could not determine creation time of attendance record' };
    }

    const createdDate = new Date(createdAt);
    const now = new Date();
    const diffHours = (now.getTime() - createdDate.getTime()) / (1000 * 60 * 60);

    if (diffHours > 24) {
      return { 
        success: false, 
        message: 'Attendance record can only be deleted within 24 hours of creation' 
      };
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


export async function adminCheckInNurse(
  assignmentId: number
): Promise<{ 
  success: boolean; 
  error?: string;
}> {
  try {
    const { supabase } = await getAuthenticatedClient();
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
    const { supabase } = await getAuthenticatedClient();
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;

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
    const { supabase } = await getAuthenticatedClient();
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

interface AttendanceRpcResponse {
  id: number | null;
  assigned_id: number;
  nurseName: string;
  date: string;
  shiftStart: string | null;
  shiftEnd: string | null;
  scheduledStart: string | null;
  scheduledEnd: string | null;
  hoursWorked: string | null;
  status: string;
  location: string | null;
  nurseId: number;
  total_count: number;
}

export async function fetchStaffAttendance(
  date?: string,
  page: number = 1,
  pageSize: number = 50,
  status: 'present' | 'absent' | 'all' = 'all',
  debouncedSearchTerm?: string
): Promise<{
  success: boolean;
  data: AttendanceRecord[];
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalRecords: number;
    pageSize: number;
  };
  error?: string;
}> {
  try {
    const { supabase, nursesOrg } = await getAuthenticatedClient();
    const targetDate = date || new Date().toISOString().split('T')[0];
    const searchTerm = debouncedSearchTerm?.trim().toLowerCase() || null;

    const { data, error } = await supabase.rpc('get_nurse_attendance_report', {
      input_date: targetDate,
      page_number: page,
      page_size: pageSize,
      status_filter: status,
      admitted_type_filter: nursesOrg,
      search_term: searchTerm
    });

    if (error) throw new Error(error.message);

    const rpcData = data as unknown as AttendanceRpcResponse[] | null;
    const safeData = rpcData || [];
    const totalRecords = safeData.length > 0 ? safeData[0].total_count : 0;

    const formattedData: AttendanceRecord[] = safeData.map((record) => ({
      id: record.id || record.assigned_id,
      nurseName: record.nurseName,
      date: record.date,
      shiftStart: record.shiftStart ?? '',
      shiftEnd: record.shiftEnd ?? '',
      scheduledStart: record.scheduledStart ?? '',
      scheduledEnd: record.scheduledEnd ?? '',
      hoursWorked: record.hoursWorked || '0',
      status: record.status,
      location: record.location,
      nurseId: record.nurseId
    }));

    return {
      success: true,
      data: formattedData,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalRecords / pageSize),
        totalRecords: totalRecords,
        pageSize: pageSize
      }
    };

  } catch (error) {
    return {
      success: false,
      data: [],
      error: error instanceof Error ? error.message : 'An unknown error occurred'
    };
  }
}


export async function fetchStaffAttendanceFromView(
  date?: string,
  page: number = 1,
  pageSize: number = 50,
  admittedType?: string,
  debouncedSearchTerm?: string
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
    const { supabase } = await getAuthenticatedClient();
    const targetDate = date || new Date().toISOString().split('T')[0];
    const from = (page - 1) * pageSize;

    let query = supabase
      .from('nurse_attendance_view')
      .select('*', { count: 'exact' })
      .eq('date', targetDate);

    if (admittedType) {
      query = query.eq('admitted_type', admittedType);
    }

    if (debouncedSearchTerm && debouncedSearchTerm.trim() !== "") {
      const searchLower = debouncedSearchTerm.trim().toLowerCase();
      query = query.ilike('full_name', `%${searchLower}%`);
    }

    query = query.range(from, from + pageSize - 1);

    const { data, error, count } = await query;

    if (error) throw new Error(error.message);

    const formattedData: AttendanceRecord[] = (data || []).map(record => ({
      id: record.attendance_id,
      nurseName: record.full_name || `${record.first_name} ${record.last_name}`,
      date: record.date,
      shiftStart: record.start_time ? convertTo12HourFormat(record.start_time) : '',
      shiftEnd: record.end_time ? convertTo12HourFormat(record.end_time) : '',
      scheduledStart: record.scheduled_start_time ? convertTo12HourFormat(record.scheduled_start_time) : '',
      scheduledEnd: record.scheduled_end_time ? convertTo12HourFormat(record.scheduled_end_time) : '',
      hoursWorked: calculateHoursWorked(record.total_hours, record.start_time, record.end_time),
      status: record.start_time ? 'Present' : 'Absent',
      location: parseLocation(record.location),
      nurseId: record.nurse_id || null
    }));

    return {
      success: true,
      data: formattedData,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil((count ?? 0) / pageSize),
        totalRecords: count ?? 0,
        pageSize
      }
    };
  } catch (error) {
    logger.error('Error fetching attendance records from view:', error);
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
    const { supabase } = await getAuthenticatedClient();
    
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

interface AssignmentData {
  id: number;
  shift_start_time: string | null;
  shift_end_time: string | null;
  start_date: string;
  end_date: string;
  salary_per_day: number | null;
}

interface AttendanceData {
  id: number;
  date: string;
  start_time: string | null;
  end_time: string | null;
  total_hours: string | null;
  is_admin_action: boolean | null;
  location: string | null;
  assigned_id: number;
  notes: string | null;
}

interface LeaveData {
  start_date: string;
  end_date: string;
  leave_type: string;
}

type AttendanceResult = AttendanceRecordById & { 
  salaryPerDay?: number;
  nurseName?: string;
  nursePrevRegNo?: string;
  nurseRegNo?: string;
};

export async function getNurseAttendanceRecordsByDate(
  nurseId: number,
  startDate: string,
  endDate: string,
  page: number = 1,
  pageSize: number = 10
): Promise<{
  success: boolean;
  data?: AttendanceResult[];
  count?: number;
  totalPages?: number;
  currentPage?: number;
  error?: string;
}> {
  try {
    const { supabase } = await getAuthenticatedClient();

    const [nurseResponse, assignmentsResponse, leavesResponse] = await Promise.all([
      supabase
        .from('nurses')
        .select('full_name, nurse_prev_reg_no, nurse_reg_no')
        .eq('nurse_id', nurseId)
        .single(),

      supabase
        .from('nurse_client')
        .select('id, shift_start_time, shift_end_time, start_date, end_date, salary_per_day')
        .eq('nurse_id', nurseId)
        .or(`start_date.lte.${endDate},end_date.gte.${startDate}`)
        .returns<AssignmentData[]>(),

      supabase
        .from('nurse_leave_requests')
        .select('start_date, end_date, leave_type')
        .eq('nurse_id', nurseId)
        .eq('status', 'approved')
        .or(`start_date.lte.${endDate},end_date.gte.${startDate}`)
        .returns<LeaveData[]>()
    ]);

    if (assignmentsResponse.error) return { success: false, error: assignmentsResponse.error.message };
    if (nurseResponse.error) return { success: false, error: nurseResponse.error.message };
    if (leavesResponse.error) return { success: false, error: leavesResponse.error.message };

    const assignments = assignmentsResponse.data || [];
    const nurseDetails = nurseResponse.data;
    const leaves = leavesResponse.data || [];

    if (assignments.length === 0) {
      return { success: true, data: [], count: 0, totalPages: 0, currentPage: page };
    }

    const assignmentIds = assignments.map(a => a.id);
    const { data: attendanceData, error: attendanceError } = await supabase
      .from('attendence_individual')
      .select('id, date, start_time, end_time, total_hours, is_admin_action, location, assigned_id')
      .in('assigned_id', assignmentIds)
      .gte('date', startDate)
      .lte('date', endDate)
      .returns<AttendanceData[]>();

    if (attendanceError) {
      return { success: false, error: attendanceError.message };
    }

    const dateAssignmentMap: Record<string, AssignmentData> = {};
    const currentDate = new Date(startDate);
    const lastDate = new Date(endDate);
    const allDates: string[] = [];

    while (currentDate <= lastDate) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const assignment = assignments.find(a =>
        a.start_date <= dateStr && a.end_date >= dateStr
      );
      if (assignment) {
        dateAssignmentMap[dateStr] = assignment;
      }
      allDates.push(dateStr);
      currentDate.setDate(currentDate.getDate() + 1);
    }

    const attendanceMap = new Map<string, AttendanceData>();
    attendanceData?.forEach(record => {
      attendanceMap.set(record.date, record);
    });

    const results = allDates.map((date): AttendanceResult | null => {
      const assignment = dateAssignmentMap[date];
      if (!assignment) return null;

      const record = attendanceMap.get(date);
      const shiftStartTime = assignment.shift_start_time || null;
      const shiftEndTime = assignment.shift_end_time || null;
      const salaryPerDay = assignment.salary_per_day ?? undefined;

      const nurseInfo = {
        nurseName: nurseDetails.full_name,
        nursePrevRegNo: nurseDetails.nurse_prev_reg_no,
        nurseRegNo: nurseDetails.nurse_reg_no,
      };

      if (record) {
        let status = 'Absent';
        if (record.start_time) {
          if (assignment.shift_start_time) {
            const [schedH, schedM] = assignment.shift_start_time.split(':').map(Number);
            const [actH, actM] = record.start_time.split(':').map(Number);
            const scheduledMinutes = schedH * 60 + schedM;
            const actualMinutes = actH * 60 + actM;
            
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
          totalHours: calculateHoursWorked(record.total_hours, record.start_time, record.end_time),
          status,
          location: parseLocation(record.location),
          isAdminAction: !!record.is_admin_action,
          notes: record.notes ?? undefined,
          assignmentId: assignment.id,
          shiftStartTime,
          shiftEndTime,
          salaryPerDay,
          ...nurseInfo
        };
      } else {
        let status = 'Absent';
        
        const activeLeave = leaves.find(l => l.start_date <= date && l.end_date >= date);
        
        if (activeLeave) {
          status = `On Leave (${formatLeaveType(activeLeave.leave_type)})`;
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
          salaryPerDay,
          ...nurseInfo
        };
      }
    });

    const filteredResults = results.filter((item): item is AttendanceResult => item !== null);
    
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