"use server"

import { createSupabaseServerClient } from './auth'
import { Client } from '@/types/client.types';

export interface Todo {
  id: string;
  text: string;
  time: string;
  date: string;
  location: string;
  urgent: boolean;
  completed: boolean;
  user_id?: string;
}

async function getAuthenticatedClient() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  const userId = user?.id;
  
  if (!userId) {
    throw new Error("User not authenticated");
  }
  
  return { supabase, userId };
}

export interface DashboardData {
  stats: {
    activeNurses: { count: number; trend: string; trendUp: boolean };
    currentAssignments: { count: number; trend: string; trendUp: boolean };
    openRequests: { count: number; trend: string; trendUp: boolean };
    approvedClients: { count: number; trend: string; trendUp: boolean };
  };
  todos: Todo[];
  recentClients: Client[];
  attendance: {
    present: number;
    absent: number;
    onLeave: number;
    total: number;
    presentPercentage: number;
  };
  complaints: {
    open: number;
    underReview: number;
    resolved: number;
    total: number;
  };
}

export async function fetchDashboardData(): Promise<{
  success: boolean;
  data?: DashboardData;
  error?: string;
}> {
  try {
    const { supabase, userId } = await getAuthenticatedClient();
    
    const today = new Date().toISOString().split('T')[0];

    const [
      statsResults,
      todosResult,
      recentClientsResult,
      attendanceResult,
      complaintsResults
    ] = await Promise.all([

      Promise.all([
        supabase.from('nurses').select('count').neq('status', 'leave').single(),
        supabase.from('nurse_client').select('count').single(),
        supabase.from('clients').select('count').eq('status', 'pending').single(),
        supabase.from('clients').select('count').eq('status', 'approved').single()
      ]),
    
      supabase
        .from('admin_dashboard_todos')
        .select('id, text, time, date, location, urgent, completed')
        .eq('user_id', userId)
        .order('created_at', { ascending: false }),
        
      supabase
        .from('clients')
        .select(`
          id,
          client_type,
          status,
          created_at,
          individual_clients:individual_clients(
            requestor_email,
            requestor_phone,
            patient_name,
            requestor_name,
            service_required,
            start_date
          ),
          organization_clients:organization_clients(
            organization_name,
            contact_email,
            contact_phone
          )
        `)
        .eq('status', 'pending')
        .limit(5)
        .order('created_at', { ascending: false }),
    
      supabase.rpc('get_attendance_data', { curr_date: today }),
      
      Promise.all([
        supabase.from('dearcare_complaints').select('count').single(),
        supabase.from('dearcare_complaints').select('count').eq('status', 'open').single(),
        supabase.from('dearcare_complaints').select('count').eq('status', 'under_review').single(),
        supabase.from('dearcare_complaints').select('count').eq('status', 'resolved').single()
      ])
    ]);

    const [nursesResult, assignmentsResult, requestsResult, clientsResult] = statsResults;
    const [totalComplaintsResult, openComplaintsResult, underReviewComplaintsResult, resolvedComplaintsResult] = complaintsResults;

    if (nursesResult.error) throw new Error(`Error fetching nurses: ${nursesResult.error.message}`);
    if (assignmentsResult.error) throw new Error(`Error fetching assignments: ${assignmentsResult.error.message}`);
    if (requestsResult.error) throw new Error(`Error fetching requests: ${requestsResult.error.message}`);
    if (clientsResult.error) throw new Error(`Error fetching clients: ${clientsResult.error.message}`);
    if (todosResult.error) throw new Error(`Error fetching todos: ${todosResult.error.message}`);
    if (recentClientsResult.error) throw new Error(`Error fetching recent clients: ${recentClientsResult.error.message}`);
    if (attendanceResult.error) throw new Error(`Error fetching attendance: ${attendanceResult.error.message}`);
    
    if (totalComplaintsResult.error) throw new Error(`Error fetching total complaints: ${totalComplaintsResult.error.message}`);
    if (openComplaintsResult.error) throw new Error(`Error fetching pending complaints: ${openComplaintsResult.error.message}`);
    if (underReviewComplaintsResult.error) throw new Error(`Error fetching under review complaints: ${underReviewComplaintsResult.error.message}`);
    if (resolvedComplaintsResult.error) throw new Error(`Error fetching resolved complaints: ${resolvedComplaintsResult.error.message}`);

    const recentClients = recentClientsResult.data.map(record => {
      const isIndividual = record.client_type === 'individual';
      const individualData = isIndividual ? (Array.isArray(record.individual_clients) 
        ? record.individual_clients[0] 
        : record.individual_clients) : null;
      const organizationData = !isIndividual ? (Array.isArray(record.organization_clients) 
        ? record.organization_clients[0] 
        : record.organization_clients) : null;
      
      return {
        id: record.id,
        name: isIndividual 
          ? individualData?.requestor_name || "Unknown" 
          : organizationData?.organization_name || "Unknown",
        requestDate: isIndividual
          ? new Date(individualData?.start_date || record.created_at || new Date()).toISOString().split('T')[0]
          : new Date(record.created_at || new Date()).toISOString().split('T')[0],
        service: isIndividual ? individualData?.service_required : "Organization Care",
        status: record.status,
        email: isIndividual ? individualData?.requestor_email : organizationData?.contact_email,
        phone: isIndividual ? individualData?.requestor_phone : organizationData?.contact_phone,
      };
    });

    // Process attendance data from our RPC
    const attendanceData = attendanceResult.data || { total: 0, present: 0, onLeave: 0 };
    const totalStaff = attendanceData.total || 0;
    const presentStaff = attendanceData.present || 0;
    const onLeaveStaff = attendanceData.onLeave || 0;
    const absentStaff = totalStaff - presentStaff - onLeaveStaff;
    const presentPercentage = totalStaff > 0 ? Math.round((presentStaff / totalStaff) * 100) : 0;

    const totalComplaints = parseInt(String(totalComplaintsResult.data?.count)) || 0;
    const openComplaints = parseInt(String(openComplaintsResult.data?.count)) || 0;
    const underReviewComplaints = parseInt(String(underReviewComplaintsResult.data?.count)) || 0;
    const resolvedComplaints = parseInt(String(resolvedComplaintsResult.data?.count)) || 0;
        
    return {
      success: true,
      data: {
        stats: {
          activeNurses: { 
            count: parseInt(String(nursesResult.data?.count)) || 0, 
            trend: '+5%', 
            trendUp: true 
          },
          currentAssignments: { 
            count: parseInt(String(assignmentsResult.data?.count)) || 0, 
            trend: '+2%', 
            trendUp: true 
          },
          openRequests: { 
            count: parseInt(String(requestsResult.data?.count)) || 0, 
            trend: '-3%', 
            trendUp: false 
          },
          approvedClients: { 
            count: parseInt(String(clientsResult.data?.count)) || 0, 
            trend: '+10%', 
            trendUp: true 
          },
        },
        todos: todosResult.data as Todo[] || [],
        recentClients: recentClients,
        attendance: {
          present: presentStaff,
          absent: absentStaff,
          onLeave: onLeaveStaff,
          total: totalStaff,
          presentPercentage: presentPercentage
        },
        complaints: {
          open: openComplaints,
          underReview: underReviewComplaints,
          resolved: resolvedComplaints,
          total: totalComplaints
        }
      }
    };
    
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unknown error occurred'
    };
  }
}

