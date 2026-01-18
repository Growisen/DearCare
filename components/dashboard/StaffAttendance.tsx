"use client"

import { Card } from "../ui/card"
import { Users, UserCheck, UserX, Calendar, Circle } from "lucide-react"
import { StaffAttendanceProps } from "@/types/staff.types" 
import Link from "next/link"

export default function StaffAttendance({ 
  currentTime, 
  attendanceData, 
  isLoading = false 
}: StaffAttendanceProps & { 
  attendanceData?: { 
    present: number; 
    absent: number; 
    onLeave: number; 
    total: number; 
    presentPercentage: number;
  },
  isLoading?: boolean
}) {
  
  const present = attendanceData?.present ?? 0
  const absent = attendanceData?.absent ?? 0
  const onLeave = attendanceData?.onLeave ?? 0
  const presentPercentage = attendanceData?.presentPercentage ?? 0
  
  const CIRCUMFERENCE = 62.83;
  const strokeDashoffset = CIRCUMFERENCE - (presentPercentage / 100) * CIRCUMFERENCE;
  
  return (
    <Card className="p-4 bg-white border border-slate-200 shadow-none rounded-sm col-span-full sm:col-span-2">
      <div className="flex items-center justify-between mb-4 border-b border-slate-200 pb-2">
        <div className="flex items-center">
          <Users className="w-5 h-5 text-slate-700 mr-2" />
          <div>
            <h3 className="text-md font-medium text-slate-800">Staff Attendance</h3>
            {isLoading ? (
              <div className="h-3 w-24 bg-slate-200 rounded-sm mt-1 animate-pulse" />
            ) : (
              <p className="text-xs text-slate-500 mt-0.5">{currentTime}</p>
            )}
          </div>
        </div>
        <Link
          href="/staff-attendance"
          prefetch={false} 
          className="text-xs font-medium text-blue-600 hover:text-blue-800"
        >
          View details →
        </Link>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
        <div className="col-span-1 sm:col-span-2 flex justify-center items-center">
          <div className="relative w-32 h-32 flex items-center justify-center">
            {isLoading ? (
              <div className="w-28 h-28 rounded-full border-[6px] border-slate-100 animate-pulse bg-slate-50" />
            ) : (
              <>
                <Circle 
                  className="w-full h-full text-slate-100" 
                  strokeWidth={2}
                />
                <Circle 
                  className="absolute inset-0 w-full h-full text-emerald-500 transition-all duration-1000 ease-out -rotate-90"
                  strokeWidth={2}
                  strokeDasharray={CIRCUMFERENCE}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <p className="text-2xl font-bold text-slate-900">{presentPercentage}%</p>
                  <p className="text-xs text-slate-600 font-medium">Present</p>
                </div>
              </>
            )}
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
              {isLoading ? (
                <div className="h-6 w-8 bg-slate-200 rounded-sm animate-pulse" />
              ) : (
                <span className="text-lg font-semibold text-slate-900">{present}</span>
              )}
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
              {isLoading ? (
                <div className="h-6 w-8 bg-slate-200 rounded-sm animate-pulse" />
              ) : (
                <span className="text-lg font-semibold text-slate-900">{absent}</span>
              )}
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
              {isLoading ? (
                <div className="h-6 w-8 bg-slate-200 rounded-sm animate-pulse" />
              ) : (
                <span className="text-lg font-semibold text-slate-900">{onLeave}</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}