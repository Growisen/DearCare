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
  handleCategoryChange: (role: StaffOrganization | "all") => void
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
  handleCategoryChange, 
  handleSearch,
  handleResetFilters
}: StaffHeaderProps) {
  return (
    <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div>
          <h1 className="text-lg font-semibold text-gray-800">Staff Management</h1>
          <p className="text-xs text-gray-500">Manage and review staff members</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={onAddStaff}
            className="px-3 py-1.5 bg-green-500 text-white text-sm rounded-md hover:bg-green-600 transition-colors flex items-center gap-1"
          >
            <Plus size={16} />
            Add Staff
          </button>
          <button 
            onClick={onExport}
            disabled={isExporting}
            className="px-3 py-1.5 bg-blue-500 text-white text-sm rounded-md hover:bg-blue-600 transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed flex items-center gap-1"
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
            placeholder="Search by name, email or designation..."
            className="pl-9 pr-16 py-1 h-9 bg-white text-sm border-gray-200 focus-visible:ring-blue-400 text-gray-800"
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
          <span className="text-xs font-medium text-gray-600 whitespace-nowrap hidden sm:inline">Organization:</span>
          <div className="hidden sm:flex gap-1.5 items-center">
            <button
              onClick={() => handleCategoryChange("all")}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                selectedCategory === "all"
                  ? "bg-blue-50 text-blue-700 border border-blue-200"
                  : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
              }`}
            >
              All
            </button>
            {["DearCare LLP", "Tata HomeNursing"].map((org) => (
              <button
                key={org}
                onClick={() => handleCategoryChange(org as StaffOrganization)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                  selectedCategory === org
                    ? "bg-blue-50 text-blue-700 border border-blue-200"
                    : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
                }`}
              >
                {org}
              </button>
            ))}
            
            <button
              onClick={handleResetFilters}
              disabled={selectedCategory === "all" && !searchInput}
              className={`ml-1 px-2.5 py-1 rounded-md text-xs font-medium transition-colors border flex items-center gap-1 ${
                selectedCategory === "all" && !searchInput
                  ? "bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-200"
              }`}
            >
              <X className="h-3 w-3" />
              Reset All
            </button>
          </div>
          
          {/* Mobile view - role dropdown and reset button */}
          <div className="sm:hidden w-full flex flex-col gap-2">
            <select
              value={selectedCategory}
              onChange={(e) => handleCategoryChange(e.target.value as StaffOrganization | "all")}
              className="w-full rounded-md border border-gray-200 bg-white py-1.5 px-2 text-sm text-gray-800 appearance-none focus:outline-none focus:ring-1 focus:ring-blue-400"
              style={{ 
                backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                backgroundPosition: `right 0.5rem center`,
                backgroundRepeat: `no-repeat`,
                backgroundSize: `1.5em 1.5em`,
                paddingRight: `2rem`
              }}
            >
              <option value="all">All Staff</option>
              <option value="DearCare LLP">DearCare LLP</option>
              <option value="Tata HomeNursing">Tata HomeNursing</option>
            </select>
            
            {/* Reset button for mobile */}
            <button
              onClick={handleResetFilters}
              disabled={selectedCategory === "all" && !searchInput}
              className={`py-1.5 rounded text-xs font-medium transition-colors border flex items-center justify-center gap-1 ${
                selectedCategory === "all" && !searchInput
                  ? "bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-200"
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