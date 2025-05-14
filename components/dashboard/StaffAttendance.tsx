import { Card } from "../ui/card"
import { Users, UserCheck, UserX, Calendar } from "lucide-react"
import { StaffAttendanceProps } from "@/types/staff.types" 
import { useRouter } from "next/navigation"

export default function StaffAttendance({ currentTime, attendanceData }: 
  StaffAttendanceProps & { 
    attendanceData?: { 
      present: number; 
      absent: number; 
      onLeave: number; 
      total: number; 
      presentPercentage: number;
    } 
  }) {
  const router = useRouter()
  
  // Use default values if data is not available
  const present = attendanceData?.present ?? 0
  const absent = attendanceData?.absent ?? 0
  const onLeave = attendanceData?.onLeave ?? 0
  const presentPercentage = attendanceData?.presentPercentage ?? 0
  
  const handleDetailsClick = () => {
    router.push('/staff-attendance') 
  }
  
  return (
    <Card className="p-3 sm:p-4 bg-white/90 backdrop-blur-sm border border-gray-100 shadow-sm rounded-xl min-h-[250px] h-auto col-span-full sm:col-span-2 hover:shadow-md transition-all duration-300">
      <div className="flex items-start justify-between mb-3 sm:mb-4">
        <div className="flex items-start gap-2 sm:gap-3">
          <div className="p-1 sm:p-1.5 rounded-lg bg-[#004d6d]/10">
            <Users className="w-4 h-4 sm:w-5 sm:h-5 text-[#004d6d]" />
          </div>
          <div>
            <h3 className="text-sm sm:text-md font-semibold text-gray-800">Staff Attendance</h3>
            <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5 sm:mt-1">{currentTime}</p>
          </div>
        </div>
        <button 
          className="text-[10px] sm:text-xs text-blue-600 hover:text-blue-800 font-medium mt-1 mr-1"
          onClick={handleDetailsClick}
        >
          Details
        </button>
      </div>
      
      <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
        <div className="relative w-20 h-20 sm:w-24 sm:h-24">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            <circle 
              className="text-gray-100" 
              strokeWidth="10" 
              stroke="currentColor" 
              fill="transparent" 
              r="40" 
              cx="50" 
              cy="50" 
            />
            <circle 
              className="text-emerald-500" 
              strokeWidth="10" 
              strokeDasharray={251.2} 
              strokeDashoffset={251.2 * (1 - presentPercentage/100)} 
              strokeLinecap="round" 
              stroke="currentColor" 
              fill="transparent" 
              r="40" 
              cx="50" 
              cy="50" 
            />
          </svg>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
            <p className="text-base sm:text-lg font-bold text-gray-900">{presentPercentage}%</p>
            <p className="text-[10px] sm:text-xs text-gray-500">Present</p>
          </div>
        </div>

        <div className="space-y-2 sm:space-y-4 flex-1 w-full">
          <div className="flex items-center justify-between p-2 sm:p-3 bg-emerald-50/50 rounded-lg">
            <div className="flex items-center gap-1 sm:gap-1.5">
              <UserCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-500" />
              <span className="text-xs sm:text-sm text-gray-700">Present</span>
            </div>
            <span className="font-semibold text-emerald-600">{present}</span>
          </div>
          <div className="flex items-center justify-between p-1.5 sm:p-2 bg-rose-50/50 rounded-lg">
            <div className="flex items-center gap-1 sm:gap-1.5">
              <UserX className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rose-500" />
              <span className="text-xs sm:text-sm text-gray-700">Absent</span>
            </div>
            <span className="font-semibold text-rose-600">{absent}</span>
          </div>
          <div className="flex items-center justify-between p-1.5 sm:p-2 bg-indigo-50/50 rounded-lg">
            <div className="flex items-center gap-1 sm:gap-1.5">
              <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-500" />
              <span className="text-xs sm:text-sm text-gray-700">On Leave</span>
            </div>
            <span className="font-semibold text-indigo-600">{onLeave}</span>
          </div>
        </div>
      </div>
    </Card>
  )
}