"use client"

import { useState } from 'react'
import { Check } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { useLeaveRequestData } from '@/hooks/useLeaveRequestData'
import { updateLeaveRequestStatus, exportLeaveRequests } from '@/app/actions/staff-management/leave-management'
import { LeaveRequest } from '@/types/leave.types'

import { LeaveRequestsHeader } from '@/components/leaveManagement/LeaveRequestsHeader'
import { LeaveRequestsTable } from '@/components/leaveManagement/LeaveRequestsTable'
import { PaginationControls } from '@/components/client/clients/PaginationControls'
import LeaveRequestModal from '@/components/leaveManagement/LeaveRequestModal'

export default function LeaveRequestsPage() {
  // Custom hook for managing leave request data
  const {
    leaveRequests,
    isLoading,
    searchTerm,
    setSearchTerm,
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
    fetchLeaveRequests,
    handlePageChange
  } = useLeaveRequestData()


  // Local state
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
  
  // Filter statuses without 'All' since it's handled separately in the header
  const statuses = ['Pending', 'Approved', 'Rejected']
  
  // Event handlers
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
        fetchLeaveRequests()
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
        fetchLeaveRequests()
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

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      handlePageChange(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      handlePageChange(currentPage + 1);
    }
  };

  const handleSearch = () => {
    applySearch()
  }

  const handleResetFilters = () => {
    clearAllFilters()
    fetchLeaveRequests()
  }

  const handleExport = async () => {
    setIsExporting(true)
    try {
      // Get the current status filter value in the correct format
      const currentStatus = statusFilter && statusFilter !== 'All' 
        ? statusFilter.toLowerCase() as 'pending' | 'approved' | 'rejected' 
        : null
  
      // Call our export function with current filters
      const result = await exportLeaveRequests(
        currentStatus,
        searchTerm,
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
  
      // Create blob from the CSV data
      const csvData = result.csvData || '';
      const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' })
      
      // Create download link and trigger download
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
      
      toast.success(`${result.recordCount} leave requests exported successfully`)
    } catch (error) {
      console.error('Export error:', error)
      toast.error('Failed to export leave requests')
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="space-y-8 pb-10">
      <LeaveRequestsHeader 
        onExport={handleExport}
        isExporting={isExporting}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        dateRange={dateRange}
        setDateRange={setDateRange}
        handleSearch={handleSearch}
        handleResetFilters={handleResetFilters}
        statuses={statuses}
      />

      <div className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
        <LeaveRequestsTable
          leaveRequests={leaveRequests}
          isLoading={isLoading}
          processingRequestIds={processingRequestIds}
          onView={handleViewLeaveRequest}
        />
        
        {!isLoading && leaveRequests.length > 0 && (
          <div className="p-4 bg-gray-50 border-t border-gray-200">
            <PaginationControls
              currentPage={currentPage}
              totalPages={totalPages}
              totalCount={totalCount}
              pageSize={pageSize}
              itemsLength={leaveRequests.length}
              onPageChange={handlePageChange}
              onPreviousPage={handlePreviousPage}
              onNextPage={handleNextPage}
              setPageSize={handlePageSizeChange}
            />
          </div>
        )}
      </div>

      {/* Leave Request Modal */}
      {selectedLeaveRequest && (
        <LeaveRequestModal 
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          leaveRequest={selectedLeaveRequest}
          onApprove={handleApproveLeaveRequest}
          onReject={handleRejectLeaveRequest}
        />
      )}

      {/* Approval Confirmation Modal */}
      {confirmationModal.isOpen && confirmationModal.action === 'approve' && (
        <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-xl max-w-md w-full m-4 border border-gray-100">
            <div className="flex items-center justify-center w-16 h-16 mx-auto bg-green-50 border border-green-100 rounded-full mb-6">
              <Check className="h-7 w-7 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-center text-gray-900 mb-3">
              Approve Leave Request
            </h3>
            <p className="text-sm text-gray-600 mb-6 text-center">
              Are you sure you want to approve this leave request? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                className="px-5 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm transition-all duration-150"
                onClick={() => setConfirmationModal({isOpen: false, requestId: null, action: null})}
              >
                Cancel
              </button>
              <button
                className="px-5 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 shadow-sm transition-all duration-150"
                onClick={() => {
                  if (confirmationModal.requestId) {
                    handleApproveLeaveRequest(confirmationModal.requestId)
                  }
                }}
              >
                Confirm Approval
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}