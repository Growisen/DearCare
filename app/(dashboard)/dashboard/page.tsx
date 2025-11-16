"use client"
import { useState, useEffect } from "react"
import StaffAttendance from "@/components/dashboard/StaffAttendance"
import RecentActivities from "@/components/dashboard/RecentActivities"
import Stats from "@/components/dashboard/Stats"
import UpcomingSchedules from "@/components/dashboard/UpcomingSchedules"
import RecentClients from "@/components/dashboard/RecentClients"
import PaymentOverview from "@/components/dashboard/PaymentOverview"
import { useDashboardData } from "@/hooks/useDashboardData"
import Loader from '@/components/Loader'
import DashboardHeader from "@/components/dashboard/DashboardHeader"

export default function DashboardPage() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [greeting, setGreeting] = useState("Good Day")

  const todayFormatted = new Date().toLocaleDateString('en-US', { 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  })

  const { dashboard, paymentOverview } = useDashboardData({ selectedDate });

  const isLoading = dashboard.isLoading;
  const error = dashboard.error;
  const result = dashboard.data;
  const dashboardData = result?.success ? result.data : null;

  const paymentData = paymentOverview.data?.success ? paymentOverview.data.data : undefined;

  console.log('Dashboard Data:', dashboardData);
  console.log('Payment Overview Data:', paymentData);

  useEffect(() => {
    const hour = new Date().getHours()
    if (hour < 12) setGreeting("Good Morning")
    else if (hour < 18) setGreeting("Good Afternoon")
    else setGreeting("Good Evening")
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Loader message="Loading dashboard..." />
      </div>
    )
  }

  if (error || (result && !result.success)) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="p-6 bg-white border border-red-100 rounded-xl shadow-sm max-w-md w-full text-center">
          <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900">Unable to load data</h3>
          <p className="text-gray-500 mt-2 text-sm">
            {error instanceof Error ? error.message : result?.error || "A connection error occurred."}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 min-h-screen md:px-6 pb-6 custom-scrollbar">
      <DashboardHeader
        greeting={greeting}
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        todayFormatted={todayFormatted}
      />
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
        <div className="lg:col-span-3 grid grid-cols-2 md:grid-cols-4 gap-5 content-start">
          <Stats statsData={dashboardData?.stats} />
          <StaffAttendance 
            currentTime={new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} 
            attendanceData={dashboardData?.attendance} 
          />
          <RecentActivities complaintsData={dashboardData?.complaints} />
        </div>
        <UpcomingSchedules todosData={dashboardData?.todos} />
      </div>
      <RecentClients clientsData={dashboardData?.recentClients} />
      <PaymentOverview loading={paymentOverview.isLoading} paymentData={paymentData} />
    </div>
  )
}