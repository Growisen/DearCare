"use client"

type ErrorStateProps = {
  message: string
}

export default function ErrorState({ message }: ErrorStateProps) {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="p-6 bg-white border border-red-100 rounded-sm shadow-none max-w-md w-full text-center">
        <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900">Unable to load data</h3>
        <p className="text-gray-500 mt-2 text-sm">{message}</p>
      </div>
    </div>
  )
}