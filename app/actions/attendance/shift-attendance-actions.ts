/**
 * Shift-Based Attendance Server Actions
 * 
 * Server-side functions for managing shift-based attendance for Tata Home Nursing employees.
 * These actions handle shift start/end operations, validation, and data retrieval.
 * 
 * @module shift-attendance-actions
 */

'use server';

import { createSupabaseServerClient } from '@/app/actions/authentication/auth';
import type {
  StartShiftRequest,
  StartShiftResponse,
  EndShiftRequest,
  EndShiftResponse,
  ShiftAttendanceRecord,
  ShiftHistoryFilter,
  ShiftHistoryResponse,
  ActiveShift,
  ShiftAttendanceStats,
  ShiftValidationResult,
  ShiftCalculation,
  ShiftLocation,
  ShiftStatus,
} from '@/types/shift-attendance.types';

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Auto-close expired active shifts
 * 
 * Finds shifts that are still marked as active (shift_end_datetime is NULL)
 * but their assignment period has ended. Automatically closes them at the
 * assignment end date + end time.
 * 
 * @param nurseId - Optional nurse ID to filter by specific nurse
 * @returns Number of shifts auto-closed
 */
export async function autoCloseExpiredShifts(nurseId?: number): Promise<{
  success: boolean;
  closedCount: number;
  closedShiftIds: number[];
  error?: string;
}> {
  const supabase = await createSupabaseServerClient();
  
  const today = new Date().toISOString().split('T')[0];
  
  // Find all expired active shifts
  let query = supabase
    .from('nurse_client')
    .select('id, nurse_id, shift_start_datetime, start_date, end_date, shift_start_time, shift_end_time')
    .eq('attendance_mode', 'shift_based')
    .not('shift_start_datetime', 'is', null)
    .is('shift_end_datetime', null)
    .lt('end_date', today); // Assignment end date is before today
  
  if (nurseId) {
    query = query.eq('nurse_id', nurseId);
  }
  
  const { data: expiredShifts, error: fetchError } = await query;
  
  if (fetchError) {
    console.error('[autoCloseExpiredShifts] Error fetching:', fetchError);
    return {
      success: false,
      closedCount: 0,
      closedShiftIds: [],
      error: fetchError.message,
    };
  }
  
  if (!expiredShifts || expiredShifts.length === 0) {
    return {
      success: true,
      closedCount: 0,
      closedShiftIds: [],
    };
  }
  
  console.log(`[autoCloseExpiredShifts] Found ${expiredShifts.length} expired active shifts`);
  
  const closedShiftIds: number[] = [];
  
  // Close each expired shift
  for (const shift of expiredShifts) {
    // Calculate end datetime: end_date + shift_end_time
    // If shift_end_time is not available, use end of day (23:59:59)
    let endDatetime: string;
    
    if (shift.shift_end_time) {
      // Parse time (format: "HH:MM:SS")
      const [hours, minutes] = shift.shift_end_time.split(':');
      const endDate = new Date(shift.end_date);
      endDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      endDatetime = endDate.toISOString();
    } else {
      // Default to end of assignment day
      const endDate = new Date(shift.end_date);
      endDate.setHours(23, 59, 59, 999);
      endDatetime = endDate.toISOString();
    }
    
    console.log(`[autoCloseExpiredShifts] Closing shift ${shift.id} at ${endDatetime}`);
    
    const { error: updateError } = await supabase
      .from('nurse_client')
      .update({
        shift_end_datetime: endDatetime,
        shift_end_location: JSON.stringify({
          latitude: 0,
          longitude: 0,
          timestamp: endDatetime,
          note: 'Auto-closed: Assignment period ended',
        }),
      })
      .eq('id', shift.id);
    
    if (updateError) {
      console.error(`[autoCloseExpiredShifts] Error closing shift ${shift.id}:`, updateError);
    } else {
      closedShiftIds.push(shift.id);
    }
  }
  
  return {
    success: true,
    closedCount: closedShiftIds.length,
    closedShiftIds,
  };
}

/**
 * Calculate shift attendance days from start and end datetimes
 * 
 * This is a utility function (not a server action) for calculating shift duration.
 * 
 * @param startDatetime - Shift start timestamp (ISO string)
 * @param endDatetime - Shift end timestamp (ISO string)
 * @returns Calculation details including attendance days
 */
