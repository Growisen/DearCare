"use server"

import { createSupabaseServerClient } from './auth'

type StatsData = {
  activeNurses: { count: number; trend: string; trendUp: boolean };
  currentAssignments: { count: number; trend: string; trendUp: boolean };
  openRequests: { count: number; trend: string; trendUp: boolean };
  approvedClients: { count: number; trend: string; trendUp: boolean };
};

export async function fetchDashboardStats(): Promise<{ success: boolean; data?: StatsData; error?: string }> {
  try {
    const supabase = await createSupabaseServerClient();
    
    // Fetch active nurses stats
    const { count: activeNursesCount, error: nursesError } = await supabase
      .from('caregivers')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active');
    
    if (nursesError) {
      throw new Error(`Error fetching nurses: ${nursesError.message}`);
    }
    
    // Fetch current assignments stats
    const { count: assignmentsCount, error: assignmentsError } = await supabase
      .from('assignments')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active');
      
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