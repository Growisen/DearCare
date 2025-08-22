"use server"

import { createSupabaseServerClient } from '@/app/actions/authentication/auth';
import { logger } from '@/utils/logger';

interface LineItemInput {
  fieldName: string;
  amount: number;
}

interface SavePaymentGroupInput {
  clientId: string;
  groupName: string;
  lineItems: LineItemInput[];
  dateAdded?: string;
  notes?: string;
  showToClient?: boolean;
}

interface ClientPaymentRecord {
  id: string;
  client_id: string;
  payment_group_name: string;
  total_amount: number;
  date_added: string;
  notes?: string | null;
  show_to_client: boolean;
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

    const { clientId, groupName, lineItems, dateAdded, notes, showToClient } = input;

    if (!lineItems || lineItems.length === 0) {
      return { success: false, error: "At least one line item is required." };
    }

    const totalAmount = lineItems.reduce((sum, item) => sum + item.amount, 0);

    const { data: record, error: recordError } = await supabase
      .from('client_payment_records')
      .insert([{
        client_id: clientId,
        payment_group_name: groupName,
        total_amount: totalAmount,
        date_added: dateAdded ? new Date(dateAdded).toISOString() : undefined,
        notes: notes || null,
        show_to_client: showToClient !== undefined ? showToClient : true,
      }])
      .select()
      .single();

    if (recordError) {
      logger.error('Error saving payment group:', recordError);
      return { success: false, error: recordError.message };
    }

    const lineItemsToInsert = lineItems.map(item => ({
      payment_record_id: record.id,
      field_name: item.fieldName,
      amount: item.amount,
    }));

    const { error: lineItemsError } = await supabase
      .from('client_payment_line_items')
      .insert(lineItemsToInsert);

    if (lineItemsError) {
      logger.error('Error saving payment line items:', lineItemsError);
      return { success: false, error: lineItemsError.message };
    }

    return { success: true, record, lineItems: lineItemsToInsert };
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