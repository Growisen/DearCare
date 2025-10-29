import React, { memo } from 'react'
import { format, parseISO } from 'date-fns'
import { Eye, CheckCircle, Clock, AlertCircle } from 'lucide-react'
import { LeaveRequest } from '@/types/leave.types'
import Loader from '../Loader'
import { formatName } from '@/utils/formatters'

type LeaveRequestsTableProps = {
  leaveRequests: LeaveRequest[]
  isLoading: boolean
  processingRequestIds: Set<string>
  onView: (request: LeaveRequest) => void
}

const LeaveRequestRow = memo(({ 
  request, 
  onView, 
  statusColors,
  statusIcons
}: { 
  request: LeaveRequest, 
  isProcessing: boolean,
  onView: (request: LeaveRequest) => void,
  statusColors: Record<string, string>,
  statusIcons: Record<string, React.FC<{ className?: string }>>
}) => {
  const StatusIcon = statusIcons[request.status] || statusIcons.default;
  
  return (
    <tr className="hover:bg-gray-50">
      <td className="py-4 px-6">
        <div>
          <div className="text-gray-800 font-medium">{formatName(request.nurseName)}</div>
          <div className="text-xs text-gray-500">{request.registrationNumber}</div>
        </div>
      </td>
      <td className="py-4 px-6 text-gray-600">{request.leaveType}</td>
      <td className="py-4 px-6 text-gray-600">{request.leaveMode}</td>
      <td className="py-4 px-6 text-gray-600">
        {format(parseISO(request.startDate), 'MMM dd, yyyy')} 
        {request.startDate !== request.endDate && (
          <span className="flex items-center gap-1">
            <span className="inline-block w-3 h-px bg-gray-300 mx-1"></span>
            {format(parseISO(request.endDate), 'MMM dd, yyyy')}
          </span>
        )}
      </td>
      <td className="py-4 px-6 text-gray-600">{request.days}</td>
      <td className="py-4 px-6 text-gray-600">{format(parseISO(request.appliedOn), 'MMM dd, yyyy')}</td>
      <td className="py-4 px-6">
        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${statusColors[request.status] || statusColors.default}`}>
          <StatusIcon className="w-3.5 h-3.5" />
          {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
        </span>
      </td>
      <td className="py-4 px-6">
        <div className="flex items-center justify-end gap-2">
          <button 
            className="px-3 py-1.5 text-blue-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors text-sm font-medium inline-flex items-center gap-1.5"
            onClick={() => onView(request)}
            aria-label={`View details for ${request.nurseName}`}
          >
            <Eye className="h-4 w-4" />
            View
          </button>
        </div>
      </td>
    </tr>
  );
});
LeaveRequestRow.displayName = 'LeaveRequestRow';

const LeaveRequestMobileCard = memo(({ 
  request, 
  onView, 
  statusColors,
  statusIcons
}: { 
  request: LeaveRequest, 
  isProcessing: boolean,
  onView: (request: LeaveRequest) => void,
  statusColors: Record<string, string>,
  statusIcons: Record<string, React.FC<{ className?: string }>>
}) => {
  const StatusIcon = statusIcons[request.status] || statusIcons.default;
  
  return (
    <div className="p-5 space-y-4 hover:bg-gray-50 transition-colors border-b border-gray-200 last:border-0">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-semibold text-gray-800">{formatName(request.nurseName)}</h3>
          <p className="text-sm text-gray-500 mt-1">{request.leaveType} ({request.leaveMode})</p>
        </div>
        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${statusColors[request.status] || statusColors.default}`}>
          <StatusIcon className="w-3.5 h-3.5" />
          {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
        </span>
      </div>
      
      <div className="grid grid-cols-2 gap-y-2 text-sm bg-white border border-gray-200 p-3 rounded-lg">
        <p className="text-gray-500">Period:</p>
        <p className="text-gray-800 font-medium">
          {format(parseISO(request.startDate), 'MMM dd, yyyy')}
          {request.startDate !== request.endDate && (
            <> - {format(parseISO(request.endDate), 'MMM dd, yyyy')}</>
          )}
        </p>
        <p className="text-gray-500">Days:</p>
        <p className="text-gray-800 font-medium">{request.days}</p>
        <p className="text-gray-500">Applied On:</p>
        <p className="text-gray-800">{format(parseISO(request.appliedOn), 'MMM dd, yyyy')}</p>
        <p className="text-gray-500">Nurse Reg No:</p>
        <p className="text-gray-800">{request.registrationNumber}</p>
      </div>
      
      <div className="flex gap-2">
        <button 
          className="flex-1 px-3 py-2 text-blue-500 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors text-sm font-medium flex items-center justify-center gap-1.5"
          onClick={() => onView(request)}
          aria-label={`View details for ${request.nurseName}`}
        >
          <Eye className="h-4 w-4" />
          View
        </button>
      </div>
    </div>
  );
});
LeaveRequestMobileCard.displayName = 'LeaveRequestMobileCard';

export function LeaveRequestsTable({
  leaveRequests,
  isLoading,
  processingRequestIds,
  onView,
}: LeaveRequestsTableProps) {
  const statusColors: Record<string, string> = {
    pending: "bg-yellow-50 text-yellow-700 border border-yellow-200",
    approved: "bg-green-50 text-green-700 border border-green-200",
    rejected: "bg-red-50 text-red-700 border border-red-200",
    cancelled: "bg-gray-50 text-gray-700 border border-gray-200",
    default: "bg-gray-50 text-gray-600 border border-gray-200"
  }

  const statusIcons: Record<string, React.FC<{ className?: string }>> = {
    pending: Clock,
    approved: CheckCircle,
    rejected: AlertCircle,
    cancelled: AlertCircle,
    default: Eye
  }

  if (isLoading) {
    return (
      <Loader message="Loading Leave Requests..."/>
    )
  }

  return (
    <div className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
      {/* Desktop Table */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-100 border-b border-gray-200">
            <tr className="text-left">
              <th className="py-4 px-6 font-medium text-gray-700">Nurse</th>
              <th className="py-4 px-6 font-medium text-gray-700">Leave Type</th>
              <th className="py-4 px-6 font-medium text-gray-700">Leave Mode</th>
              <th className="py-4 px-6 font-medium text-gray-700">Period</th>
              <th className="py-4 px-6 font-medium text-gray-700">Days</th>
              <th className="py-4 px-6 font-medium text-gray-700">Applied On</th>
              <th className="py-4 px-6 font-medium text-gray-700">Status</th>
              <th className="py-4 px-6 font-medium text-gray-700 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {leaveRequests.length > 0 ? (
              leaveRequests.map((request) => (
                <LeaveRequestRow 
                  key={request.id} 
                  request={request}
                  isProcessing={processingRequestIds.has(request.id)}
                  onView={onView}
                  statusColors={statusColors}
                  statusIcons={statusIcons}
                />
              ))
            ) : (
              <tr>
                <td colSpan={8} className="py-8 text-center text-gray-500">
                  No leave requests found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="sm:hidden bg-white">
        {leaveRequests.length > 0 ? (
          leaveRequests.map((request) => (
            <LeaveRequestMobileCard
              key={request.id}
              request={request}
              isProcessing={processingRequestIds.has(request.id)}
              onView={onView}
              statusColors={statusColors}
              statusIcons={statusIcons}
            />
          ))
        ) : (
          <div className="p-8 text-center text-gray-500">
            No leave requests found
          </div>
        )}
      </div>
    </div>
  )
}