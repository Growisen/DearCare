import React from "react"

type LoadingStateProps = {
  message?: string
}

export function LoadingState({ message = "Loading..." }: LoadingStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="w-16 h-16 relative">
        <div className="absolute top-0 right-0 bottom-0 left-0 rounded-full border-4 border-blue-200"></div>
        <div className="absolute top-0 right-0 bottom-0 left-0 rounded-full border-4 border-blue-600 border-t-transparent animate-spin"></div>
      </div>
      <p className="mt-4 text-gray-600 font-medium">{message}</p>
    </div>
  )
}