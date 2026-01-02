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
  
  const present = attendanceData?.present ?? 0
  const absent = attendanceData?.absent ?? 0
  const onLeave = attendanceData?.onLeave ?? 0
  const presentPercentage = attendanceData?.presentPercentage ?? 0
  
  const handleDetailsClick = () => {
    router.push('/staff-attendance') 
  }
  
  return (
    <Card className="p-4 bg-white border border-slate-200 shadow-none rounded-sm col-span-full sm:col-span-2">
      <div className="flex items-center justify-between mb-4 border-b border-slate-200 pb-2">
        <div className="flex items-center">
          <Users className="w-5 h-5 text-slate-700 mr-2" />
          <div>
            <h3 className="text-md font-medium text-slate-800">Staff Attendance</h3>
            <p className="text-xs text-slate-500 mt-0.5">{currentTime}</p>
          </div>
        </div>
        <button 
          className="text-xs font-medium text-blue-600 hover:text-blue-800"
          onClick={handleDetailsClick}
        >
          View details →
        </button>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
        <div className="col-span-1 sm:col-span-2 flex justify-center items-center">
          <div className="relative w-32 h-32">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle 
                className="text-slate-200" 
                strokeWidth="8" 
                stroke="currentColor" 
                fill="transparent" 
                r="44" 
                cx="50" 
                cy="50" 
              />
              <circle 
                className="text-emerald-500 transition-all duration-1000 ease-out" 
                strokeWidth="8" 
                strokeDasharray={276.46} 
                strokeDashoffset={276.46 * (1 - presentPercentage/100)} 
                strokeLinecap="round" 
                stroke="currentColor" 
                fill="transparent" 
                r="44" 
                cx="50" 
                cy="50" 
                style={{
                  filter: 'drop-shadow(0 0 2px rgba(16, 185, 129, 0.3))'
                }}
              />
            </svg>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
              <p className="text-2xl font-bold text-slate-900">{presentPercentage}%</p>
              <p className="text-xs text-slate-600 font-medium">Present</p>
            </div>
          </div>
        </div>

        <div className="col-span-1 sm:col-span-3 space-y-3 flex flex-col justify-center">
          <div className="border border-slate-200 rounded-sm p-3 shadow-none">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-emerald-50 rounded-sm">
                  <UserCheck className="w-5 h-5 text-emerald-600" />
                </div>
                <span className="text-sm font-medium text-slate-800">Present</span>
              </div>
              <span className="text-lg font-semibold text-slate-900">{present}</span>
            </div>
          </div>

          <div className="border border-slate-200 rounded-sm p-3 shadow-none">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-rose-50 rounded-sm">
                  <UserX className="w-5 h-5 text-rose-600" />
                </div>
                <span className="text-sm font-medium text-slate-800">Absent</span>
              </div>
              <span className="text-lg font-semibold text-slate-900">{absent}</span>
            </div>
          </div>

          <div className="border border-slate-200 rounded-sm p-3 shadow-none">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-indigo-50 rounded-sm">
                  <Calendar className="w-5 h-5 text-indigo-600" />
                </div>
                <span className="text-sm font-medium text-slate-800">On Leave</span>
              </div>
              <span className="text-lg font-semibold text-slate-900">{onLeave}</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}