import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchComplaints, exportComplaintsToCSV } from '@/app/actions/complaints-actions';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Complaint, ComplaintStatus, ComplaintSource } from '@/types/complaint.types';

export const useComplaints = () => {
  const queryClient = useQueryClient();
  const [searchInput, setSearchInput] = useState<string>('');
  const [activeSearchTerm, setActiveSearchTerm] = useState<string>(''); // This replaces debouncedSearchInput
  const [selectedStatus, setSelectedStatus] = useState<ComplaintStatus | 'all'>('all');
  const [selectedSource, setSelectedSource] = useState<ComplaintSource | 'all'>('all');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize] = useState<number>(10);
  

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedStatus, selectedSource, activeSearchTerm]);
  
  // React Query for fetching complaints with caching
  const { 
    data: queryResult, 
    isLoading: loading, 
    error: queryError, 
    refetch 
  } = useQuery({
    queryKey: [
      'complaints', 
      currentPage, 
      pageSize, 
      selectedStatus, 
      selectedSource, 
      activeSearchTerm 
    ],
    queryFn: () => fetchComplaints(
      currentPage,
      pageSize,
      selectedStatus === 'all' ? undefined : selectedStatus,
      selectedSource === 'all' ? undefined : selectedSource,
      activeSearchTerm 
    ),
    staleTime: 1000 * 60 * 2, // 2 minutes
    refetchOnWindowFocus: true,
    refetchInterval: 1000 * 60 * 10, // 10 minutes
  });
  
  // Process query results
  const complaints = queryResult?.success ? queryResult.data || [] : [];
  const totalPages = queryResult?.pagination?.totalPages || 1;
  const totalCount = queryResult?.pagination?.totalCount || 0;
  const error = queryError 
    ? (queryError instanceof Error ? queryError.message : 'An unknown error occurred') 
    : queryResult?.success === false ? queryResult.error : null;
  
  // Export mutation
  const { mutate: exportMutation, isPending: isExporting } = useMutation({
    mutationFn: exportComplaintsToCSV,
    onSuccess: (response) => {
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
    }
  });

  const triggerSearch = () => {
    setActiveSearchTerm(searchInput);
  };
  
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
    setActiveSearchTerm(''); // Also clear the active search term
  };
  
  const handleExport = () => {
    exportMutation();
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
    refetch();
  };

  const invalidateComplaintsCache = () => {
    queryClient.invalidateQueries({ queryKey: ['complaints'] });
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
    triggerSearch,
    goToPage,
    goToPreviousPage,
    goToNextPage,
    refreshComplaints,
    invalidateComplaintsCache
  };
};