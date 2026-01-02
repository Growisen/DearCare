import { Check, X, Clock } from "lucide-react";

export const StatusBadge = ({ status }: { status: string }) => {
  const getStatusColor = () => {
    switch (status) {
      case 'Approved':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'Rejected':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'Pending':
        return 'bg-amber-100 text-amber-800 border-amber-200'
      default:
        return 'bg-gray-100 text-gray-800 border-slate-200'
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

export default StatusBadge;