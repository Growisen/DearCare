"use client"
import { useState, useEffect } from "react"
import StaffAttendance from "@/components/dashboard/StaffAttendance"
import RecentActivities from "@/components/dashboard/RecentActivities"
import Stats from "@/components/dashboard/Stats"
import UpcomingSchedules from "@/components/dashboard/UpcomingSchedules"
import RecentClients from "@/components/dashboard/RecentClients"
import { fetchDashboardData, DashboardData } from "@/app/actions/dashboard-actions"
import { Loader2 } from "lucide-react"

export default function DashboardPage() {
  const [currentTime, setCurrentTime] = useState("")
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Timer for clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date().toLocaleTimeString()), 1000)
    return () => clearInterval(timer)
  }, [])

  // Fetch all dashboard data at once
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setIsLoading(true)
        const result = await fetchDashboardData()
        
        if (result.success && result.data) {
          setDashboardData(result.data)
        } else {
          throw new Error(result.error || "Failed to load dashboard data")
        }
      } finally {
        setIsLoading(false)
      }
    }

    loadDashboardData()
  }, [])

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center gap-2">
          <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
          <span className="text-lg font-medium text-gray-700">Loading dashboard...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-5 min-h-screen p-4 custom-scrollbar">
      {/* Main Content Section */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-3 grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Stats Section */}
          <Stats statsData={dashboardData?.stats} />

          {/* Staff Attendance */}
          <StaffAttendance 
            currentTime={currentTime} 
            attendanceData={dashboardData?.attendance} 
          />

          {/* Recent Activities */}
          <RecentActivities complaintsData={dashboardData?.complaints} />
        </div>

        {/* Upcoming Schedules Sidebar */}
        <UpcomingSchedules todosData={dashboardData?.todos} />
      </div>

      {/* Recent Clients Section */}
      <RecentClients clientsData={dashboardData?.recentClients} />
    </div>
  )
}