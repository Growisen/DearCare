'use server'

import { createSupabaseServerClient } from '@/app/actions/authentication/auth';
import { updateNurseStatus } from '@/app/actions/staff-management/add-nurse';
import { getOrgMappings } from '@/app/utils/org-utils';
import { getClientProfileUrl } from '@/utils/formatters';
import { logger } from '@/utils/logger';

export interface ShiftAssignment {
  nurseId: string | number;
  startDate: string;
  endDate: string;
  shiftStart: string;
  shiftEnd: string;
  salaryPerDay: string;
}

export type ScheduleResponse = {
  success: boolean;
  message: string;
}

function validateShiftTimes(shiftStart: string, shiftEnd: string): { valid: boolean; message?: string } {
  const timeRegex = /^(\d{2}):(\d{2})(?::(\d{2}))?$/;
  if (!timeRegex.test(shiftStart) || !timeRegex.test(shiftEnd)) {
    return { valid: false, message: 'Shift times must be in HH:MM or HH:MM:SS format' };
  }

  const parseTime = (timeStr: string) => {
    const [, hour, min, sec] = timeStr.match(timeRegex) || [];
    return {
      hour: Number(hour),
      min: Number(min),
      sec: Number(sec || '0'),
    };
  };

  const startTime = parseTime(shiftStart);
  const endTime = parseTime(shiftEnd);

  if (
    startTime.hour < 0 || startTime.hour > 23 ||
    startTime.min < 0 || startTime.min > 59 ||
    startTime.sec < 0 || startTime.sec > 59 ||
    endTime.hour < 0 || endTime.hour > 23 ||
    endTime.min < 0 || endTime.min > 59 ||
    endTime.sec < 0 || endTime.sec > 59
  ) {
    return { valid: false, message: 'Invalid time values in shift times' };
  }

  if (
    endTime.hour === 0 && endTime.min === 0 && endTime.sec === 0 &&
    (shiftEnd === '00:00' || shiftEnd === '00:00:00')
  ) {
    endTime.hour = 24;
  }

  const startTotal = startTime.hour * 3600 + startTime.min * 60 + startTime.sec;
  const endTotal = endTime.hour * 3600 + endTime.min * 60 + endTime.sec;

  const is24HourShift = startTotal === 0 && endTotal === 86400; 


  const isOvernightShift = endTotal < startTotal && !is24HourShift;

  if (!is24HourShift && !isOvernightShift && endTotal <= startTotal) {
    return {
      valid: false,
      message: 'Shift end time must be after shift start time, unless it\'s an overnight or 24-hour shift'
    };
  }

  return { valid: true };
}

function timeToSeconds(timeStr: string): number {
  if (!timeStr || typeof timeStr !== 'string') {
    throw new Error(`Invalid time format: ${timeStr}`);
  }
  const parts = timeStr.split(':').map(Number);
  if (parts.length < 2 || parts.some(isNaN)) {
    throw new Error(`Invalid time format: ${timeStr}`);
  }
  const [h, m, s = 0] = parts;
  if (h < 0 || h >= 24 || m < 0 || m >= 60 || s < 0 || s >= 60) {
    throw new Error(`Invalid time values: ${timeStr}`);
  }
  return h * 3600 + m * 60 + s;
}

function timesOverlap(
  startA: number,
  endA: number,
  startB: number,
  endB: number
): boolean {
  const getIntervals = (start: number, end: number): [number, number][] => {
    return start < end ? [[start, end]] : [[start, 86400], [0, end]];
  };

  const intervalsA = getIntervals(startA, endA);
  const intervalsB = getIntervals(startB, endB);

  for (const [aStart, aEnd] of intervalsA) {
    for (const [bStart, bEnd] of intervalsB) {
      if (aStart < bEnd && bStart < aEnd) return true;
    }
  }
  return false;
}


