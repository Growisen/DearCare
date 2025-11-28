"use server"

import { createSupabaseServerClient } from '@/app/actions/authentication/auth';
import { logger } from '@/utils/logger';
import { getOrgMappings } from '@/app/utils/org-utils';
import { getAuthenticatedClient } from '@/app/utils/auth-utils';

interface LineItemInput {
  fieldName: string;
  amount: number;
  gst?: number;
  totalWithGst?: number;
  commission?: number;
}

interface SavePaymentGroupInput {
  clientId: string;
  groupName: string;
  lineItems: LineItemInput[];
  dateAdded?: string;
  notes?: string;
  showToClient?: boolean;
  modeOfPayment?: string;
  startDate?: string;
  endDate?: string;  
}

interface ClientPaymentRecord {
  id: string;
  client_id: string;
  payment_group_name: string;
  total_amount: number;
  date_added: string;
  notes?: string | null;
  show_to_client: boolean;
  approved: boolean;
  mode_of_payment?: string | null;
  // start_date?: string;
  // end_date?: string;  
}

interface ClientPaymentLineItem {
  id: string;
  payment_record_id: string;
  field_name: string;
  amount: number;
}

export async function saveClientPaymentGroup(input: SavePaymentGroupInput) {
  try {
    const supabase = await createSupabaseServerClient();

    const { clientId, groupName, lineItems, dateAdded, notes, showToClient, modeOfPayment, startDate, endDate } = input;

    if (!lineItems || lineItems.length === 0) {
      return { success: false, error: "At least one line item is required." };
    }

    let totalAmount = 0;
    const lineItemsToInsert = lineItems.map(item => {
      const gstValue = item.gst ? (item.amount * item.gst) / 100 : 0;
      const amountWithGst = item.amount + gstValue;
      totalAmount += amountWithGst;
      return {
        payment_record_id: undefined,
        field_name: item.fieldName,
        amount: item.amount,
        gst: item.gst || 0,
        amount_with_gst: amountWithGst,
        commission: item.commission || 0,
      };
    });

    const { data: record, error: recordError } = await supabase
      .from('client_payment_records')
      .insert([{
        client_id: clientId,
        payment_group_name: groupName,
        total_amount: totalAmount,
        date_added: dateAdded ? new Date(dateAdded).toISOString() : undefined,
        notes: notes || null,
        show_to_client: showToClient !== undefined ? showToClient : true,
        mode_of_payment: modeOfPayment || null,
        start_date: startDate ? new Date(startDate).toISOString() : null,
        end_date: endDate ? new Date(endDate).toISOString() : null, 
      }])
      .select()
      .single();

    if (recordError) {
      logger.error('Error saving payment group:', recordError);
      return { success: false, error: recordError.message };
    }

    const lineItemsWithRecordId = lineItemsToInsert.map(item => ({
      ...item,
      payment_record_id: record.id,
    }));

    const { error: lineItemsError } = await supabase
      .from('client_payment_line_items')
      .insert(lineItemsWithRecordId);

    if (lineItemsError) {
      logger.error('Error saving payment line items:', lineItemsError);
      return { success: false, error: lineItemsError.message };
    }

    return { success: true, record, lineItems: lineItemsWithRecordId };
  } catch (error: unknown) {
    logger.error('Error saving client payment group:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unknown error occurred'
    };
  }
}


export async function getClientPaymentGroups(clientId: string) {
  try {
    const supabase = await createSupabaseServerClient();

    const { data: records, error: recordsError } = await supabase
      .from('client_payment_records')
      .select('*')
      .eq('client_id', clientId)
      .order('date_added', { ascending: false });

    if (recordsError) {
      logger.error('Error fetching payment records:', recordsError);
      return { success: false, error: recordsError.message };
    }

    const recordIds = (records as ClientPaymentRecord[]).map((r) => r.id);

    const { data: lineItems, error: lineItemsError } = await supabase
      .from('client_payment_line_items')
      .select('*')
      .in('payment_record_id', recordIds);

    if (lineItemsError) {
      logger.error('Error fetching payment line items:', lineItemsError);
      return { success: false, error: lineItemsError.message };
    }

    const recordsWithItems = (records as ClientPaymentRecord[]).map((record: ClientPaymentRecord) => ({
      ...record,
      lineItems: (lineItems as ClientPaymentLineItem[]).filter((item: ClientPaymentLineItem) => item.payment_record_id === record.id),
    }));

    return { success: true, records: recordsWithItems };
  } catch (error: unknown) {
    logger.error('Error fetching client payment groups:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unknown error occurred'
    };
  }
}

