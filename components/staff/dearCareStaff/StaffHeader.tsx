import React from "react"
import { Search, X, Plus, Download } from "lucide-react"
import { Input } from "@/components/ui/input"
import { StaffOrganization } from "@/types/dearCareStaff.types"

type StaffHeaderProps = {
  onAddStaff: () => void
  onExport: () => void
  isExporting: boolean
  searchInput: string
  setSearchInput: (value: string) => void
  selectedCategory: StaffOrganization | "all"
  handleSearch: () => void
  handleResetFilters: () => void
}

export function StaffHeader({ 
  onAddStaff, 
  onExport, 
  isExporting, 
  searchInput, 
  setSearchInput, 
  selectedCategory, 
  handleSearch,
  handleResetFilters
}: StaffHeaderProps) {
  return (
    <div className="bg-gray-50 rounded-sm border border-slate-200 overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-slate-200">
        <div>
          <h1 className="text-lg font-semibold text-gray-800">Staff Management</h1>
          <p className="text-xs text-gray-500">Manage and review staff members</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={onAddStaff}
            className="px-3 py-1.5 bg-green-500 text-white text-sm rounded-sm hover:bg-green-600 transition-colors flex items-center gap-1"
          >
            <Plus size={16} />
            Add Staff
          </button>
          <button 
            onClick={onExport}
            disabled={isExporting}
            className="px-3 py-1.5 bg-blue-500 text-white text-sm rounded-sm hover:bg-blue-600 transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed flex items-center gap-1"
          >
            {isExporting ? (
              <span className="flex items-center">
                <svg className="animate-spin mr-1 h-3 w-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Exporting...
              </span>
            ) : (
              <>
                <Download size={16} />
                Export
              </>
            )}
          </button>
        </div>
      </div>

      <div className="p-3 bg-gray-50 grid gap-2 grid-cols-1 sm:grid-cols-[1fr_auto]">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Enter search term and press Enter..."
            className="pl-9 pr-16 py-1 h-9 bg-white text-sm border-slate-200 focus-visible:ring-blue-400 text-gray-800"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          {searchInput && (
            <button 
              onClick={() => {
                setSearchInput("")
                handleResetFilters()
              }}
              className="absolute right-16 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5"
              aria-label="Clear search"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
          <button
            onClick={handleSearch}
            className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-xs transition-colors"
          >
            Search
          </button>
        </div>

        <div className="flex items-center gap-2">
          {/* Organization badge - read only for desktop */}
          <span className="text-xs font-medium text-gray-600 whitespace-nowrap hidden sm:inline">Organization:</span>
          <div className="hidden sm:flex gap-1.5 items-center">
            <div className="px-2.5 py-1 rounded-sm text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
              {selectedCategory === "all" ? "All Organizations" : selectedCategory}
            </div>
            
            <button
              onClick={handleResetFilters}
              disabled={!searchInput}
              className={`ml-1 px-2.5 py-1 rounded-sm text-xs font-medium transition-colors border flex items-center gap-1 ${
                !searchInput
                  ? "bg-gray-50 text-gray-400 border-slate-200 cursor-not-allowed"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200 border-slate-200"
              }`}
            >
              <X className="h-3 w-3" />
              Reset All
            </button>
          </div>
          
          {/* Mobile view - organization badge and reset button */}
          <div className="sm:hidden w-full flex flex-col gap-2">
            {/* Organization badge - read only for mobile */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-gray-600">Organization:</span>
              <div className="px-2.5 py-1 rounded-sm text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                {selectedCategory === "all" ? "All Organizations" : selectedCategory}
              </div>
            </div>
            
            {/* Reset button for mobile */}
            <button
              onClick={handleResetFilters}
              disabled={!searchInput}
              className={`py-1.5 rounded text-xs font-medium transition-colors border flex items-center justify-center gap-1 ${
                !searchInput
                  ? "bg-gray-50 text-gray-400 border-slate-200 cursor-not-allowed"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200 border-slate-200"
              }`}
            >
              <X className="h-3 w-3" />
              Reset All Filters
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}