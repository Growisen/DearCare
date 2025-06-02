import React from "react"
import { Search, X, Download } from "lucide-react"
import { Input } from "@/components/ui/input"

type AssignmentHeaderProps = {
  onExport: () => void
  isExporting: boolean
  selectedStatus: 'all' | 'active' | 'completed' | 'cancelled'
  searchInput: string
  setSearchInput: (value: string) => void
  handleStatusChange: (status: 'all' | 'active' | 'completed' | 'cancelled') => void
  handleSearch: (e: React.FormEvent) => void
  handleResetFilters: () => void
}

export function AssignmentHeader({
  onExport,
  isExporting,
  selectedStatus,
  searchInput,
  setSearchInput,
  handleStatusChange,
  handleSearch,
  handleResetFilters
}: AssignmentHeaderProps) {
  return (
    <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
      {/* Header with title and action buttons */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div>
          <h1 className="text-lg font-semibold text-gray-800">Nurse Assignments</h1>
          <p className="text-xs text-gray-500">Manage and view all nurse scheduling assignments</p>
        </div>
        <div className="flex gap-2">
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
      <div className="p-3 bg-gray-50 grid gap-2 grid-cols-1 sm:grid-cols-[1fr_auto]">
        {/* Search input */}
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by Nurse ID..."
            className="pl-9 pr-16 py-1 h-9 bg-white text-sm border-gray-200 focus-visible:ring-blue-400 text-gray-800"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch(e as React.FormEvent)}
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
            onClick={(e) => handleSearch(e as React.FormEvent)}
            className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-xs transition-colors"
          >
            Search
          </button>
        </div>

        {/* Status filters */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-gray-600 whitespace-nowrap hidden sm:inline">Status:</span>
          {/* Desktop view - compact pill buttons */}
          <div className="hidden sm:flex gap-1.5 items-center">
            {['all', 'active', 'completed', 'cancelled'].map((status) => (
              <button
                key={status}
                onClick={() => handleStatusChange(status as 'all' | 'active' | 'completed' | 'cancelled')}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                  selectedStatus === status
                    ? "bg-blue-50 text-blue-700 border border-blue-200"
                    : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
          {/* Mobile view - compact dropdown */}
          <select
            value={selectedStatus}
            onChange={(e) => handleStatusChange(e.target.value as 'all' | 'active' | 'completed' | 'cancelled')}
            className="sm:hidden w-full rounded-md border border-gray-200 bg-white py-1.5 px-2 text-sm text-gray-800 appearance-none focus:outline-none focus:ring-1 focus:ring-blue-400"
            style={{ 
              backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
              backgroundPosition: `right 0.5rem center`,
              backgroundRepeat: `no-repeat`,
              backgroundSize: `1.5em 1.5em`,
              paddingRight: `2rem`
            }}
          >
            <option value="all">All Assignments</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>
    </div>
  )
}