export async function scheduleNurseShifts(
  shifts: ShiftAssignment[],
  clientId: string
): Promise<ScheduleResponse> {
  try {
    const supabase = await createSupabaseServerClient();

    if (!shifts || !Array.isArray(shifts) || shifts.length === 0) {
      return {
        success: false,
        message: 'No shift data provided',
      };
    }

    if (!clientId || typeof clientId !== 'string') {
      return {
        success: false,
        message: 'Valid client ID is required',
      };
    }

    const processedShifts = shifts.map((shift, index) => {
      let nurseId = shift.nurseId;

      if (typeof nurseId === 'string') {
        const parsed = parseInt(nurseId, 10);
        if (isNaN(parsed) || parsed <= 0) {
          throw new Error(
            `Shift ${index} has an invalid Nurse ID. It must be a positive whole number.`
          );
        }
        nurseId = parsed;
      }

      if (
        typeof nurseId !== 'number' ||
        isNaN(nurseId) ||
        nurseId <= 0 ||
        !Number.isInteger(nurseId)
      ) {
        throw new Error(
          `Shift ${index} has an invalid Nurse ID. It must be a positive whole number.`
        );
      }

      return {
        ...shift,
        nurseId,
      };
    });

    for (let i = 0; i < processedShifts.length; i++) {
      const shift = processedShifts[i];

      if (
        shift.nurseId === undefined ||
        shift.nurseId === null ||
        !shift.startDate ||
        !shift.endDate ||
        !shift.shiftStart ||
        !shift.shiftEnd ||
        !shift.salaryPerDay
      ) {
        return {
          success: false,
          message: `Shift ${i} is missing required information (like dates, times, or salary).`,
        };
      }

      const startDate = new Date(shift.startDate);
      const endDate = new Date(shift.endDate);

      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        return {
          success: false,
          message: `Shift ${i} has an invalid date format.`,
        };
      }

      if (endDate < startDate) {
        return {
          success: false,
          message: `Shift ${i} has an end date that is before its start date.`,
        };
      }
      const timeValidation = validateShiftTimes(shift.shiftStart, shift.shiftEnd);
      if (!timeValidation.valid) {
        return {
          success: false,
          message: `Shift ${i} has invalid start or end times.`,
        };
      }
    }

    const shiftRecords = processedShifts.map((shift) => ({
      client_id: clientId,
      nurse_id: shift.nurseId,
      start_date: shift.startDate,
      end_date: shift.endDate,
      shift_start_time: shift.shiftStart,
      shift_end_time: shift.shiftEnd,
      salary_per_day: shift.salaryPerDay,
      assigned_type: 'individual',
    }));

    try {
      const { data: clientExists, error: clientError } = await supabase
        .from('clients')
        .select('id')
        .eq('id', clientId)
        .single();

      if (clientError || !clientExists) {
        if (clientError && clientError.code === 'PGRST116') {
          return {
            success: false,
            message: `The specified client does not exist.`,
          };
        }
        return {
          success: false,
          message: `An error occurred while verifying the client.`,
        };
      }

      const uniqueNurseIds = [
        ...new Set(processedShifts.map((shift) => shift.nurseId)),
      ];
      const { data: nursesExist, error: nurseError } = await supabase
        .from('nurses')
        .select('nurse_id')
        .in('nurse_id', uniqueNurseIds);

      if (nurseError) {
        return {
          success: false,
          message: `An error occurred while verifying the nurses.`,
        };
      }

      const foundNurseIds = nursesExist?.map((n) => n.nurse_id) || [];
      const missingNurseIds = uniqueNurseIds.filter(
        (id) => !foundNurseIds.includes(id)
      );

      if (missingNurseIds.length > 0) {
        return {
          success: false,
          message: `The following nurses could not be found: ${missingNurseIds.join(
            ', '
          )}`,
        };
      }

      const minStartDate = new Date(
        Math.min(
          ...processedShifts.map((s) => new Date(s.startDate).getTime())
        )
      )
        .toISOString()
        .split('T')[0];
      const maxEndDate = new Date(
        Math.max(...processedShifts.map((s) => new Date(s.endDate).getTime()))
      )
        .toISOString()
        .split('T')[0];

      const { data: existingShifts, error: conflictError } = await supabase
        .from('nurse_client')
        .select('nurse_id, start_date, end_date, shift_start_time, shift_end_time')
        .in('nurse_id', uniqueNurseIds)
        .gte('end_date', minStartDate)
        .lte('start_date', maxEndDate);

      if (conflictError) {
        return {
          success: false,
          message: `An error occurred while checking for existing schedules.`,
        };
      }

      const conflicts = [];
      for (let i = 0; i < processedShifts.length; i++) {
        const newShift = processedShifts[i];
        const nurseExistingShifts =
          existingShifts?.filter((es) => es.nurse_id === newShift.nurseId) || [];

        for (const existing of nurseExistingShifts) {
          const newStart = new Date(newShift.startDate);
          const newEnd = new Date(newShift.endDate);
          const existingStart = new Date(existing.start_date);
          const existingEnd = new Date(existing.end_date);

          if (newStart <= existingEnd && newEnd >= existingStart) {
            try {
              const newStartTime = timeToSeconds(newShift.shiftStart);
              const newEndTime = timeToSeconds(newShift.shiftEnd);
              const existingStartTime = timeToSeconds(existing.shift_start_time);
              const existingEndTime = timeToSeconds(existing.shift_end_time);

              if (
                timesOverlap(
                  newStartTime,
                  newEndTime,
                  existingStartTime,
                  existingEndTime
                )
              ) {
                conflicts.push(
                  `Nurse ${newShift.nurseId} is already scheduled for an overlapping time.`
                );
                break;
              }
            } catch {
              return {
                success: false,
                message: `One of the shifts has an invalid time format.`,
              };
            }
          }
        }

        for (let j = i + 1; j < processedShifts.length; j++) {
          const otherShift = processedShifts[j];
          if (newShift.nurseId === otherShift.nurseId) {
            const newStart = new Date(newShift.startDate);
            const newEnd = new Date(newShift.endDate);
            const otherStart = new Date(otherShift.startDate);
            const otherEnd = new Date(otherShift.endDate);

            if (newStart <= otherEnd && newEnd >= otherStart) {
              try {
                const newStartTime = timeToSeconds(newShift.shiftStart);
                const newEndTime = timeToSeconds(newShift.shiftEnd);
                const otherStartTime = timeToSeconds(otherShift.shiftStart);
                const otherEndTime = timeToSeconds(otherShift.shiftEnd);

                if (
                  timesOverlap(
                    newStartTime,
                    newEndTime,
                    otherStartTime,
                    otherEndTime
                  )
                ) {
                  conflicts.push(
                    `Nurse ${newShift.nurseId} has conflicting assignments in this new schedule (shifts ${i} and ${j}).`
                  );
                }
              } catch {
                return {
                  success: false,
                  message: `One of the shifts has an invalid time format.`,
                };
              }
            }
          }
        }
      }

      if (conflicts.length > 0) {
        return {
          success: false,
          message: `Scheduling conflicts detected: ${[...new Set(conflicts)].join(
            ', '
          )}`,
        };
      }

      const { data, error } = await supabase
        .from('nurse_client')
        .insert(shiftRecords)
        .select();

      if (error) {
        return {
          success: false,
          message: `A database error occurred while saving the shifts.`,
        };
      }

      if (!data || data.length === 0) {
        return {
          success: false,
          message: `The shifts were saved, but we couldn't get a confirmation.`,
        };
      }

      if (data.length !== shiftRecords.length) {
        return {
          success: false,
          message: 'Some shifts could not be saved.',
        };
      }

      const statusUpdateResults = await Promise.allSettled(
        uniqueNurseIds.map((nurseId) =>
          updateNurseStatus(nurseId, 'assigned')
        )
      );

      const failedUpdates = statusUpdateResults
        .map((result, index) => ({ result, nurseId: uniqueNurseIds[index] }))
        .filter(({ result }) => result.status === 'rejected')
        .map(({ nurseId }) => ({ nurseId }));

      if (failedUpdates.length > 0) {
        return {
          success: true,
          message: `Shifts scheduled successfully. However, the status for the following nurses could not be updated: ${failedUpdates
            .map((f) => f.nurseId)
            .join(', ')}`,
        };
      }

      return {
        success: true,
        message: 'Shifts scheduled successfully and all nurse statuses updated',
      };
    } catch {
      return {
        success: false,
        message: `An unexpected error occurred while saving the schedule.`,
      };
    }
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : 'An unexpected error occurred. Please try again.',
    };
  }
}

