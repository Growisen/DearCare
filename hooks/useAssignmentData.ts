"use client"

import { useState } from 'react'
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { getAllNurseAssignments, NurseAssignmentData } from '../app/actions/shift-schedule-actions'

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
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'completed' | 'upcoming'>('all')
  const [searchInput, setSearchInput] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10
  const [isExporting, setIsExporting] = useState(false)

  const { 
    data, 
    isLoading: loading, 
    error: queryError,
    refetch 
  } = useQuery({
    queryKey: ['assignments', filterStatus, searchQuery, currentPage, pageSize],
    queryFn: () => getAllNurseAssignments(currentPage, pageSize, filterStatus, searchQuery),
    staleTime: 1000 * 60 * 2, // 2 minutes
    refetchOnWindowFocus: true,
    refetchInterval: 1000 * 60 * 10, // 10 minutes
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

  const handleStatusChange = (status: 'all' | 'active' | 'completed' | 'upcoming') => {
    setFilterStatus(status)
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

  const handleResetFilters = () => {
    setSearchInput('')
    setSearchQuery('')
    setFilterStatus('all')
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
        searchQuery
      );
      
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to export assignments data');
      }
      
      const csvContent = convertToCSV(response.data);
      
      const date = new Date().toISOString().split('T')[0];
      const fileName = `nurse_assignments_${date}.csv`;
      
      downloadCSV(csvContent, fileName);
      
      console.log(`Exported ${response.data.length} assignments successfully`);
    } catch (error) {
      console.error('Export failed:', error)
    } finally {
      setIsExporting(false)
    }
  }

  return {
    assignments,
    loading,
    error,
    filterStatus,
    searchInput,
    setSearchInput,
    searchQuery,
    currentPage,
    totalPages,
    totalCount,
    pageSize,
    isExporting,
    handleSearch,
    handleStatusChange,
    handlePageChange,
    handlePreviousPage,
    handleNextPage,
    handleResetFilters,
    refreshData,
    handleExport,
    invalidateAssignmentsCache
  }
}