import React from "react"

type EmptyStateProps = {
  title: string
  message: string
  handleResetFilters: () => void
}

export function EmptyState({ title, message, handleResetFilters }: EmptyStateProps) {
  return (
    <div className="p-12 text-center">
      <div className="bg-gray-50 border border-slate-200 text-gray-600 px-8 py-10 rounded-sm max-w-lg mx-auto">
        <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <p className="text-xl font-medium mb-2">{title}</p>
        <p className="text-gray-500 mb-4">{message}</p>
        <button 
          onClick={handleResetFilters}
          className="px-4 py-2 bg-blue-600 text-white rounded-sm hover:bg-blue-700 transition-colors font-medium"
        >
          Reset Filters
        </button>
      </div>
    </div>
  )
}