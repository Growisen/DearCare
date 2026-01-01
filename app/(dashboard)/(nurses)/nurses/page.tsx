"use client"
import { useEffect, useState } from "react"
import { NurseDetailsOverlay } from "../../../../components/nurse/nurse-details-overlay"
import { AddNurseOverlay } from "../../../../components/nurse/add-nurse-overlay"
import NurseTable from "@/components/nurse/NurseTable"
import NurseCard from "@/components/nurse/NurseCard"
import { NurseBasicInfo, NurseBasicDetails } from "@/types/staff.types"
import { fetchBasicDetails, exportNurseData } from "@/app/actions/staff-management/add-nurse"
import { LoadingState } from "@/components/Loader"
import { generateNurseExcel } from '@/lib/generatexlsx';
import { toast } from 'react-hot-toast';
import { NurseHeader } from "@/components/nurse/NurseHeader"
import { EmptyState } from "@/components/client/clients/EmptyState"
import { PaginationControls } from "@/components/client/clients/PaginationControls"

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
    setCurrentPage(1);
  }, [selectedStatus, selectedExperience, debouncedSearch]);

  useEffect(() => {
    loadNurses()
  }, [currentPage, debouncedSearch, selectedStatus, selectedExperience])

  const loadNurses = async () => {
    setIsLoading(true)
    const { data, count, error } = await fetchBasicDetails(
      {
        page: currentPage,
        limit,
      },
      selectedStatus,
      selectedExperience,
      debouncedSearch
    )

    if (error) {
      setError(error)
      toast.error(error)
    } else if (data) {
      setNurses(data)
      setTotalCount(count || 0)
    }
    
    setIsLoading(false)
  }

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber)
  }

  const handlePreviousPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1))
  const handleNextPage = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages))

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
  
      const blob = generateNurseExcel(result.data);
      
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
    <div className="space-y-3 relative">
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

      <div className="bg-white rounded-sm shadow-none overflow-hidden border border-slate-200">
        <div className="hidden sm:block overflow-x-auto">
          <NurseTable 
            nurses={nurses} 
            isLoading={isLoading}
          />
          
          {!isLoading && nurses.length > 0 && (
            <PaginationControls 
              currentPage={currentPage}
              totalPages={totalPages}
              totalCount={totalCount}
              pageSize={limit}
              itemsLength={nurses.length}
              onPageChange={handlePageChange}
              onPreviousPage={handlePreviousPage}
              onNextPage={handleNextPage}
            />
          )}

          {!isLoading && nurses.length === 0 && (
            <EmptyState
              title="No nurses found"
              message="Try adjusting your filters or search to find nurses."
              handleResetFilters={handleResetFilters}
            />
          )}
        </div>
        
        <div className="sm:hidden divide-y divide-gray-200">
          {isLoading ? (
            <LoadingState message="Loading Nurses..." />
          ) : (
            <>
              {nurses.map((nurse) => (
                <NurseCard 
                  key={nurse.nurse_id} 
                  nurse={nurse} 
                  onReviewDetails={handleReviewDetails} 
                />
              ))}
              
              {nurses.length > 0 && (
                <PaginationControls 
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalCount={totalCount}
                  pageSize={limit}
                  itemsLength={nurses.length}
                  onPageChange={handlePageChange}
                  onPreviousPage={handlePreviousPage}
                  onNextPage={handleNextPage}
                />
              )}

              {nurses.length === 0 && (
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