export interface NurseAssignmentData {
  id: number;
  nurse_id: number;
  client_id: string;
  start_date: string;
  end_date: string;
  shift_start_time: string;
  shift_end_time: string;
  status: 'active' | 'completed' | 'cancelled';
  assigned_type: string;
  salary_per_day?: number;
  nurse_reg_no?: string;
  end_notes?: string;
}

export async function getNurseAssignments(clientId: string): Promise<{
  success: boolean;
  data?: NurseAssignmentData[];
  error?: string;
}> {
  try {
    const supabase = await createSupabaseServerClient();
    
    const { data, error } = await supabase
      .from('nurse_client')
      .select(`
        *,
        nurses:nurse_id(first_name, last_name, salary_per_month, nurse_reg_no)
      `)
      .eq('client_id', clientId)
      .order('start_date', { ascending: false });
    
    if (error) {
      logger.error('Error fetching nurse assignments:', error);
      return {
        success: false,
        error: error.message
      };
    }
    
    const formattedData = data?.map(item => ({
      ...item,
      nurse_first_name: item.nurses?.first_name || '',
      nurse_last_name: item.nurses?.last_name || '',
    }));

    
    return {
      success: true,
      data: formattedData as NurseAssignmentData[]
    };
  } catch (error) {
    logger.error('Unexpected error fetching nurse assignments:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch nurse assignments'
    };
  }
}