function calculateShiftDays(
  startDatetime: string,
  endDatetime: string
): ShiftCalculation {
  const start = new Date(startDatetime);
  const end = new Date(endDatetime);
  
  const durationMs = end.getTime() - start.getTime();
  const durationHours = durationMs / (1000 * 60 * 60);
  const durationDays = durationHours / 24;
  
  // Round to 2 decimal places
  const attendanceDays = Math.round(durationDays * 100) / 100;
  
  return {
    startDatetime,
    endDatetime,
    durationMs,
    durationHours: Math.round(durationHours * 100) / 100,
    durationDays: Math.round(durationDays * 100) / 100,
    attendanceDays: Math.max(0.01, attendanceDays), // Minimum 0.01 days
  };
}

/**
 * Parse location JSON string to ShiftLocation object
 * 
 * @param locationString - JSON string or object containing location data
 * @returns Parsed ShiftLocation or null if invalid
 */
function parseLocation(locationString: string | null): ShiftLocation | null {
  if (!locationString) return null;
  
  try {
    const parsed = typeof locationString === 'string' 
      ? JSON.parse(locationString) 
      : locationString;
    
    if (parsed && typeof parsed.latitude === 'number' && typeof parsed.longitude === 'number') {
      return parsed as ShiftLocation;
    }
  } catch (error) {
    console.error('Error parsing location:', error);
  }
  
  return null;
}

/**
 * Determine shift status from timestamps
 * 
 * @param startDatetime - Shift start timestamp
 * @param endDatetime - Shift end timestamp
 * @returns Current shift status
 */
function getShiftStatus(
  startDatetime: string | null,
  endDatetime: string | null
): ShiftStatus {
  if (!startDatetime) return 'not_started';
  if (startDatetime && !endDatetime) return 'in_progress';
  return 'completed';
}

// ============================================================================
// Validation Functions
// ============================================================================

/**
 * Validate that assignment is eligible for shift-based attendance
 * 
 * @param assignmentId - Assignment ID to validate
 * @returns Validation result with error message if invalid
 */
export async function validateShiftEligibility(
  assignmentId: number
): Promise<ShiftValidationResult> {
  const supabase = await createSupabaseServerClient();
  
  // Fetch assignment with nurse details
  const { data: assignment, error } = await supabase
    .from('nurse_client')
    .select(`
      id,
      nurse_id,
      client_id,
      attendance_mode,
      start_date,
      end_date,
      shift_start_datetime,
      shift_end_datetime,
      nurses (
        admitted_type,
        first_name,
        last_name
      )
    `)
    .eq('id', assignmentId)
    .single();
  
  if (error || !assignment) {
    return {
      isValid: false,
      error: 'Assignment not found',
    };
  }
  
  // Check if assignment is for Tata Home Nursing
  const nurse = Array.isArray(assignment.nurses) ? assignment.nurses[0] : assignment.nurses;
  if (nurse?.admitted_type !== 'Tata_Homenursing') {
    return {
      isValid: false,
      error: 'Shift-based attendance is only available for Tata Home Nursing employees',
    };
  }
  
  // Check if attendance mode is shift_based
  if (assignment.attendance_mode !== 'shift_based') {
    return {
      isValid: false,
      error: 'This assignment is not configured for shift-based attendance',
    };
  }
  
  return { isValid: true };
}

/**
 * Validate that nurse can start a shift
 * 
 * @param assignmentId - Assignment ID to start shift for
 * @returns Validation result
 */
