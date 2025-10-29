"use server"

import { createSupabaseServerClient } from '@/app/actions/authentication/auth'


export async function fetchAdvancePayments(nurseId: number) {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from('advance_payments')
    .select('*')
    .eq('nurse_id', nurseId)
    .order('date', { ascending: false })

  if (error) throw error
  return data
}

export async function insertAdvancePayment(payment: {
  nurse_id: number
  date: string
  advance_amount: number
  return_type: 'full' | 'installments'
  return_amount?: number
  remaining_amount?: number
  installment_amount?: number
  deductions?: object[]
}) {
  const supabase = await createSupabaseServerClient()

  const { data: sameDateData, error: sameDateError } = await supabase
    .from('advance_payments')
    .select('*')
    .eq('nurse_id', payment.nurse_id)
    .eq('date', payment.date)
    .single()

  if (sameDateError && sameDateError.code !== 'PGRST116') throw sameDateError

  if (sameDateData) {
    const newDeduction = {
      date: payment.date,
      lend: payment.advance_amount,
      remaining: (sameDateData.remaining_amount ?? 0) + payment.advance_amount
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
    const newDeduction = {
      date: payment.date,
      lend: payment.advance_amount,
      remaining: (remainingData.remaining_amount ?? 0) + payment.advance_amount
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
    }])
    .select()

  if (error) throw error
  return data?.[0]
}

export async function deleteAdvancePayment(paymentId: string) {
  const supabase = await createSupabaseServerClient()
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
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from('advance_payments')
    .update(updates)
    .eq('id', paymentId)
    .select()

  if (error) throw error
  return data?.[0]
}

export async function addManualInstallment(paymentId: string, installmentAmount: number, installmentDate: string) {
  const supabase = await createSupabaseServerClient()

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
    remaining: newRemaining
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