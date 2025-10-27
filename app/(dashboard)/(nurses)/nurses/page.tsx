"use client"
import { useEffect, useState } from "react"
import { NurseDetailsOverlay } from "../../../../components/nurse/nurse-details-overlay"
import { AddNurseOverlay } from "../../../../components/nurse/add-nurse-overlay"
import NurseTable from "@/components/nurse/NurseTable"
import NurseCard from "@/components/nurse/NurseCard"
import { NurseBasicInfo, NurseBasicDetails } from "@/types/staff.types"
import { fetchBasicDetails, exportNurseData } from "@/app/actions/staff-management/add-nurse"
import Loader from "@/components/Loader"
import { generateNurseExcel } from '@/lib/generatexlsx';
import { toast } from 'react-hot-toast';
import { NurseHeader } from "@/components/nurse/NurseHeader"
import { EmptyState } from "@/components/client/clients/EmptyState"

const PaginationControls = ({ 
  currentPage, 
  totalPages, 
  totalCount, 
  itemsPerPage, 
  onPageChange, 
  isMobile = false 
}: {
  currentPage: number
  totalPages: number
  totalCount: number
  itemsPerPage: number
  onPageChange: (page: number) => void
  isMobile?: boolean
}) => {
  const indexOfFirstItem = (currentPage - 1) * itemsPerPage + 1;
  const indexOfLastItem = Math.min(currentPage * itemsPerPage, totalCount);
  
  return (
    <div className={`${isMobile ? "flex flex-col" : "flex items-center justify-between"} px-6 py-4 bg-white border-t border-gray-200`}>
      <div className="text-sm text-gray-700 mb-2">
        Showing {indexOfFirstItem} to {indexOfLastItem} of {totalCount} nurses
      </div>
      <div className="flex gap-2 justify-center">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
        >
          Previous
        </button>
        
        {!isMobile && Array.from({ length: totalPages }, (_, i) => i + 1)
          .filter(pageNum => 
            pageNum === 1 || 
            pageNum === totalPages || 
            (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
          )
          .map((pageNum, index, array) => {
            // Add ellipsis
            if (index > 0 && pageNum - array[index - 1] > 1) {
              return (
                <span key={`ellipsis-${pageNum}`} className="px-3 py-1">...</span>
              );
            }
            return (
              <button
                key={pageNum}
                onClick={() => onPageChange(pageNum)}
                className={`px-3 py-1 text-sm font-medium rounded-md ${
                  currentPage === pageNum
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {pageNum}
              </button>
            );
          })}
          
        {isMobile && (
          <span className="px-3 py-1 text-sm font-medium bg-blue-600 text-white rounded-md">
            {currentPage}
          </span>
        )}
        
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default function NursesPage() {
  const [nurses, setNurses] = useState<NurseBasicDetails[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedStatus, setSelectedStatus] = useState<string>("all")
  const [selectedExperience, setSelectedExperience] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState(searchQuery)
  const [selectedNurse, setSelectedNurse] = useState<NurseBasicInfo | null>(null)
  const [showAddNurse, setShowAddNurse] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [isExporting, setIsExporting] = useState(false)
  const limit = 10

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery)
    }, 400)

    return () => {
      clearTimeout(handler)
    }
  }, [searchQuery])

  useEffect(() => {
    loadNurses()
  }, [currentPage, debouncedSearch])

  const loadNurses = async () => {
    setIsLoading(true)
    const { data, count, error } = await fetchBasicDetails({
      page: currentPage,
      limit
    }, debouncedSearch)

    if (error) {
      setError(error)
      toast.error(error)
    } else if (data) {
      setNurses(data)
      setTotalCount(count || 0)
    }
    
    setIsLoading(false)
  }

  const filteredNurses = nurses.filter(nurse => {
    const matchesStatus = selectedStatus === "all" || nurse.status === selectedStatus
    const matchesExperience = selectedExperience === "all" || 
      (selectedExperience === "less_than_1" && (nurse.experience ?? 0) < 1) ||
      (selectedExperience === "less_than_5" && (nurse.experience ?? 0) < 5) ||
      (selectedExperience === "less_than_10" && (nurse.experience ?? 0) < 10) ||
      (selectedExperience === "greater_than_15" && (nurse.experience ?? 0) >= 10)
    return matchesStatus && matchesExperience
  })
  
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber)
  }

  const totalPages = Math.ceil(totalCount / limit)
  
  const handleReviewDetails = (nurse: NurseBasicInfo) => {
    setSelectedNurse(nurse)
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
  const handleAddNurse = async (nurseData: any) => {
    try {
      setShowAddNurse(false);
      await loadNurses();
    } catch (error) {
      console.error(error);
    }
  };

  const handleExportExcel = async () => {
    try {
      setIsExporting(true);
      const result = await exportNurseData();
      
      if (result.error || !result.data) {
        toast.error(result.error || 'Failed to export data');
        return;
      }
  
      const blob = generateNurseExcel(result.data as any[]);
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `nurse_data_${new Date().toISOString().split('T')[0]}.xlsx`;
      
      document.body.appendChild(link);
      link.click();
      
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('Excel file downloaded successfully!');
    } catch (error) {
      toast.error('Failed to generate Excel file');
      console.error('Export error:', error);
    } finally {
      setIsExporting(false);
    }
  };
  
  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedStatus("all");
    setSelectedExperience("all");
    setCurrentPage(1);
  };

  if (error) {
    return (
      <div className="flex flex-col items-center p-8">
        <div className="text-red-600 mb-4">Error: {error}</div>
        <button 
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          onClick={loadNurses}
        >
          Try Again
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6 relative">
      <NurseHeader 
        onAddNurse={() => setShowAddNurse(true)}
        onExport={handleExportExcel}
        isExporting={isExporting}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedStatus={selectedStatus}
        setSelectedStatus={setSelectedStatus}
        selectedExperience={selectedExperience}
        setSelectedExperience={setSelectedExperience}
        handleResetFilters={handleResetFilters}
      />

      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
        <div className="hidden sm:block overflow-x-auto">
          <NurseTable 
            nurses={filteredNurses} 
            isLoading={isLoading}
          />
          
          {!isLoading && filteredNurses.length > 0 && (
            <PaginationControls 
              currentPage={currentPage}
              totalPages={totalPages}
              totalCount={totalCount}
              itemsPerPage={limit}
              onPageChange={handlePageChange}
            />
          )}

          {!isLoading && filteredNurses.length === 0 && (
            <EmptyState
              title="No nurses found"
              message="Try adjusting your filters or search to find nurses."
              handleResetFilters={handleResetFilters}
            />
          )}
        </div>
        
        <div className="sm:hidden divide-y divide-gray-200">
          {isLoading ? (
            <Loader />
          ) : (
            <>
              {filteredNurses.map((nurse) => (
                <NurseCard 
                  key={nurse.nurse_id} 
                  nurse={nurse} 
                  onReviewDetails={handleReviewDetails} 
                />
              ))}
              
              {filteredNurses.length > 0 && (
                <PaginationControls 
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalCount={totalCount}
                  itemsPerPage={limit}
                  onPageChange={handlePageChange}
                  isMobile={true}
                />
              )}

              {filteredNurses.length === 0 && (
                <EmptyState
                  title="No nurses found"
                  message="Try adjusting your filters or search to find nurses."
                  handleResetFilters={handleResetFilters}
                />
              )}
            </>
          )}
        </div>
      </div>

      <div className="fixed inset-0 z-50" style={{display: showAddNurse || selectedNurse ? 'block' : 'none', pointerEvents: 'none'}}>
        {showAddNurse && (
          <div style={{pointerEvents: 'auto'}}>
            <AddNurseOverlay 
              onClose={() => setShowAddNurse(false)}
              onAdd={handleAddNurse}
            />
          </div>
        )}

        {selectedNurse && (
          <div style={{pointerEvents: 'auto'}}>
            <NurseDetailsOverlay 
              nurse={selectedNurse} 
              onClose={() => setSelectedNurse(null)} 
            />
          </div>
        )}
      </div>
    </div>
  )
}