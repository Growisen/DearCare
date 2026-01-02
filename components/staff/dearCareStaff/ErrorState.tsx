import React from "react"

type ErrorStateProps = {
  error: string
  onRetry: () => void
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function ErrorState({ error, onRetry }: ErrorStateProps) {
  return (
    <div className="p-8 text-center">
      <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-5 rounded-sm mb-4 max-w-lg mx-auto">
        <p className="font-medium mb-1">Unable to load staff data</p>
        {/* <p className="text-sm text-red-600">{error}</p> */}
        <button 
          onClick={onRetry}
          className="mt-3 px-4 py-2 bg-red-100 text-red-700 rounded-sm hover:bg-red-200 transition-colors font-medium text-sm"
        >
          Try Again
        </button>
      </div>
    </div>
  )
}