export async function validateShiftStart(
  assignmentId: number
): Promise<ShiftValidationResult> {
  // Check basic eligibility
  const eligibility = await validateShiftEligibility(assignmentId);
  if (!eligibility.isValid) return eligibility;
  
  const supabase = await createSupabaseServerClient();
  
  // Fetch assignment details
  const { data: assignment, error } = await supabase
    .from('nurse_client')
    .select('id, nurse_id, shift_start_datetime, shift_end_datetime, start_date, end_date')
    .eq('id', assignmentId)
    .single();
  
  if (error || !assignment) {
    return {
      isValid: false,
      error: 'Assignment not found',
    };
  }
  
  // Check if shift already started
  if (assignment.shift_start_datetime) {
    if (!assignment.shift_end_datetime) {
      return {
        isValid: false,
        error: 'Shift is already in progress',
      };
    } else {
      return {
        isValid: false,
        error: 'Shift has already been completed',
      };
    }
  }
  
  // Check if there's another active shift for this nurse
  const { data: activeShifts, error: activeShiftsError } = await supabase
    .from('nurse_client')
    .select('id, client_id, shift_start_datetime, shift_end_datetime, start_date, end_date')
    .eq('nurse_id', assignment.nurse_id)
    .eq('attendance_mode', 'shift_based')
    .not('shift_start_datetime', 'is', null)
    .is('shift_end_datetime', null);
  
  if (activeShiftsError) {
    console.error('[validateShiftStart] Error checking active shifts:', activeShiftsError);
  }
  
  if (activeShifts && activeShifts.length > 0) {
    console.log('[validateShiftStart] Found active shifts:', activeShifts);
    
    // Filter out the current assignment and expired assignments
    const today = new Date().toISOString().split('T')[0];
    const otherActiveShifts = activeShifts.filter(s => {
      // Exclude the current assignment
      if (s.id === assignmentId) return false;
      
      // Exclude shifts where assignment period has ended (stale active shifts)
      const endDate = s.end_date || s.start_date;
      if (today > endDate) {
        console.log(`[validateShiftStart] Ignoring stale active shift (ID: ${s.id}, ended: ${endDate})`);
        return false;
      }
      
      return true;
    });
    
    if (otherActiveShifts.length > 0) {
      const conflictingShift = otherActiveShifts[0];
      return {
        isValid: false,
        error: `You have another active shift (Assignment ID: ${conflictingShift.id}, Period: ${conflictingShift.start_date} to ${conflictingShift.end_date}). Please end it before starting a new one.`,
      };
    }
  }
  
  // Check if current date is within assignment period
  const today = new Date().toISOString().split('T')[0];
  const endDate = assignment.end_date || assignment.start_date; // Fallback to start_date if no end_date
  if (today < assignment.start_date || today > endDate) {
    return {
      isValid: false,
      error: 'Shift can only be started within the assignment period',
      warning: `Assignment period: ${assignment.start_date} to ${endDate}`,
    };
  }
  
  return { isValid: true };
}

/**
 * Validate that nurse can end a shift
 * 
 * @param assignmentId - Assignment ID to end shift for
 * @returns Validation result
 */
export async function validateShiftEnd(
  assignmentId: number
): Promise<ShiftValidationResult> {
  // Check basic eligibility
  const eligibility = await validateShiftEligibility(assignmentId);
  if (!eligibility.isValid) return eligibility;
  
  const supabase = await createSupabaseServerClient();
  
  // Fetch assignment details
  const { data: assignment, error } = await supabase
    .from('nurse_client')
    .select('id, shift_start_datetime, shift_end_datetime, end_date, start_date')
    .eq('id', assignmentId)
    .single();
  
  if (error || !assignment) {
    return {
      isValid: false,
      error: 'Assignment not found',
    };
  }
  
  // Check if shift has been started
  if (!assignment.shift_start_datetime) {
    return {
      isValid: false,
      error: 'Shift has not been started yet',
    };
  }
  
  // Check if shift already ended
  if (assignment.shift_end_datetime) {
    return {
      isValid: false,
      error: 'Shift has already been ended',
    };
  }
  
  // Check if current date is within assignment period
  const today = new Date().toISOString().split('T')[0];
  const endDate = assignment.end_date || assignment.start_date;
  if (today > endDate) {
    return {
      isValid: true,
      warning: 'Ending shift after assignment end date. Please verify the timing.',
    };
  }
  
  return { isValid: true };
}

// ============================================================================
// Core Shift Operations
// ============================================================================

/**
 * Start a shift for an assignment
 * 
 * @param request - Start shift request with assignment ID and location
 * @returns Response indicating success or failure
 */
