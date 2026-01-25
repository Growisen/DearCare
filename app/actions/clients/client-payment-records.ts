"use server"

import { createSupabaseServerClient } from '@/app/actions/authentication/auth';
import { logger } from '@/utils/logger';
import { getOrgMappings } from '@/app/utils/org-utils';
import { getAuthenticatedClient } from '@/app/utils/auth-utils';
import { SavePaymentGroupInput } from '@/types/clientPayment.types';
import toCamelCase from '@/utils/toCamelCase';


export async function saveClientPaymentGroup(input: SavePaymentGroupInput) {
  try {
    const { supabase } = await getAuthenticatedClient();

    const { clientId, groupName, lineItems, dateAdded, notes, showToClient, modeOfPayment, startDate, endDate, paymentType } = input;

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
        payment_type: paymentType || null,
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
     const { supabase } = await getAuthenticatedClient();

    const { data: records, error } = await supabase
      .from('client_payment_records')
      .select(`
        *,
        lineItems:client_payment_line_items (*)
      `)
      .eq('client_id', clientId)
      .order('date_added', { ascending: false });

    if (error) {
      logger.error('Error fetching payment groups:', error);
      return { success: false, error: error.message };
    }

    return { success: true, records };

  } catch (error: unknown) {
    logger.error('Error fetching client payment groups:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unknown error occurred'
    };
  }
}

export async function deleteClientPaymentGroup(paymentRecordId: string) {
  try {
    const { supabase } = await getAuthenticatedClient();

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
  clientId: string;
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
  payment_type: string | null;
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

      if (
        filters.paymentType &&
        (filters.paymentType === "cash" || filters.paymentType === "bank transfer")
      ) {
        paymentsQuery = paymentsQuery.eq('payment_type', filters.paymentType);
      }

      Object.entries(filters).forEach(([key, value]) => {
        if (
          key !== "date" &&
          key !== "paymentType" &&
          value !== undefined &&
          value !== ""
        ) {
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
        clientId: p.client_id,
        clientName: p.client_display_name,
        groupName: p.payment_group_name,
        amount: p.total_amount,
        date: p.date_added ? new Date(p.date_added).toISOString().split('T')[0] : '',
        modeOfPayment: p.mode_of_payment || '',
        paymentType: p.payment_type || '',
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

export async function fetchClientPaymentAggregates({
  startDate,
  endDate,
  searchText,
}: {
  startDate?: string;
  endDate?: string;
  searchText?: string;
} = {}) {
  try {
    let computedEndDate = endDate;
    if (startDate && !endDate) {
      const end = new Date(startDate);
      end.setDate(end.getDate() + 1);
      computedEndDate = end.toISOString().split('T')[0];
    }

    const { supabase } = await getAuthenticatedClient();
    const { data: { user } } = await supabase.auth.getUser();
    const organization = user?.user_metadata?.organization;

    const { clientsOrg } = getOrgMappings(organization);

    const { data, error } = await supabase
      .rpc('get_client_payment_aggregates', {
        filter_client_category: clientsOrg,
        filter_start_date: startDate ?? null,
        filter_end_date: computedEndDate ?? null,
        search_text: searchText ?? null
      });

    if (error) {
      logger.error('Error fetching client payment aggregates:', error);
      return { success: false, error: error.message };
    }

    const result = Array.isArray(data) && data.length > 0 ? data[0] : { total_amount_received: 0, total_commission_generated: 0 };

    return {
      success: true,
      data: {
        totalAmountReceived: Number(result.total_amount_received),
        totalCommissionGenerated: Number(result.total_commission_generated),
      },
    };
  } catch (error: unknown) {
    logger.error('Error fetching client payment aggregates:', error);
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
  paymentType?: string;
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
    if (input.paymentType !== undefined) updateFields.payment_type = input.paymentType;

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

export interface RefundInput {
  amount: number;
  reason?: string;
  paymentMethod: string;
  paymentType: string;
  refundDate: string;
}

export const createRefundPayment = async (input: RefundInput, clientId: string) => {
  try {
    const { supabase } = await getAuthenticatedClient();

    if (input.amount <= 0) {
      return { success: false, error: "Refund amount must be greater than zero." };
    }

    const { error } = await supabase
      .from('crm_refund_payments')
      .insert({
        client_id: clientId,
        amount: input.amount,
        reason: input.reason || null,
        payment_method: input.paymentMethod,
        payment_type: input.paymentType,
        refund_date: input.refundDate ? new Date(input.refundDate).toISOString() : new Date().toISOString(),
      });

    if (error) {
      console.error("Supabase Error:", error.message);
      return { success: false, error: "Failed to create refund" };
    }

    return { success: true };
  } catch (error: unknown) {
    console.error("Unknown Error:", error);
    return {
      success: false,
      error: 'An unknown error occurred'
    };
  }
};

export const fetchRefundPayments = async (clientId: string) => {
  try {
    const { supabase } = await getAuthenticatedClient();

    if (!clientId) {
      return { success: false, error: "Client ID is required" };
    }

    const { data, error } = await supabase
      .from('crm_refund_payments')
      .select('*')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Supabase Error:", error.message);
      return { success: false, error: "Failed to fetch refunds" };
    }

    return { success: true, refunds: data?.map(toCamelCase) };
  } catch (error: unknown) {
    console.error("Unknown Error:", error);
    return {
      success: false,
      error: 'An unknown error occurred'
    };
  }
};

interface RefundPaymentsFilters {
  createdAt?: string;
  refundDate?: string;
  search?: string;
  paymentType?: string;
  page?: number;
  limit?: number;
}

export const fetchAllRefunds = async (filters: RefundPaymentsFilters) => {
  try {
    const { supabase } = await getAuthenticatedClient();

    const {
      createdAt,
      refundDate,
      search,
      paymentType,
      page = 1,
      limit = 10,
    } = filters;

    let query = supabase
      .from('crm_client_refund_details_view')
      .select('*', { count: 'exact' });

    if (createdAt) {
      const start = new Date(createdAt);
      start.setHours(0, 0, 0, 0);
      const end = new Date(createdAt);
      end.setHours(23, 59, 59, 999);
      query = query.gte('created_at', start.toISOString()).lte('created_at', end.toISOString());
    }

    if (refundDate) {
      const start = new Date(refundDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(refundDate);
      end.setHours(23, 59, 59, 999);
      query = query.gte('refund_date', start.toISOString()).lte('refund_date', end.toISOString());
    }

    if (paymentType) {
      query = query.eq('payment_type', paymentType);
    }

    if (search) {
      query = query.ilike('reason', `%${search}%`);
    }

    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.order('created_at', { ascending: false }).range(from, to);

    const { data, error, count } = await query;

    if (error) {
      console.error("Supabase Error:", error.message);
      return { success: false, error: "Failed to fetch refunds" };
    }

    return {
      success: true,
      refunds: data?.map(toCamelCase),
      total: count ?? 0,
      page,
      limit,
    };
  } catch (error: unknown) {
    console.error("Unknown Error:", error);
    return {
      success: false,
      error: 'An unknown error occurred'
    };
  }
};