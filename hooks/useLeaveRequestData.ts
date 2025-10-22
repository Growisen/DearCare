import { useState, useEffect } from 'react';
import { getLeaveRequests, updateLeaveRequestStatus, exportLeaveRequests } from '@/app/actions/staff-management/leave-management';
import { toast } from 'react-hot-toast';
import { LeaveRequestStatus, LeaveRequest } from '@/types/leave.types';
import { useQuery } from "@tanstack/react-query";
import useOrgStore from '@/app/stores/UseOrgStore';

export function useLeaveRequestData() {
  const { organization } = useOrgStore();
  const [searchInput, setSearchInput] = useState('')
  const [appliedSearchTerm, setAppliedSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string | null>(null)
  
  // Map organization from store to admitted type filter (database enum format)
  const getAdmittedTypeFilter = (): 'Dearcare_Llp' | 'Tata_Homenursing' | "" => {
    if (!organization) return "";
    if (organization === "TataHomeNursing") return "Tata_Homenursing";
    if (organization === "DearCare") return "Dearcare_Llp";
    return "";
  };

  const admittedTypeFilter = getAdmittedTypeFilter();
  
  const [dateRange, setDateRange] = useState<{startDate: string | null, endDate: string | null}>({
    startDate: null,
    endDate: null
  })
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [processingRequestIds, setProcessingRequestIds] = useState<Set<string>>(new Set())
  const [selectedLeaveRequest, setSelectedLeaveRequest] = useState<LeaveRequest | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [confirmationModal, setConfirmationModal] = useState<{
    isOpen: boolean;
    requestId: string | null;
    action: 'approve' | 'reject' | null;
  }>({
    isOpen: false,
    requestId: null,
    action: null,
  })
  

  const statuses = ['Pending', 'Approved', 'Rejected']
  
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
      pageSize,
      admittedTypeFilter
    ],
    queryFn: async () => {
      try {
        const result = await getLeaveRequests(
          getStatusFilter(),
          admittedTypeFilter,
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
  
  const handleViewLeaveRequest = (request: LeaveRequest) => {
    setSelectedLeaveRequest(request)
    setIsModalOpen(true)
  }

  const handleApproveLeaveRequest = async (id: string) => {
    setProcessingRequestIds(prev => new Set(prev).add(id))
    
    try {
      const result = await updateLeaveRequestStatus(id, 'approved')
      if (result.success) {
        toast.success('Leave request approved')
        refetch()
        if (selectedLeaveRequest?.id === id) {
          setSelectedLeaveRequest({...selectedLeaveRequest, status: 'approved'})
        }
      } else {
        toast.error(result.error || 'Failed to approve leave request')
      }
    } catch {
      toast.error('An error occurred while approving the request')
    } finally {
      setProcessingRequestIds(prev => {
        const updated = new Set(prev)
        updated.delete(id)
        return updated
      })
    }
  }

  const handleRejectLeaveRequest = async (id: string, rejectionReason?: string) => {
    try {
      if (!rejectionReason?.trim()) {
        toast.error('Please provide a reason for rejection');
        return;
      }
      
      setProcessingRequestIds(prev => new Set(prev).add(id))
      
      const result = await updateLeaveRequestStatus(id, 'rejected', rejectionReason)
      if (result.success) {
        toast.success('Leave request rejected')
        refetch()
        if (selectedLeaveRequest?.id === id) {
          setSelectedLeaveRequest({
            ...selectedLeaveRequest, 
            status: 'rejected', 
            rejectionReason
          })
        }
        setIsModalOpen(false)
      } else {
        toast.error(result.error || 'Failed to reject leave request')
      }
    } catch {
      toast.error('An error occurred while rejecting the request')
    } finally {
      setProcessingRequestIds(prev => {
        const updated = new Set(prev)
        updated.delete(id)
        return updated
      })
    }
  }
  
  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize)
    setCurrentPage(1)
  }



  const handleSearch = () => {
    applySearch()
  }

  const handleResetFilters = () => {
    clearAllFilters()
    refetch()
  }

  const handleExport = async () => {
    setIsExporting(true)
    try {
      const currentStatus = statusFilter && statusFilter !== 'All' 
        ? statusFilter.toLowerCase() as 'pending' | 'approved' | 'rejected' 
        : null
  
      const result = await exportLeaveRequests(
        currentStatus,
        searchInput,
        dateRange.startDate,
        dateRange.endDate
      )
  
      if (!result.success) {
        toast.error(result.error || 'Failed to export leave requests')
        return
      }
  
      if (result.recordCount === 0) {
        toast.error('No data to export based on current filters')
        return
      }
  
      const csvData = result.csvData || '';
      const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' })
      
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      
      // Set filename with current date
      const date = new Date().toISOString().split('T')[0]
      link.setAttribute('href', url)
      link.setAttribute('download', `leave_requests_${date}.csv`)
      link.style.visibility = 'hidden'
      
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      if (result.recordCount !== undefined) {
        toast.success(`${result.recordCount} leave requests exported successfully`)
      } else {
        toast.success('Leave requests exported successfully')
      }
    } catch (error) {
      console.error('Export error:', error)
      toast.error('Failed to export leave requests')
    } finally {
      setIsExporting(false)
    }
  }

  return {
    statuses,
    isModalOpen, 
    setIsModalOpen,
    isExporting,
    confirmationModal, 
    setConfirmationModal,
    leaveRequests,
    isLoading,
    searchTerm: searchInput,
    setSearchTerm: setSearchInput,
    applySearch,
    statusFilter, 
    setStatusFilter,
    admittedTypeFilter,
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
    refetch,
    handlePageChange,
    handlePreviousPage,
    handleNextPage,
    handleViewLeaveRequest,
    handleApproveLeaveRequest,
    handleRejectLeaveRequest,
    handleExport,
    handlePageSizeChange,
    handleSearch,
    handleResetFilters,
    selectedLeaveRequest
  }
}