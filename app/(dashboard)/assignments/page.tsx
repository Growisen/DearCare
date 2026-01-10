"use client"

import { useAssignmentData } from '@/hooks/useAssignmentData'

import { AssignmentHeader } from '@/components/assignment/AssignmentHeader'
import { AssignmentTable } from '@/components/assignment/AssignmentTable'
import { EmptyState } from "@/components/client/clients/EmptyState"
import { LoadingState } from '@/components/Loader'
import { PaginationControls } from '@/components/client/clients/PaginationControls'
import { ErrorState } from '@/components/client/clients/ErrorState'
import { StatsSummary } from '@/components/assignment/AssignmentStats'

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
    handlePageChange,
    handlePreviousPage,
    handleNextPage,
    handleResetFilters,
    refreshData,
    handleExport,
    stats,
    statsLoading,
  } = useAssignmentData()

  return (
    <div className="">
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
      />

      <StatsSummary
        stats={
          stats ?? {
            starting_today_count: 0,
            ending_today_count: 0,
            active_count: 0,
            expiring_soon_count: 0,
          }
        }
        loading={statsLoading}
      />

      <div className="bg-white rounded-sm shadow-none overflow-hidden border border-slate-200 mt-3">
        {loading ? (
          <LoadingState 
            message="Loading assignments..." 
            description="Please wait while we fetch the assignments data" 
            className="xl:h-[770px] lg:h-[670px] md:h-[570px] sm:h-[470px] h-[370px]"
          />
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
          <AssignmentTable 
            assignments={assignments} 
          />
        )}
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
          disabled={loading}
        />
      </div>
    </div>
  )
}