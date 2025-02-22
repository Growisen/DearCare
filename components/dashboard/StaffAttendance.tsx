import { Card } from "../ui/card"
import { Users, UserCheck, UserX, Calendar } from "lucide-react"

interface StaffAttendanceProps {
  currentTime: string;
}

export default function StaffAttendance({ currentTime }: StaffAttendanceProps) {
  return (
    <Card className="p-4 bg-white/50 backdrop-blur-sm border border-gray-100/20 rounded-xl h-[290px] col-span-2">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-3">
          <div className="p-1.5 rounded-lg bg-[#004d6d]/10">
            <Users className="w-5 h-5 text-[#004d6d]" />
          </div>
          <div>
            <h3 className="text-md font-semibold text-gray-800">Staff Attendance</h3>
            <p className="text-xs text-gray-500 mt-1">{currentTime}</p>
          </div>
        </div>
        <button className="text-xs text-blue-600 hover:text-blue-800 font-medium mt-1 mr-1">Details</button>
      </div>
      
      <div className="flex items-center gap-6">
        <div className="relative w-24 h-24">
          <svg className="w-full h-full transform -rotate-90">
            <circle className="text-gray-100" strokeWidth="6" stroke="currentColor" fill="transparent" r="45" cx="48" cy="48" />
            <circle className="text-emerald-500" strokeWidth="6" strokeDasharray={283} strokeDashoffset={283 * (1 - 0.85)} strokeLinecap="round" stroke="currentColor" fill="transparent" r="45" cx="48" cy="48" />
          </svg>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
            <p className="text-lg font-bold text-gray-900">85%</p>
            <p className="text-xs text-gray-500">Present</p>
          </div>
        </div>

        <div className="space-y-4 flex-1">
          <div className="flex items-center justify-between p-3 bg-emerald-50/50 rounded-lg">
            <div className="flex items-center gap-1.5">
              <UserCheck className="w-4 h-4 text-emerald-500" />
              <span className="text-sm text-gray-700">Present</span>
            </div>
            <span className="font-semibold text-emerald-600">95</span>
          </div>
          <div className="flex items-center justify-between p-2 bg-rose-50/50 rounded-lg">
            <div className="flex items-center gap-1.5">
              <UserX className="w-4 h-4 text-rose-500" />
              <span className="text-sm text-gray-700">Absent</span>
            </div>
            <span className="font-semibold text-rose-600">12</span>
          </div>
          <div className="flex items-center justify-between p-2 bg-indigo-50/50 rounded-lg">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-indigo-500" />
              <span className="text-sm text-gray-700">On Leave</span>
            </div>
            <span className="font-semibold text-indigo-600">3</span>
          </div>
        </div>
      </div>
    </Card>
  )
}
