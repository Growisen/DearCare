import React from "react"
import { Search, X, Download, Calendar, RefreshCw } from "lucide-react"
import { Input } from "@/components/ui/input"
import { AdmittedType } from "@/app/actions/staff-management/leave-management";

type LeaveRequestsHeaderProps = {
  onAddLeaveRequest?: () => void
  onViewPolicy?: () => void
  onExport?: () => void
  isExporting?: boolean
  searchTerm: string
  setSearchTerm: (value: string) => void
  statusFilter: string | null
  setStatusFilter: (value: string | null) => void
  dateRange: {startDate: string | null, endDate: string | null}
  setDateRange: (value: {startDate: string | null, endDate: string | null}) => void
  handleSearch: () => void
  handleResetFilters: () => void
  statuses: string[]
  admittedTypeFilter: 'Dearcare_Llp' | 'Tata_Homenursing' | ""
  setAdmittedTypeFilter: (value: 'Dearcare_Llp' | 'Tata_Homenursing' | "") => void
}

export function LeaveRequestsHeader({ 
  onExport,
  isExporting = false,
  searchTerm, 
  setSearchTerm, 
  statusFilter, 
  setStatusFilter, 
  dateRange,
  setDateRange,
  handleSearch,
  handleResetFilters,
  statuses,
  admittedTypeFilter = "",
  setAdmittedTypeFilter
}: LeaveRequestsHeaderProps) {
  
  const hasActiveFilters = searchTerm || statusFilter || dateRange.startDate || dateRange.endDate || admittedTypeFilter

  const admittedTypeMap = [
    { value: "", display: "All Categories" },
    { value: "Dearcare_Llp", display: "DearCare LLP" },
    { value: "Tata_Homenursing", display: "Tata HomeNursing" }
  ];

  return (
    <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
      {/* Header with title and action buttons */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div>
          <h1 className="text-lg font-semibold text-gray-800">Leave Requests</h1>
          <p className="text-xs text-gray-500">Manage and review leave requests</p>
        </div>
        <div className="flex gap-2">
          {onExport && (
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
          )}
        </div>
      </div>

      {/* Search and filters section */}
      <div className="p-3 bg-gray-50 grid gap-2 grid-cols-1 sm:grid-cols-[1fr_auto]">
        {/* Search input */}
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by name, ID, leave type..."
            className="pl-9 pr-16 py-1 h-9 bg-white text-sm text-gray-800 border-gray-200 focus-visible:ring-blue-400"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          {searchTerm && (
            <button 
              onClick={() => {
                setSearchTerm("")
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

        {/* Date filters */}
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-2">
            <div className="relative">
              <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="date"
                className="pl-9 pr-3 py-1 h-9 bg-white text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-800"
                value={dateRange.startDate || ''}
                onChange={(e) => setDateRange({...dateRange, startDate: e.target.value || null})}
              />
            </div>
            <span className="text-gray-500">to</span>
            <input
              type="date"
              className="pl-3 pr-3 py-1 h-9 bg-white text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-800"
              value={dateRange.endDate || ''}
              onChange={(e) => setDateRange({...dateRange, endDate: e.target.value || null})}
            />
          </div>
          
          {/* Mobile view - compact select dropdowns */}
          <div className="sm:hidden flex flex-col w-full gap-2">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="date"
                  className="w-full pl-9 pr-3 py-1.5 bg-white text-sm border border-gray-200 rounded-md"
                  value={dateRange.startDate || ''}
                  onChange={(e) => setDateRange({...dateRange, startDate: e.target.value || null})}
                />
              </div>
              <div className="flex-1">
                <input
                  type="date"
                  className="w-full pl-3 pr-3 py-1.5 bg-white text-sm border border-gray-200 rounded-md"
                  value={dateRange.endDate || ''}
                  onChange={(e) => setDateRange({...dateRange, endDate: e.target.value || null})}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={statusFilter || 'All'}
                onChange={(e) => setStatusFilter(e.target.value === 'All' ? null : e.target.value)}
                className="flex-1 rounded-md border border-gray-200 bg-white py-1.5 px-2 text-sm text-gray-800 appearance-none focus:outline-none focus:ring-1 focus:ring-blue-400"
                style={{ 
                  backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                  backgroundPosition: `right 0.5rem center`,
                  backgroundRepeat: `no-repeat`,
                  backgroundSize: `1.5em 1.5em`,
                  paddingRight: `2rem`
                }}
              >
                <option value="All">All Statuses</option>
                {statuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
              
              {/* Mobile Reset Button */}
              {hasActiveFilters && (
                <button
                  onClick={handleResetFilters}
                  className="px-3 py-1.5 rounded-md text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200 transition-colors flex items-center gap-1 whitespace-nowrap"
                >
                  <RefreshCw className="h-3 w-3" />
                  Reset
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Combined Status and Category Filters Section with spacing below */}
      <div className="px-3 pb-5 mb-3 bg-gray-50">
        {/* Desktop view */}
        <div className="hidden sm:flex items-center gap-4 flex-wrap">
          {/* Category filters */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-gray-600 whitespace-nowrap">Category:</span>
            <div className="flex gap-1.5 items-center flex-wrap">
              {admittedTypeMap.map((type) => (
                <button
                  key={type.value}
                  onClick={() => setAdmittedTypeFilter(type.value as AdmittedType)}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                    admittedTypeFilter === type.value
                      ? "bg-blue-50 text-blue-700 border border-blue-200"
                      : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
                  }`}
                >
                  {type.display}
                </button>
              ))}
            </div>
          </div>

          {/* Status filters */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-gray-600 whitespace-nowrap">Status:</span>
            <div className="flex gap-1.5 items-center">
              {['All', ...statuses].map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status === 'All' ? null : status)}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                    (status === 'All' && statusFilter === null) || statusFilter === status
                      ? "bg-blue-50 text-blue-700 border border-blue-200"
                      : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
          
          {/* Reset button */}
          {hasActiveFilters && (
            <button
              onClick={handleResetFilters}
              className="px-2.5 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200 transition-colors flex items-center gap-1"
              title="Reset all filters"
            >
              <RefreshCw className="h-3 w-3" />
              Reset
            </button>
          )}
        </div>
        
        {/* Mobile view */}
        <div className="sm:hidden mt-2">
          <select
            value={admittedTypeFilter}
            onChange={(e) => setAdmittedTypeFilter(e.target.value as AdmittedType)}
            className="w-full rounded-md border border-gray-200 bg-white py-1.5 px-2 text-sm text-gray-800 appearance-none focus:outline-none focus:ring-1 focus:ring-blue-400"
            style={{ 
              backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
              backgroundPosition: `right 0.5rem center`,
              backgroundRepeat: `no-repeat`,
              backgroundSize: `1.5em 1.5em`,
              paddingRight: `2rem`
            }}
          >
            {admittedTypeMap.map((type) => (
              <option key={type.value} value={type.value}>
                {type.display}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  )
}