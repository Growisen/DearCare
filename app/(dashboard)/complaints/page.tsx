"use client"

import React from "react"
import { ComplaintHeader } from "@/components/complaints/ComplaintHeader"
import { ComplaintTable } from "@/components/complaints/ComplaintTable"
import { PaginationControls } from "@/components/client/clients/PaginationControls"
import { ErrorState } from "@/components/client/clients/ErrorState"
import { Complaint } from "@/types/complaint.types"
import { useComplaints } from "@/hooks/useComplaints"

export default function ComplaintsPage() {
  const { 
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
    itemsLength,
    handleStatusChange,
    handleSourceChange,
    handleResetFilters,
    handleExport,
    goToPage,
    goToPreviousPage,
    goToNextPage,
    refreshComplaints
  } = useComplaints();

  const handleSearch = () => {
    // Search functionality is already handled by the hook
  };
  
  
  const handleViewComplaint = (complaint: Complaint) => {
    window.open(`/complaints/${complaint.id}`, "_blank");
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
    return <ErrorState error={error} onRetry={refreshComplaints} />;
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
          complaints={complaints}
          onViewComplaint={handleViewComplaint}
        />
        
        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          totalCount={totalCount}
          pageSize={pageSize}
          itemsLength={itemsLength}
          onPageChange={goToPage}
          onPreviousPage={goToPreviousPage}
          onNextPage={goToNextPage}
        />
      </div>
    </div>
  );
}