"use client"

import React, { useState, useEffect, useCallback } from "react"
import { ComplaintHeader } from "@/components/complaints/ComplaintHeader"
import { ComplaintTable } from "@/components/complaints/ComplaintTable"
import { PaginationControls } from "@/components/client/clients/PaginationControls"
import { ErrorState } from "@/components/client/clients/ErrorState"
import { Complaint, ComplaintStatus, ComplaintSource } from "@/types/complaint.types"

const mockComplaints: Complaint[] = [
  {
    id: "1",
    title: "Poor Communication from Nurse",
    description: "The assigned nurse rarely responds to messages and is often late.",
    status: "open",
    submitterName: "John Smith",
    submissionDate: "2025-04-28",
    source: "client",
    lastUpdated: "2025-05-01"
  },
  {
    id: "2",
    title: "Billing Discrepancy",
    description: "I was charged for services that weren't provided during last week's visit.",
    status: "under_review",
    submitterName: "Emma Johnson",
    submissionDate: "2025-05-02",
    source: "client",
    lastUpdated: "2025-05-03"
  },
  {
    id: "3",
    title: "Unsafe Working Environment",
    description: "The client's home has several safety hazards that make providing care difficult.",
    status: "resolved",
    submitterName: "David Chen",
    submissionDate: "2025-04-15",
    source: "nurse",
    lastUpdated: "2025-04-20"
  },
  {
    id: "4",
    title: "Missed Appointments",
    description: "The client has missed three consecutive appointments without notice.",
    status: "open",
    submitterName: "Patricia Lopez",
    submissionDate: "2025-05-05",
    source: "nurse",
    lastUpdated: "2025-05-05"
  },
  {
    id: "5",
    title: "Medication Administration Error",
    description: "The wrong dosage was administered during yesterday's visit.",
    status: "open",
    submitterName: "Robert Williams",
    submissionDate: "2025-05-10",
    source: "client",
    lastUpdated: "2025-05-10"
  }
];

export default function ComplaintsPage() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [filteredComplaints, setFilteredComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<ComplaintStatus | "all">("all");
  const [selectedSource, setSelectedSource] = useState<ComplaintSource | "all">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [isExporting, setIsExporting] = useState(false);
  
  const pageSize = 10;
  
  const fetchComplaints = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // In a real app, you would fetch from an API
      // For now, we'll simulate an API call with our mock data
      await new Promise(resolve => setTimeout(resolve, 1000));
      setComplaints(mockComplaints);
    } catch {
      setError("Failed to load complaints. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, []);
  
  useEffect(() => {
    fetchComplaints();
  }, [fetchComplaints]);
  
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
  
  const totalPages = Math.max(1, Math.ceil(filteredComplaints.length / pageSize));
  
  const paginatedComplaints = filteredComplaints.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );
  
  const handleStatusChange = (status: ComplaintStatus | "all") => {
    setSelectedStatus(status);
  };
  
  const handleSourceChange = (source: ComplaintSource | "all") => {
    setSelectedSource(source);
  };
  
  const handleSearch = () => {
    // Search functionality is already handled by the useEffect
  };
  
  const handleResetFilters = () => {
    setSearchInput("");
    setSelectedStatus("all");
    setSelectedSource("all");
  };
  
  const handleExport = async () => {
    setIsExporting(true);
    // Simulate export process
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsExporting(false);
    alert("Complaints exported successfully!");
  };
  
  const handleViewComplaint = (complaint: Complaint) => {
    window.open(`/complaints/${complaint.id}`, "_blank");
  };
  
  const goToPage = (page: number) => {
    setCurrentPage(page);
  };
  
  const goToPreviousPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };
  
  const goToNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };
  
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-48 bg-gray-50 rounded-xl border border-gray-200 animate-pulse"></div>
        <div className="h-96 bg-gray-50 rounded-xl border border-gray-200 animate-pulse"></div>
      </div>
    );
  }
  
  if (error) {
    return <ErrorState error={error} onRetry={fetchComplaints} />;
  }
  
  return (
    <div className="space-y-5">
      <ComplaintHeader 
        onExport={handleExport}
        isExporting={isExporting}
        searchInput={searchInput}
        setSearchInput={setSearchInput}
        selectedStatus={selectedStatus}
        selectedSource={selectedSource}
        handleStatusChange={handleStatusChange}
        handleSourceChange={handleSourceChange}
        handleSearch={handleSearch}
        handleResetFilters={handleResetFilters}
      />
      
      <div className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
        <ComplaintTable 
          complaints={paginatedComplaints}
          onViewComplaint={handleViewComplaint}
        />
        
        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          totalCount={filteredComplaints.length}
          pageSize={pageSize}
          itemsLength={paginatedComplaints.length}
          onPageChange={goToPage}
          onPreviousPage={goToPreviousPage}
          onNextPage={goToNextPage}
        />
      </div>
    </div>
  );
}