export interface NurseAssignmentData {
  id: number;
  nurse_id: number;
  nurse_first_name?: string;
  nurse_last_name?: string;
  nurse_full_name?: string;
  client_id: string;
  start_date: string;
  end_date: string;
  salary_per_day?: number;
  salary_per_month?: number;
  shift_start_time: string;
  shift_end_time: string;
  status: 'active' | 'completed' | 'cancelled';
  assigned_type: string;
  nurses?: {
    first_name: string;
    last_name: string;
    nurse_reg_no?: string;
  };
  client_type?: string;
  client_name?: string;
  client_profile_url?: string;
  current_service_start?: string;
  current_service_end?: string;
}

export async function getAllNurseAssignments(
  page: number = 1, 
  pageSize: number = 10,
  filterStatus: 'all' | 'active' | 'upcoming' | 'completed' = 'all',
  searchQuery: string = '',
  dateFilter: string = '',
  categoryFilter?: string,
): Promise<{
  success: boolean;
  data?: NurseAssignmentData[];
  count?: number;
  error?: string;
  noResults?: boolean;
}> {
  try {
    const supabase = await createSupabaseServerClient();
    const today = new Date().toISOString().split('T')[0];

    const { data: { user } } = await supabase.auth.getUser();
    const organization = user?.user_metadata?.organization;

    const { nursesOrg } = getOrgMappings(organization);

    let query = supabase
      .from('nurse_assignments_view_with_service_history')
      .select('*', { count: 'exact' });

    if (filterStatus !== 'all') {
      switch (filterStatus) {
        case 'active':
          query = query
            .lte('start_date', today)
            .gte('end_date', today);
          break;
        case 'upcoming':
          query = query.gt('start_date', today);
          break;
        case 'completed':
          query = query.lt('end_date', today);
          break;
      }
    }

    if (dateFilter) {
      query = query
        .lte('start_date', dateFilter)
        .gte('end_date', dateFilter);
    }

    if (categoryFilter) {
      query = query.eq('admitted_type', nursesOrg);
    }

    if (searchQuery && searchQuery.trim() !== '') {
      const searchTerm = `%${searchQuery.trim().toLowerCase()}%`;
      
      query = query.or(
        `nurse_full_name.ilike.${searchTerm},` +
        `client_name.ilike.${searchTerm},` +
        `patient_name.ilike.${searchTerm},` +
        `nurse_id.eq.${parseInt(searchQuery) || 0}`
      );
    }
    
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, error, count } = await query
      .range(from, to)
      .order('id', { ascending: false });

    if (error) {
      logger.error('Error fetching nurse assignments:', error);
      return {
        success: false,
        error: error.message
      };
    }

    if (searchQuery && (!data || data.length === 0)) {
      return {
        success: true,
        data: [],
        count: 0,
        noResults: true,
        error: `No results found for search: "${searchQuery}"`
      };
    }

    const processedData = data?.map(item => {
      let computedStatus: 'active' | 'upcoming' | 'completed';
      
      if (item.start_date > today) {
        computedStatus = 'upcoming';
      } else if (item.end_date < today) {
        computedStatus = 'completed';
      } else {
        computedStatus = 'active';
      }

      const clientProfileUrl = getClientProfileUrl(item.client_id, item.client_type);
      
      return {
        ...item,
        status: computedStatus,
        client_profile_url: clientProfileUrl,
      };
    });

    return {
      success: true,
      data: processedData as NurseAssignmentData[],
      count: count || 0
    };
  } catch (error) {
    logger.error('Unexpected error fetching nurse assignments:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch nurse assignments'
    };
  }
}

