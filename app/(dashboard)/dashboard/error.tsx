"use client"

import { useEffect } from "react"

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function DashboardError({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error)
  }, [error])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-5 rounded-lg max-w-lg">
        <h3 className="text-lg font-medium mb-2">Error Loading Dashboard</h3>
        <p>{error.message || "An unexpected error occurred"}</p>
        <button 
          onClick={() => reset()}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Try Again
        </button>
      </div>
    </div>
  )
}