"use server"

import { getAuthenticatedClient } from '@/app/actions/helpers/auth.helper';
import { jsonToCSV } from '@/utils/jsonToCSV';
import toCamelCase from '@/utils/toCamelCase';

export async function fetchAdvancePaymentsById(nurseId: number) {
  const { supabase } = await getAuthenticatedClient();

  const { data, error } = await supabase
    .from('crm_nurse_advance_ledger')
    .select(`
      id,
      transaction_date,
      amount,
      transaction_type,
      status,
      notes,
      payment_method,
      receipt_file,
      return_type,
      installment_amount
    `)
    .eq('nurse_id', nurseId)
    .order('transaction_date', { ascending: false });

  if (error) {
    return {
      success: false,
      message: error.message || 'Failed to fetch advance payments',
      data: [],
      meta: { total: 0 }
    };
  }

  if (!data) {
    return {
      success: true,
      message: 'No advance payments found',
      data: [],
      meta: { total: 0 }
    };
  }

  const paymentsWithUrls = await Promise.all(
    data.map(async (transaction) => {
      let receipt_url = '';

      if (transaction.receipt_file) {
        const { data: urlData, error: urlError } = await supabase.storage
          .from('DearCare')
          .createSignedUrl(transaction.receipt_file, 60 * 60);

        if (!urlError) {
          receipt_url = urlData?.signedUrl;
        }
      }

      return toCamelCase({
        ...transaction,
        date: transaction.transaction_date,
        info: transaction.notes,
        receiptUrl: receipt_url
      });
    })
  );

  return {
    success: true,
    message: 'Advance payments fetched successfully',
    data: paymentsWithUrls,
    meta: { total: paymentsWithUrls.length }
  };
}

export async function createAdvancePayment(payment: {
  nurse_id: number;
  date: string;
  advance_amount: number;
  transaction_type: string;
  payment_method?: string;
  payment_type?: string;
  receipt_file?: File | null;
  info?: string;
  return_type: 'full' | 'installments';
  installment_amount?: number;
}) {
  const { supabase } = await getAuthenticatedClient();

  const { data, error } = await supabase
    .from('crm_nurse_advance_ledger')
    .insert([
      {
        nurse_id: payment.nurse_id,
        transaction_date: payment.date,
        amount: payment.advance_amount,
        transaction_type: payment.transaction_type,
        status: 'PENDING',
        payment_method: payment.payment_method || null,
        notes: payment.info || null,
        return_type: payment.return_type,
        installment_amount: payment.installment_amount || null,
        receipt_file: null,
        payment_type: payment.payment_type || null,
      },
    ])
    .select()
    .single();

  if (error) {
    return { success: false, message: error.message || 'Failed to insert advance payment' };
  }
  if (!data) {
    return { success: false, message: 'Failed to insert advance payment' };
  }

  if (payment.receipt_file) {
    const timestamp = new Date().getTime();
    const filePath = `Nurses/advances/${data.id}/${timestamp}_${payment.receipt_file.name}`;

    const { error: uploadError } = await supabase.storage
      .from('DearCare')
      .upload(filePath, payment.receipt_file, { upsert: true });

    if (uploadError) {
      return { success: false, message: uploadError.message || 'Failed to upload receipt file' };
    }

    const { error: updateError } = await supabase
      .from('crm_nurse_advance_ledger')
      .update({ receipt_file: filePath })
      .eq('id', data.id)
      .select()
      .single();

    if (updateError) {
      return { success: false, message: updateError.message || 'Failed to update receipt file path' };
    }
  }

  return { success: true, message: 'Advance payment created successfully' };
}

export async function deleteAdvancePaymentById(paymentId: string) {
  const { supabase } = await getAuthenticatedClient()

  const { data: payment, error: fetchError } = await supabase
    .from('nurse_advance_ledger')
    .select('created_at, receipt_file')
    .eq('id', paymentId)
    .single()

  if (fetchError) throw fetchError
  if (!payment) throw new Error('Payment not found')

  const createdAt = new Date(payment.created_at)
  const now = new Date()
  const diffHours = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60)

  if (diffHours > 24) throw new Error('Cannot delete payments created more than 24 hours ago')

  if (payment.receipt_file) {
    const { error: fileDeleteError } = await supabase.storage
      .from('DearCare')
      .remove([payment.receipt_file])

    if (fileDeleteError) throw fileDeleteError
  }

  const { error } = await supabase
    .from('nurse_advance_ledger')
    .delete()
    .eq('id', paymentId)

  if (error) throw error

  return { success: true, message: 'Payment deleted successfully' }
}