export async function startShift(
  request: StartShiftRequest
): Promise<StartShiftResponse> {
  const { assignmentId, location } = request;
  
  console.log('[startShift] Starting for assignmentId:', assignmentId);
  
  const supabase = await createSupabaseServerClient();
  
  // First, get the nurse_id for this assignment
  const { data: assignmentData, error: assignmentError } = await supabase
    .from('nurse_client')
    .select('nurse_id')
    .eq('id', assignmentId)
    .single();
  
  if (!assignmentError && assignmentData) {
    // Auto-close any expired active shifts for this nurse
    console.log('[startShift] Checking for expired active shifts...');
    const autoCloseResult = await autoCloseExpiredShifts(assignmentData.nurse_id);
    if (autoCloseResult.closedCount > 0) {
      console.log(`[startShift] Auto-closed ${autoCloseResult.closedCount} expired shifts`);
    }
  }
  
  // Validate shift start
  const validation = await validateShiftStart(assignmentId);
  if (!validation.isValid) {
    console.log('[startShift] Validation failed:', validation.error);
    return {
      success: false,
      error: validation.error,
    };
  }
  
  console.log('[startShift] Validation passed');
  
  // First, verify the assignment exists and check its current state
  const { data: existingAssignment, error: fetchError } = await supabase
    .from('nurse_client')
    .select('id, nurse_id, attendance_mode, shift_start_datetime, shift_end_datetime')
    .eq('id', assignmentId)
    .single();
  
  if (fetchError || !existingAssignment) {
    console.error('[startShift] Assignment not found:', fetchError);
    return {
      success: false,
      error: 'Assignment not found',
    };
  }
  
  console.log('[startShift] Found assignment:', existingAssignment);
  
  // Get current timestamp
  const now = new Date().toISOString();
  
  console.log('[startShift] Attempting to update assignmentId:', assignmentId);
  
  // Update assignment with shift start details
  const { data, error } = await supabase
    .from('nurse_client')
    .update({
      shift_start_datetime: now,
      shift_start_location: JSON.stringify(location),
    })
    .eq('id', assignmentId)
    .select('id, nurse_id, client_id, shift_start_datetime');
  
  if (error) {
    console.error('[startShift] Error updating:', error);
    return {
      success: false,
      error: 'Failed to start shift. Please try again.',
    };
  }
  
  // Check if any rows were updated
  if (!data || data.length === 0) {
    console.error('[startShift] No rows updated. This usually means RLS policy is blocking or assignment does not exist');
    console.error('[startShift] AssignmentId:', assignmentId);
    return {
      success: false,
      error: 'Assignment not found or you do not have permission to update it.',
    };
  }
  
  const updatedAssignment = data[0];
  console.log('[startShift] Successfully updated:', updatedAssignment);
  
  return {
    success: true,
    data: {
      assignmentId: updatedAssignment.id,
      shiftStartDatetime: updatedAssignment.shift_start_datetime!,
      nurseId: updatedAssignment.nurse_id,
      clientId: updatedAssignment.client_id,
    },
  };
}

/**
 * End a shift for an assignment
 * 
 * @param request - End shift request with assignment ID and location
 * @returns Response indicating success or failure with calculated days
 */
export async function endShift(
  request: EndShiftRequest
): Promise<EndShiftResponse> {
  const { assignmentId, location } = request;
  
  console.log('[endShift] Starting for assignmentId:', assignmentId);
  
  // Validate shift end
  const validation = await validateShiftEnd(assignmentId);
  if (!validation.isValid) {
    console.log('[endShift] Validation failed:', validation.error);
    return {
      success: false,
      error: validation.error,
    };
  }
  
  const supabase = await createSupabaseServerClient();
  
  // Get current timestamp
  const now = new Date().toISOString();
  
  // Fetch shift start datetime
  const { data: assignment, error: fetchError } = await supabase
    .from('nurse_client')
    .select('shift_start_datetime')
    .eq('id', assignmentId)
    .single();
  
  if (fetchError) {
    console.error('[endShift] Error fetching assignment:', fetchError);
    return {
      success: false,
      error: 'Assignment not found. Please check if the assignment exists.',
    };
  }
  
  if (!assignment?.shift_start_datetime) {
    console.error('[endShift] No shift_start_datetime found');
    return {
      success: false,
      error: 'Shift start datetime not found',
    };
  }
  
  console.log('[endShift] Shift started at:', assignment.shift_start_datetime);
  
  // Calculate attendance days
  const calculation = calculateShiftDays(assignment.shift_start_datetime, now);
  
  console.log('[endShift] Calculated days:', calculation.attendanceDays);
  console.log('[endShift] Attempting to update assignmentId:', assignmentId);
  
  // Update assignment with shift end details
  // Note: calculated_attendance_days will be auto-calculated by database trigger
  const { data, error } = await supabase
    .from('nurse_client')
    .update({
      shift_end_datetime: now,
      shift_end_location: JSON.stringify(location),
    })
    .eq('id', assignmentId)
    .select('id, nurse_id, client_id, shift_start_datetime, shift_end_datetime, calculated_attendance_days');
  
  if (error) {
    console.error('[endShift] Error updating:', error);
    return {
      success: false,
      error: 'Failed to end shift. Please try again.',
    };
  }
  
  // Check if any rows were updated
  if (!data || data.length === 0) {
    console.error('[endShift] No rows updated. AssignmentId:', assignmentId);
    console.error('[endShift] This usually means RLS policy is blocking the update or assignment does not exist');
    return {
      success: false,
      error: 'Assignment not found or you do not have permission to update it.',
    };
  }
  
  console.log('[endShift] Successfully updated:', data[0]);
  
  const updatedAssignment = data[0];
  
  return {
    success: true,
    data: {
      assignmentId: updatedAssignment.id,
      shiftStartDatetime: updatedAssignment.shift_start_datetime!,
      shiftEndDatetime: updatedAssignment.shift_end_datetime!,
      calculatedAttendanceDays: updatedAssignment.calculated_attendance_days || calculation.attendanceDays,
      durationHours: calculation.durationHours,
      nurseId: updatedAssignment.nurse_id,
      clientId: updatedAssignment.client_id,
    },
  };
}