export async function updateNurseAssignment(
  assignmentId: number,
  updates: {
    start_date?: string;
    end_date?: string;
    shift_start_time?: string;
    shift_end_time?: string;
  }
): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    const supabase = await createSupabaseServerClient();
    
    if (updates.end_date && updates.start_date) {
      const startDate = new Date(updates.start_date);
      const endDate = new Date(updates.end_date);
      
      if (endDate < startDate) {
        return {
          success: false,
          message: 'End date cannot be before start date'
        };
      }
    }
    
    if (updates.shift_start_time && updates.shift_end_time) {
      const timeValidation = validateShiftTimes(updates.shift_start_time, updates.shift_end_time);
      if (!timeValidation.valid) {
        return {
          success: false,
          message: timeValidation.message || 'Invalid shift times'
        };
      }
    }

    const { error } = await supabase
      .from('nurse_client')
      .update(updates)
      .eq('id', assignmentId);
    
    if (error) {
      logger.error('Error updating nurse assignment:', error);
      return {
        success: false,
        message: `Database error: ${error.message}`
      };
    }
    
    return {
      success: true,
      message: 'Assignment updated successfully'
    };
  } catch (error) {
    logger.error('Error updating nurse assignment:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to update nurse assignment'
    };
  }
}

export async function endNurseAssignment(
  assignmentId: number
): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    const supabase = await createSupabaseServerClient();
    
    // Update the assignment status to completed
    const { error } = await supabase
      .from('nurse_client')
      .update({ 
        status: 'completed',
        end_date: new Date().toISOString().split('T')[0]
      })
      .eq('id', assignmentId);
    
    if (error) {
      logger.error('Error ending nurse assignment:', error);
      return {
        success: false,
        message: `Database error: ${error.message}`
      };
    }
    
    return {
      success: true,
      message: 'Assignment ended successfully'
    };
  } catch (error) {
    logger.error('Error ending nurse assignment:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to end nurse assignment'
    };
  }
}

export async function deleteNurseAssignment(
  assignmentId: number
): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    const supabase = await createSupabaseServerClient();

    const { data: attendanceRecords, error: attendanceFetchError } = await supabase
      .from('attendence_individual')
      .select('id')
      .eq('assigned_id', assignmentId);

    if (attendanceFetchError) {
      logger.error('Error checking attendance records:', attendanceFetchError);
      return {
        success: false,
        message: `Error checking attendance records: ${attendanceFetchError.message}`
      };
    }

    if (attendanceRecords && attendanceRecords.length > 0) {
      return {
        success: false,
        message: 'Cannot delete assignment.'
      };
    }

    const { data: assignment, error: fetchError } = await supabase
      .from('nurse_client')
      .select('nurse_id')
      .eq('id', assignmentId)
      .single();

    if (fetchError) {
      logger.error('Error fetching assignment details:', fetchError);
      return {
        success: false,
        message: `Error fetching assignment details: ${fetchError.message}`
      };
    }

    const nurseId = assignment.nurse_id;

    const { error: deleteError } = await supabase
      .from('nurse_client')
      .delete()
      .eq('id', assignmentId);

    if (deleteError) {
      logger.error('Error deleting nurse assignment:', deleteError);
      return {
        success: false,
        message: `Database error: ${deleteError.message}`
      };
    }

    const { data: remainingAssignments, error: checkError } = await supabase
      .from('nurse_client')
      .select('id')
      .eq('nurse_id', nurseId);

    if (checkError) {
      logger.error('Error checking remaining assignments:', checkError);
    } else {
      if (!remainingAssignments || remainingAssignments.length === 0) {
        const statusResult = await updateNurseStatus(nurseId, 'unassigned');
        if (!statusResult.success) {
          logger.warn(`Failed to update nurse ${nurseId} status to unassigned:`, statusResult.error);
        }
      }
    }

    return {
      success: true,
      message: 'Assignment deleted successfully'
    };
  } catch (error) {
    logger.error('Error deleting nurse assignment:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to delete nurse assignment'
    };
  }
}


