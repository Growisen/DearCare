"use client"

import { useAssignmentData } from '@/hooks/useAssignmentData'

import { AssignmentHeader } from '@/components/assignment/AssignmentHeader'
import { AssignmentTable } from '@/components/assignment/AssignmentTable'
import { EmptyState } from "@/components/client/clients/EmptyState"
import { LoadingState } from '@/components/Loader'
import { PaginationControls } from '@/components/client/clients/PaginationControls'
import { ErrorState } from '@/components/client/clients/ErrorState'

export default function AssignmentsPage() {
  
  const { 
    assignments,
    loading,
    error,
    filterStatus,
    searchInput,
    setSearchInput,
    dateFilter,
    categoryFilter,
    currentPage,
    totalPages,
    totalCount,
    pageSize,
    handlePageSizeChange,
    isExporting,
    handleSearch,
    handleStatusChange,
    handleDateFilterChange,
    handleCategoryChange, 
    handlePageChange,
    handlePreviousPage,
    handleNextPage,
    handleResetFilters,
    refreshData,
    handleExport
  } = useAssignmentData()

  return (
    <div className="space-y-5 sm:space-y-7">
      <AssignmentHeader
        onExport={handleExport}
        isExporting={isExporting}
        selectedStatus={filterStatus}
        searchInput={searchInput}
        setSearchInput={setSearchInput}
        dateFilter={dateFilter}
        handleStatusChange={handleStatusChange}
        handleSearch={handleSearch}
        handleDateFilterChange={handleDateFilterChange}
        handleResetFilters={handleResetFilters}
        selectedCategory={categoryFilter}
        handleCategoryChange={handleCategoryChange}
      />


      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
        {loading ? (
          <LoadingState message="Loading assignments..." />
        ) : error ? (
          <ErrorState 
            error={error} 
            onRetry={refreshData} 
          />
        ) : assignments.length === 0 ? (
          <EmptyState 
            title="No assignments found"
            message="Try changing your filters or search criteria"
            handleResetFilters={handleResetFilters}
          />
        ) : (
          <>
            <AssignmentTable 
              assignments={assignments} 
            />
            
            <PaginationControls
              currentPage={currentPage}
              totalPages={totalPages}
              totalCount={totalCount}
              pageSize={pageSize}
              setPageSize={handlePageSizeChange}
              itemsLength={assignments.length}
              onPageChange={handlePageChange}
              onPreviousPage={handlePreviousPage}
              onNextPage={handleNextPage}
            />
          </>
        )}
      </div>

      {/* You can add assignment details overlay similar to client details overlay */}
      {/* {selectedAssignment && (
        <AssignmentDetailsOverlay 
          assignment={selectedAssignment} 
          onClose={() => setSelectedAssignment(null)}
        />
      )} */}
    </div>
  )
}