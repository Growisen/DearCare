"use server"

import { getAuthenticatedClient } from '@/app/actions/helpers/auth.helper';
import { jsonToCSV } from '@/utils/jsonToCSV';

type Deduction = {
  date: string;
  amount_paid?: number;
  lend?: number;
  remaining: number;
  type?: string;
  payment_method?: string;
  receipt_file?: string | null;
  info?: string | null;
};

export async function fetchAdvancePayments(nurseId: number) {
  const { supabase } = await getAuthenticatedClient()
  const { data, error } = await supabase
    .from('advance_payments')
    .select(`
      id,
      date,
      advance_amount,
      return_type,
      return_amount,
      remaining_amount,
      installment_amount,
      info,
      payment_method,
      receipt_file,
      deductions,
      approved
    `)
    .eq('nurse_id', nurseId)
    .order('date', { ascending: false })

  if (error) throw error
  if (!data) return []

  const paymentsWithUrls = await Promise.all(
    data.map(async (payment) => {
      let receipt_url = null

      if (payment.receipt_file) {
        const { data: urlData, error: urlError } = await supabase.storage
          .from('DearCare')
          .createSignedUrl(payment.receipt_file, 60 * 60)
        
        if (urlError) throw urlError
        receipt_url = urlData?.signedUrl
      }

      let processedDeductions = payment.deductions

      if (Array.isArray(payment.deductions)) {
        processedDeductions = await Promise.all(
          payment.deductions.map(async (deduction: Deduction) => {
            if (deduction.receipt_file) {
              const { data: dedUrlData } = await supabase.storage
                .from('DearCare')
                .createSignedUrl(deduction.receipt_file, 60 * 60)

              if (dedUrlData?.signedUrl) {
                return { ...deduction, receipt_file: dedUrlData.signedUrl }
              }
            }
            return deduction
          })
        )
      }

      return { 
        ...payment, 
        receipt_url,
        deductions: processedDeductions
      }
    })
  )

  return paymentsWithUrls
}