export async function updateAdvancePayment(paymentId: string, updates: {
  date?: string
  advance_amount?: number
  return_type?: 'full' | 'installments'
  installment_amount?: number
  info?: string
  payment_method?: string
  status?: 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED'
}) {
  const { supabase } = await getAuthenticatedClient()

  const mappedUpdates: {
    transaction_date?: string;
    amount?: number;
    return_type?: 'full' | 'installments';
    installment_amount?: number;
    notes?: string;
    payment_method?: string;
    status?: 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED';
  } = {}
  if (updates.date) mappedUpdates.transaction_date = updates.date
  if (updates.advance_amount !== undefined) mappedUpdates.amount = updates.advance_amount
  if (updates.return_type) mappedUpdates.return_type = updates.return_type
  if (updates.installment_amount !== undefined) mappedUpdates.installment_amount = updates.installment_amount
  if (updates.info) mappedUpdates.notes = updates.info
  if (updates.payment_method) mappedUpdates.payment_method = updates.payment_method
  if (updates.status) mappedUpdates.status = updates.status

  const { error } = await supabase
    .from('nurse_advance_ledger')
    .update(mappedUpdates)
    .eq('id', paymentId)

  if (error) throw error
  
  return { success: true, message: 'Payment updated successfully' }
}

export async function approveAdvancePayment(paymentId: string) {
  const { supabase } = await getAuthenticatedClient()
  const { data, error } = await supabase
    .from('advance_payments')
    .update({ approved: true })
    .eq('id', paymentId)
    .select()

  if (error) throw error
  return data?.[0]
}

export async function fetchAdvancePaymentTotals({
  date,
  searchTerm,
  paymentType,
}: {
  date?: string | null;
  searchTerm?: string;
  paymentType?: string;
}) {
  const { supabase, nursesOrg } = await getAuthenticatedClient();

  const totalsResult = await supabase.rpc('get_advance_payment_totals', {
    p_org: nursesOrg,
    p_date: date,
    p_search: searchTerm || null,
    p_payment_type: paymentType || null,
  });

  if (totalsResult.error) {
    return {
      totalAmountGiven: 0,
      totalAmountReturned: 0,
      error: totalsResult.error?.message,
    };
  }

  const stats = totalsResult.data?.[0] || { total_given: 0, total_returned: 0 };

  return {
    totalAmountGiven: Number(stats.total_given),
    totalAmountReturned: Number(stats.total_returned),
    error: null,
  };
}

export async function fetchAdvancePaymentRecords({
  startDate,
  page = 1,
  pageSize = 5,
  searchTerm = '',
  exportMode = false,
  paymentType,
}: {
  startDate?: string | Date | null;
  page?: number;
  pageSize?: number;
  searchTerm?: string;
  exportMode?: boolean;
  paymentType?: string;
}) {
  const { supabase, nursesOrg } = await getAuthenticatedClient();

  const dateFilter = startDate ? new Date(startDate).toISOString().split('T')[0] : null;

  const applyFilters = (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    queryBuilder: any
  ) => {
    let q = queryBuilder.eq('nurse_admitted_type', nursesOrg);

    if (dateFilter) {
      q = q.eq('date', dateFilter);
    }

    if (paymentType && paymentType !== 'all') {
      q = q.eq('payment_type', paymentType);
    }

    if (searchTerm) {
      q = q.or(
        [
          `info.ilike.%${searchTerm}%`,
          `nurse_name.ilike.%${searchTerm}%`,
          `address.ilike.%${searchTerm}%`,
          `nurse_reg_no.ilike.%${searchTerm}%`,
          `nurse_prev_reg_no.ilike.%${searchTerm}%`,
          `city.ilike.%${searchTerm}%`
        ].join(',')
      );
    }

    return q;
  };

  let from: number, to: number;
  if (exportMode) {
    from = 0;
    to = 999;
  } else {
    from = (page - 1) * pageSize;
    to = from + pageSize - 1;
  }

  const listQuery = applyFilters(
    supabase
      .from('advance_payments_view')
      .select('*', { count: 'exact' })
      .order('date', { ascending: false })
      .range(from, to)
  );


  const [listResult] = await Promise.all([listQuery]);

  if (listResult.error) {
    return {
      status: 'error',
      data: [],
      meta: {
        total: 0,
        page,
        pageSize,
        totalPages: 0,
        error: listResult.error?.message,
      },
    };
  }

  const total = listResult.count || 0;

  return {
    status: 'success',
    data: exportMode ? jsonToCSV(listResult.data || []) : listResult.data || [],
    meta: {
      total,
      page,
      pageSize,
      totalPages: exportMode ? 1 : Math.ceil(total / pageSize),
    },
  };
}