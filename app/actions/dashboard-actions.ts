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


export async function fetchDashboardStats(): Promise<{ success: boolean; data?: StatsData; error?: string }> {
  try {
    const supabase = await createSupabaseServerClient();
    
    // Fetch active nurses stats
    const { count: activeNursesCount, error: nursesError } = await supabase
      .from('nurses')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'unassigned');
    
    if (nursesError) {
      throw new Error(`Error fetching nurses: ${nursesError.message}`);
    }
    
    // Fetch current assignments stats
    const { count: assignmentsCount, error: assignmentsError } = await supabase
      .from('nurse_client')
      .select('*', { count: 'exact', head: true });
      
    if (assignmentsError) {
      throw new Error(`Error fetching assignments: ${assignmentsError.message}`);
    }
    
    // Fetch open requests stats
    const { count: requestsCount, error: requestsError } = await supabase
      .from('clients')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');
      
    if (requestsError) {
      throw new Error(`Error fetching requests: ${requestsError.message}`);
    }
    
    // Fetch active clients stats
    const { count: clientsCount, error: clientsError } = await supabase
      .from('clients')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'approved');
      
    if (clientsError) {
      throw new Error(`Error fetching clients: ${clientsError.message}`);
    }
    
    // Calculate trends (just placeholder values for now)
    // In a real implementation, you would compare with previous period data
    
    return {
      success: true,
      data: {
        activeNurses: { 
          count: activeNursesCount || 0, 
          trend: '+5%', 
          trendUp: true 
        },
        currentAssignments: { 
          count: assignmentsCount || 0, 
          trend: '+2%', 
          trendUp: true 
        },
        openRequests: { 
          count: requestsCount || 0, 
          trend: '-3%', 
          trendUp: false 
        },
        approvedClients: { 
          count: clientsCount || 0, 
          trend: '+10%', 
          trendUp: true 
        },
      }
    };
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    // Return default values in case of error
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
    const supabase = await createSupabaseServerClient();
    const { data: session } = await supabase.auth.getSession();
    const userId = session?.session?.user?.id;
    
    if (!userId) {
      return { success: false, data: [], error: "User not authenticated" };
    }
    
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
    const supabase = await createSupabaseServerClient();
    const { data: session } = await supabase.auth.getSession();
    const userId = session?.session?.user?.id;
    
    if (!userId) {
      return { success: false, error: "User not authenticated" };
    }
    
    // Create a new todo with user_id
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
    const supabase = await createSupabaseServerClient();
    const { data: session } = await supabase.auth.getSession();
    const userId = session?.session?.user?.id;
    
    if (!userId) {
      return { success: false, error: "User not authenticated" };
    }
    
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
    const supabase = await createSupabaseServerClient();
    const { data: session } = await supabase.auth.getSession();
    const userId = session?.session?.user?.id;
    
    if (!userId) {
      return { success: false, error: "User not authenticated" };
    }
    
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