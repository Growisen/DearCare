"use client"
import { useState, useEffect } from "react"
import StaffAttendance from "../../../components/dashboard/StaffAttendance"
import RecentActivities from "../../../components/dashboard/RecentActivities"
import Stats from "../../../components/dashboard/Stats"
import UpcomingSchedules from "../../../components/dashboard/UpcomingSchedules"
import RecentClients from "../../../components/dashboard/RecentClients"

export default function DashboardPage() {
  const [currentTime, setCurrentTime] = useState("")

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date().toLocaleTimeString()), 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="flex flex-col gap-4 min-h-screen p-4 custom-scrollbar">
      {/* Main Content Section */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-3 grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Stats Section */}
          <Stats />

          {/* Staff Attendance */}
          <StaffAttendance currentTime={currentTime} />

          {/* Recent Activities */}
          <RecentActivities />
        </div>

        {/* Upcoming Schedules Sidebar */}
        <UpcomingSchedules />
      </div>

      {/* Recent Clients Section */}
      <RecentClients />
    </div>
  )
}