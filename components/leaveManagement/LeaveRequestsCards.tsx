import React from 'react'
import { format, parseISO } from 'date-fns'
import StatusBadge from '@/components/leaveManagement/StatusBadge'
import { LeaveRequest } from '@/types/leave.types'
import { formatName } from '@/utils/formatters'

type LeaveRequestsCardsProps = {
  leaveRequests: LeaveRequest[]
  isLoading: boolean
  processingRequestIds: Set<string>
  onView: (request: LeaveRequest) => void
  onApprove: (id: string) => void
  onReject: (id: string) => void
}

export function LeaveRequestsCards({
  leaveRequests,
  isLoading,
  processingRequestIds,
  onView,
  onApprove,
  onReject
}: LeaveRequestsCardsProps) {
  const renderSkeleton = () => (
    <div className="space-y-5 py-3">
      {Array(5).fill(0).map((_, idx) => (
        <div key={idx} className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
          <div className="flex flex-col space-y-4">
            <div className="h-5 bg-gray-100 rounded-md w-1/4 animate-pulse"></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="h-4 bg-gray-100 rounded-md w-3/4 animate-pulse"></div>
              <div className="h-4 bg-gray-100 rounded-md w-1/2 animate-pulse"></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="h-4 bg-gray-100 rounded-md w-1/2 animate-pulse"></div>
              <div className="h-4 bg-gray-100 rounded-md w-3/4 animate-pulse"></div>
            </div>
            <div className="flex justify-end">
              <div className="h-9 bg-gray-100 rounded-lg w-28 animate-pulse"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
  
  if (isLoading) {
    return (
      <div className="md:hidden">
        {renderSkeleton()}
      </div>
    )
  }

  if (leaveRequests.length === 0) {
    return (
      <div className="md:hidden px-5 py-10 text-center">
        <div className="flex flex-col items-center">
          <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <p className="text-gray-600 font-medium">No leave requests found</p>
          <p className="text-sm text-gray-400 mt-1">Try adjusting your search criteria</p>
        </div>
      </div>
    )
  }
  
  return (
    <div className="md:hidden divide-y divide-gray-100">
      {leaveRequests.map((request) => {
        const isProcessing = processingRequestIds.has(request.id)
        
        return (
          <div key={request.id} className="p-5 space-y-4 hover:bg-gray-50 transition-colors">
            <div className="flex justify-between">
              <div>
                <h3 className="font-medium text-gray-900">{formatName(request.nurseName)}</h3>
                <p className="text-xs text-gray-500 mt-0.5">{request.nurseId}</p>
              </div>
              <StatusBadge status={request.status} />
            </div>
            
            <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
              <div className="text-gray-800">
                <span className="text-gray-500 block text-xs mb-0.5">Type</span> 
                {request.leaveType}
              </div>
              <div className="text-gray-800">
                <span className="text-gray-500 block text-xs mb-0.5">Mode</span> 
                {request.leaveMode}
              </div>
              <div className="text-gray-800">
                <span className="text-gray-500 block text-xs mb-0.5">Days</span> 
                {request.days}
              </div>
              <div className="text-gray-800">
                <span className="text-gray-500 block text-xs mb-0.5">Applied</span> 
                {format(parseISO(request.appliedOn), 'MMM dd')}
              </div>
              <div className="col-span-2 text-gray-800">
                <span className="text-gray-500 block text-xs mb-0.5">Period</span> 
                {format(parseISO(request.startDate), 'MMM dd, yyyy')} 
                {request.startDate !== request.endDate && (
                  <div className="flex items-center gap-1 mt-1">
                    <span className="inline-block w-3 h-px bg-gray-300 mx-1"></span>
                    {format(parseISO(request.endDate), 'MMM dd, yyyy')}
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex justify-end gap-2 pt-2">
              <button 
                className="px-3.5 py-1.5 bg-indigo-50 text-indigo-600 rounded-md text-sm font-medium hover:bg-indigo-100 transition-colors"
                onClick={() => onView(request)}
              >
                View
              </button>
              {request.status === 'pending' && (
                <>
                  <button 
                    className={`px-3.5 py-1.5 bg-green-50 text-green-600 rounded-md text-sm font-medium hover:bg-green-100 transition-colors ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
                    onClick={() => onApprove(request.id)}
                    disabled={isProcessing}
                  >
                    {isProcessing ? '...' : 'Approve'}
                  </button>
                  <button 
                    className={`px-3.5 py-1.5 bg-red-50 text-red-600 rounded-md text-sm font-medium hover:bg-red-100 transition-colors ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
                    onClick={() => onReject(request.id)}
                    disabled={isProcessing}
                  >
                    Reject
                  </button>
                </>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}