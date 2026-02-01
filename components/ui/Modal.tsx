import ModalPortal from './ModalPortal'
import React from 'react'
import { AlertTriangle, CheckCircle2, X, Loader2 } from 'lucide-react'

type ModalVariant = 'delete' | 'approve'

type ModalProps = {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  variant?: ModalVariant
  title?: string
  description?: string
  confirmText?: string
  cancelText?: string
  loading?: boolean 
}

export default function Modal({
  open,
  onClose,
  onConfirm,
  variant = 'delete',
  title,
  description,
  confirmText,
  cancelText,
  loading = false,
}: ModalProps) {
  if (!open) return null

  const isDelete = variant === 'delete'

  return (
    <ModalPortal>
      <div
        className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-50 flex items-center justify-center animate-in fade-in duration-200 p-1 sm:p-2"
        onClick={onClose}
      >
        <div
          className="relative w-full max-w-md rounded-sm bg-white border border-slate-200"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-start justify-between p-6 border-b border-slate-200">
            <div className="flex items-center gap-3">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full ${
                  isDelete ? 'bg-red-50' : 'bg-blue-50'
                }`}
              >
                {isDelete ? (
                  <AlertTriangle className="h-5 w-5 text-red-600" strokeWidth={2} />
                ) : (
                  <CheckCircle2 className="h-5 w-5 text-blue-600" strokeWidth={2} />
                )}
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                {title ||
                  (isDelete
                    ? 'Are you sure you want to delete this item?'
                    : 'Are you sure you want to approve this action?')}
              </h3>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Close modal"
              disabled={loading}
            >
              <X className="h-5 w-5" strokeWidth={2} />
            </button>
          </div>

          {description && (
            <div className="px-6 py-4 bg-gray-50">
              <p className="text-sm text-gray-600">{description}</p>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 p-6 bg-gray-50 border-t border-slate-200">
            <button
              onClick={onClose}
              className="px-5 py-1.5 text-sm font-medium text-gray-700 bg-white border border-slate-300
               rounded-sm hover:bg-gray-100 transition-colors"
              disabled={loading}
            >
              {cancelText || 'No, cancel'}
            </button>
            <button
              onClick={onConfirm}
              className={`px-5 py-1.5 text-sm font-medium text-white rounded-sm transition-colors ${
                isDelete
                  ? 'bg-red-700 hover:bg-red-800'
                  : 'bg-blue-700 hover:bg-blue-800'
              } flex items-center gap-2`}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin h-4 w-4 text-white" />{' '}
                  <span>Processing...</span>
                </>
              ) : (
                confirmText || (isDelete ? "Yes, I'm sure" : 'Approve')
              )}
            </button>
          </div>
        </div>
      </div>
    </ModalPortal>
  )
}