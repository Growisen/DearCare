"use client"

import ModalPortal from '@/components/ui/ModalPortal'
import React, { useState, useEffect } from 'react'

type EditServicePeriodModalProps = {
  open: boolean
  onCloseAction: () => void
  onUpdateAction: (startDate: string, endDate: string) => Promise<void>
  initialStartDate?: string
  initialEndDate?: string
}

export default function EditServicePeriodModal({
  open,
  onCloseAction,
  onUpdateAction,
  initialStartDate = '',
  initialEndDate = '',
}: EditServicePeriodModalProps) {
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (open) {
      setStartDate(initialStartDate)
      setEndDate(initialEndDate)
      setError('')
      setIsLoading(false)
    }
  }, [open, initialStartDate, initialEndDate])

  if (!open) return null

  const handleConfirm = async () => {
    if (!startDate || !endDate) {
      setError('Both start and end dates are required')
      return
    }

    if (new Date(endDate) < new Date(startDate)) {
      setError('End date cannot be before the start date')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      await onUpdateAction(startDate, endDate)
      onCloseAction()
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Failed to update service period')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setError('')
    onCloseAction()
  }

  return (
    <ModalPortal>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
        onClick={handleClose}
      >
        <div
          className="relative w-full max-w-md rounded-sm bg-white shadow-xl border border-slate-200"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-start justify-between p-6 border-b border-slate-200">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50">
                <svg 
                  className="h-5 w-5 text-blue-600"
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" 
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Edit Service Period</h3>
            </div>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
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
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="start-date"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Start Date
                </label>
                <input
                  id="start-date"
                  type="date"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value)
                    if (error) setError('')
                  }}
                  className={`w-full px-3 py-2 border rounded-sm text-gray-800 transition-colors focus:outline-none ${
                    error
                      ? 'border-red-300 focus:border-red-500'
                      : 'border-slate-200 focus:border-blue-500'
                  }`}
                />
              </div>

              <div>
                <label
                  htmlFor="end-date"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  End Date
                </label>
                <input
                  id="end-date"
                  type="date"
                  value={endDate}
                  onChange={(e) => {
                    setEndDate(e.target.value)
                    if (error) setError('')
                  }}
                  className={`w-full px-3 py-2 border rounded-sm text-gray-800 transition-colors focus:outline-none ${
                    error
                      ? 'border-red-300 focus:border-red-500'
                      : 'border-slate-200 focus:border-blue-500'
                  }`}
                />
              </div>
            </div>

            {error && (
              <p className="mt-1 text-sm text-red-600">{error}</p>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 p-6 bg-gray-50 border-t border-slate-200">
            <button
              onClick={handleClose}
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-slate-200 rounded-sm hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-sm hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {isLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </ModalPortal>
  )
}