export async function insertAdvancePayment(payment: {
  nurse_id: number
  date: string
  advance_amount: number
  return_type: 'full' | 'installments'
  return_amount?: number
  remaining_amount?: number
  installment_amount?: number
  deductions?: Deduction[]
  payment_method?: string
  receipt_file?: File | null
  info?: string
}) {
  const { supabase } = await getAuthenticatedClient()

  const uploadReceipt = async (id: number, file: File) => {
    const timestamp = new Date().getTime()
    const filePath = `Nurses/advance/${id}/${timestamp}_${file.name}`

    const { error: uploadError } = await supabase.storage
      .from('DearCare')
      .upload(filePath, file, { upsert: true })

    if (uploadError) throw uploadError
    return filePath
  }

  const { data: sameDateData, error: sameDateError } = await supabase
    .from('advance_payments')
    .select('*')
    .eq('nurse_id', payment.nurse_id)
    .eq('date', payment.date)
    .single()

  if (sameDateError && sameDateError.code !== 'PGRST116') throw sameDateError

  if (sameDateData) {
    let newReceiptPath = null
    if (payment.receipt_file) {
      newReceiptPath = await uploadReceipt(sameDateData.id, payment.receipt_file)
    }

    const newDeduction = {
      date: payment.date,
      lend: payment.advance_amount,
      remaining: (sameDateData.remaining_amount ?? 0) + payment.advance_amount,
      type: 'addition',
      payment_method: payment.payment_method,
      receipt_file: newReceiptPath,
      info: payment.info
    }

    const updatedDeductions = Array.isArray(sameDateData.deductions)
      ? [...sameDateData.deductions, newDeduction]
      : [newDeduction]

    const { data: updateData, error: updateError } = await supabase
      .from('advance_payments')
      .update({
        advance_amount: (sameDateData.advance_amount ?? 0) + payment.advance_amount,
        remaining_amount: (sameDateData.remaining_amount ?? 0) + payment.advance_amount,
        deductions: updatedDeductions
      })
      .eq('id', sameDateData.id)
      .select()

    if (updateError) throw updateError
    return updateData?.[0]
  }

  const { data: remainingData, error: remainingError } = await supabase
    .from('advance_payments')
    .select('*')
    .eq('nurse_id', payment.nurse_id)
    .gt('remaining_amount', 0)
    .order('date', { ascending: false })
    .limit(1)
    .single()

  if (remainingError && remainingError.code !== 'PGRST116') throw remainingError

  if (remainingData) {
    let newReceiptPath = null
    if (payment.receipt_file) {
      newReceiptPath = await uploadReceipt(remainingData.id, payment.receipt_file)
    }

    const newDeduction = {
      date: payment.date,
      lend: payment.advance_amount,
      remaining: (remainingData.remaining_amount ?? 0) + payment.advance_amount,
      type: 'addition',
      payment_method: payment.payment_method,
      receipt_file: newReceiptPath,
      info: payment.info
    }

    const updatedDeductions = Array.isArray(remainingData.deductions)
      ? [...remainingData.deductions, newDeduction]
      : [newDeduction]

    const { data: updateData, error: updateError } = await supabase
      .from('advance_payments')
      .update({
        advance_amount: (remainingData.advance_amount ?? 0) + payment.advance_amount,
        remaining_amount: (remainingData.remaining_amount ?? 0) + payment.advance_amount,
        deductions: updatedDeductions
      })
      .eq('id', remainingData.id)
      .select()

    if (updateError) throw updateError
    return updateData?.[0]
  }

  const installmentAmount =
    payment.return_type === 'full'
      ? payment.advance_amount
      : payment.installment_amount

  const { data, error } = await supabase
    .from('advance_payments')
    .insert([{
      nurse_id: payment.nurse_id,
      date: payment.date,
      advance_amount: payment.advance_amount,
      return_type: payment.return_type,
      return_amount: payment.return_amount,
      remaining_amount: payment.remaining_amount ?? payment.advance_amount,
      installment_amount: installmentAmount,
      deductions: payment.deductions ?? [],
      payment_method: payment.payment_method ?? null,
      receipt_file: null,
      info: payment.info ?? null
    }])
    .select()

  if (error) throw error
  const inserted = data?.[0]
  if (!inserted) throw new Error('Failed to insert advance payment')

  if (payment.receipt_file) {
    const filePath = await uploadReceipt(inserted.id, payment.receipt_file)

    const { data: updateData, error: updateError } = await supabase
      .from('advance_payments')
      .update({ receipt_file: filePath })
      .eq('id', inserted.id)
      .select()

    if (updateError) throw updateError
    return updateData?.[0]
  }

  return inserted
}

export async function deleteAdvancePayment(paymentId: string) {
  const { supabase } = await getAuthenticatedClient()

  const { data: payment, error: fetchError } = await supabase
    .from('advance_payments')
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

  const { data, error } = await supabase
    .from('advance_payments')
    .delete()
    .eq('id', paymentId)
    .select()

  if (error) throw error
  return data?.[0]
}

export async function updateAdvancePayment(paymentId: number, updates: {
  date?: string
  advance_amount?: number
  return_type?: 'full' | 'partial'
  return_amount?: number
  remaining_amount?: number
  deductions?: object[]
}) {
  const { supabase } = await getAuthenticatedClient()
  const { data, error } = await supabase
    .from('advance_payments')
    .update(updates)
    .eq('id', paymentId)
    .select()

  if (error) throw error
  return data?.[0]
}