export async function addTodo(todo: Omit<Todo, 'id'>): Promise<{ success: boolean; todo?: Todo; error?: string }> {
  try {
    const { supabase, userId } = await getAuthenticatedClient();
    
    const newTodo = {
      ...todo,
      user_id: userId,
      created_at: new Date().toISOString()
    };
    
    const { data, error } = await supabase
      .from('admin_dashboard_todos')
      .insert(newTodo)
      .select()
      .single();
      
    if (error) {
      throw new Error(error.message);
    }
    
    return { 
      success: true, 
      todo: data as Todo 
    };
  } catch (error) {
    console.error('Error adding todo:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unknown error occurred'
    };
  }
}

export async function updateTodoStatus(id: string, completed: boolean): Promise<{ success: boolean; error?: string }> {
  try {
    const { supabase, userId } = await getAuthenticatedClient();
    
    const { error } = await supabase
      .from('admin_dashboard_todos')
      .update({ completed })
      .eq('id', id)
      .eq('user_id', userId);
      
    if (error) {
      throw new Error(error.message);
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error updating todo status:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unknown error occurred'
    };
  }
}

export async function deleteTodo(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { supabase, userId } = await getAuthenticatedClient();
    
    const { error } = await supabase
      .from('admin_dashboard_todos')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);
      
    if (error) {
      throw new Error(error.message);
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error deleting todo:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unknown error occurred'
    };
  }
}