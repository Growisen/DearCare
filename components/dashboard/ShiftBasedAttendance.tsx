'use client';

import { Card } from "../ui/card";
import { Clock, TrendingUp, CalendarDays } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getDashboardShiftStats } from "@/app/actions/attendance/shift-attendance-actions";

interface ShiftBasedAttendanceProps {
  organization: string;
}

/**
 * Dashboard component for shift-based attendance statistics
 * Shows aggregated attendance data for Tata Home Nursing employees
 */
export default function ShiftBasedAttendance({ organization }: ShiftBasedAttendanceProps) {
  // Only show for Tata Home Nursing
  if (organization !== 'tata-home-nursing') {
    return null;
  }

  // Fetch aggregated shift attendance stats
  const { data: statsData, isLoading } = useQuery({
    queryKey: ['shiftAttendance', 'dashboard', organization],
    queryFn: () => getDashboardShiftStats(organization),
    staleTime: 60000, // 1 minute
  });

  if (isLoading) {
    return (
      <Card className="p-4 bg-white border border-slate-200 shadow-sm rounded-lg col-span-full sm:col-span-2">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-purple-600 animate-spin" />
          <p className="text-sm text-slate-600">Loading shift attendance...</p>
        </div>
      </Card>
    );
  }

  const totalDays = statsData?.totalAttendanceDays?.toFixed(1) ?? '0.0';
  const activeShifts = statsData?.totalActiveShifts ?? 0;
  const completedShifts = statsData?.totalCompletedShifts ?? 0;
  const avgDuration = statsData?.averageShiftDuration?.toFixed(1) ?? '0.0';

  return (
    <Card className="p-4 bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200 shadow-sm rounded-lg col-span-full sm:col-span-2">
      <div className="flex items-center justify-between mb-4 border-b border-purple-200 pb-2">
        <div className="flex items-center">
          <Clock className="w-5 h-5 text-purple-700 mr-2" />
          <div>
            <h3 className="text-md font-medium text-slate-800">Shift-Based Attendance</h3>
            <p className="text-xs text-slate-500 mt-0.5">Tata Home Nursing</p>
          </div>
        </div>
        <div className="px-2 py-1 bg-purple-100 border border-purple-300 rounded-full">
          <p className="text-xs font-medium text-purple-800">Active</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Total Attendance Days */}
        <div className="bg-white border border-blue-200 rounded-lg p-3 shadow-sm">
          <div className="flex flex-col items-center text-center">
            <div className="p-2 bg-blue-50 rounded-full mb-2">
              <CalendarDays className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-2xl font-bold text-slate-900">{totalDays}</span>
            <span className="text-xs font-medium text-slate-600 mt-1">Total Days</span>
          </div>
        </div>

        {/* Active Shifts */}
        <div className="bg-white border border-orange-200 rounded-lg p-3 shadow-sm">
          <div className="flex flex-col items-center text-center">
            <div className="p-2 bg-orange-50 rounded-full mb-2">
              <Clock className="w-5 h-5 text-orange-600" />
            </div>
            <span className="text-2xl font-bold text-slate-900">{activeShifts}</span>
            <span className="text-xs font-medium text-slate-600 mt-1">Active Shifts</span>
          </div>
        </div>

        {/* Completed Shifts */}
        <div className="bg-white border border-green-200 rounded-lg p-3 shadow-sm">
          <div className="flex flex-col items-center text-center">
            <div className="p-2 bg-green-50 rounded-full mb-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <span className="text-2xl font-bold text-slate-900">{completedShifts}</span>
            <span className="text-xs font-medium text-slate-600 mt-1">Completed</span>
          </div>
        </div>
      </div>

      {/* Average Duration Info */}
      <div className="mt-3 bg-white border border-purple-200 rounded-lg p-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-600">Avg Shift Duration:</span>
          <span className="text-sm font-bold text-purple-900">{avgDuration} days</span>
        </div>
      </div>

      {/* Note about shift-based system */}
      <div className="mt-2 pt-2 border-t border-purple-200">
        <p className="text-xs text-slate-500 text-center italic">
          Attendance calculated from shift start/end datetimes
        </p>
      </div>
    </Card>
  );
}