// ============================================================================
// Query Functions
// ============================================================================

/**
 * Get active shift for a nurse
 * 
 * @param nurseId - Nurse ID to check for active shifts
 * @returns Active shift information
 */
export async function getActiveShift(nurseId: number): Promise<ActiveShift> {
  const supabase = await createSupabaseServerClient();
  
  const { data, error } = await supabase
    .from('nurse_client')
    .select(`
      id,
      nurse_id,
      client_id,
      shift_start_datetime,
      shift_end_datetime,
      calculated_attendance_days,
      salary_per_day,
      shift_start_location,
      shift_end_location,
      nurses (
        first_name,
        last_name,
        nurse_reg_no,
        admitted_type
      ),
      clients!inner (
        id,
        client_type
      )
    `)
    .eq('nurse_id', nurseId)
    .eq('attendance_mode', 'shift_based')
    .not('shift_start_datetime', 'is', null)
    .is('shift_end_datetime', null)
    .order('shift_start_datetime', { ascending: false })
    .limit(1)
    .single();
  
  if (error || !data) {
    return {
      hasActiveShift: false,
      shift: null,
    };
  }
  
  // Fetch client name based on client_type
  let clientName = 'Unknown Client';
  const client = Array.isArray(data.clients) ? data.clients[0] : data.clients;
  if (client) {
    if (client.client_type === 'individual') {
      const { data: individualClient } = await supabase
        .from('individual_clients')
        .select('patient_name')
        .eq('client_id', data.client_id)
        .single();
      clientName = individualClient?.patient_name || 'Unknown Patient';
    } else if (client.client_type === 'organization') {
      const { data: orgClient } = await supabase
        .from('organization_clients')
        .select('organization_name')
        .eq('client_id', data.client_id)
        .single();
      clientName = orgClient?.organization_name || 'Unknown Organization';
    }
  }
  
  const calculation = calculateShiftDays(
    data.shift_start_datetime!,
    new Date().toISOString()
  );
  
  const nurse = Array.isArray(data.nurses) ? data.nurses[0] : data.nurses;
  const record: ShiftAttendanceRecord = {
    assignmentId: data.id,
    nurseId: data.nurse_id,
    nurseFirstName: nurse?.first_name || '',
    nurseLastName: nurse?.last_name || '',
    nurseRegNo: nurse?.nurse_reg_no || null,
    organizationType: nurse?.admitted_type || '',
    clientId: data.client_id,
    clientName,
    shiftStartDatetime: data.shift_start_datetime!,
    shiftEndDatetime: null,
    calculatedAttendanceDays: calculation.attendanceDays,
    status: 'in_progress',
    durationHours: calculation.durationHours,
    startLocation: parseLocation(data.shift_start_location),
    endLocation: null,
    salaryPerDay: data.salary_per_day,
    calculatedSalary: data.salary_per_day ? data.salary_per_day * calculation.attendanceDays : null,
  };
  
  return {
    hasActiveShift: true,
    shift: record,
  };
}

/**
 * Get shift history with filtering and pagination
 * 
 * @param filter - Filter options for querying shifts
 * @returns Paginated shift history
 */
