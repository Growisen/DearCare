import React, { useState, KeyboardEvent } from 'react'
import { Search, Filter, ChevronDown, Calendar } from 'lucide-react'

type LeaveRequestsHeaderProps = {
  // Header props
  title: string
  onAddLeaveRequest?: () => void
  onViewPolicy?: () => void
  
  // Filters props
  searchTerm: string
  setSearchTerm: (value: string) => void
  statusFilter: string | null
  setStatusFilter: (value: string | null) => void
  dateRange: {startDate: string | null, endDate: string | null}
  setDateRange: (value: {startDate: string | null, endDate: string | null}) => void
  clearAllFilters: () => void
  statuses: string[]
}

export function LeaveRequestsHeader({
  // Header props
  title,
  onAddLeaveRequest,
  onViewPolicy,
  
  // Filters props
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  dateRange,
  setDateRange,
  clearAllFilters,
  statuses
}: LeaveRequestsHeaderProps) {
  const [showFiltersOnMobile, setShowFiltersOnMobile] = useState(false)
  const [inputValue, setInputValue] = useState(searchTerm)
  
  const handleSearch = () => {
    setSearchTerm(inputValue)
  }
  
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }
  
  // Update local input value when searchTerm is cleared externally
  React.useEffect(() => {
    if (!searchTerm) {
      setInputValue('')
    }
  }, [searchTerm])

  return (
    <div className="bg-white rounded-2xl shadow border border-gray-100 overflow-hidden">
      <div className="p-5 space-y-5">
        {/* Header Content */}
        <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{title}</h1>
            <p className="text-sm text-gray-500 mt-1">Manage and view leave requests</p>
          </div>
          
          {/* Add action buttons if handlers are provided */}
          {(onAddLeaveRequest || onViewPolicy) && (
            <div className="flex flex-wrap gap-3">
              {onViewPolicy && (
                <button
                  onClick={onViewPolicy}
                  className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm transition-all duration-150"
                >
                  View Policy
                </button>
              )}
              {onAddLeaveRequest && (
                <button
                  onClick={onAddLeaveRequest}
                  className="px-4 py-2 bg-indigo-600 rounded-lg text-sm font-medium text-white hover:bg-indigo-700 shadow-sm transition-all duration-150"
                >
                  Add Leave Request
                </button>
              )}
            </div>
          )}
        </div>

        {/* Mobile Toggle for Filters */}
        <button
          onClick={() => setShowFiltersOnMobile(!showFiltersOnMobile)}
          className="md:hidden w-full px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm transition-all duration-150"
        >
          {showFiltersOnMobile ? 'Hide Filters' : 'Show Filters'}
        </button>

        {/* Filters Content */}
        <div className={`space-y-5 ${showFiltersOnMobile ? 'block' : 'hidden md:block'}`}>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-5">
            <div className="relative w-full md:max-w-xs flex">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search by name, ID, leave type..."
                className="block w-full pl-10 pr-3 py-2.5 border-y border-l border-gray-200 rounded-l-lg text-sm text-gray-700 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 transition-all duration-150"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <button
                onClick={handleSearch}
                className="px-4 py-2.5 bg-indigo-600 rounded-r-lg text-sm font-medium text-white hover:bg-indigo-700 shadow-sm transition-all duration-150 flex-shrink-0"
              >
                Search
              </button>
            </div>
          
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full md:w-auto">
              <div className="relative w-full sm:w-auto">
                <Calendar className="absolute w-4 h-4 left-3.5 top-3 text-gray-500" />
                <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-2">
                  <input
                    type="date"
                    className="w-full sm:w-auto appearance-none pl-10 pr-3 py-2.5 border border-gray-200 bg-white rounded-lg text-sm text-gray-700 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 transition-all duration-150"
                    value={dateRange.startDate || ''}
                    onChange={(e) => setDateRange({...dateRange, startDate: e.target.value || null})}
                    placeholder="Start Date"
                  />
                  <span className="text-gray-400 hidden sm:inline">to</span>
                  <input
                    type="date"
                    className="w-full sm:w-auto appearance-none pl-3 pr-3 py-2.5 border border-gray-200 bg-white rounded-lg text-sm text-gray-700 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 transition-all duration-150"
                    value={dateRange.endDate || ''}
                    onChange={(e) => setDateRange({...dateRange, endDate: e.target.value || null})}
                    placeholder="End Date"
                  />
                </div>
              </div>
            
              <div className="relative w-full sm:w-auto">
                <Filter className="absolute w-4 h-4 left-3.5 top-3 text-gray-500" />
                <select
                  className="w-full sm:w-auto appearance-none pl-10 pr-10 py-2.5 border border-gray-200 bg-white rounded-lg text-sm text-gray-700 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 transition-all duration-150"
                  value={statusFilter || 'All'}
                  onChange={(e) => setStatusFilter(e.target.value === 'All' ? null : e.target.value)}
                >
                  {statuses.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                  <ChevronDown className="w-4 h-4" />
                </div>
              </div>
            </div>
          </div>
          
          {/* Active Filters Display */}
          {(searchTerm || statusFilter || dateRange.startDate || dateRange.endDate) && (
            <div className="flex items-center justify-between pt-2 text-sm">
              <div className="text-gray-500">
                <span>Active filters: </span>
                {searchTerm && <span className="mx-1 px-2.5 py-1 bg-gray-50 border border-gray-100 rounded-full text-gray-700">{searchTerm}</span>}
                {statusFilter && <span className="mx-1 px-2.5 py-1 bg-gray-50 border border-gray-100 rounded-full text-gray-700">{statusFilter}</span>}
                {(dateRange.startDate || dateRange.endDate) && (
                  <span className="mx-1 px-2.5 py-1 bg-gray-50 border border-gray-100 rounded-full text-gray-700">
                    Date range
                  </span>
                )}
              </div>
              <button 
                onClick={clearAllFilters}
                className="text-indigo-600 hover:text-indigo-800 font-medium hover:underline transition-colors"
              >
                Clear all
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}