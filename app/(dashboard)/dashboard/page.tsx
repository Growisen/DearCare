"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { useDashboardData } from "@/hooks/useDashboardData"
import { usePaymentsData } from "@/hooks/useClientPaymentsData"
import { useAdvancePaymentsData } from "@/hooks/useAdvancePaymentsData"
import { usePagination } from "@/hooks/usePagination"
import ErrorState from "@/components/common/ErrorState"
import DashboardHeader from "@/components/dashboard/DashboardHeader"
import Stats from "@/components/dashboard/Stats"
import StaffAttendance from "@/components/dashboard/StaffAttendance"
import RecentActivities from "@/components/dashboard/RecentActivities"
import UpcomingSchedules from "@/components/dashboard/UpcomingSchedules"
import RecentClients from "@/components/dashboard/RecentClients"
import PaymentOverview from "@/components/dashboard/PaymentOverview"
import AdvancePaymentsOverview from "@/components/dashboard/AdvancePaymentsOverview"
import RefundOverview from "@/components/dashboard/RefundsOverview"
import { getGreeting } from "@/utils/dateUtils"
import { useRefunds, RefundPaymentsFilters, Refund } from "@/hooks/useRefunds"

export default function DashboardPage() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [greeting, setGreeting] = useState("")
  const [isExporting, setIsExporting] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [currentTime, setCurrentTime] = useState("")
  const [paymentFilters, setPaymentFilters] = useState<{ date?: Date | null; paymentType?: string }>({})
  const [advancePaymentFilters, setAdvancePaymentFilters] = useState<{ date?: Date | null; paymentType?: string }>({})
  const [refundFilters, setRefundFilters] = useState<RefundPaymentsFilters>({
    date: null,
  })
  const [refundSearchTerm, setRefundSearchTerm] = useState("")
  const [debouncedRefundSearch, setDebouncedRefundSearch] = useState("")

  const { 
    page, 
    pageSize, 
    changePage, 
    changePageSize, 
    resetPage 
  } = usePagination()

  const { 
    page: refundsPage, 
    pageSize: refundsPageSize, 
    changePage: changeRefundsPage, 
    changePageSize: changeRefundsPageSize, 
    resetPage: resetRefundsPage 
  } = usePagination()

  useEffect(() => {
    setGreeting(getGreeting())
    setCurrentTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm)
      if (searchTerm !== debouncedSearch) {
        resetPage()
      }
    }, 500)
    return () => clearTimeout(timer)
  }, [searchTerm, resetPage, debouncedSearch])

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedRefundSearch(refundSearchTerm)
      if (refundSearchTerm !== debouncedRefundSearch) {
        resetRefundsPage()
      }
    }, 500)
    return () => clearTimeout(timer)
  }, [refundSearchTerm, resetRefundsPage, debouncedRefundSearch])

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedRefundSearch(refundSearchTerm)
    }, 500)
    return () => clearTimeout(timer)
  }, [refundSearchTerm])

  const advancePaymentOptions = useMemo(() => ({
    selectedDate,
    page,
    pageSize,
    advancePaymentsSearchTerm: debouncedSearch,
    paymentType: advancePaymentFilters.paymentType
  }), [selectedDate, page, pageSize, debouncedSearch, advancePaymentFilters.paymentType])

  const { 
    dashboard 
  } = useDashboardData(selectedDate)
  const {
    paymentOverview,
  } = usePaymentsData(paymentFilters)
  const {
    advancePayments,
    advancePaymentsTotals,
    exportAdvancePaymentsCSV,
  } = useAdvancePaymentsData(advancePaymentOptions)

  const { 
    refunds,
    isLoading: refundsLoading, 
    totalCount: refundsTotalCount 
  } = useRefunds({
    ...refundFilters,
    search: debouncedRefundSearch,
    page: refundsPage,
    limit: refundsPageSize,
  })

  const dashboardData = useMemo(() => 
    dashboard.data?.success ? dashboard.data.data : null, 
  [dashboard.data])

  const paymentData = useMemo(() => 
    paymentOverview.data?.success ? paymentOverview.data.data : undefined, 
  [paymentOverview.data])

  const advanceData = useMemo(() => 
    advancePayments.data?.data || [], 
  [advancePayments.data])

  const advanceMeta = useMemo(() => 
    advancePayments.data?.meta, 
  [advancePayments.data])

  const advanceTotals = useMemo(() => 
    advancePaymentsTotals.data ?? { totalAmountGiven: 0, totalAmountReturned: 0 }, 
  [advancePaymentsTotals.data])

  const isLoading = dashboard.isLoading
  const error = dashboard.error || advancePayments.error
  const errorMessage = error instanceof Error ? error.message : "A connection error occurred."
  
  const todayFormatted = useMemo(() => 
    new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' }), 
  [])

  const handleExport = useCallback(async () => {
    setIsExporting(true)
    try {
      await exportAdvancePaymentsCSV()
    } finally {
      setIsExporting(false)
    }
  }, [exportAdvancePaymentsCSV])

  const totalPages = advanceMeta?.totalPages || 1

  const handlePageChange = useCallback((p: number) => changePage(p, totalPages), [changePage, totalPages])
  const handlePrevPage = useCallback(() => changePage(page - 1, totalPages), [changePage, page, totalPages])
  const handleNextPage = useCallback(() => changePage(page + 1, totalPages), [changePage, page, totalPages])

  const totalRefundPages = Math.ceil(refundsTotalCount / refundsPageSize) || 1

  const handleRefundsPageChange = useCallback((p: number) => 
    changeRefundsPage(p, totalRefundPages), 
  [changeRefundsPage, totalRefundPages]
  )
  const handleRefundsPrevPage = useCallback(() => 
    changeRefundsPage(refundsPage - 1, totalRefundPages), 
  [changeRefundsPage, refundsPage, totalRefundPages]
  )
  const handleRefundsNextPage = useCallback(() =>
    changeRefundsPage(refundsPage + 1, totalRefundPages),
  [changeRefundsPage, refundsPage, totalRefundPages]
  )

  useEffect(() => {
    if (setPaymentFilters) {
      setPaymentFilters(prev => ({
        ...prev,
        date: selectedDate
      }))
    }
  }, [selectedDate, setPaymentFilters])

  useEffect(() => {
    if (setRefundFilters) {
      setRefundFilters(prev => ({
        ...prev,
        date: selectedDate
      }))
    }
  }, [selectedDate, setRefundFilters])

  if (error || (dashboard.data && !dashboard.data.success)) {
    return <ErrorState message={errorMessage} />
  }

  return (
    <div className="flex flex-col gap-3 min-h-screen custom-scrollbar">
      <DashboardHeader
        greeting={greeting}
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        todayFormatted={todayFormatted}
        isLoading={isLoading}
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
        <div className="lg:col-span-3 grid grid-cols-2 md:grid-cols-4 gap-5 content-start">
          <Stats 
            statsData={dashboardData?.stats} 
            isLoading={isLoading}
          />
          <StaffAttendance 
            currentTime={currentTime} 
            attendanceData={dashboardData?.attendance} 
            isLoading={isLoading}
          />
          <RecentActivities 
            complaintsData={dashboardData?.complaints} 
            isLoading={isLoading}
          />
        </div>
        <UpcomingSchedules 
          todosData={dashboardData?.todos} 
          isLoading={isLoading}
        />
      </div>

      <RecentClients 
        clientsData={dashboardData?.recentClients} 
      />
      
      <PaymentOverview 
        loading={paymentOverview.isLoading} 
        paymentData={paymentData} 
        paymentFilters={paymentFilters} 
        setPaymentFilters={setPaymentFilters}
      />

      <RefundOverview
        refunds={refunds as Refund[] || []}
        loading={refundsLoading}
        filters={refundFilters}
        setFilters={setRefundFilters}
        searchTerm={refundSearchTerm}
        setSearchTerm={setRefundSearchTerm}
        page={refundsPage}
        pageSize={refundsPageSize}
        totalPages={totalRefundPages}
        totalCount={refundsTotalCount}
        onNextPageAction={handleRefundsNextPage}
        onPreviousPageAction={handleRefundsPrevPage}
        onPageChangeAction={handleRefundsPageChange}
        setPageSizeAction={changeRefundsPageSize}
      />

      <AdvancePaymentsOverview 
        loading={advancePayments.isLoading}
        isExporting={isExporting}
        payments={Array.isArray(advanceData) ? advanceData : []}
        totalRecords={advanceMeta?.total}
        paymentType={advancePaymentFilters.paymentType}
        setPaymentTypeAction={(paymentType: string) =>
          setAdvancePaymentFilters(prev => ({ ...prev, paymentType }))
        }
        page={page}
        pageSize={pageSize}
        totalPages={totalPages}
        totalGiven={advanceTotals.totalAmountGiven}
        totalReturned={advanceTotals.totalAmountReturned}
        searchTerm={searchTerm} 
        setSearchTermAction={setSearchTerm} 
        onExportAction={handleExport}
        onPageChangeAction={handlePageChange}
        onPreviousPageAction={handlePrevPage}
        onNextPageAction={handleNextPage}
        setPageSizeAction={changePageSize}
      />
    </div>
  )
}