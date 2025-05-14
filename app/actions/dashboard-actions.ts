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
  const { data: session } = await supabase.auth.getSession();
  const userId = session?.session?.user?.id;
  
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
}

export async function fetchDashboardData(): Promise<{
  success: boolean;
  data?: DashboardData;
  error?: string;
}> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: session } = await supabase.auth.getSession();
    const userId = session?.session?.user?.id;
    
    if (!userId) {
      throw new Error("User not authenticated");
    }

    const [
      nursesResult, 
      assignmentsResult, 
      requestsResult, 
      clientsResult,
      todosResult,
      recentClientsResult
    ] = await Promise.all([

      supabase.from('nurses').select('*', { count: 'exact', head: true }).eq('status', 'unassigned'),
      supabase.from('nurse_client').select('*', { count: 'exact', head: true }),
      supabase.from('clients').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('clients').select('*', { count: 'exact', head: true }).eq('status', 'approved'),
      

      supabase
        .from('admin_dashboard_todos')
        .select('*')
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
        .order('created_at', { ascending: false })
    ]);
    
    if (nursesResult.error) throw new Error(`Error fetching nurses: ${nursesResult.error.message}`);
    if (assignmentsResult.error) throw new Error(`Error fetching assignments: ${assignmentsResult.error.message}`);
    if (requestsResult.error) throw new Error(`Error fetching requests: ${requestsResult.error.message}`);
    if (clientsResult.error) throw new Error(`Error fetching clients: ${clientsResult.error.message}`);
    if (todosResult.error) throw new Error(`Error fetching todos: ${todosResult.error.message}`);
    if (recentClientsResult.error) throw new Error(`Error fetching recent clients: ${recentClientsResult.error.message}`);
    

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
          ? individualData?.patient_name || "Unknown" 
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
    
    return {
      success: true,
      data: {
        stats: {
          activeNurses: { 
            count: nursesResult.count || 0, 
            trend: '+5%', 
            trendUp: true 
          },
          currentAssignments: { 
            count: assignmentsResult.count || 0, 
            trend: '+2%', 
            trendUp: true 
          },
          openRequests: { 
            count: requestsResult.count || 0, 
            trend: '-3%', 
            trendUp: false 
          },
          approvedClients: { 
            count: clientsResult.count || 0, 
            trend: '+10%', 
            trendUp: true 
          },
        },
        todos: todosResult.data as Todo[] || [],
        recentClients: recentClients
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