export async function addManualInstallment(paymentId: string, installmentAmount: number, installmentDate: string, note: string) {
  const { supabase } = await getAuthenticatedClient()

  const { data: paymentData, error: fetchError } = await supabase
    .from('advance_payments')
    .select('remaining_amount, deductions, return_amount')
    .eq('id', paymentId)
    .single()

  if (fetchError) throw fetchError
  if (!paymentData) throw new Error('Advance payment not found')

  const prevRemaining = Number(paymentData.remaining_amount)
  const newRemaining = prevRemaining - installmentAmount
  if (newRemaining < 0) throw new Error('Installment amount exceeds remaining amount')

  const prevReturnAmount = Number(paymentData.return_amount) || 0
  const newReturnAmount = prevReturnAmount + installmentAmount

  const prevDeductions = Array.isArray(paymentData.deductions) ? paymentData.deductions : []
  const newDeduction = {
    amount_paid: installmentAmount,
    date: installmentDate,
    remaining: newRemaining,
    info: note
  }
  const updatedDeductions = [...prevDeductions, newDeduction]

  const { data: updateData, error: updateError } = await supabase
    .from('advance_payments')
    .update({
      remaining_amount: newRemaining,
      return_amount: newReturnAmount,
      deductions: updatedDeductions
    })
    .eq('id', paymentId)
    .select()

  if (updateError) throw updateError
  return updateData?.[0]
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


export async function deleteDeductionFromPayment(input: {
  payment_id: string,
  deduction: {
    date: string;
    amount_paid?: number;
    lend?: number;
    remaining: number;
    type?: string;
    payment_method?: string;
    receipt_file?: string | null;
    info?: string | null;
  }
}) {
  const { supabase } = await getAuthenticatedClient()

  try {
    const { data: payment, error: fetchError } = await supabase
      .from('advance_payments')
      .select('deductions, advance_amount, remaining_amount, return_amount')
      .eq('id', input.payment_id)
      .single();

    if (fetchError || !payment) {
      return { success: false, data: null };
    }

    const prevDeductions = Array.isArray(payment.deductions) ? payment.deductions : [];

    const fields = [
      'date', 'amount_paid', 'lend', 'remaining', 'type', 'payment_method', 'receipt_file', 'info'
    ];
    const deductionToDelete = prevDeductions.find((ded: Deduction) =>
      fields.every(field => {
        const a = ded[field as keyof Deduction];
        const b = input.deduction[field as keyof Deduction];
        return (a === b) || (a == null && b == null);
      })
    );

    const updatedDeductions = prevDeductions.filter((ded: Deduction) =>
      !fields.every(field => {
        const a = ded[field as keyof Deduction];
        const b = input.deduction[field as keyof Deduction];
        return (a === b) || (a == null && b == null);
      })
    );

    let newAdvanceAmount = payment.advance_amount;
    let newRemainingAmount = payment.remaining_amount;
    let newReturnAmount = payment.return_amount ?? 0;

    if (deductionToDelete) {
      if (deductionToDelete.lend) {
        newAdvanceAmount = (payment.advance_amount ?? 0) - (deductionToDelete.lend ?? 0);
        newRemainingAmount = (payment.remaining_amount ?? 0) - (deductionToDelete.lend ?? 0);
      } else if (deductionToDelete.amount_paid) {
        newRemainingAmount = (payment.remaining_amount ?? 0) + (deductionToDelete.amount_paid ?? 0);
        newReturnAmount = (payment.return_amount ?? 0) - (deductionToDelete.amount_paid ?? 0);
      }
    }

    if (newReturnAmount === 0) {
      newReturnAmount = null;
    }

    const { data: updateData, error: updateError } = await supabase
      .from('advance_payments')
      .update({
        deductions: updatedDeductions,
        advance_amount: newAdvanceAmount,
        remaining_amount: newRemainingAmount,
        return_amount: newReturnAmount
      })
      .eq('id', input.payment_id)
      .select();

    if (updateError || !updateData?.[0]) {
      return { success: false, data: null };
    }

    return { success: true, data: updateData[0] };
  } catch {
    return { success: false, data: null };
  }
}


export async function fetchAdvancePaymentTotals({
  date,
  searchTerm,
}: {
  date?: string | null;
  searchTerm?: string;
}) {
  const { supabase, nursesOrg } = await getAuthenticatedClient();

  const totalsResult = await supabase.rpc('get_advance_payment_totals', {
    p_org: nursesOrg,
    p_date: date,
    p_search: searchTerm || null,
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
}: {
  startDate?: string | Date | null;
  page?: number;
  pageSize?: number;
  searchTerm?: string;
  exportMode?: boolean;
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