import { useState, useEffect } from 'react'
import { getLeaveRequests } from '@/app/actions/leave-management'
import { toast } from 'react-hot-toast'
import { LeaveRequest, LeaveRequestStatus } from '@/types/leave.types'

export function useLeaveRequestData() {
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string | null>(null)
  const [dateRange, setDateRange] = useState<{startDate: string | null, endDate: string | null}>({
    startDate: null,
    endDate: null
  })
  const [currentPage, setCurrentPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [pageSize, setPageSize] = useState(10)
  const [processingRequestIds, setProcessingRequestIds] = useState<Set<string>>(new Set())
  
  const totalPages = Math.ceil(totalCount / pageSize)

  const clearAllFilters = () => {
    setSearchTerm('')
    setStatusFilter(null)
    setDateRange({startDate: null, endDate: null})
  }

  const fetchLeaveRequests = async () => {
    setIsLoading(true)
    try {
      let status: LeaveRequestStatus | null = null
      
      if (statusFilter && statusFilter !== 'All') {
        const lowercaseStatus = statusFilter.toLowerCase() as LeaveRequestStatus
        if (lowercaseStatus === 'pending' || lowercaseStatus === 'approved' || lowercaseStatus === 'rejected') {
          status = lowercaseStatus
        }
      }
        
      const result = await getLeaveRequests(
        status, 
        searchTerm,
        dateRange.startDate,
        dateRange.endDate,
        currentPage,
        pageSize
      )
  
      if (result.success) {
        setLeaveRequests(result.leaveRequests || [])
        setTotalCount(result.totalCount || 0)
      } else {
        toast.error(result.error || 'Failed to fetch leave requests')
        setLeaveRequests([])
        setTotalCount(0)
      }
    } catch (error) {
      console.error('Error fetching leave requests:', error)
      toast.error('An error occurred while fetching leave requests')
      setLeaveRequests([])
      setTotalCount(0)
    } finally {
      setIsLoading(false)
    }
  }
  
  useEffect(() => {
    setCurrentPage(1)
  }, [statusFilter, searchTerm, dateRange.startDate, dateRange.endDate])
  
  useEffect(() => {
    fetchLeaveRequests()
  }, [currentPage, pageSize, statusFilter, searchTerm, dateRange.startDate, dateRange.endDate])

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return
    setCurrentPage(page)
  }

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1)
    }
  }

  return {
    leaveRequests,
    isLoading,
    searchTerm,
    setSearchTerm,
    statusFilter, 
    setStatusFilter,
    dateRange,
    setDateRange,
    currentPage,
    setCurrentPage,
    totalPages,
    totalCount,
    pageSize,
    setPageSize,
    processingRequestIds,
    setProcessingRequestIds,
    clearAllFilters,
    fetchLeaveRequests,
    handlePageChange,
    handlePreviousPage,
    handleNextPage
  }
}