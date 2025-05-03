'use server'

import { createSupabaseServerClient } from './auth';
import { updateNurseStatus } from './add-nurse';

export interface ShiftAssignment {
  nurseId: string;
  startDate: string;
  endDate: string;
  shiftStart: string;
  shiftEnd: string;
}

export type ScheduleResponse = {
  success: boolean;
  message: string;
}

export async function scheduleNurseShifts(shifts: ShiftAssignment[], clientId: string): Promise<ScheduleResponse> {
  try {

    const supabase = await createSupabaseServerClient();

    if (!shifts || !Array.isArray(shifts) || shifts.length === 0) {
      return {
        success: false,
        message: 'No shift data provided'
      };
    }

    const processedShifts = shifts.map(shift => ({
      ...shift,
      nurseId: typeof shift.nurseId === 'string' ? parseInt(shift.nurseId, 10) : shift.nurseId
    }));

    for (const shift of processedShifts) {

      if (shift.nurseId === undefined || shift.nurseId === null || !shift.startDate || !shift.endDate || !shift.shiftStart || !shift.shiftEnd) {
        return {
          success: false,
          message: 'Incomplete shift data provided'
        };
      }

      // Validate that nurseId is a number
      if (typeof shift.nurseId !== 'number' || isNaN(shift.nurseId)) {
        console.log("type ", typeof shift.nurseId)
        return {
          success: false,
          message: 'Nurse ID must be a valid number'
        };
      }

      const startDate = new Date(shift.startDate);
      const endDate = new Date(shift.endDate);
      
      if (endDate < startDate) {
        return {
          success: false,
          message: 'End date cannot be before start date'
        };
      }
      
      const [startTimeStr, startSecs = '00'] = shift.shiftStart.split(':');
      const [endTimeStr, endSecs = '00'] = shift.shiftEnd.split(':');
      const [startHour, startMin] = startTimeStr.split(':').map(Number);
      const [endHour, endMin] = endTimeStr.split(':').map(Number);
      
      if (startHour > endHour || 
          (startHour === endHour && startMin > endMin) || 
          (startHour === endHour && startMin === endMin && startSecs >= endSecs)) {
        return {
          success: false,
          message: 'Shift end time must be after shift start time'
        };
      }
    }

    const shiftRecords = processedShifts.map(shift => ({
      client_id: clientId,
      nurse_id: shift.nurseId,
      start_date: shift.startDate,
      end_date: shift.endDate,
      shift_start_time: shift.shiftStart,
      shift_end_time: shift.shiftEnd,
      assigned_type: 'individual'
    }));

    console.log('Attempting to insert shifts:', JSON.stringify(shiftRecords, null, 2));

    try {
     
      const { data: clientExists, error: clientError } = await supabase
        .from('clients')
        .select('id')
        .eq('id', clientId)
        .single();

      if (clientError || !clientExists) {
        console.error('Client does not exist:', clientId);
        return {
          success: false,
          message: 'Client does not exist'
        };
      }

      const nurseIds = processedShifts.map(shift => shift.nurseId);
      const { data: nursesExist, error: nurseError } = await supabase
        .from('nurses')
        .select('nurse_id')
        .in('nurse_id', nurseIds);

      if (nurseError) {
        console.error('Error checking nurses:', nurseError);
      } else {
        const foundNurseIds = nursesExist.map(n => n.nurse_id);
        const missingNurseIds = nurseIds.filter(id => !foundNurseIds.includes(id));
        if (missingNurseIds.length > 0) {
          console.warn('Some nurse IDs do not exist:', missingNurseIds);
        }
      }

      const { data, error } = await supabase
        .from('nurse_client')
        .insert(shiftRecords)
        .select();

      if (error) {
        console.error('Error inserting shift data:', error);
        return {
          success: false,
          message: `Database error: ${error.message}`
        };
      }

      console.log('Insert response data:', data);
      
      if (!data || data.length === 0) {
        console.warn('No data returned after insert - possible silent failure');
      }

      // Update status for all nurses involved in the shift assignment
      const uniqueNurseIds = [...new Set(processedShifts.map(shift => shift.nurseId))];
      
      const statusUpdates = await Promise.all(
        uniqueNurseIds.map(nurseId => 
          updateNurseStatus(nurseId, 'assigned')
        )
      );
      
      const statusUpdateErrors = statusUpdates
        .filter(update => !update.success)
        .map(update => update.error);
        
      if (statusUpdateErrors.length > 0) {
        console.warn('Some nurse status updates failed:', statusUpdateErrors);
      }

      return {
        success: true,
        message: 'Shifts scheduled successfully and nurse status updated to assigned',
      };
    } catch (insertError) {
      console.error('Unexpected error during database operations:', insertError);
      return {
        success: false,
        message: 'Unexpected error during database operations'
      };
    }
  } catch (error) {
    console.error('Error scheduling shifts:', error);
    
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to schedule shifts'
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
      .select('*')
      .eq('client_id', clientId);
    
    if (error) {
      console.error('Error fetching nurse assignments:', error);
      return {
        success: false,
        error: error.message
      };
    }
    
    return {
      success: true,
      data: data as NurseAssignmentData[]
    };
  } catch (error) {
    console.error('Unexpected error fetching nurse assignments:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch nurse assignments'
    };
  }
}


