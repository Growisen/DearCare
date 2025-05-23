import { useState } from 'react'
import { X, Calendar, User, AlarmClock, Clock, Check, AlertTriangle } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { LeaveRequest, LeaveRequestStatus } from '@/types/leave.types'

interface LeaveRequestModalProps {
  isOpen: boolean
  onClose: () => void
  leaveRequest: LeaveRequest | null
  onApprove?: (id: string) => void
  onReject?: (id: string, rejectionReason?: string) => void
}

const StatusBadge = ({ status }: { status: LeaveRequestStatus | string }) => {
  const getStatusColor = () => {
    switch (status.toLowerCase()) {
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'pending':
        return 'bg-amber-100 text-amber-800 border-amber-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusIcon = () => {
    switch (status.toLowerCase()) {
      case 'approved':
        return <Check className="w-3.5 h-3.5" />
      case 'rejected':
        return <X className="w-3.5 h-3.5" />
      case 'pending':
        return <Clock className="w-3.5 h-3.5" />
      default:
        return null
    }
  }

  // Display status with first letter capitalized
  const displayStatus = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();

  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor()}`}>
      {getStatusIcon()}
      {displayStatus}
    </span>
  )
}

export default function LeaveRequestModal({
  isOpen,
  onClose,
  leaveRequest,
  onApprove,
  onReject
}: LeaveRequestModalProps) {
  const [rejectionReason, setRejectionReason] = useState('')
  const [isRejecting, setIsRejecting] = useState(false)
  const [isApproving, setIsApproving] = useState(false)
  
  if (!isOpen || !leaveRequest) return null

  const isPending = leaveRequest.status === 'pending'
  
  // Format the days display correctly
  const daysText = leaveRequest.days === 1 
    ? '1 day' 
    : leaveRequest.days < 1 
      ? `${leaveRequest.days} day` 
      : `${leaveRequest.days} days`;
  
  // Parse ISO date strings to Date objects
  const startDate = parseISO(leaveRequest.startDate)
  const endDate = parseISO(leaveRequest.endDate)
  const appliedDate = parseISO(leaveRequest.appliedOn)

  const handleReject = () => {
    if (onReject) {
      onReject(leaveRequest.id, rejectionReason);
      setRejectionReason('');
      setIsRejecting(false);
      onClose();
    }
  }

  const handleApprove = () => {
    if (onApprove) {
      onApprove(leaveRequest.id);
      setIsApproving(false);
      onClose();
    }
  }
  
  const resetAndClose = () => {
    setIsRejecting(false);
    setIsApproving(false);
    setRejectionReason('');
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto">
      <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm"></div>
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md mx-4">
        <div className="flex justify-between items-center px-6 py-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">
            {isRejecting ? "Reject Leave Request" : isApproving ? "Approve Leave Request" : "Leave Request Details"}
          </h2>
          <button 
            onClick={resetAndClose}
            className="text-gray-500 hover:text-gray-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isRejecting ? (
          <div className="px-6 py-4 space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">
                Please provide a reason for rejecting this leave request
              </h3>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full h-32 px-3 py-2 text-gray-700 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter rejection reason..."
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button 
                onClick={() => setIsRejecting(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 text-sm font-medium transition"
              >
                Cancel
              </button>
              <button 
                onClick={handleReject}
                disabled={!rejectionReason.trim()}
                className={`px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium transition ${
                  !rejectionReason.trim() ? 'opacity-50 cursor-not-allowed' : 'hover:bg-red-700'
                }`}
              >
                Reject
              </button>
            </div>
          </div>
        ) : isApproving ? (
          <div className="px-6 py-4 space-y-4">
            <div className="flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-4 border border-green-100">
                <Check className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-base font-medium text-gray-900 mb-2">
                Confirm Leave Approval
              </h3>
              <p className="text-sm text-gray-600 mb-2">
                Are you sure you want to approve this leave request for <span className="font-medium">{leaveRequest.nurseName}</span>?
              </p>
              <div className="bg-yellow-50 border border-yellow-100 rounded-md px-4 py-3 mt-2 flex items-start gap-2 text-left w-full">
                <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-yellow-700">
                  This action cannot be undone. The employee will be notified upon approval.
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button 
                onClick={() => setIsApproving(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 text-sm font-medium transition"
              >
                Cancel
              </button>
              <button 
                onClick={handleApprove}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm font-medium transition"
              >
                Confirm Approval
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="px-6 py-4 space-y-4">
              {/* Employee Details */}
              <div className="flex items-start gap-3">
                <User className="w-5 h-5 text-gray-500 mt-1" />
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Employee</h3>
                  <p className="text-base font-medium text-gray-900">{leaveRequest.nurseName}</p>
                  <p className="text-sm text-gray-500">{leaveRequest.nurseId}</p>
                </div>
              </div>

              {/* Leave Details */}
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-gray-500 mt-1" />
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Leave Period</h3>
                  <p className="text-base text-gray-900">
                    {format(startDate, 'MMMM dd, yyyy')}
                    {leaveRequest.startDate !== leaveRequest.endDate && 
                      ` - ${format(endDate, 'MMMM dd, yyyy')}`}
                  </p>
                  <p className="text-sm text-gray-500">{daysText} • {leaveRequest.leaveType}</p>
                </div>
              </div>

              {/* Leave Mode */}
              <div className="flex items-start gap-3">
                <AlarmClock className="w-5 h-5 text-gray-500 mt-1" />
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Leave Mode</h3>
                  <p className="text-base text-gray-900">{leaveRequest.leaveMode}</p>
                </div>
              </div>

              {/* Reason */}
              <div className="pt-2 border-t border-gray-100">
                <h3 className="text-sm font-medium text-gray-500 mb-1">Reason</h3>
                <div className="text-base text-gray-900 max-h-28 overflow-y-auto px-3 py-2 border border-gray-100 rounded-md bg-gray-50">
                  {leaveRequest.reason}
                </div>
              </div>

              {/* Status & Applied Date */}
              <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Status</h3>
                  <StatusBadge status={leaveRequest.status} />
                </div>
                <div className="text-right">
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Applied On</h3>
                  <div className="flex items-center gap-1 text-gray-500 text-sm">
                    <Clock className="w-3.5 h-3.5" />
                    {format(appliedDate, 'MMM dd, yyyy')}
                  </div>
                </div>
              </div>
              
              {/* Display rejection reason if status is rejected */}
              {leaveRequest.status === 'rejected' && leaveRequest.rejectionReason && (
                <div className="pt-2 border-t border-gray-100">
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Rejection Reason</h3>
                  <div className="text-base text-gray-900 px-3 py-2 border border-gray-100 rounded-md bg-gray-50">
                    {leaveRequest.rejectionReason}
                  </div>
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
              <button 
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 text-sm font-medium transition"
              >
                Close
              </button>
              {isPending && onApprove && onReject && (
                <>
                  <button 
                    onClick={() => setIsApproving(true)}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm font-medium transition"
                  >
                    Approve
                  </button>
                  <button 
                    onClick={() => setIsRejecting(true)}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm font-medium transition"
                  >
                    Reject
                  </button>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}