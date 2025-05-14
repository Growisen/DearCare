import React from 'react'
import { format, parseISO } from 'date-fns'
import StatusBadge from '@/components/leaveManagement/StatusBadge'
import { LeaveRequest } from '@/types/leave.types'

type LeaveRequestsTableProps = {
  leaveRequests: LeaveRequest[]
  isLoading: boolean
  processingRequestIds: Set<string>
  onView: (request: LeaveRequest) => void
  onApprove: (id: string) => void
  onReject: (id: string) => void
}

export function LeaveRequestsTable({
  leaveRequests,
  isLoading,
  processingRequestIds,
  onView,
  onApprove,
  onReject
}: LeaveRequestsTableProps) {
  if (isLoading) {
    return (
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-100">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Employee
              </th>
              <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Leave Type
              </th>
              <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Leave Mode
              </th>
              <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Period
              </th>
              <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Days
              </th>
              <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Applied On
              </th>
              <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={8} className="px-6 py-10">
                <div className="flex justify-center">
                  <div className="animate-spin rounded-full h-10 w-10 border-2 border-indigo-500 border-t-transparent"></div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    )
  }

  if (leaveRequests.length === 0) {
    return (
      <div className="px-6 py-10 text-center">
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
    <div className="hidden md:block overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-100">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Employee
            </th>
            <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Leave Type
            </th>
            <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Leave Mode
            </th>
            <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Period
            </th>
            <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Days
            </th>
            <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Applied On
            </th>
            <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th scope="col" className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-100">
          {leaveRequests.map((request) => {
            const isProcessing = processingRequestIds.has(request.id)
            
            return (
              <tr key={request.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{request.nurseName}</div>
                      <div className="text-xs text-gray-500">{request.nurseId}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-800">{request.leaveType}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-700">{request.leaveMode}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-700">
                    {format(parseISO(request.startDate), 'MMM dd, yyyy')} 
                    {request.startDate !== request.endDate && (
                      <span className="flex items-center gap-1">
                        <span className="inline-block w-3 h-px bg-gray-300 mx-1"></span>
                        {format(parseISO(request.endDate), 'MMM dd, yyyy')}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-800">{request.days}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">
                    {format(parseISO(request.appliedOn), 'MMM dd, yyyy')}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <StatusBadge status={request.status} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button 
                    className="text-indigo-600 hover:text-indigo-900 hover:underline mr-4 transition-colors"
                    onClick={() => onView(request)}
                  >
                    View
                  </button>
                  {request.status === 'pending' && (
                    <>
                      <button 
                        className={`text-green-600 hover:text-green-900 hover:underline mr-4 transition-colors ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
                        onClick={() => onApprove(request.id)}
                        disabled={isProcessing}
                      >
                        {isProcessing ? 'Processing...' : 'Approve'}
                      </button>
                      <button 
                        className={`text-red-600 hover:text-red-900 hover:underline transition-colors ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
                        onClick={() => onReject(request.id)}
                        disabled={isProcessing}
                      >
                        Reject
                      </button>
                    </>
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}