export async function getShiftHistory(
  filter: ShiftHistoryFilter = {}
): Promise<ShiftHistoryResponse> {
  const supabase = await createSupabaseServerClient();
  
  const {
    nurseId,
    clientId,
    organizationType,
    status,
    startDate,
    endDate,
    page = 1,
    pageSize = 10,
  } = filter;
  
  let query = supabase
    .from('nurse_client')
    .select(`
      id,
      nurse_id,
      client_id,
      shift_start_datetime,
      shift_end_datetime,
      calculated_attendance_days,
      salary_per_day,
      shift_start_location,
      shift_end_location,
      nurses (
        first_name,
        last_name,
        nurse_reg_no,
        admitted_type
      ),
      clients!inner (
        id,
        client_type
      )
    `, { count: 'exact' })
    .eq('attendance_mode', 'shift_based');
  
  // Apply filters
  if (nurseId) query = query.eq('nurse_id', nurseId);
  if (clientId) query = query.eq('client_id', clientId);
  if (organizationType) query = query.eq('nurses.admitted_type', organizationType);
  
  // Filter by status
  if (status === 'not_started') {
    query = query.is('shift_start_datetime', null);
  } else if (status === 'in_progress') {
    query = query.not('shift_start_datetime', 'is', null).is('shift_end_datetime', null);
  } else if (status === 'completed') {
    query = query.not('shift_start_datetime', 'is', null).not('shift_end_datetime', 'is', null);
  }
  
  // Filter by date range
  if (startDate) query = query.gte('shift_start_datetime', startDate);
  if (endDate) query = query.lte('shift_end_datetime', endDate);
  
  // Apply pagination
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  query = query.range(from, to);
  
  // Order by shift start (most recent first)
  query = query.order('shift_start_datetime', { ascending: false, nullsFirst: false });
  
  const { data, error, count } = await query;
  
  if (error) {
    console.error('Error fetching shift history:', error);
    return {
      records: [],
      totalCount: 0,
      currentPage: page,
      totalPages: 0,
      pageSize,
    };
  }
  
  // Fetch client names for all records
  const clientIds = [...new Set((data || []).map(item => item.client_id))];
  const clientNamesMap: Record<string, string> = {};
  
  for (const clientId of clientIds) {
    const clientData = (data || []).find(item => item.client_id === clientId)?.clients;
    const client = Array.isArray(clientData) ? clientData[0] : clientData;
    if (client?.client_type === 'individual') {
      const { data: individualClient } = await supabase
        .from('individual_clients')
        .select('patient_name')
        .eq('client_id', clientId)
        .single();
      clientNamesMap[clientId] = individualClient?.patient_name || 'Unknown Patient';
    } else if (client?.client_type === 'organization') {
      const { data: orgClient } = await supabase
        .from('organization_clients')
        .select('organization_name')
        .eq('client_id', clientId)
        .single();
      clientNamesMap[clientId] = orgClient?.organization_name || 'Unknown Organization';
    } else {
      clientNamesMap[clientId] = 'Unknown Client';
    }
  }
  
  const records: ShiftAttendanceRecord[] = (data || []).map((item) => {
    const shiftStatus = getShiftStatus(item.shift_start_datetime, item.shift_end_datetime);
    const calculation = item.shift_start_datetime && item.shift_end_datetime
      ? calculateShiftDays(item.shift_start_datetime, item.shift_end_datetime)
      : item.shift_start_datetime
      ? calculateShiftDays(item.shift_start_datetime, new Date().toISOString())
      : null;
    
    const nurse = Array.isArray(item.nurses) ? item.nurses[0] : item.nurses;
    return {
      assignmentId: item.id,
      nurseId: item.nurse_id,
      nurseFirstName: nurse?.first_name || '',
      nurseLastName: nurse?.last_name || '',
      nurseRegNo: nurse?.nurse_reg_no || null,
      organizationType: nurse?.admitted_type || '',
      clientId: item.client_id,
      clientName: clientNamesMap[item.client_id] || 'Unknown Client',
      shiftStartDatetime: item.shift_start_datetime || '',
      shiftEndDatetime: item.shift_end_datetime,
      calculatedAttendanceDays: item.calculated_attendance_days || 0,
      status: shiftStatus,
      durationHours: calculation?.durationHours || 0,
      startLocation: parseLocation(item.shift_start_location),
      endLocation: parseLocation(item.shift_end_location),
      salaryPerDay: item.salary_per_day,
      calculatedSalary: item.salary_per_day ? item.salary_per_day * (item.calculated_attendance_days || 0) : null,
    };
  });
  
  const totalCount = count || 0;
  const totalPages = Math.ceil(totalCount / pageSize);
  
  return {
    records,
    totalCount,
    currentPage: page,
    totalPages,
    pageSize,
  };
}