export async function requireAuthenticatedUser(supabase: ReturnType<typeof createSupabaseServerClient>) {
  const { data: { user }, error } = await (await supabase).auth.getUser();
  if (error || !user) {
    return { user: null, error: error?.message || "Not authenticated" };
  }
  return { user, error: null };
}

export async function deleteClientPaymentGroup(paymentRecordId: string) {
  try {
    const supabase = await createSupabaseServerClient();

    const { user, error: authError } = await requireAuthenticatedUser(Promise.resolve(supabase));
    if (authError || !user) {
      return { success: false, error: authError };
    }

    const { error: lineItemsError } = await supabase
      .from('client_payment_line_items')
      .delete()
      .eq('payment_record_id', paymentRecordId);

    if (lineItemsError) {
      logger.error('Error deleting payment line items:', lineItemsError);
      return { success: false, error: lineItemsError.message };
    }

    const { error: recordError } = await supabase
      .from('client_payment_records')
      .delete()
      .eq('id', paymentRecordId);

    if (recordError) {
      logger.error('Error deleting payment record:', recordError);
      return { success: false, error: recordError.message };
    }

    return { success: true };
  } catch (error: unknown) {
    logger.error('Error deleting client payment group:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unknown error occurred'
    };
  }
}

export interface AssignedNurse {
  nurseId: number;
  name: string;
  regNo: string | null;
  startDate: string;
  endDate: string | null;
}

export interface RecentPayment {
  id: string;
  clientName: string;
  groupName: string;
  amount: number;
  date: string;
  modeOfPayment: string;
  assignedNurses: AssignedNurse[];
}

export interface AssignedNurse {
  nurseId: number;
  name: string;
  regNo: string | null;
  startDate: string;
  endDate: string | null;
}

export interface RecentPayment {
  id: string;
  clientName: string;
  groupName: string;
  amount: number;
  date: string;
  modeOfPayment: string;
  assignedNurses: AssignedNurse[];
}

export interface PaymentOverview {
  totalPayments: number;
  totalAmount: number;
  recentPayments: RecentPayment[];
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
  start_date: string | null;
  end_date: string | null;
};

