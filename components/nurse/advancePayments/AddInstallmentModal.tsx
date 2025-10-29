"use client"

import ModalPortal from '@/components/ui/ModalPortal'
import React, { useState } from 'react'
import { addManualInstallment } from '@/app/actions/staff-management/advance-payments'

type InstallmentModalProps = {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  paymentId: string
  title?: string
  description?: string
  confirmText?: string
  cancelText?: string
  placeholder?: string
}

export default function AddInstallmentModal({
  open,
  onClose,
  onConfirm,
  paymentId,
  title = 'Add Installment Amount',
  description,
  confirmText = 'Add Amount',
  cancelText = 'Cancel',
  placeholder = 'Enter amount',
}: InstallmentModalProps) {
  const [amount, setAmount] = useState('')
  const [error, setError] = useState('')

  if (!open) return null

  const handleConfirm = async () => {
    if (!amount.trim()) {
      setError('Amount is required')
      return
    }

    const numAmount = parseFloat(amount)
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Please enter a valid amount')
      return
    }

    try {
      const today = new Date().toISOString().slice(0, 10)
      await addManualInstallment(paymentId, numAmount, today)
      setAmount('')
      setError('')
      onConfirm()
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError('Failed to add installmen')
      } else {
        setError('Failed to add installment')
      }
    }
  }

  const handleClose = () => {
    setAmount('')
    setError('')
    onClose()
  }

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAmount(e.target.value)
    if (error) setError('')
  }

  return (
    <ModalPortal>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
        onClick={handleClose}
      >
        <div
          className="relative w-full max-w-md rounded-lg bg-white shadow-xl border border-gray-200"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-start justify-between p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-50">
                <svg
                  className="h-5 w-5 text-green-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            </div>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Close modal"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <div className="p-6 space-y-4">
            {description && (
              <p className="text-sm text-gray-600">{description}</p>
            )}

            <div>
              <label
                htmlFor="installment-amount"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Amount
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                  $
                </span>
                <input
                  id="installment-amount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={amount}
                  onChange={handleAmountChange}
                  placeholder={placeholder}
                  className={`w-full pl-8 pr-4 py-2 border rounded-md text-gray-800 transition-colors focus:outline-none ${
                    error
                      ? 'border-red-300 focus:border-red-500'
                      : 'border-gray-300 focus:border-gray-500'
                  }`}
                />
              </div>
              {error && (
                <p className="mt-1 text-sm text-red-600">{error}</p>
              )}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 p-6 bg-gray-50 border-t border-gray-200">
            <button
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              {cancelText}
            </button>
            <button
              onClick={handleConfirm}
              className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 transition-colors"
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </ModalPortal>
  )
}