/**
 * Get shift attendance statistics for a nurse
 * 
 * @param nurseId - Nurse ID to get statistics for
 * @param startDate - Optional start date for filtering
 * @param endDate - Optional end date for filtering
 * @returns Attendance statistics
 */
export async function getShiftAttendanceStats(
  nurseId: number,
  startDate?: string,
  endDate?: string
): Promise<ShiftAttendanceStats> {
  const supabase = await createSupabaseServerClient();
  
  let query = supabase
    .from('nurse_client')
    .select('shift_start_datetime, shift_end_datetime, calculated_attendance_days, salary_per_day')
    .eq('nurse_id', nurseId)
    .eq('attendance_mode', 'shift_based');
  
  if (startDate) query = query.gte('shift_start_datetime', startDate);
  if (endDate) query = query.lte('shift_end_datetime', endDate);
  
  const { data, error } = await query;
  
  if (error || !data) {
    return {
      totalShifts: 0,
      totalAttendanceDays: 0,
      totalHours: 0,
      averageShiftDuration: 0,
      activeShifts: 0,
      totalCalculatedSalary: 0,
    };
  }
  
  let totalShifts = 0;
  let completedShifts = 0;
  let totalAttendanceDays = 0;
  let totalHours = 0;
  let activeShifts = 0;
  let totalCalculatedSalary = 0;
  
  data.forEach((item) => {
    if (item.shift_start_datetime) {
      totalShifts++;
      
      if (item.shift_end_datetime) {
        completedShifts++;
        totalAttendanceDays += item.calculated_attendance_days || 0;
        const calculation = calculateShiftDays(item.shift_start_datetime, item.shift_end_datetime);
        totalHours += calculation.durationHours;
        
        if (item.salary_per_day && item.calculated_attendance_days) {
          totalCalculatedSalary += item.salary_per_day * item.calculated_attendance_days;
        }
      } else {
        activeShifts++;
        // Calculate current duration for active shifts
        const calculation = calculateShiftDays(item.shift_start_datetime, new Date().toISOString());
        totalHours += calculation.durationHours;
        totalAttendanceDays += calculation.attendanceDays;
      }
    }
  });
  
  const averageShiftDuration = completedShifts > 0 ? totalHours / completedShifts : 0;
  
  return {
    totalShifts: completedShifts,
    totalAttendanceDays: Math.round(totalAttendanceDays * 100) / 100,
    totalHours: Math.round(totalHours * 100) / 100,
    averageShiftDuration: Math.round(averageShiftDuration * 100) / 100,
    activeShifts,
    totalCalculatedSalary: Math.round(totalCalculatedSalary * 100) / 100,
  };
}

/**
 * Get shift attendance record by assignment ID
 * 
 * @param assignmentId - Assignment ID to fetch
 * @returns Shift attendance record or null if not found
 */