type NurseClientJoin = {
  client_id: string;
  start_date: string;
  end_date: string | null;
  nurse_id: number;
  nurses: {
    full_name: string | null;
    nurse_reg_no: string | null;
  } | null;
};
export async function fetchPaymentOverview({
  page = 1,
  pageSize = 10,
  search = "",
  filters = {},
  isExporting = false,
}: {
  page?: number;
  pageSize?: number;
  search?: string;
  filters?: Record<string, unknown>;
  isExporting?: boolean;
}): Promise<{
  success: boolean;
  data?: PaymentOverview;
  error?: string;
}> {
  try {
    const { supabase } = await getAuthenticatedClient();

    const { data: { user } } = await supabase.auth.getUser();
    const organization = user?.user_metadata?.organization;

    const { clientsOrg } = getOrgMappings(organization);

    let paymentsQuery = supabase
      .from('unified_payment_records_view')
      .select('*', { count: 'exact' })
      .order('date_added', { ascending: false })
      .eq('client_category', clientsOrg);

    if (!isExporting) {
      if (filters.date) {
        const date = new Date(filters.date as string);
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        paymentsQuery = paymentsQuery
          .gte('date_added', startOfDay.toISOString())
          .lte('date_added', endOfDay.toISOString());
      }

      if (search) {
        paymentsQuery = paymentsQuery.ilike('client_display_name', `%${search}%`);
      }

      Object.entries(filters).forEach(([key, value]) => {
        if (key !== "date" && value !== undefined && value !== "") {
          paymentsQuery = paymentsQuery.eq(key, value);
        }
      });

      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      paymentsQuery = paymentsQuery.range(from, to);
    }

    const { data: rawPayments, error: paymentsError, count } = await paymentsQuery.returns<UnifiedPaymentViewRecord[]>();

    if (paymentsError) throw new Error(paymentsError.message);

    const payments = rawPayments || [];

    const paymentsWithDates = payments.filter(p => p.start_date && p.end_date);
    const clientIds = [...new Set(paymentsWithDates.map(p => p.client_id))];

    let assignmentsMap: Record<string, NurseClientJoin[]> = {};

    if (clientIds.length > 0) {
      const { data: assignments, error: assignmentError } = await supabase
        .from('nurse_client')
        .select(`
          client_id,
          start_date,
          end_date,
          nurse_id,
          nurses (
            full_name,
            nurse_reg_no
          )
        `)
        .in('client_id', clientIds)
        .returns<NurseClientJoin[]>();

      if (!assignmentError && assignments) {
        assignmentsMap = assignments.reduce((acc, curr) => {
          if (!acc[curr.client_id]) acc[curr.client_id] = [];
          acc[curr.client_id].push(curr);
          return acc;
        }, {} as Record<string, NurseClientJoin[]>);
      }
    }

    const recentPayments = payments.map(p => {
      let relevantNurses: AssignedNurse[] = [];

      if (p.start_date && p.end_date) {
        const paymentStart = new Date(p.start_date);
        const paymentEnd = new Date(p.end_date);

        const clientAssignments = assignmentsMap[p.client_id] || [];

        relevantNurses = clientAssignments
          .filter(a => {
            const assignStart = new Date(a.start_date);
            const assignEnd = a.end_date ? new Date(a.end_date) : new Date('9999-12-31');

            return assignStart <= paymentEnd && assignEnd >= paymentStart;
          })
          .map(a => ({
            nurseId: a.nurse_id,
            name: a.nurses?.full_name || 'Unknown',
            regNo: a.nurses?.nurse_reg_no || null,
            startDate: a.start_date,
            endDate: a.end_date
          }));
      }

      return {
        id: p.id,
        clientName: p.client_display_name,
        groupName: p.payment_group_name,
        amount: p.total_amount,
        date: p.date_added ? new Date(p.date_added).toISOString().split('T')[0] : '',
        modeOfPayment: p.mode_of_payment || '',
        assignedNurses: relevantNurses,
        startDate: p.start_date,
        endDate: p.end_date,
      };
    });

    const totalPayments = isExporting ? payments.length : (count ?? payments.length);
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

export interface UpdatePaymentGroupInput {
  paymentRecordId: number | string;
  groupName?: string;
  notes?: string;
  showToClient?: boolean;
  modeOfPayment?: string;
  startDate?: string;
  endDate?: string;
  approved?: boolean;
}

export async function updateClientPaymentGroup(input: UpdatePaymentGroupInput) {
  try {
    const supabase = await createSupabaseServerClient();

    const updateFields: Record<string, unknown> = {};
    if (input.groupName !== undefined) updateFields.payment_group_name = input.groupName;
    if (input.notes !== undefined) updateFields.notes = input.notes;
    if (input.showToClient !== undefined) updateFields.show_to_client = input.showToClient;
    if (input.modeOfPayment !== undefined) updateFields.mode_of_payment = input.modeOfPayment;
    if (input.startDate !== undefined) updateFields.start_date = input.startDate ? new Date(input.startDate).toISOString() : null;
    if (input.endDate !== undefined) updateFields.end_date = input.endDate ? new Date(input.endDate).toISOString() : null;
    if (input.approved !== undefined) updateFields.approved = input.approved;
    
    const { error } = await supabase
      .from('client_payment_records')
      .update(updateFields)
      .eq('id', input.paymentRecordId);

    if (error) {
      logger.error('Error updating payment group:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error: unknown) {
    logger.error('Error updating client payment group:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unknown error occurred'
    };
  }
}