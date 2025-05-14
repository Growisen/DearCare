"use client"

import { useState } from 'react'
import { Check } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { useLeaveRequestData } from '@/hooks/useLeaveRequestData'
import { updateLeaveRequestStatus } from '@/app/actions/leave-management'
import { LeaveRequest } from '@/types/leave.types'

import { LeaveRequestsHeader } from '@/components/leaveManagement/LeaveRequestsHeader'
import { LeaveRequestsTable } from '@/components/leaveManagement/LeaveRequestsTable'
import { LeaveRequestsCards } from '@/components/leaveManagement/LeaveRequestsCards'
import { PaginationControls } from '@/components/leaveManagement/PaginationControls'
import LeaveRequestModal from '@/components/leaveManagement/LeaveRequestModal'

export default function LeaveRequestsPage() {
  // Custom hook for managing leave request data
  const {
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
    handlePageChange
  } = useLeaveRequestData()

  // Local state
  const [selectedLeaveRequest, setSelectedLeaveRequest] = useState<LeaveRequest | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [confirmationModal, setConfirmationModal] = useState<{
    isOpen: boolean;
    requestId: string | null;
    action: 'approve' | 'reject' | null;
  }>({
    isOpen: false,
    requestId: null,
    action: null,
  })
  
  const statuses = ['All', 'Approved', 'Pending', 'Rejected']
  
  // Event handlers
  const handleViewLeaveRequest = (request: LeaveRequest) => {
    setSelectedLeaveRequest(request)
    setIsModalOpen(true)
  }

  const confirmApproval = (id: string) => {
    setConfirmationModal({
      isOpen: true,
      requestId: id,
      action: 'approve'
    })
  }
  
  const confirmRejection = (id: string) => {
    setSelectedLeaveRequest(leaveRequests.find(req => req.id === id) || null)
    setIsModalOpen(true)
  }

  const handleApproveLeaveRequest = async (id: string) => {
    setConfirmationModal({isOpen: false, requestId: null, action: null})
    
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

  return (
    <div className="space-y-8 pb-10">
    
      <LeaveRequestsHeader 
        title="Leave Requests"
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        dateRange={dateRange}
        setDateRange={setDateRange}
        clearAllFilters={clearAllFilters}
        statuses={statuses}
      />

      <div className="bg-white rounded-2xl shadow border border-gray-100 overflow-hidden">
        <LeaveRequestsTable
          leaveRequests={leaveRequests}
          isLoading={isLoading}
          processingRequestIds={processingRequestIds}
          onView={handleViewLeaveRequest}
          onApprove={confirmApproval}
          onReject={confirmRejection}
        />
        
        <LeaveRequestsCards
          leaveRequests={leaveRequests}
          isLoading={isLoading}
          processingRequestIds={processingRequestIds}
          onView={handleViewLeaveRequest}
          onApprove={confirmApproval}
          onReject={confirmRejection}
        />
        
        {!isLoading && leaveRequests.length > 0 && (
          <PaginationControls
            currentPage={currentPage}
            totalPages={totalPages}
            totalCount={totalCount}
            pageSize={pageSize}
            itemsLength={leaveRequests.length}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
          />
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