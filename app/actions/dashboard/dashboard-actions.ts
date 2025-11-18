"use server"

import { Client } from '@/types/client.types';
import { logger } from '@/utils/logger';
import { getOrgMappings } from '@/app/utils/org-utils';
import { getAuthenticatedClient } from '@/app/utils/auth-utils';

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

// ==============================
// Function: fetchDashboardData
// Description: Fetches dashboard statistics, todos, recent clients, attendance, and complaints data for the authenticated user and organization.
// Returns: Promise<{ success: boolean; data?: DashboardData; error?: string }>
// ==============================

export async function fetchDashboardData({ selectedDate }: { selectedDate?: Date | null }): Promise<{
  success: boolean;
  data?: DashboardData;
  error?: string;
}> {
  try {
    const { supabase, userId } = await getAuthenticatedClient();
    const today = new Date().toISOString().split('T')[0];
    
    let startOfDay: Date | undefined;
    let endOfDay: Date | undefined;

    if (selectedDate) {
      const date = typeof selectedDate === 'string' ? new Date(selectedDate) : selectedDate;
      startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      startOfDay = new Date(startOfDay.toISOString());
      endOfDay = new Date(endOfDay.toISOString());
    }

    const { data: { user } } = await supabase.auth.getUser();
    const organization = user?.user_metadata?.organization;

    const { nursesOrg, clientsOrg } = getOrgMappings(organization);

    let nursesQuery = supabase
      .from('nurses')
      .select('count')
      .neq('status', 'leave')
      .eq('admitted_type', nursesOrg);

    let assignmentsQuery = supabase
      .from('nurse_client')
      .select('*, nurse_id!inner(*)')
      .eq('nurse_id.admitted_type', nursesOrg);

    let pendingClientsQuery = supabase
      .from('clients')
      .select('count')
      .eq('status', 'pending')
      .eq('client_category', clientsOrg);

    let approvedClientsQuery = supabase
      .from('clients')
      .select('count')
      .eq('status', 'approved')
      .eq('client_category', clientsOrg);

    let todosQuery = supabase
      .from('admin_dashboard_todos')
      .select('id, text, time, date, location, urgent, completed')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    let recentClientsQuery = supabase
      .from('clients_view_unified')
      .select(`
        id,
        client_type,
        status,
        created_at,
        client_category,
        requestor_email,
        requestor_phone,
        requestor_name,
        patient_name,
        service_required,
        start_date,
        organization_name,
        contact_email,
        contact_phone
      `)
      .eq('client_category', clientsOrg)
      .limit(5)
      .order('created_at', { ascending: false });

    let totalComplaintsQuery = supabase.from('dearcare_complaints').select('count');
    let openComplaintsQuery = supabase.from('dearcare_complaints').select('count').eq('status', 'open');
    let underReviewComplaintsQuery = supabase.from('dearcare_complaints').select('count').eq('status', 'under_review');
    let resolvedComplaintsQuery = supabase.from('dearcare_complaints').select('count').eq('status', 'resolved');

    if (selectedDate && startOfDay && endOfDay) {
      const startIso = startOfDay.toISOString();
      const endIso = endOfDay.toISOString();

      nursesQuery = nursesQuery.gte('created_at', startIso).lte('created_at', endIso);
      assignmentsQuery = assignmentsQuery.gte('created_at', startIso).lte('created_at', endIso);
      pendingClientsQuery = pendingClientsQuery.gte('created_at', startIso).lte('created_at', endIso);
      approvedClientsQuery = approvedClientsQuery.gte('created_at', startIso).lte('created_at', endIso);

      todosQuery = todosQuery.eq('date', selectedDate);

      recentClientsQuery = recentClientsQuery.gte('created_at', startIso).lte('created_at', endIso);

      totalComplaintsQuery = totalComplaintsQuery.gte('created_at', startIso).lte('created_at', endIso);
      openComplaintsQuery = openComplaintsQuery.gte('created_at', startIso).lte('created_at', endIso);
      underReviewComplaintsQuery = underReviewComplaintsQuery.gte('created_at', startIso).lte('created_at', endIso);
      resolvedComplaintsQuery = resolvedComplaintsQuery.gte('created_at', startIso).lte('created_at', endIso);
    }

    const [
      statsResults,
      todosResult,
      recentClientsResult,
      attendanceResult,
      complaintsResults
    ] = await Promise.all([

      Promise.all([
        nursesQuery.single(),
        assignmentsQuery,
        pendingClientsQuery.single(),
        approvedClientsQuery.single()
      ]),

      todosQuery,

      recentClientsQuery,

      supabase.rpc('get_attendance_data_by_org', { 
        curr_date: selectedDate || today,
        organization: nursesOrg 
      }),

      Promise.all([
        totalComplaintsQuery.single(),
        openComplaintsQuery.single(),
        underReviewComplaintsQuery.single(),
        resolvedComplaintsQuery.single()
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

    const recentClients = (recentClientsResult.data || []).map(record => {
      const isIndividual = record.client_type === 'individual';
      return {
        id: record.id,
        name: isIndividual
          ? (record.requestor_name || record.patient_name || "Unknown")
          : (record.organization_name || "Unknown"),
        requestDate: isIndividual
          ? new Date(record.start_date || record.created_at || new Date()).toISOString().split('T')[0]
          : new Date(record.created_at || new Date()).toISOString().split('T')[0],
        service: isIndividual ? record.service_required : "Organization Care",
        status: record.status,
        email: isIndividual ? record.requestor_email : record.contact_email,
        phone: isIndividual ? record.requestor_phone : record.contact_phone,
      };
    });

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
            count: parseInt(String(assignmentsResult.data?.length)) || 0, 
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

export interface PaymentOverview {
  totalPayments: number;
  totalAmount: number;
  recentPayments: Array<{
    id: string;
    clientName: string;
    groupName: string;
    amount: number;
    date: string;
    modeOfPayment?: string;
  }>;
}

type UnifiedPaymentViewRecord = {
  id: string;
  client_id: string;
  payment_group_name: string;
  total_amount: number;
  date_added: string;
  mode_of_payment: string | null;
  client_display_name: string;
  client_category: string;
  client_type?: string;
  client_status?: string;
  total_commission?: number;
};

export async function fetchPaymentOverview({ selectedDate }: { selectedDate?: Date | null }): Promise<{
  success: boolean;
  data?: PaymentOverview;
  error?: string;
}> {
  try {
    const { supabase } = await getAuthenticatedClient();

    const { data: { user } } = await supabase.auth.getUser();
    const organization = user?.user_metadata?.organization;

    const { clientsOrg } = getOrgMappings(organization);

    const dateToUse = selectedDate ?? new Date();

    let paymentsQuery = supabase
      .from('unified_payment_records_view_with_comm')
      .select('*')
      .order('date_added', { ascending: false })
      .eq('client_category', clientsOrg);

    if (dateToUse) {
      const startOfDay = new Date(dateToUse);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(dateToUse);
      endOfDay.setHours(23, 59, 59, 999);

      paymentsQuery = paymentsQuery
        .gte('date_added', startOfDay.toISOString())
        .lte('date_added', endOfDay.toISOString());
    }

    const { data: rawPayments, error: paymentsError } = await paymentsQuery.returns<UnifiedPaymentViewRecord[]>();

    console.log('Fetched raw payments:', rawPayments);

    if (paymentsError) throw new Error(paymentsError.message);

    const payments = rawPayments || [];

    const recentPayments = payments.map(p => {
      return {
        id: p.id,
        clientName: p.client_display_name,
        groupName: p.payment_group_name,
        amount: p.total_amount,
        date: p.date_added ? new Date(p.date_added).toISOString().split('T')[0] : '',
        modeOfPayment: p.mode_of_payment || '',
        totalCommission: p.total_commission || 0,
      };
    });

    const totalPayments = payments.length;
    const totalAmount = payments.reduce((sum, p) => sum + (p.total_amount || 0), 0);

    return {
      success: true,
      data: {
        totalPayments,
        totalAmount,
        recentPayments,
      },
    };
  } catch (error) {
    logger.error('Error fetching payment overview:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unknown error occurred',
    };
  }
}
// ==============================
// Function: addTodo
// Description: Adds a new todo item for the authenticated user.
// Returns: Promise<{ success: boolean; todo?: Todo; error?: string }>
// ==============================
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
    logger.error('Error adding todo:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unknown error occurred'
    };
  }
}


// ==============================
// Function: updateTodoStatus
// Description: Updates the completion status of a todo item for the authenticated user.
// Returns: Promise<{ success: boolean; error?: string }>
// ==============================
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
    logger.error('Error updating todo status:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unknown error occurred'
    };
  }
}


// ==============================
// Function: deleteTodo
// Description: Deletes a todo item for the authenticated user.
// Returns: Promise<{ success: boolean; error?: string }>
// ==============================
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
    logger.error('Error deleting todo:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unknown error occurred'
    };
  }
}