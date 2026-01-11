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
    attendanceStatus,
    setAttendanceStatus,
    handleSearch,
  } = useStaffAttendance();

  return (
    <div className="space-y-3">
      <AttendanceHeader
        selectedDate={selectedDate}
        handleDateChange={handleDateChange}
        searchTerm={searchTerm}
        setSearchTerm={handleSearchChange}
        onExport={handleExport}
        isExporting={isExporting}
        selectedCategory={selectedCategory}
        attendanceStatus={attendanceStatus}
        setAttendanceStatus={setAttendanceStatus}
        handleSearch={handleSearch}
        handleResetFilters={handleResetFilters}
      />

      <div className="bg-white rounded-sm shadow-none overflow-hidden border border-slate-200">
        {loading ? (
          <LoadingState 
            message="Loading attendance data..." 
            description="Please wait while we fetch the attendance records data"
            className="xl:h-[770px] lg:h-[670px] md:h-[570px] sm:h-[470px] h-[370px]"
          />
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
          <AttendanceTable
            attendanceData={filteredData}
          />
        )}
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
          disabled={loading}
        />
      </div>
    </div>
  )
}