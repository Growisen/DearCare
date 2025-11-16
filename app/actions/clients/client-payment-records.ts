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

    const recentPayments = payments.map(p => {
      return {
        id: p.id,
        clientName: p.client_display_name,
        groupName: p.payment_group_name,
        amount: p.total_amount,
        date: p.date_added ? new Date(p.date_added).toISOString().split('T')[0] : '',
        modeOfPayment: p.mode_of_payment || '',
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