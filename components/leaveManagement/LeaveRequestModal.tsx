import { X, Calendar, User, AlarmClock, Clock, Check } from 'lucide-react'
import { format } from 'date-fns'

type LeaveRequestType = {
  id: string
  employeeName: string
  employeeId: string
  department: string // Keeping in type but not displaying
  leaveType: string
  startDate: Date
  endDate: Date
  days: number
  leaveMode: string
  reason: string
  status: string
  appliedOn: Date
}

interface LeaveRequestModalProps {
  isOpen: boolean
  onClose: () => void
  leaveRequest: LeaveRequestType | null
  onApprove?: (id: string) => void
  onReject?: (id: string) => void
}

const StatusBadge = ({ status }: { status: string }) => {
  const getStatusColor = () => {
    switch (status) {
      case 'Approved':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'Rejected':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'Pending':
        return 'bg-amber-100 text-amber-800 border-amber-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusIcon = () => {
    switch (status) {
      case 'Approved':
        return <Check className="w-3.5 h-3.5" />
      case 'Rejected':
        return <X className="w-3.5 h-3.5" />
      case 'Pending':
        return <Clock className="w-3.5 h-3.5" />
      default:
        return null
    }
  }

  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor()}`}>
      {getStatusIcon()}
      {status}
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
  if (!isOpen || !leaveRequest) return null

  const isPending = leaveRequest.status === 'Pending'
  
  // Format the days display correctly
  const daysText = leaveRequest.days === 1 
    ? '1 day' 
    : leaveRequest.days < 1 
      ? `${leaveRequest.days} day` 
      : `${leaveRequest.days} days`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto">
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm"></div>
            <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md mx-4">
            <div className="flex justify-between items-center px-6 py-4 border-b">
                <h2 className="text-lg font-semibold text-gray-900">Leave Request Details</h2>
                <button 
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 transition"
                >
                <X className="w-5 h-5" />
                </button>
            </div>

        <div className="px-6 py-4 space-y-4">
          {/* Employee Details */}
          <div className="flex items-start gap-3">
            <User className="w-5 h-5 text-gray-500 mt-1" />
            <div>
              <h3 className="text-sm font-medium text-gray-500">Employee</h3>
              <p className="text-base font-medium text-gray-900">{leaveRequest.employeeName}</p>
              <p className="text-sm text-gray-500">{leaveRequest.employeeId}</p>
              {/* Removed department display */}
            </div>
          </div>

          {/* Leave Details */}
          <div className="flex items-start gap-3">
            <Calendar className="w-5 h-5 text-gray-500 mt-1" />
            <div>
              <h3 className="text-sm font-medium text-gray-500">Leave Period</h3>
              <p className="text-base text-gray-900">
                {format(leaveRequest.startDate, 'MMMM dd, yyyy')}
                {leaveRequest.startDate.getTime() !== leaveRequest.endDate.getTime() && 
                  ` - ${format(leaveRequest.endDate, 'MMMM dd, yyyy')}`}
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
                {format(leaveRequest.appliedOn, 'MMM dd, yyyy')}
              </div>
            </div>
          </div>
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
                onClick={() => {
                  onApprove(leaveRequest.id)
                  onClose()
                }}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm font-medium transition"
              >
                Approve
              </button>
              <button 
                onClick={() => {
                  onReject(leaveRequest.id)
                  onClose()
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm font-medium transition"
              >
                Reject
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}