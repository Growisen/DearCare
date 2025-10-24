"use client"
import { useState, useEffect } from "react"
import StaffAttendance from "@/components/dashboard/StaffAttendance"
import RecentActivities from "@/components/dashboard/RecentActivities"
import Stats from "@/components/dashboard/Stats"
import UpcomingSchedules from "@/components/dashboard/UpcomingSchedules"
import RecentClients from "@/components/dashboard/RecentClients"
import { useDashboardData } from "@/hooks/useDashboardData"
import Loader from '@/components/Loader';

export default function DashboardPage() {
  const [currentTime, setCurrentTime] = useState("")
  const { data: result, isLoading, error } = useDashboardData()
  const dashboardData = result?.success ? result.data : null

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date().toLocaleTimeString()), 1000)
    return () => clearInterval(timer)
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center gap-2">
          <Loader message="Loading dashboard..."/>
        </div>
      </div>
    )
  }

  if (error || (result && !result.success)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600">
            {error instanceof Error ? error.message : result?.error || "Failed to load dashboard data"}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-5 min-h-screen pt-4 md:p-4 custom-scrollbar">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-3 grid grid-cols-2 md:grid-cols-4 gap-4">
          <Stats statsData={dashboardData?.stats} />
          <StaffAttendance 
            currentTime={currentTime} 
            attendanceData={dashboardData?.attendance} 
          />
          <RecentActivities complaintsData={dashboardData?.complaints} />
        </div>
        <UpcomingSchedules todosData={dashboardData?.todos} />
      </div>
      <RecentClients clientsData={dashboardData?.recentClients} />
    </div>
  )
}