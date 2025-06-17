import { useState, useEffect } from 'react'
import { getLeaveRequests } from '@/app/actions/leave-management'
import { toast } from 'react-hot-toast'
import { LeaveRequestStatus } from '@/types/leave.types'
import { useQuery } from "@tanstack/react-query"

export function useLeaveRequestData() {
  const [searchInput, setSearchInput] = useState('')
  const [appliedSearchTerm, setAppliedSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string | null>(null)
  const [dateRange, setDateRange] = useState<{startDate: string | null, endDate: string | null}>({
    startDate: null,
    endDate: null
  })
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [processingRequestIds, setProcessingRequestIds] = useState<Set<string>>(new Set())
  
  const getStatusFilter = (): LeaveRequestStatus | null => {
    if (statusFilter && statusFilter !== 'All') {
      const lowercaseStatus = statusFilter.toLowerCase() as LeaveRequestStatus
      if (lowercaseStatus === 'pending' || lowercaseStatus === 'approved' || lowercaseStatus === 'rejected') {
        return lowercaseStatus
      }
    }
    return null
  }


  useEffect(() => {
    setCurrentPage(1)
  }, [statusFilter, appliedSearchTerm, dateRange.startDate, dateRange.endDate])

  // Use React Query for data fetching and caching
  const { 
    data, 
    isLoading, 
    refetch 
  } = useQuery({
    queryKey: [
      'leaveRequests', 
      getStatusFilter(), 
      appliedSearchTerm,
      dateRange.startDate,
      dateRange.endDate,
      currentPage,
      pageSize
    ],
    queryFn: async () => {
      try {
        const result = await getLeaveRequests(
          getStatusFilter(),
          appliedSearchTerm,
          dateRange.startDate,
          dateRange.endDate,
          currentPage,
          pageSize
        )
        
        if (!result.success) {
          toast.error(result.error || 'Failed to fetch leave requests')
          return { leaveRequests: [], totalCount: 0 }
        }
        
        return { 
          leaveRequests: result.leaveRequests || [], 
          totalCount: result.totalCount || 0 
        }
      } catch (error) {
        console.error('Error fetching leave requests:', error)
        toast.error('An error occurred while fetching leave requests')
        return { leaveRequests: [], totalCount: 0 }
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: true,
    refetchInterval: 1000 * 60 * 10, // 10 minutes
  })

  const leaveRequests = data?.leaveRequests || []
  const totalCount = data?.totalCount || 0
  const totalPages = Math.ceil(totalCount / pageSize)
  
  // Apply search when search button is clicked
  const applySearch = () => {
    setAppliedSearchTerm(searchInput)
    setCurrentPage(1)
  }
  
  const clearAllFilters = () => {
    setSearchInput('')
    setAppliedSearchTerm('')
    setStatusFilter(null)
    setDateRange({startDate: null, endDate: null})
  }

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
    searchTerm: searchInput,
    setSearchTerm: setSearchInput,
    applySearch,
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
    fetchLeaveRequests: refetch,
    handlePageChange,
    handlePreviousPage,
    handleNextPage
  }
}