export async function getAllNurseAssignments(): Promise<{
  success: boolean;
  data?: NurseAssignmentData[];
  error?: string;
}> {
  try {
    const supabase = await createSupabaseServerClient();
    
    const { data, error } = await supabase
      .from('nurse_client')
      .select('*');
    
    if (error) {
      console.error('Error fetching all nurse assignments:', error);
      return {
        success: false,
        error: error.message
      };
    }
    
    return {
      success: true,
      data: data as NurseAssignmentData[]
    };
  } catch (error) {
    console.error('Unexpected error fetching all nurse assignments:', error);
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
    
    // Validate data
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
      const [startTimeStr, startSecs = '00'] = updates.shift_start_time.split(':');
      const [endTimeStr, endSecs = '00'] = updates.shift_end_time.split(':');
      const [startHour, startMin] = startTimeStr.split(':').map(Number);
      const [endHour, endMin] = endTimeStr.split(':').map(Number);
      
      if (startHour > endHour || 
          (startHour === endHour && startMin > endMin) || 
          (startHour === endHour && startMin === endMin && startSecs >= endSecs)) {
        return {
          success: false,
          message: 'Shift end time must be after shift start time'
        };
      }
    }
    
    // Update the assignment in the database
    const { error } = await supabase
      .from('nurse_client')
      .update(updates)
      .eq('id', assignmentId);
    
    if (error) {
      console.error('Error updating nurse assignment:', error);
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
    console.error('Error updating nurse assignment:', error);
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
      console.error('Error ending nurse assignment:', error);
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
    console.error('Error ending nurse assignment:', error);
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

    const { data: assignment, error: fetchError } = await supabase
      .from('nurse_client')
      .select('nurse_id')
      .eq('id', assignmentId)
      .single();
    
    if (fetchError) {
      console.error('Error fetching assignment details:', fetchError);
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
      console.error('Error deleting nurse assignment:', deleteError);
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
      console.error('Error checking remaining assignments:', checkError);
    } else {
      if (!remainingAssignments || remainingAssignments.length === 0) {
        const statusResult = await updateNurseStatus(nurseId, 'unassigned');
        if (!statusResult.success) {
          console.warn(`Failed to update nurse ${nurseId} status to unassigned:`, statusResult.error);
        }
      }
    }
    
    return {
      success: true,
      message: 'Assignment deleted successfully'
    };
  } catch (error) {
    console.error('Error deleting nurse assignment:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to delete nurse assignment'
    };
  }
}