export async function getShiftByAssignmentId(
  assignmentId: number
): Promise<ShiftAttendanceRecord | null> {
  const supabase = await createSupabaseServerClient();
  
  const { data, error } = await supabase
    .from('nurse_client')
    .select(`
      id,
      nurse_id,
      client_id,
      shift_start_datetime,
      shift_end_datetime,
      calculated_attendance_days,
      salary_per_day,
      shift_start_location,
      shift_end_location,
      nurses (
        first_name,
        last_name,
        nurse_reg_no,
        admitted_type
      ),
      clients!inner (
        id,
        client_type
      )
    `)
    .eq('id', assignmentId)
    .eq('attendance_mode', 'shift_based')
    .single();
  
  if (error || !data) {
    return null;
  }
  
  // Fetch client name based on client_type
  let clientName = 'Unknown Client';
  const client = Array.isArray(data.clients) ? data.clients[0] : data.clients;
  if (client) {
    if (client.client_type === 'individual') {
      const { data: individualClient } = await supabase
        .from('individual_clients')
        .select('patient_name')
        .eq('client_id', data.client_id)
        .single();
      clientName = individualClient?.patient_name || 'Unknown Patient';
    } else if (client.client_type === 'organization') {
      const { data: orgClient } = await supabase
        .from('organization_clients')
        .select('organization_name')
        .eq('client_id', data.client_id)
        .single();
      clientName = orgClient?.organization_name || 'Unknown Organization';
    }
  }
  
  const shiftStatus = getShiftStatus(data.shift_start_datetime, data.shift_end_datetime);
  const calculation = data.shift_start_datetime && data.shift_end_datetime
    ? calculateShiftDays(data.shift_start_datetime, data.shift_end_datetime)
    : data.shift_start_datetime
    ? calculateShiftDays(data.shift_start_datetime, new Date().toISOString())
    : null;
  
  const nurse = Array.isArray(data.nurses) ? data.nurses[0] : data.nurses;
  return {
    assignmentId: data.id,
    nurseId: data.nurse_id,
    nurseFirstName: nurse?.first_name || '',
    nurseLastName: nurse?.last_name || '',
    nurseRegNo: nurse?.nurse_reg_no || null,
    organizationType: nurse?.admitted_type || '',
    clientId: data.client_id,
    clientName,
    shiftStartDatetime: data.shift_start_datetime || '',
    shiftEndDatetime: data.shift_end_datetime,
    calculatedAttendanceDays: data.calculated_attendance_days || 0,
    status: shiftStatus,
    durationHours: calculation?.durationHours || 0,
    startLocation: parseLocation(data.shift_start_location),
    endLocation: parseLocation(data.shift_end_location),
    salaryPerDay: data.salary_per_day,
    calculatedSalary: data.salary_per_day ? data.salary_per_day * (data.calculated_attendance_days || 0) : null,
  };
}

/**
 * Get aggregated shift attendance statistics for the dashboard
 * Returns organization-wide statistics for all shift-based attendance
 * 
 * @param organization - Organization type to filter by (e.g., 'tata-home-nursing')
 * @returns Aggregated attendance statistics
 */
export async function getDashboardShiftStats(
  organization: string
): Promise<{
  totalAttendanceDays: number;
  totalActiveShifts: number;
  totalCompletedShifts: number;
  averageShiftDuration: number;
  totalNursesWithShifts: number;
}> {
  const supabase = await createSupabaseServerClient();
  
  // Fetch all shift-based assignments for the organization
  const { data, error } = await supabase
    .from('nurse_client')
    .select(`
      shift_start_datetime,
      shift_end_datetime,
      calculated_attendance_days,
      nurse_id,
      nurses!inner (
        admitted_type
      )
    `)
    .eq('attendance_mode', 'shift_based')
    .eq('nurses.admitted_type', organization as any);
  
  if (error || !data) {
    return {
      totalAttendanceDays: 0,
      totalActiveShifts: 0,
      totalCompletedShifts: 0,
      averageShiftDuration: 0,
      totalNursesWithShifts: 0,
    };
  }
  
  let totalAttendanceDays = 0;
  let totalActiveShifts = 0;
  let totalCompletedShifts = 0;
  let totalDurationHours = 0;
  const nurseSet = new Set<number>();
  
  data.forEach((item) => {
    if (item.shift_start_datetime) {
      nurseSet.add(item.nurse_id);
      
      if (item.shift_end_datetime) {
        // Completed shift
        totalCompletedShifts++;
        totalAttendanceDays += item.calculated_attendance_days || 0;
        const calculation = calculateShiftDays(item.shift_start_datetime, item.shift_end_datetime);
        totalDurationHours += calculation.durationHours;
      } else {
        // Active shift
        totalActiveShifts++;
        // Calculate current duration for active shifts
        const calculation = calculateShiftDays(item.shift_start_datetime, new Date().toISOString());
        totalAttendanceDays += calculation.attendanceDays;
        totalDurationHours += calculation.durationHours;
      }
    }
  });
  
  // Convert total hours to average days
  const averageShiftDuration = totalCompletedShifts > 0 
    ? (totalDurationHours / totalCompletedShifts) / 24 
    : 0;
  
  return {
    totalAttendanceDays: Math.round(totalAttendanceDays * 100) / 100,
    totalActiveShifts,
    totalCompletedShifts,
    averageShiftDuration: Math.round(averageShiftDuration * 100) / 100,
    totalNursesWithShifts: nurseSet.size,
  };
}
