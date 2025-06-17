'use server'

import { createSupabaseServerClient } from './auth';
import { updateNurseStatus } from './add-nurse';
import { getClientProfileUrl } from '@/utils/formatters';

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
      .select(`
        *,
        nurses:nurse_id(first_name, last_name)
      `)
      .eq('client_id', clientId);
    
    if (error) {
      console.error('Error fetching nurse assignments:', error);
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
    console.error('Unexpected error fetching nurse assignments:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch nurse assignments'
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
  nurses?: {
    first_name: string;
    last_name: string;
  };
  client_type?: string;
  client_name?: string;
  client_profile_url?: string;
}

export async function getAllNurseAssignments(
  page: number = 1, 
  pageSize: number = 10,
  filterStatus: 'all' | 'active' | 'upcoming' | 'completed' = 'all',
  searchQuery: string = '',
  dateFilter: string = ''
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

    let query = supabase
      .from('nurse_client')
      .select(`
        *,
        nurses(first_name, last_name),
        clients(
          id,
          client_type,
          individual_clients(requestor_name),
          organization_clients(organization_name)
        )
      `, { count: 'exact' });

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

    // Apply date filter if provided
    if (dateFilter) {
      query = query
        .lte('start_date', dateFilter)
        .gte('end_date', dateFilter);
    }

    if (searchQuery) {
      try {
        query = query.or(`nurse_id.eq.${parseInt(searchQuery) || 0}`);
      } catch (searchError) {
        console.error('Search query error:', searchError);
        return {
          success: false,
          error: 'Invalid search query format',
          data: [],
          count: 0
        };
      }
    }
    
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, error, count } = await query
      .range(from, to)
      .order('id', { ascending: false });

    if (error) {
      console.error('Error fetching nurse assignments:', error);
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
      const startDate = item.start_date;
      const endDate = item.end_date;
      
      if (startDate > today) {
        computedStatus = 'upcoming';
      } else if (endDate < today) {
        computedStatus = 'completed';
      } else {
        computedStatus = 'active';
      }

      let clientName = '';
      const clientType = item.clients?.client_type || '';
      
      if (item.clients?.client_type === 'individual') {
        const individualClient = item.clients.individual_clients;
        
        if (individualClient) {
          if (Array.isArray(individualClient) && individualClient.length > 0) {
            clientName = individualClient[0].requestor_name || '';
          } else if (typeof individualClient === 'object') {
            clientName = individualClient.requestor_name || '';
          }
        }
      } 
      else if (item.clients?.client_type === 'organization') {
        const organizationClient = item.clients.organization_clients;
        
        if (organizationClient) {
          if (Array.isArray(organizationClient) && organizationClient.length > 0) {
            clientName = organizationClient[0].organization_name || '';
          } else if (typeof organizationClient === 'object') {
            clientName = organizationClient.organization_name || '';
          }
        }
      }

      const clientProfileUrl = getClientProfileUrl(item.client_id, clientType);
      
      return {
        ...item,
        status: computedStatus,
        client_type: clientType,
        client_name: clientName,
        client_profile_url: clientProfileUrl,
        clients: undefined,
      };
    });

    return {
      success: true,
      data: processedData as NurseAssignmentData[],
      count: count || 0
    };
  } catch (error) {
    console.error('Unexpected error fetching nurse assignments:', error);
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
        nurses(first_name, last_name, phone_number, email),
        clients(
          id,
          client_type,
          individual_clients(requestor_name, requestor_address, requestor_phone),
          organization_clients(organization_name, organization_address, contact_person_name)
        )
      `)
      .eq('id', assignmentId)
      .single();
    
    if (error) {
      console.error('Error fetching assignment:', error);
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
        nurse_email: data.nurses?.email || ''
      }
    };
  } catch (error) {
    console.error('Error fetching assignment details:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch assignment details'
    };
  }
}