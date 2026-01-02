"use client"
import { useState } from "react"
import { useStaffData } from "@/hooks/useStaffData"
import { useExportStaff } from "@/hooks/useExportStaff"
import { Staff } from "@/types/dearCareStaff.types"

import { StaffHeader } from "@/components/staff/dearCareStaff/StaffHeader"
import { StaffTable } from "@/components/staff/dearCareStaff/StaffTable"
import { StaffDetailsOverlay } from "@/components/staff/dearCareStaff/staff-details-overlay"
import { AddStaffOverlay } from "@/components/staff/dearCareStaff/add-staff-overlay"
import { LoadingState } from "@/components/Loader"
import { ErrorState } from "@/components/staff/dearCareStaff/ErrorState"
import { EmptyState } from "@/components/staff/dearCareStaff/EmptyState"
import { PaginationControls } from "@/components/client/clients/PaginationControls"

export default function StaffPage() {
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null)
  const [showAddStaff, setShowAddStaff] = useState(false)
  
  const { 
    staff,
    isLoading,
    error,
    searchInput,
    setSearchInput,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    handleSearch,
    currentPage,
    totalPages,
    totalCount,
    pageSize,
    handlePageSizeChange,
    handlePageChange,
    handlePreviousPage,
    handleNextPage,
    refreshData
  } = useStaffData()

  const { isExporting, handleExport } = useExportStaff(selectedCategory, searchQuery)

  const handleStaffAdded = () => {
    setShowAddStaff(false)
    refreshData()
  }

  const handleStaffUpdate = () => {
    refreshData()
  }

  const handleResetFilters = () => {
    try {
      setSearchInput("");
      
      setSearchQuery(""); 
      
      refreshData();
    } catch (error) {
      console.error("Error in handleResetFilters:", error);
    }
  }

  return (
    <div>
      <div className="space-y-3">
        <StaffHeader 
          onAddStaff={() => setShowAddStaff(true)}
          onExport={handleExport}
          isExporting={isExporting}
          selectedCategory={selectedCategory}
          searchInput={searchInput}
          setSearchInput={setSearchInput}
          handleSearch={handleSearch}
          handleResetFilters={handleResetFilters}
        />

        <div className="bg-white rounded-sm shadow-none overflow-hidden border border-slate-200">
          {isLoading ? (
            <LoadingState message="Loading staff members..." />
          ) : error ? (
            <ErrorState 
              error={error} 
              onRetry={refreshData} 
            />
          ) : staff.length === 0 ? (
            <EmptyState 
              title="No staff found"
              message="Try changing your filters or search criteria" 
              handleResetFilters={handleResetFilters}
            />
          ) : (
            <>
              <StaffTable 
                staff={staff} 
                onReviewDetails={setSelectedStaff} 
              />
              
              <PaginationControls
                currentPage={currentPage}
                totalPages={totalPages}
                totalCount={totalCount}
                pageSize={pageSize}
                setPageSize={handlePageSizeChange}
                itemsLength={staff.length}
                onPageChange={handlePageChange}
                onPreviousPage={handlePreviousPage}
                onNextPage={handleNextPage}
              />
            </>
          )}
        </div>
      </div>

      {showAddStaff && (
        <AddStaffOverlay 
          onClose={() => setShowAddStaff(false)}
          onAdd={handleStaffAdded}
        />
      )}

      {selectedStaff && (
        <StaffDetailsOverlay 
          staff={selectedStaff} 
          onClose={() => setSelectedStaff(null)}
          onUpdate={handleStaffUpdate}
        />
      )}
    </div>
  )
}