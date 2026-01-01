import ModalPortal from './ModalPortal'
import React from 'react'

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
}: ModalProps) {
  if (!open) return null

  const isDelete = variant === 'delete'

  return (
    <ModalPortal>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      >
        <div
          className="relative w-full max-w-md rounded-sm bg-white shadow-xl border border-slate-200"
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
                  <svg
                    className="h-5 w-5 text-red-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                ) : (
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
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
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

          {description && (
            <div className="px-6 py-4 bg-gray-50">
              <p className="text-sm text-gray-600">{description}</p>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 p-6 bg-gray-50 border-t border-slate-200">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-slate-200 rounded-sm hover:bg-gray-50 transition-colors"
            >
              {cancelText || 'No, cancel'}
            </button>
            <button
              onClick={onConfirm}
              className={`px-4 py-2 text-sm font-medium text-white rounded-sm transition-colors ${
                isDelete
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {confirmText || (isDelete ? "Yes, I'm sure" : 'Approve')}
            </button>
          </div>
        </div>
      </div>
    </ModalPortal>
  )
}