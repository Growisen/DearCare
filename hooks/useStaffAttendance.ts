import { useState, useEffect } from 'react';
import { fetchStaffAttendance, AttendanceRecord } from '@/app/actions/attendance/attendance-actions';

export const useStaffAttendance = () => {
  const [attendanceData, setAttendanceData] = useState<AttendanceRecord[]>([]);
  const [filteredData, setFilteredData] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState("");
  
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    loadAttendanceData();
  }, [selectedDate, currentPage, pageSize, selectedCategory]);
  
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

  const loadAttendanceData = async () => {
    setLoading(true);
    try {
      const date = new Date(selectedDate);
      const formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      const result = await fetchStaffAttendance(
        formattedDate, 
        currentPage, 
        pageSize,
        true,
        selectedCategory
      );
  
      if (result.success) {
        setAttendanceData(result.data);
        
        if (result.pagination) {
          setTotalPages(result.pagination.totalPages);
          setTotalCount(result.pagination.totalRecords); 
        }
        
        setError(null);
      } else {
        setError(result.error || 'Failed to load attendance data');
        setAttendanceData([]);
        setTotalCount(0);
      }
    } catch {
      setError('An error occurred while fetching attendance data');
      setAttendanceData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };
  
  const handleSearchChange = (newSearchTerm: string) => {
    setSearchTerm(newSearchTerm);
    setCurrentPage(1);
  };
  
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(e.target.value);
    setCurrentPage(1);
  };

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
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
      const date = new Date(selectedDate);
      const formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

      const batchSize = 500;
      let allRecords: AttendanceRecord[] = [];
      let exportPage = 1;
      let hasMore = true;
      
      while (hasMore) {
        const batchResult = await fetchStaffAttendance(
          formattedDate,
          exportPage,
          batchSize,
          true,
          selectedCategory
        );
        
        if (!batchResult.success) {
          throw new Error(batchResult.error || 'Failed to export data');
        }
        
        allRecords = [...allRecords, ...batchResult.data];
        
        if (!batchResult.pagination || 
            exportPage >= batchResult.pagination.totalPages || 
            batchResult.data.length < batchSize) {
          hasMore = false;
        } else {
          exportPage++;
        }
      }
      
      const filteredRecords = searchTerm ? 
        allRecords.filter(record => record.nurseName.toLowerCase().includes(searchTerm.toLowerCase())) : 
        allRecords;
      
      const headers = ["Nurse Name", "Date", "Scheduled Start", "Scheduled End", 
                       "Actual Start", "Actual End", "Hours Worked", "Location", "Status"];
      
      const csvRows = [headers.join(',')];
      
      const chunkSize = 100;
      for (let i = 0; i < filteredRecords.length; i += chunkSize) {
        const chunk = filteredRecords.slice(i, i + chunkSize);
        
        chunk.forEach(record => {
          let locationValue = 'N/A';
          if (record.location) {
            const [lat, lng] = record.location.split(',').map(coord => parseFloat(coord.trim()));
            if (!isNaN(lat) && !isNaN(lng)) {
              locationValue = `https://www.google.com/maps?q=${lat},${lng}`;
            } else {
              locationValue = record.location;
            }
          }
          
          csvRows.push([
            `"${record.nurseName}"`,
            `"${record.date}"`,
            `"${record.scheduledStart || 'N/A'}"`,
            `"${record.scheduledEnd || 'N/A'}"`,
            `"${record.shiftStart || 'N/A'}"`,
            `"${record.shiftEnd || 'N/A'}"`,
            `"${record.hoursWorked || 'N/A'}"`,
            `"${locationValue}"`,
            `"${record.status}"`
          ].join(','));
        });
      }
      
      const csvContent = csvRows.join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `staff-attendance-${selectedDate}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Error exporting data:', error);
    } finally {
      setIsExporting(false);
    }
  };

  return {
    attendanceData,
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
    handleCategoryChange,
    handleSearchChange,
    handleDateChange,
    handlePageSizeChange,
    handlePageChange,
    handlePreviousPage,
    handleNextPage,
    handleResetFilters,
    handleExport,
  };
};
