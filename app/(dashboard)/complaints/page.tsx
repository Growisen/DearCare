"use client"

import React from "react"
import { ComplaintHeader } from "@/components/complaints/ComplaintHeader"
import { ComplaintTable } from "@/components/complaints/ComplaintTable"
import { PaginationControls } from "@/components/client/clients/PaginationControls"
import { ErrorState } from "@/components/client/clients/ErrorState"
import { Complaint } from "@/types/complaint.types"
import { useComplaints } from "@/hooks/useComplaints"
import { LoadingState } from "@/components/Loader"

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
    handlePageSizeChange,
    itemsLength,
    handleStatusChange,
    handleSourceChange,
    handleResetFilters,
    handleExport,
    triggerSearch,
    goToPage,
    goToPreviousPage,
    goToNextPage,
    refreshComplaints
  } = useComplaints();

  const handleSearch = () => {
    triggerSearch();
  };
  
  const handleViewComplaint = (complaint: Complaint) => {
    window.open(`/complaints/${complaint.id}`, "_blank");
  };
  
  if (error) {
    return <ErrorState error={error} onRetry={refreshComplaints} />;
  }
  
  return (
    <div className="space-y-3">
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
      
      <div className="bg-gray-50 rounded-sm border border-slate-200 overflow-hidden">
        {loading ? (
          <LoadingState message="Loading complaints..." description="Please wait while we fetch the complaints data" />
        ) : (
          <>
            <ComplaintTable 
              complaints={complaints}
              onViewComplaint={handleViewComplaint}
            />
            
            {complaints.length > 0 && (
              <PaginationControls
                currentPage={currentPage}
                totalPages={totalPages}
                totalCount={totalCount}
                pageSize={pageSize}
                setPageSize={handlePageSizeChange}
                itemsLength={itemsLength}
                onPageChange={goToPage}
                onPreviousPage={goToPreviousPage}
                onNextPage={goToNextPage}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}