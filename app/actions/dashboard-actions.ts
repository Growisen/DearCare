"use server"

import { createSupabaseServerClient } from './auth'

type StatsData = {
  activeNurses: { count: number; trend: string; trendUp: boolean };
  currentAssignments: { count: number; trend: string; trendUp: boolean };
  openRequests: { count: number; trend: string; trendUp: boolean };
  approvedClients: { count: number; trend: string; trendUp: boolean };
};

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


export async function fetchDashboardStats(): Promise<{ success: boolean; data?: StatsData; error?: string }> {
  try {
    const supabase = await createSupabaseServerClient();
    
    const [nursesResult, assignmentsResult, requestsResult, clientsResult] = await Promise.all([
      supabase.from('nurses').select('*', { count: 'exact', head: true }).eq('status', 'unassigned'),
      
      supabase.from('nurse_client').select('*', { count: 'exact', head: true }),
      
      supabase.from('clients').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      
      supabase.from('clients').select('*', { count: 'exact', head: true }).eq('status', 'approved')
    ]);
    
    if (nursesResult.error) throw new Error(`Error fetching nurses: ${nursesResult.error.message}`);
    if (assignmentsResult.error) throw new Error(`Error fetching assignments: ${assignmentsResult.error.message}`);
    if (requestsResult.error) throw new Error(`Error fetching requests: ${requestsResult.error.message}`);
    if (clientsResult.error) throw new Error(`Error fetching clients: ${clientsResult.error.message}`);
    
    return {
      success: true,
      data: {
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
      }
    };
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unknown error occurred',
      data: {
        activeNurses: { count: 0, trend: '0%', trendUp: true },
        currentAssignments: { count: 0, trend: '0%', trendUp: true },
        openRequests: { count: 0, trend: '0%', trendUp: true },
        approvedClients: { count: 0, trend: '0%', trendUp: true },
      }
    };
  }
}

export async function fetchTodos(): Promise<{ success: boolean; data: Todo[]; error?: string }> {
  try {
    const { supabase, userId } = await getAuthenticatedClient();
    
    const { data, error } = await supabase
      .from('admin_dashboard_todos')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
      
    if (error) {
      throw new Error(error.message);
    }
    
    return { 
      success: true, 
      data: data as Todo[] || [] 
    };
  } catch (error) {
    console.error('Error fetching todos:', error);
    return {
      success: false,
      data: [],
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