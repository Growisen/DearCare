import { CheckCircle, Clock, AlertCircle, CalendarX, FileClock, XCircle } from "lucide-react"
import { NurseBasicDetails, NurseBasicInfo } from "@/types/staff.types"
import { useRouter } from 'next/navigation'

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
  leave: CalendarX,
  unassigned: AlertCircle,
  pending: Clock,
  under_review: FileClock,
  rejected: XCircle
}

interface NurseCardProps {
  nurse: NurseBasicDetails;
  onReviewDetails?: (nurse: NurseBasicInfo) => void;
}

const NurseCard = ({ nurse, onReviewDetails }: NurseCardProps) => {
  const StatusIcon = statusIcons[nurse.status as keyof typeof statusIcons]
  const router = useRouter();
  
  // Convert NurseBasicDetails to NurseBasicInfo format
  const convertToNurseBasicInfo = (nurseDetails: NurseBasicDetails): NurseBasicInfo => {
    return {
      nurse_id: nurseDetails.nurse_id,
      first_name: nurseDetails.name.first,
      last_name: nurseDetails.name.last,
      email: nurseDetails.contact.email || "",
      phone_number: nurseDetails.contact.phone || "",
      status: nurseDetails.status,
      experience: nurseDetails.experience,
      rating: nurseDetails.rating,
    };
  };
  
  const handleReviewDetails = () => {
    if (onReviewDetails) {
      // Convert the nurse object to the expected format
      const nurseInfo = convertToNurseBasicInfo(nurse);
      onReviewDetails(nurseInfo);
    } else {
      router.push(`/nurses/${nurse.nurse_id}`);
    }
  };
  
  return (
    <div key={nurse.nurse_id} className="p-4 space-y-3">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-medium text-gray-900">
            {`${nurse.name.first || ''} ${nurse.name.last || ''}`}
          </h3>
        </div>
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium ${statusColors[nurse.status as keyof typeof statusColors]}`}>
          <StatusIcon className="w-3.5 h-3.5" />
          {nurse.status.replace("_", " ").charAt(0).toUpperCase() + nurse.status.slice(1).replace("_", " ")}
        </span>
      </div>
      
      <div className="text-sm">
        <p className="text-gray-600">Experience: {nurse.experience || 0} years</p>
        <p className="text-gray-600">Rating: {nurse.rating || 0}/5</p>
        <p className="text-gray-900">{nurse.contact.email}</p>
        <p className="text-gray-600">{nurse.contact.phone}</p>
      </div>
      
      <div className="pt-2">
        <button 
          className="w-full px-3 py-1.5 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors text-sm font-medium border border-blue-200"
          onClick={handleReviewDetails}
        >
          Review Details
        </button>
      </div>
    </div>
  )
}
export default NurseCard
