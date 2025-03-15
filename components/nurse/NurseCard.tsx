import { CheckCircle, Clock, AlertCircle } from "lucide-react"
import { Nurse, NurseBasicInfo } from "@/types/staff.types"

const statusColors = {
  assigned: "bg-green-100 text-green-700 border border-green-200",
  leave: "bg-yellow-100 text-yellow-700 border border-yellow-200",
  unassigned: "bg-red-100 text-red-700 border border-red-200",
  pending: "bg-gray-100 text-gray-700 border border-gray-200",
  under_review: "bg-blue-100 text-blue-700 border border-blue-200",
  rejected: "bg-purple-100 text-purple-700 border border-purple-200"
}

const statusIcons = {
  assigned: CheckCircle,
  leave: Clock,
  unassigned: AlertCircle,
  pending: Clock,
  under_review: Clock,
  rejected: AlertCircle
}

interface NurseCardProps {
  nurse: NurseBasicInfo;
  onReviewDetails: (nurse: NurseBasicInfo) => void;
}

const NurseCard = ({ nurse, onReviewDetails }: NurseCardProps) => {
  const StatusIcon = statusIcons[nurse.status as keyof typeof statusIcons]
  
  return (
    <div key={nurse.nurse_id} className="p-4 space-y-3">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-medium text-gray-900">
            {`${nurse.first_name || ''} ${nurse.last_name || ''}`}
          </h3>
        </div>
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium ${statusColors[nurse.status as keyof typeof statusColors]}`}>
          <StatusIcon className="w-3.5 h-3.5" />
          {nurse.status.replace("_", " ").charAt(0).toUpperCase() + nurse.status.slice(1).replace("_", " ")}
        </span>
      </div>
      
      <div className="text-sm">
        <p className="text-gray-600">Experience: {nurse.experience || 0} years</p>
        <p className="text-gray-900">{nurse.email}</p>
        <p className="text-gray-600">{nurse.phone_number}</p>
      </div>
      
      <button 
        className="w-full mt-2 px-3 py-1.5 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors text-sm font-medium"
        onClick={() => onReviewDetails(nurse)}
      >
        Review Details
      </button>
    </div>
  )
}
export default NurseCard
