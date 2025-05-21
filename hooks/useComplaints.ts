"use client"

import { useState, useEffect, useCallback } from 'react'
import { fetchComplaints, exportComplaintsToCSV } from '@/app/actions/complaints-actions'
import { Complaint, ComplaintStatus, ComplaintSource } from '@/types/complaint.types'

export function useComplaints(pageSize: number = 10) {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [filteredComplaints, setFilteredComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<ComplaintStatus | "all">("all");
  const [selectedSource, setSelectedSource] = useState<ComplaintSource | "all">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [isExporting, setIsExporting] = useState(false);
  
  // Fetch complaints from the database
  const loadComplaints = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await fetchComplaints();

      console.log("Fetched complaints:", result.data);
      
      if (!result.success || !result.data) {
        throw new Error(result.error || "Failed to fetch complaints");
      }
      
      setComplaints(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load complaints. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Initial data fetch
  useEffect(() => {
    loadComplaints();
  }, [loadComplaints]);
  
  // Apply filters whenever filter state changes
  useEffect(() => {
    let result = [...complaints];
    
    // Filter by status
    if (selectedStatus !== "all") {
      result = result.filter(complaint => complaint.status === selectedStatus);
    }
    
    // Filter by source (client/nurse)
    if (selectedSource !== "all") {
      result = result.filter(complaint => complaint.source === selectedSource);
    }
    
    // Filter by search input
    if (searchInput) {
      const searchTerm = searchInput.toLowerCase();
      result = result.filter(
        complaint =>
          complaint.title.toLowerCase().includes(searchTerm) ||
          complaint.submitterName?.toLowerCase().includes(searchTerm) ||
          complaint.description.toLowerCase().includes(searchTerm)
      );
    }
    
    setFilteredComplaints(result);
    setCurrentPage(1); // Reset to first page when filters change
  }, [complaints, selectedStatus, selectedSource, searchInput]);
  
  // Calculate pagination values
  const totalPages = Math.max(1, Math.ceil(filteredComplaints.length / pageSize));
  
  const paginatedComplaints = filteredComplaints.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );
  
  // Status filter handler
  const handleStatusChange = (status: ComplaintStatus | "all") => {
    setSelectedStatus(status);
  };
  
  // Source filter handler
  const handleSourceChange = (source: ComplaintSource | "all") => {
    setSelectedSource(source);
  };
  
  // Reset filters
  const handleResetFilters = () => {
    setSearchInput("");
    setSelectedStatus("all");
    setSelectedSource("all");
  };
  
  // Export complaints
  const handleExport = async () => {
    setIsExporting(true);
    
    try {
      const result = await exportComplaintsToCSV();
      
      if (!result.success || !result.data) {
        throw new Error(result.error || "Failed to export complaints");
      }
      
      // Create and download the CSV file
      const blob = new Blob([result.data], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `complaints_export_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
    } catch (err) {
      console.error("Export failed:", err);
      alert("Failed to export complaints. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };
  
  // Pagination handlers
  const goToPage = (page: number) => {
    setCurrentPage(page);
  };
  
  const goToPreviousPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };
  
  const goToNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };
  
  return {
    complaints: paginatedComplaints,
    loading,
    error,
    searchInput,
    setSearchInput,
    selectedStatus,
    selectedSource,
    currentPage,
    isExporting,
    totalPages,
    totalCount: filteredComplaints.length,
    pageSize,
    itemsLength: paginatedComplaints.length,
    handleStatusChange,
    handleSourceChange,
    handleResetFilters,
    handleExport,
    goToPage,
    goToPreviousPage,
    goToNextPage,
    refreshComplaints: loadComplaints
  };
}