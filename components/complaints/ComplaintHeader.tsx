import React from "react"
import { Search, X, Download } from "lucide-react"
import { Input } from "@/components/ui/input"
import { ComplaintStatus, ComplaintSource } from "@/types/complaint.types"

type ComplaintHeaderProps = {
  onExport: () => void
  isExporting: boolean
  searchInput: string
  setSearchInput: (value: string) => void
  selectedStatus: ComplaintStatus | "all"
  selectedSource: ComplaintSource | "all"
  handleStatusChange: (status: ComplaintStatus | "all") => void
  handleSourceChange: (source: ComplaintSource | "all") => void
  handleSearch: () => void
  handleResetFilters: () => void
}

export function ComplaintHeader({ 
  onExport, 
  isExporting, 
  searchInput, 
  setSearchInput, 
  selectedStatus, 
  selectedSource,
  handleStatusChange, 
  handleSourceChange,
  handleSearch,
  handleResetFilters
}: ComplaintHeaderProps) {
  return (
    <div className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
      <div className="flex items-center justify-between p-3 sm:p-4 border-b border-gray-200">
        <div>
          <h1 className="text-lg sm:text-xl font-semibold text-gray-800">Complaints Management</h1>
          <p className="text-xs sm:text-sm text-gray-500">Track and resolve complaints</p>
        </div>
        <button 
          onClick={onExport}
          disabled={isExporting}
          className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed flex items-center gap-1.5 text-sm"
        >
          {isExporting ? (
            <span className="flex items-center">
              <svg className="animate-spin mr-1.5 h-3.5 w-3.5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Exporting
            </span>
          ) : (
            <>
              <Download size={16} />
              Export
            </>
          )}
        </button>
      </div>

      <div className="p-3 sm:p-4 bg-gray-50">
        {/* Combined search and filters row for desktop */}
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search complaints..."
              className="pl-9 w-full bg-white text-sm text-gray-800 placeholder:text-gray-400 border-gray-200 h-10 focus-visible:ring-blue-400"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            {searchInput && (
              <button 
                onClick={() => {
                  setSearchInput("")
                  // Don't call handleResetFilters here to avoid resetting status and source filters
                }}
                className="absolute right-16 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                aria-label="Clear search"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
            
            <button
              onClick={handleSearch}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-500 hover:bg-blue-600 text-white px-2.5 py-1 rounded-md text-xs transition-colors font-medium"
            >
              Search
            </button>
          </div>

          {/* Compact filters for desktop */}
          <div className="hidden lg:flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-medium text-gray-600">Status:</span>
              <div className="flex gap-1">
                {["all", "open", "under_review", "resolved"].map((status) => (
                  <button
                    key={status}
                    onClick={() => handleStatusChange(status as ComplaintStatus | "all")}
                    className={`px-2.5 py-1.5 rounded text-xs font-medium transition-colors ${
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

            <div className="flex items-center gap-1.5">
              <span className="text-xs font-medium text-gray-600">Source:</span>
              <div className="flex gap-1">
                {["all", "client", "nurse"].map((source) => (
                  <button
                    key={source}
                    onClick={() => handleSourceChange(source as ComplaintSource | "all")}
                    className={`px-2.5 py-1.5 rounded text-xs font-medium transition-colors ${
                      selectedSource === source
                        ? "bg-purple-50 text-purple-700 border border-purple-200"
                        : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
                    }`}
                  >
                    {source === "all" ? "All" : source.charAt(0).toUpperCase() + source.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Add Reset All Filters button in desktop view */}
            <button
              onClick={handleResetFilters}
              disabled={selectedStatus === "all" && selectedSource === "all" && !searchInput}
              className={`px-2.5 py-1.5 rounded text-xs font-medium transition-colors border flex items-center gap-1 ${
                selectedStatus === "all" && selectedSource === "all" && !searchInput
                  ? "bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-200"
              }`}
            >
              <X className="h-3 w-3" />
              Reset All
            </button>
          </div>
        </div>

        {/* Mobile filters (only visible on smaller screens) */}
        <div className="lg:hidden flex flex-col gap-2 mt-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-gray-600 w-14">Status:</span>
            <select
              value={selectedStatus}
              onChange={(e) => handleStatusChange(e.target.value as ComplaintStatus | "all")}
              className="flex-1 rounded border border-gray-200 bg-white py-1.5 px-2 text-sm text-gray-800 appearance-none focus:outline-none focus:ring-1 focus:ring-blue-400"
              style={{ 
                backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                backgroundPosition: `right 0.5rem center`,
                backgroundRepeat: `no-repeat`,
                backgroundSize: `1em 1em`,
                paddingRight: `2rem`
              }}
            >
              <option value="all">All Statuses</option>
              {["open", "under_review", "resolved"].map((status) => (
                <option key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1).replace("_", " ")}
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-gray-600 w-14">Source:</span>
            <select
              value={selectedSource}
              onChange={(e) => handleSourceChange(e.target.value as ComplaintSource | "all")}
              className="flex-1 rounded border border-gray-200 bg-white py-1.5 px-2 text-sm text-gray-800 appearance-none focus:outline-none focus:ring-1 focus:ring-blue-400"
              style={{ 
                backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                backgroundPosition: `right 0.5rem center`,
                backgroundRepeat: `no-repeat`,
                backgroundSize: `1em 1em`,
                paddingRight: `2rem`
              }}
            >
              <option value="all">All Sources</option>
              <option value="client">Clients</option>
              <option value="nurse">Nurses</option>
            </select>
          </div>
          
          {/* Add Reset All Filters button in mobile view */}
          <button
            onClick={handleResetFilters}
            disabled={selectedStatus === "all" && selectedSource === "all" && !searchInput}
            className={`mt-1 py-1.5 rounded text-xs font-medium transition-colors border flex items-center justify-center gap-1 ${
              selectedStatus === "all" && selectedSource === "all" && !searchInput
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