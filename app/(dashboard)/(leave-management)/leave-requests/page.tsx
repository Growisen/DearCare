"use client"

import { Check } from 'lucide-react'
import { useLeaveRequestData } from '@/hooks/useLeaveRequestData'
import { LeaveRequestsHeader } from '@/components/leaveManagement/LeaveRequestsHeader'
import { LeaveRequestsTable } from '@/components/leaveManagement/LeaveRequestsTable'
import { PaginationControls } from '@/components/client/clients/PaginationControls'
import LeaveRequestModal from '@/components/leaveManagement/LeaveRequestModal'

export default function LeaveRequestsPage() {

  const {
    statuses,
    isModalOpen, 
    setIsModalOpen,
    isExporting,
    confirmationModal, 
    setConfirmationModal,
    leaveRequests,
    isLoading,
    searchTerm,
    setSearchTerm,
    statusFilter, 
    setStatusFilter,
    admittedTypeFilter, 
    setAdmittedTypeFilter,
    dateRange,
    setDateRange,
    currentPage,
    totalPages,
    totalCount,
    pageSize,
    processingRequestIds,
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
  } = useLeaveRequestData()

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
        admittedTypeFilter={admittedTypeFilter}
        setAdmittedTypeFilter={setAdmittedTypeFilter}
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