import { useState, useEffect } from 'react';
import { fetchStaffAttendance, AttendanceRecord } from '@/app/actions/attendance/attendance-actions';
import useOrgStore from '@/app/stores/UseOrgStore';

export const useStaffAttendance = () => {
  const { organization } = useOrgStore();
  
  const [attendanceData, setAttendanceData] = useState<AttendanceRecord[]>([]);
  const [filteredData, setFilteredData] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchTerm, setSearchTerm] = useState('');
  const [attendanceStatus, setAttendanceStatus] = useState<'present' | 'absent' | 'all'>('all');   

  const getCategoryFilter = (): string => {
    if (!organization) return "";
    if (organization === "TataHomeNursing") return "Tata_Homenursing";
    if (organization === "DearCare") return "Dearcare_Llp";
    return "";
  };
  const selectedCategory = getCategoryFilter();
  
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [isExporting, setIsExporting] = useState(false);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  useEffect(() => {
    loadAttendanceData();
  }, [selectedDate, currentPage, pageSize, selectedCategory, debouncedSearchTerm, attendanceStatus]);

  const loadAttendanceData = async () => {
    setLoading(true);
    
    try {
      const date = new Date(selectedDate);
      const formattedDate = date.toLocaleDateString('en-CA');

      const result = await fetchStaffAttendance(
        formattedDate,
        currentPage,
        pageSize,
        attendanceStatus,
        debouncedSearchTerm
      );
      
      if (result.success) {
        setAttendanceData(result.data);
        setFilteredData(result.data);
        
        if (result.pagination) {
          setTotalPages(result.pagination.totalPages);
          setTotalCount(result.pagination.totalRecords); 
        }
        setError(null);
      } else {
        throw new Error(result.error);
      }
    } catch{
      setError('Failed to load attendance data');
      setAttendanceData([]);
      setFilteredData([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (newSearchTerm: string) => {
    setSearchTerm(newSearchTerm);
    setCurrentPage(1);
    setAttendanceData([]);
    setFilteredData([]);
    setLoading(true);
  };
  
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAttendanceData([]);
    setFilteredData([]);
    setLoading(true); 
    
    setSelectedDate(e.target.value);
    setCurrentPage(1);
  };

  const handleStatusChange = (status: 'present' | 'absent' | 'all') => {
    setAttendanceData([]); 
    setFilteredData([]);
    setLoading(true);

    setCurrentPage(1);
    setAttendanceStatus(status);
  };

  const handleSearch = () => {
    setAttendanceData([]); 
    setFilteredData([]);
    setCurrentPage(1);
    setSearchTerm(debouncedSearchTerm);
  }

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setCurrentPage(1);
    setAttendanceData([]);
    setFilteredData([]);
    setLoading(true);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handleResetFilters = () => {
    setAttendanceData([]); 
    setLoading(true);
    setSearchTerm('');
    setAttendanceStatus('all');
    setCurrentPage(1);
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const date = new Date(selectedDate);
      const formattedDate = date.toLocaleDateString('en-CA');

      const batchSize = 500;
      let allRecords: AttendanceRecord[] = [];
      let exportPage = 1;
      let hasMore = true;
      
      while (hasMore) {
        const batchResult = await fetchStaffAttendance(
          formattedDate,
          exportPage,
          batchSize,
          attendanceStatus,
          searchTerm
        );
        
        if (!batchResult.success) throw new Error(batchResult.error);
        
        allRecords = [...allRecords, ...batchResult.data];
        
        if (!batchResult.pagination || 
            exportPage >= batchResult.pagination.totalPages || 
            batchResult.data.length < batchSize) {
          hasMore = false;
        } else {
          exportPage++;
        }
      }

      let finalRecords = allRecords;
      if (attendanceStatus !== 'all') {
         finalRecords = allRecords.filter(r => 
            attendanceStatus === 'present' ? r.status === 'present' : r.status !== 'present'
         );
      }

      const headers = ["Nurse Name", "Date", "Scheduled Start", "Scheduled End", 
                       "Actual Start", "Actual End", "Hours Worked", "Location", "Status"];
      
      const csvRows = [headers.join(',')];
      
      finalRecords.forEach(record => {
         let locationValue = 'N/A';
         if (record.location) {
            locationValue = record.location.replace(/,/g, ';'); 
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
      
      const csvContent = csvRows.join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `staff-attendance-${selectedDate}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
    } catch (error) {
      console.error(error);
      alert('Failed to export data');
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
    attendanceStatus,

    loadAttendanceData,
    handleSearchChange,
    handleDateChange,
    handlePageSizeChange,
    handlePageChange,
    handlePreviousPage,
    handleNextPage,
    handleResetFilters,
    handleExport,
    setAttendanceStatus: handleStatusChange, 
    handleSearch,
  };
};