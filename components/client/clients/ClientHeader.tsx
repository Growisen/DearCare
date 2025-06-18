import React from "react"
import { Search, X, Plus, Download } from "lucide-react"
import { Input } from "@/components/ui/input"
import { ClientStatus, ClientCategory } from "@/types/client.types"

type ClientHeader = {
  onAddClient: () => void
  onExport: () => void
  isExporting: boolean
  searchInput: string
  setSearchInput: (value: string) => void
  selectedStatus: string
  handleStatusChange: (status: ClientStatus) => void
  selectedCategory: ClientCategory | "all" 
  handleCategoryChange: (category: ClientCategory | "all") => void
  handleSearch: () => void
  handleResetFilters: () => void
}

export function ClientHeader({ 
  onAddClient, 
  onExport, 
  isExporting, 
  searchInput, 
  setSearchInput, 
  selectedStatus, 
  handleStatusChange,
  selectedCategory,
  handleCategoryChange, 
  handleSearch,
  handleResetFilters
}: ClientHeader) {
  return (
    <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
      {/* Header with title and action buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border-b border-gray-200 gap-3">
        <div>
          <h1 className="text-lg font-semibold text-gray-800">Client Requests</h1>
          <p className="text-xs text-gray-500">Manage and review client service requests</p>
        </div>
        <div className="flex gap-2 self-start sm:self-auto">
          <button 
            onClick={onAddClient}
            className="px-3 py-1.5 bg-green-500 text-white text-sm rounded-md hover:bg-green-600 transition-colors flex items-center gap-1"
          >
            <Plus size={16} />
            Add
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

      {/* Search and filters section */}
      <div className="p-4 bg-gray-50 space-y-3">
        {/* Search input - full width on all screens */}
        <div className="relative w-full">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by name, contact or location..."
            className="pl-9 pr-20 py-1 h-9 bg-white text-sm border-gray-200 focus-visible:ring-blue-400 text-gray-800 w-full"
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
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-500 hover:bg-blue-600 text-white px-2.5 py-1 rounded text-xs transition-colors"
          >
            Search
          </button>
        </div>

        {/* Filters section - desktop view */}
        <div className="hidden sm:flex flex-wrap items-center gap-3">
          {/* Status filters */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-xs font-medium text-gray-600 whitespace-nowrap">Status:</span>
            <div className="flex gap-1.5 items-center flex-wrap">
              {["all", "pending", "approved", "under_review", "rejected"].map((status) => (
                <button
                  key={status}
                  onClick={() => handleStatusChange(status as ClientStatus)}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                    selectedStatus === status
                      ? "bg-blue-50 text-blue-700 border border-blue-200"
                      : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
                  }`}
                >
                  {status === "all" ? "All" : status.charAt(0).toUpperCase() + status.slice(1).replace("_", " ")}
                </button>
              ))}
            </div>
          </div>
          
          {/* Category filter - desktop */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-xs font-medium text-gray-600 whitespace-nowrap">Category:</span>
            <div className="flex gap-1.5 items-center">
              {["all", "DearCare LLP", "Tata HomeNursing"].map((category) => (
                <button
                  key={category}
                  onClick={() => handleCategoryChange(category as ClientCategory | "all")}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                    selectedCategory === category
                      ? "bg-blue-50 text-blue-700 border border-blue-200"
                      : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
                  }`}
                >
                  {category === "all" ? "All Categories" : category}
                </button>
              ))}
            </div>
          </div>
          
          {/* Reset button for desktop - pushed to right */}
          <button
            onClick={handleResetFilters}
            disabled={selectedStatus === "all" && selectedCategory === "all" && !searchInput}
            className={`ml-auto px-2.5 py-1 rounded-md text-xs font-medium transition-colors border flex items-center gap-1 ${
              selectedStatus === "all" && selectedCategory === "all" && !searchInput
                ? "bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-200"
            }`}
          >
            <X className="h-3 w-3" />
            Reset All
          </button>
        </div>
        
        {/* Mobile view - status and category dropdowns with reset button */}
        <div className="sm:hidden space-y-2">
          <div className="grid grid-cols-2 gap-2">
            {/* Status dropdown */}
            <select
              value={selectedStatus}
              onChange={(e) => handleStatusChange(e.target.value as ClientStatus)}
              className="rounded-md border border-gray-200 bg-white py-1.5 px-2 text-sm text-gray-800 appearance-none focus:outline-none focus:ring-1 focus:ring-blue-400"
              style={{ 
                backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                backgroundPosition: `right 0.5rem center`,
                backgroundRepeat: `no-repeat`,
                backgroundSize: `1.5em 1.5em`,
                paddingRight: `2rem`
              }}
            >
              <option value="all">All Clients</option>
              {["approved", "pending", "under_review", "rejected"].map((status) => (
                <option key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1).replace("_", " ")}
                </option>
              ))}
            </select>
            
            {/* Category dropdown for mobile */}
            <select
              value={selectedCategory}
              onChange={(e) => handleCategoryChange(e.target.value as ClientCategory | "all")}
              className="rounded-md border border-gray-200 bg-white py-1.5 px-2 text-sm text-gray-800 appearance-none focus:outline-none focus:ring-1 focus:ring-blue-400"
              style={{ 
                backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                backgroundPosition: `right 0.5rem center`,
                backgroundRepeat: `no-repeat`,
                backgroundSize: `1.5em 1.5em`,
                paddingRight: `2rem`
              }}
            >
              <option value="all">All Categories</option>
              <option value="DearCare LLP">DearCare LLP</option>
              <option value="Tata HomeNursing">Tata HomeNursing</option>
            </select>
          </div>
          
          {/* Reset button for mobile */}
          <button
            onClick={handleResetFilters}
            disabled={selectedStatus === "all" && selectedCategory === "all" && !searchInput}
            className={`w-full py-1.5 rounded text-xs font-medium transition-colors border flex items-center justify-center gap-1 ${
              selectedStatus === "all" && selectedCategory === "all" && !searchInput
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
  )
}