"use client"
import { useState, useEffect } from "react"
import StaffAttendance from "../../../components/dashboard/StaffAttendance"
import RecentActivities from "../../../components/dashboard/RecentActivities"
import Stats from "../../../components/dashboard/Stats"
import UpcomingSchedules from "../../../components/dashboard/UpcomingSchedules"
import RecentClients from "../../../components/dashboard/RecentClients"
import { fetchDashboardData, DashboardData } from "@/app/actions/dashboard-actions"
import { Loader2 } from "lucide-react"

export default function DashboardPage() {
  const [currentTime, setCurrentTime] = useState("")
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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
          setError(result.error || "Failed to load dashboard data")
        }
      } catch (err) {
        setError("An unexpected error occurred")
        console.error(err)
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

  // Show error state if any
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-5 rounded-lg max-w-lg">
          <h3 className="text-lg font-medium mb-2">Error Loading Dashboard</h3>
          <p>{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Try Again
          </button>
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
          <RecentActivities />
        </div>

        {/* Upcoming Schedules Sidebar */}
        <UpcomingSchedules todosData={dashboardData?.todos} />
      </div>

      {/* Recent Clients Section */}
      <RecentClients clientsData={dashboardData?.recentClients} />
    </div>
  )
}