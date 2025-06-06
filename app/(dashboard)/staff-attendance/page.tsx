"use client"
import { useState, useEffect } from 'react'
import { fetchStaffAttendance, AttendanceRecord } from '@/app/actions/attendance-actions'

import { AttendanceHeader } from '@/components/staff/attendance/AttendanceHeader'
import { AttendanceTable } from '@/components/staff/attendance/AttendanceTable'
import { ErrorState } from '@/components/staff/attendance/ErrorState'
import { EmptyState } from '@/components/staff/attendance/EmptyState'
import { LoadingState } from '@/components/Loader'
import { PaginationControls } from '@/components/client/clients/PaginationControls'

export default function StaffAttendancePage() {
  // State for attendance data and loading state
  const [attendanceData, setAttendanceData] = useState<AttendanceRecord[]>([])
  const [filteredData, setFilteredData] = useState<AttendanceRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // State for filters
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [searchTerm, setSearchTerm] = useState('')
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10
  const [totalPages, setTotalPages] = useState(1)
  const [isExporting, setIsExporting] = useState(false)
  
  useEffect(() => {
    loadAttendanceData();
  }, [selectedDate, currentPage]); // Add currentPage dependency
  
  const loadAttendanceData = async () => {
    setLoading(true);
    try {
      const date = new Date(selectedDate);
      const formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      const result = await fetchStaffAttendance(
        formattedDate, 
        currentPage, 
        pageSize,
        true
      );
  
      console.log('Attendance data:', result.data);
      console.log('Pagination info:', result.pagination);
      
      if (result.success) {
        setAttendanceData(result.data);
        
        // Use server pagination information
        if (result.pagination) {
          setTotalPages(result.pagination.totalPages);
        }
        
        setError(null);
      } else {
        setError(result.error || 'Failed to load attendance data');
        setAttendanceData([]);
      }
    } catch {
      setError('An error occurred while fetching attendance data');
      setAttendanceData([]);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    const filtered = attendanceData.filter(record => 
      searchTerm === '' || 
      record.nurseName.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    setFilteredData(filtered);
    
    if (filtered.length === 0 && searchTerm !== '') {
      setCurrentPage(1);
    }
  }, [attendanceData, searchTerm]);
  
  const handleSearchChange = (newSearchTerm: string) => {
    setSearchTerm(newSearchTerm);
    setCurrentPage(1);
  };
  
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(e.target.value);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setCurrentPage(1);
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const headers = ["Nurse Name", "Date", "Scheduled Start", "Scheduled End", 
                       "Actual Start", "Actual End", "Hours Worked", "Location", "Status"];
      
      const csvContent = [
        headers.join(','),
        ...attendanceData
          .filter(record => 
            searchTerm === '' || 
            record.nurseName.toLowerCase().includes(searchTerm.toLowerCase())
          )
          .map(record => [
            `"${record.nurseName}"`,
            record.date,
            record.scheduledStart || 'N/A',
            record.scheduledEnd || 'N/A',
            record.shiftStart || 'N/A',
            record.shiftEnd || 'N/A',
            record.hoursWorked || 'N/A',
            record.status
          ].join(','))
      ].join('\n');
      
      // Create download link
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `staff-attendance-${selectedDate}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
    } catch (error) {
      console.error('Error exporting data:', error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-5 sm:space-y-7">
      <AttendanceHeader 
        selectedDate={selectedDate}
        handleDateChange={handleDateChange}
        searchTerm={searchTerm}
        setSearchTerm={handleSearchChange}
        onExport={handleExport}
        isExporting={isExporting}
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
              totalCount={filteredData.length}
              pageSize={pageSize}
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