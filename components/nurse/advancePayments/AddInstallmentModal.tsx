"use client"

import ModalPortal from '@/components/ui/ModalPortal'
import React, { useState } from 'react'
import { IoClose, IoAlertCircleOutline } from 'react-icons/io5'
import { addManualInstallment } from '@/app/actions/staff-management/advance-payments'

type InstallmentModalProps = {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  paymentId: string
}

export default function RecordRepaymentModal({
  open,
  onClose,
  onConfirm,
  paymentId,
}: InstallmentModalProps) {
  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!open) return null

  const handleConfirm = async () => {
    if (!amount.trim()) {
      setError('Repayment amount is required.')
      return
    }

    const numAmount = parseFloat(amount)
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Please enter a valid positive amount.')
      return
    }

    setIsSubmitting(true)

    try {
      const today = new Date().toISOString().slice(0, 10)
      
      await addManualInstallment(paymentId, numAmount, today, note)
      
      setAmount('')
      setNote('')
      setError('')
      onConfirm()
    } catch {
      setError('Unable to record transaction. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setAmount('')
    setError('')
    setNote('')
    onClose()
  }

  return (
    <ModalPortal>
      <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in
       fade-in duration-200"
      >
        <div className="bg-white border border-slate-200 rounded-sm shadow-none w-full max-w-md flex flex-col
         overflow-hidden animate-in fade-in zoom-in duration-200"
        >
          <div className="flex items-center justify-between p-5 border-b border-slate-200 bg-gray-50">
            <div>
              <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                Record Repayment
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Enter details of funds received.
              </p>
            </div>
            <button
              onClick={handleClose}
              disabled={isSubmitting}
              className="p-2 hover:bg-gray-50 rounded-full transition-colors text-slate-400 hover:text-slate-700 disabled:opacity-50"
            >
              <IoClose size={22} />
            </button>
          </div>
          <div className="p-6 space-y-5">

            <div>
              <label htmlFor="amount" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Amount Received
              </label>
              <div className="relative group">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium">
                  ₹
                </span>
                <input
                  id="amount"
                  type="number"
                  step="1"
                  min="0"
                  value={amount}
                  onChange={(e) => {
                    setAmount(e.target.value);
                    if (error) setError('');
                  }}
                  placeholder="0.00"
                  onWheel={e => e.currentTarget.blur()}
                  className={`w-full no-spinner pl-8 pr-4 py-2.5 bg-white border rounded-sm text-slate-800 placeholder:text-slate-300 transition-all
                     outline-none focus:border-slate-300 ${
                    error ? 'border-red-300' : 'border-slate-200 focus:border-slate-200'
                  }`}
                />
              </div>
            </div>

            <div>
              <label htmlFor="note" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Remarks (Optional)
              </label>
              <textarea
                id="note"
                rows={2}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="e.g. Returned via GPay, early settlement..."
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-sm text-slate-700 placeholder:text-slate-300
                 text-sm outline-none focus:border-slate-300 resize-none"
              />
            </div>

            {error && (
              <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-100 rounded text-red-600 text-sm">
                <IoAlertCircleOutline size={18} className="shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 p-5 border-t border-slate-200 bg-gray-50">
            <button
              onClick={handleClose}
              disabled={isSubmitting}
              className="px-5 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-sm hover:bg-gray-100
               transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={isSubmitting}
              className="px-5 py-2 text-sm font-medium text-white bg-blue-700 border border-blue-700 rounded-sm hover:bg-blue-800
               hover:border-blue-800 transition-all shadow-none disabled:opacity-70 flex items-center gap-2"
            >
              {isSubmitting ? 'Processing...' : 'Confirm Repayment'}
            </button>
          </div>
        </div>
      </div>
    </ModalPortal>
  )
}