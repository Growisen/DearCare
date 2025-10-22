"use client"
import { AttendanceHeader } from '@/components/staff/attendance/AttendanceHeader'
import { AttendanceTable } from '@/components/staff/attendance/AttendanceTable'
import { ErrorState } from '@/components/staff/attendance/ErrorState'
import { EmptyState } from '@/components/staff/attendance/EmptyState'
import { LoadingState } from '@/components/Loader'
import { PaginationControls } from '@/components/client/clients/PaginationControls'
import { useStaffAttendance } from '@/hooks/useStaffAttendance'

export default function StaffAttendancePage() {
  const {
    filteredData,
    loading,
    error,
    selectedDate,
    searchTerm,
    selectedCategory,
    currentPage,
    pageSize,
    totalPages,
    totalCount,
    isExporting,
    loadAttendanceData,
    handleSearchChange,
    handleDateChange,
    handlePageSizeChange,
    handlePageChange,
    handlePreviousPage,
    handleNextPage,
    handleResetFilters,
    handleExport,
  } = useStaffAttendance();

  return (
    <div className="space-y-5 sm:space-y-7">
      <AttendanceHeader
        selectedDate={selectedDate}
        handleDateChange={handleDateChange}
        searchTerm={searchTerm}
        setSearchTerm={handleSearchChange}
        onExport={handleExport}
        isExporting={isExporting}
        selectedCategory={selectedCategory}
      />

      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
        {loading ? (
          <LoadingState message="Loading attendance data..." />
        ) : error ? (
          <ErrorState 
            error={error} 
            onRetry={loadAttendanceData} 
          />
        ) : filteredData.length === 0 ? (
          <EmptyState 
            title="No attendance records found"
            message={searchTerm ? 
              "Try changing your search term or date selection" : 
              "There are no attendance records for the selected date"
            }
            handleResetFilters={handleResetFilters}
          />
        ) : (
          <>
            <AttendanceTable
              attendanceData={filteredData}
            />
            
            <PaginationControls
              currentPage={currentPage}
              totalPages={totalPages}
              totalCount={totalCount}
              pageSize={pageSize}
              setPageSize={handlePageSizeChange}
              itemsLength={filteredData.length}
              onPageChange={handlePageChange}
              onPreviousPage={handlePreviousPage}
              onNextPage={handleNextPage}
            />
          </>
        )}
      </div>
    </div>
  )
}