export async function getAssignmentById(
  assignmentId: number
): Promise<{
  success: boolean;
  data?: NurseAssignmentData;
  error?: string;
}> {
  try {
    const supabase = await createSupabaseServerClient();
    
    const { data, error } = await supabase
      .from('nurse_client')
      .select(`
        *,
        nurses(first_name, last_name, phone_number, email, nurse_reg_no, admitted_type),
        clients(
          id,
          client_type,
          individual_clients(requestor_name, requestor_address, requestor_phone, requestor_state),
          organization_clients(organization_name, organization_address, contact_person_name)
        )
      `)
      .eq('id', assignmentId)
      .single();
    
    if (error) {
      logger.error('Error fetching assignment:', error);
      return {
        success: false,
        error: error.message
      };
    }
    
    if (!data) {
      return {
        success: false,
        error: 'Assignment not found'
      };
    }
    
    const today = new Date().toISOString().split('T')[0];
    let computedStatus: 'active' | 'upcoming' | 'completed';
    
    if (data.start_date > today) {
      computedStatus = 'upcoming';
    } else if (data.end_date < today) {
      computedStatus = 'completed';
    } else {
      computedStatus = 'active';
    }
    
    let clientName = '', address = '', contactPerson = '';
    const clientType = data.clients?.client_type || '';
    const clientId = data.client_id || data.clients?.id || '';
    
    if (clientType === 'individual') {
      const individualClient = data.clients.individual_clients;
      if (individualClient) {
        if (Array.isArray(individualClient) && individualClient.length > 0) {
          clientName = individualClient[0].requestor_name || '';
          address = individualClient[0].address || '';
          contactPerson = individualClient[0].contact_person || '';
        } else if (typeof individualClient === 'object') {
          clientName = individualClient.requestor_name || '';
          address = individualClient.address || '';
          contactPerson = individualClient.contact_person || '';
        }
      }
    } else if (clientType === 'organization') {
      const organizationClient = data.clients.organization_clients;
      if (organizationClient) {
        if (Array.isArray(organizationClient) && organizationClient.length > 0) {
          clientName = organizationClient[0].organization_name || '';
          address = organizationClient[0].address || '';
          contactPerson = organizationClient[0].contact_person || '';
        } else if (typeof organizationClient === 'object') {
          clientName = organizationClient.organization_name || '';
          address = organizationClient.address || '';
          contactPerson = organizationClient.contact_person || '';
        }
      }
    }
    
    return {
      success: true,
      data: {
        ...data,
        status: computedStatus,
        client_id: clientId,
        client_type: clientType,
        client_name: clientName,
        client_address: address,
        client_contact: contactPerson,
        nurse_full_name: `${data.nurses?.first_name || ''} ${data.nurses?.last_name || ''}`.trim(),
        nurse_phone: data.nurses?.phone || '',
        nurse_email: data.nurses?.email || '',
        nurse_reg_no: data.nurses?.nurse_reg_no || '',
        admitted_type: data.nurses?.admitted_type || '',
        salaryPerDay: data.salary_per_day
      }
    };
  } catch (error) {
    logger.error('Error fetching assignment details:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch assignment details'
    };
  }
}