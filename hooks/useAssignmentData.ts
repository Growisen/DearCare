"use client"

import { useState, useEffect } from 'react'
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { getAllNurseAssignments, NurseAssignmentData } from '@/app/actions/scheduling/shift-schedule-actions';
import useOrgStore from '@/app/stores/UseOrgStore';

function convertToCSV(assignments: NurseAssignmentData[]): string {
  const headers = [
    'ID',
    'Nurse ID',
    'Nurse Name',
    'Client ID',
    'Client Name',
    'Client Type',
    'Start Date',
    'End Date',
    'Shift Start',
    'Shift End',
    'Status',
    'Assignment Type'
  ];
  
  const csvRows = [];
  
  csvRows.push(headers.join(','));
  
  for (const assignment of assignments) {
    const nurseName = assignment.nurses 
      ? `${assignment.nurses.first_name || ''} ${assignment.nurses.last_name || ''}`.trim() 
      : '';
      
    const values = [
      assignment.id,
      assignment.nurse_id,
      nurseName,
      assignment.client_id,
      assignment.client_name || '',
      assignment.client_type || '',
      assignment.start_date,
      assignment.end_date,
      assignment.shift_start_time,
      assignment.shift_end_time,
      assignment.status,
      assignment.assigned_type
    ];
    
    const escapedValues = values.map(val => {
      if (val === null || val === undefined) return '';
      const strVal = String(val);
      return strVal.includes(',') ? `"${strVal}"` : strVal;
    });
    
    csvRows.push(escapedValues.join(','));
  }
  
  return csvRows.join('\n');
}

function downloadCSV(csvContent: string, fileName: string): void {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  
  link.setAttribute('href', url);
  link.setAttribute('download', fileName);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function useAssignmentData() {
  const queryClient = useQueryClient();
  const { organization } = useOrgStore();
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'completed' | 'upcoming' | 'ending_today' | 'starting_today'>('all')
  const [searchInput, setSearchInput] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [dateFilter, setDateFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [isExporting, setIsExporting] = useState(false)

  // Map organization from store to category filter
  const getCategoryFilter = (): string => {
    if (!organization) return "all";
    if (organization === "TataHomeNursing") return "Tata HomeNursing";
    if (organization === "DearCare") return "DearCare LLP";
    return "all";
  };

  const categoryFilter = getCategoryFilter();

  const [isFiltersLoaded, setIsFiltersLoaded] = useState(false);

  useEffect(() => {
    const savedStatus = localStorage.getItem('assignmentsPageStatus');
    if (savedStatus && ['all', 'active', 'completed', 'upcoming', 'ending_today', 'starting_today'].includes(savedStatus)) {
      setFilterStatus(savedStatus as typeof filterStatus);
    }
    setIsFiltersLoaded(true);
  }, []);

  useEffect(() => {
    localStorage.setItem('assignmentsPageStatus', filterStatus);
  }, [filterStatus]);

  const { 
    data, 
    isLoading: loading, 
    error: queryError,
    refetch 
  } = useQuery({
    queryKey: ['assignments', filterStatus, searchQuery, dateFilter, currentPage, pageSize, categoryFilter],
    queryFn: () => getAllNurseAssignments(currentPage, pageSize, filterStatus, searchQuery, dateFilter, categoryFilter),
    enabled: isFiltersLoaded,
    staleTime: 1000 * 60 * 2,
    refetchOnWindowFocus: true,
    refetchInterval: 1000 * 60 * 10,
  });

  const assignments = data?.success ? (data?.data || []) : [];
  const totalPages = data?.count !== undefined ? Math.max(1, Math.ceil(data.count / pageSize)) : 1;
  const totalCount = data?.count || 0;
  
  const error = queryError 
    ? 'Unexpected error occurred while fetching assignments' 
    : (data?.noResults 
        ? `No matches found for "${searchQuery}". Please try a different search term.` 
        : (data?.success ? null : (data?.error || 'Failed to load assignments')));

  const invalidateAssignmentsCache = () => {
    queryClient.invalidateQueries({ queryKey: ['assignments'] });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setSearchQuery(searchInput)
    setCurrentPage(1)
  }

  const handleStatusChange = (status: 'all' | 'active' | 'completed' | 'upcoming' | 'ending_today' | 'starting_today') => {
    setFilterStatus(status)
    setCurrentPage(1)
  }

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize)
    setCurrentPage(1)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handlePreviousPage = () => {
    setCurrentPage(prev => Math.max(1, prev - 1))
  }

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(totalPages, prev + 1))
  }

  const handleDateFilterChange = (date: string) => {
    setDateFilter(date)
    setCurrentPage(1)
  }

  const handleResetFilters = () => {
    setSearchInput('')
    setSearchQuery('')
    setFilterStatus('all')
    setDateFilter('')
    setCurrentPage(1)
  }

  const refreshData = () => refetch();

  const handleExport = async () => {
    setIsExporting(true)
    try {
      const response = await getAllNurseAssignments(
        1,
        10000,
        filterStatus,
        searchQuery,
        dateFilter,
        categoryFilter,
      );
      
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to export assignments data');
      }
      
      const csvContent = convertToCSV(response.data);
      
      const date = new Date().toISOString().split('T')[0];
      const fileName = `nurse_assignments_${date}.csv`;
      
      downloadCSV(csvContent, fileName);
    } catch (error) {
      console.error('Export failed:', error)
    } finally {
      setIsExporting(false)
    }
  }

  if (!isFiltersLoaded) {
    return {
      assignments: [],
      loading: true,
      error: null,
      filterStatus,
      searchInput,
      setSearchInput,
      categoryFilter,
      searchQuery,
      dateFilter,
      currentPage,
      totalPages: 1,
      totalCount: 0,
      pageSize,
      isExporting,
      handleSearch: () => {},
      handleStatusChange: () => {},
      handleDateFilterChange: () => {},
      handlePageChange: () => {},
      handlePreviousPage: () => {},
      handleNextPage: () => {},
      handleResetFilters: () => {},
      refreshData: () => {},
      handleExport: () => {},
      invalidateAssignmentsCache: () => {},
    };
  }

  return {
    assignments,
    loading,
    error,
    filterStatus,
    searchInput,
    setSearchInput,
    categoryFilter,
    searchQuery,
    dateFilter,
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
    invalidateAssignmentsCache
  }
}