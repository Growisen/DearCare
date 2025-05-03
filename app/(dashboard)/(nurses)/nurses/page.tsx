"use client"
import { useEffect, useState } from "react"
import { Search } from "lucide-react"
import { Input } from "../../../../components/ui/input"
import { NurseDetailsOverlay } from "../../../../components/nurse/nurse-details-overlay"
import { AddNurseOverlay } from "../../../../components/nurse/add-nurse-overlay"
import NurseTable from "../../../../components/nurse/NurseTable"
import NurseCard from "../../../../components/nurse/NurseCard"
import {  NurseBasicInfo,NurseBasicDetails } from "@/types/staff.types"
import { fetchBasicDetails } from "@/app/actions/add-nurse"
import Loader from "@/components/loader"
import { exportNurseData } from '@/app/actions/add-nurse';
import { generateNurseExcel } from '@/lib/generatexlsx';
import { toast } from 'react-hot-toast';


// Pagination Controls Component
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

const filterOptions = [
  {
    value: "selectedStatus",
    setValue: "setSelectedStatus",
    options: [
      { value: "all", label: "All Status" },
      { value: "assigned", label: "Assigned" },
      { value: "leave", label: "Leave" },
      { value: "unassigned", label: "Unassigned" }
    ]
  },
  {
    value: "selectedExperience",
    setValue: "setSelectedExperience",
    options: [
      { value: "all", label: "All Experience" },
      { value: "less_than_1", label: "< 1 year" },
      { value: "less_than_5", label: "< 5 years" },
      { value: "less_than_10", label: "< 10 years" },
      { value: "greater_than_15", label: ">= 10 years" }
    ]
  }
]

const FilterSelect = ({ value, onChange, options, className }: { value: string, onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void, options: { value: string, label: string }[], className?: string }) => (
  <select
    value={value}
    onChange={onChange}
    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap bg-gray-100 text-gray-600 hover:bg-gray-200 ${className}`}
  >
    {options.map(option => (
      <option key={option.value} value={option.value}>{option.label}</option>
    ))}
  </select>
)


const handleExportExcel = async () => {
  try {
    const result = await exportNurseData();
    
    if (result.error || !result.data) {
      toast.error(result.error || 'Failed to export data');
      return;
    }

    // Generate Excel file
    const blob = generateNurseExcel(result.data);
    
    // Create download link
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `nurse_data_${new Date().toISOString().split('T')[0]}.xlsx`;
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    
    // Cleanup
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    toast.success('Excel file downloaded successfully!');
  } catch (error) {
    toast.error('Failed to generate Excel file');
    console.error('Export error:', error);
  }
};

export default function NursesPage() {
  const [nurses, setNurses] = useState<NurseBasicDetails[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedStatus, setSelectedStatus] = useState<string>("all")
  const [selectedExperience, setSelectedExperience] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedNurse, setSelectedNurse] = useState<NurseBasicInfo | null>(null)
  const [showAddNurse, setShowAddNurse] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const limit = 10

  

 
  const loadNurses = async () => {
      setIsLoading(true)
      const { data, count, error } = await fetchBasicDetails({
        page: currentPage,
        limit
      })
      setSelectedStatus('all')
      setSelectedExperience('all')

      if (error) {
        setError(error)
      } else if (data) {
        setNurses(data)
        setTotalCount(count || 0)
      }
      
      setIsLoading(false)
    }

  useEffect(() => {
    
    loadNurses()
  }, [currentPage]) // Add currentPage to dependency array
  
  // Add a function to handle page changes
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber)
  }

  // Calculate total pages based on the totalCount and limit
  const totalPages = Math.ceil(totalCount / limit)

  const filteredNurses = nurses.filter(nurse => {
    const matchesStatus = selectedStatus === "all" || nurse.status === selectedStatus
    const matchesExperience = selectedExperience === "all" || 
      (selectedExperience === "less_than_1" && (nurse.experience ?? 0) < 1) ||
      (selectedExperience === "less_than_5" && (nurse.experience ?? 0) < 5) ||
      (selectedExperience === "less_than_10" && (nurse.experience ?? 0) < 10) ||
      (selectedExperience === "greater_than_15" && (nurse.experience ?? 0) >= 10)
    const matchesSearch = 
      nurse.name.first.toLowerCase().includes(searchQuery.toLowerCase()) ||
      nurse.name.last.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (nurse.contact.email?.toLowerCase() || '').includes(searchQuery.toLowerCase())
    
    return matchesStatus && matchesExperience && matchesSearch
  })
  

  const handleReviewDetails = (nurse: NurseBasicInfo) => {
    setSelectedNurse(nurse)
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
  const handleAddNurse = async (nurseData: any) => {
    try {
      // Handle adding new nurse here
      setShowAddNurse(false);
      // Refetch nurses after successful addition
      await loadNurses();
    } catch (error) {
      console.error(error);
      // Handle error case
    }
  };

  return (
    <div>
      <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
  <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Nurse Management</h1>
  <div className="flex gap-3 w-full sm:w-auto">
    <button 
      onClick={handleExportExcel}
      className="flex-1 sm:flex-none px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
    >
      Export Excel
    </button>
    <button 
      onClick={() => setShowAddNurse(true)}
      className="flex-1 sm:flex-none px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
    >
      Add Nurse
    </button>
  </div>
</div>

        <div className="flex flex-col gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search nurses..."
              className="pl-10 w-full bg-white text-base text-gray-900 placeholder:text-gray-500 border-gray-200"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          {/* Desktop view filters */}
          <div className="hidden sm:block overflow-x-auto -mx-4 px-4">
            <div className="flex gap-2 min-w-max">
              {filterOptions.map(({ value, setValue, options }) => (
                <FilterSelect 
                  key={value}
                  value={eval(value)} 
                  onChange={(e) => eval(setValue)(e.target.value)} 
                  options={options}
                />
              ))}
            </div>
          </div>
          {/* Mobile view select */}
          <div className="sm:hidden flex flex-col gap-2">
            {filterOptions.map(({ value, setValue, options }) => (
              <FilterSelect 
                key={value}
                value={eval(value)} 
                onChange={(e) => eval(setValue)(e.target.value)} 
                options={options}
                className="w-full"
              />
            ))}
          </div>
        </div>

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
          </div>
          
          {/* Mobile card view */}
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
                
                {/* Mobile pagination controls */}
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
              </>
            )}
          </div>
        </div>
      </div>
      
      {/* Add Nurse Overlay */}
      {showAddNurse && (
  <AddNurseOverlay 
    onClose={() => setShowAddNurse(false)}
    onAdd={handleAddNurse}
  />
)}

      {/* Render the overlay when a nurse is selected */}
      {selectedNurse && (
        <NurseDetailsOverlay 
          nurse={selectedNurse} 
          onClose={() => setSelectedNurse(null)} 
        />
      )}
    </div>
  )
}