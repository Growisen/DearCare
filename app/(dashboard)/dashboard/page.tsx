"use client"

import { useState, useEffect } from "react"
import { useDashboardData } from "@/hooks/useDashboardData"
import { usePaymentsData } from "@/hooks/useClientPaymentsData"
import { useAdvancePaymentsData } from "@/hooks/useAdvancePaymentsData"
import Loader from '@/components/Loader'
import DashboardHeader from "@/components/dashboard/DashboardHeader"
import Stats from "@/components/dashboard/Stats"
import StaffAttendance from "@/components/dashboard/StaffAttendance"
import RecentActivities from "@/components/dashboard/RecentActivities"
import UpcomingSchedules from "@/components/dashboard/UpcomingSchedules"
import RecentClients from "@/components/dashboard/RecentClients"
import PaymentOverview from "@/components/dashboard/PaymentOverview"
import AdvancePaymentsOverview from "@/components/dashboard/AdvancePaymentsOverview"
import ErrorState from "@/components/common/ErrorState"

export default function DashboardPage() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [greeting, setGreeting] = useState("") 
  const [isExporting, setIsExporting] = useState(false)
  
  const [searchTerm, setSearchTerm] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [pagination, setPagination] = useState({ page: 1, pageSize: 10 })

  useEffect(() => {
    const hour = new Date().getHours()
    setGreeting(hour < 12 ? "Good Morning" : hour < 18 ? "Good Afternoon" : "Good Evening")
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm)
      setPagination(prev => ({ ...prev, page: 1 }))
    }, 500)
    return () => clearTimeout(timer)
  }, [searchTerm])

  const { dashboard } = useDashboardData(selectedDate)
  const { paymentOverview } = usePaymentsData(selectedDate)
  const {
    advancePayments,
    exportAdvancePaymentsCSV,
  } = useAdvancePaymentsData({
    selectedDate,
    page: pagination.page,
    pageSize: pagination.pageSize,
    advancePaymentsSearchTerm: debouncedSearch,
  })

  const isLoading = dashboard.isLoading
  const error = dashboard.error || advancePayments.error
  const dashboardData = dashboard.data?.success ? dashboard.data.data : null
  const paymentData = paymentOverview.data?.success ? paymentOverview.data.data : undefined
  const advanceData = advancePayments.data?.data || []
  const advanceMeta = advancePayments.data?.meta

  const handleExport = async () => {
    setIsExporting(true)
    try {
      await exportAdvancePaymentsCSV()
    } finally {
      setIsExporting(false)
    }
  }

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ 
      ...prev, 
      page: Math.max(1, Math.min(newPage, advanceMeta?.totalPages || 1)) 
    }))
  }

  const handlePageSizeChange = (size: number) => {
    setPagination(prev => ({ ...prev, pageSize: size, page: 1 }))
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader message="Loading dashboard..." />
      </div>
    )
  }

  if (error || (dashboard.data && !dashboard.data.success)) {
    return <ErrorState message={error instanceof Error ? error.message : "A connection error occurred."} />
  }

  return (
    <div className="flex flex-col gap-3 min-h-screen pb-6 custom-scrollbar">
      <DashboardHeader
        greeting={greeting}
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        todayFormatted={new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
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
      
      <PaymentOverview 
        loading={paymentOverview.isLoading} 
        paymentData={paymentData} 
      />
      
      <AdvancePaymentsOverview 
        loading={advancePayments.isLoading}
        isExporting={isExporting}
        payments={Array.isArray(advanceData) ? advanceData : []}
        totalRecords={advanceMeta?.total}
        page={pagination.page}
        pageSize={pagination.pageSize}
        totalPages={advanceMeta?.totalPages}
        totalGiven={advanceMeta?.totalAmountGiven}
        totalReturned={advanceMeta?.totalAmountReturned}
        searchTerm={searchTerm} 
        setSearchTermAction={setSearchTerm} 
        onExportAction={handleExport}
        onPageChangeAction={handlePageChange}
        onPreviousPageAction={() => handlePageChange(pagination.page - 1)}
        onNextPageAction={() => handlePageChange(pagination.page + 1)}
        setPageSizeAction={handlePageSizeChange}
      />
    </div>
  )
}