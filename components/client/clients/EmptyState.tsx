import React from "react"
import { CircleX } from "lucide-react"

type EmptyStateProps = {
  title: string
  message: string
  handleResetFilters: () => void
}

export function EmptyState({ 
  title, 
  message, 
  handleResetFilters 
}: EmptyStateProps) {
  return (
    <div className="p-12 text-center">
      <div className="bg-gray-50 border border-slate-200 text-gray-600 px-8 py-10 rounded-sm max-w-lg mx-auto">
        <CircleX className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <p className="text-xl font-medium mb-2">{title}</p>
        <p className="text-gray-500 mb-4">{message}</p>
        <button 
          onClick={() => {
            handleResetFilters();
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-sm hover:bg-blue-700 transition-colors font-medium"
        >
          Reset Filters
        </button>
      </div>
    </div>
  )
}