import { useState, useEffect, useCallback } from 'react';
import { fetchComplaints, exportComplaintsToCSV } from '@/app/actions/complaints-actions';
import { Complaint, ComplaintStatus, ComplaintSource } from '@/types/complaint.types';

export const useComplaints = () => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState<string>('');
  const [debouncedSearchInput, setDebouncedSearchInput] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<ComplaintStatus | 'all'>('all');
  const [selectedSource, setSelectedSource] = useState<ComplaintSource | 'all'>('all');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [pageSize] = useState<number>(10);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  
  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchInput(searchInput);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [searchInput]);
  
  const fetchComplaintsData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetchComplaints(
        currentPage,
        pageSize,
        selectedStatus === 'all' ? undefined : selectedStatus,
        selectedSource === 'all' ? undefined : selectedSource,
        debouncedSearchInput
      );
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch complaints');
      }
      
      setComplaints(response.data || []);
      if (response.pagination) {
        setTotalPages(response.pagination.totalPages);
        setTotalCount(response.pagination.totalCount);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, selectedStatus, selectedSource, debouncedSearchInput]);
  
  useEffect(() => {
    fetchComplaintsData();
  }, [fetchComplaintsData]);
  
  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedStatus, selectedSource, debouncedSearchInput]);
  
  const handleStatusChange = (status: ComplaintStatus | 'all') => {
    setSelectedStatus(status);
  };
  
  const handleSourceChange = (source: ComplaintSource | 'all') => {
    setSelectedSource(source);
  };
  
  const handleResetFilters = () => {
    setSelectedStatus('all');
    setSelectedSource('all');
    setSearchInput('');
  };
  
  const handleExport = async () => {
    setIsExporting(true);
    
    try {
      const response = await exportComplaintsToCSV();
      
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to export complaints');
      }
      
      // Create a blob from the CSV data
      const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8' });
      
      // Create a temporary URL for the blob
      const url = window.URL.createObjectURL(blob);
      
      // Create a temporary link element
      const link = document.createElement('a');
      link.href = url;
      
      // Set filename
      const date = new Date().toISOString().split('T')[0];
      link.setAttribute('download', `complaints-export-${date}.csv`);
      
      // Append to the document temporarily
      document.body.appendChild(link);
      
      // Trigger the download
      link.click();
      
      // Clean up
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsExporting(false);
    }
  };
  
  const goToPage = (page: number) => {
    setCurrentPage(page);
  };
  
  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };
  
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };
  
  const refreshComplaints = () => {
    setCurrentPage(1);
    fetchComplaintsData();
  };
  
  return {
    complaints,
    loading,
    error,
    searchInput,
    setSearchInput,
    selectedStatus,
    selectedSource,
    currentPage,
    isExporting,
    totalPages,
    totalCount,
    pageSize,
    itemsLength: complaints.length,
    handleStatusChange,
    handleSourceChange,
    handleResetFilters,
    handleExport,
    goToPage,
    goToPreviousPage,
    goToNextPage,
    refreshComplaints
  };
};