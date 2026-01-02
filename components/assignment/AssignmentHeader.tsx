import React from "react"
import { Search, X, Download, Calendar, FilePlus } from "lucide-react" 
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"

type AssignmentHeaderProps = {
  onExport: () => void
  isExporting: boolean
  selectedStatus: 'all' | 'active' | 'completed' | 'upcoming' | 'ending_today' | 'starting_today'
  searchInput: string
  setSearchInput: (value: string) => void
  dateFilter: string
  handleStatusChange: (status: 'all' | 'active' | 'completed' | 'upcoming' | 'ending_today' | 'starting_today') => void
  handleSearch: (e: React.FormEvent) => void
  handleDateFilterChange: (date: string) => void
  handleResetFilters: () => void
  selectedCategory: string
}

export function AssignmentHeader({
  onExport,
  isExporting,
  selectedStatus,
  searchInput,
  setSearchInput,
  dateFilter,
  handleStatusChange,
  handleSearch,
  handleDateFilterChange,
  handleResetFilters,
  selectedCategory
}: AssignmentHeaderProps) {
  
  const router = useRouter();

  const setTodayDate = () => {
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0];
    handleDateFilterChange(formattedDate);
  };

  const isTodaySelected = () => {
    const today = new Date().toISOString().split('T')[0]; 
    return dateFilter === today;
  };
  
  const buttonStyles = {
    selected: "bg-blue-50 text-blue-700 border border-blue-200",
    unselected: "bg-white text-gray-600 hover:bg-gray-100 border border-slate-200",
  };
  
  return (
    <div className="bg-gray-50 rounded-sm border border-slate-200 overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-slate-200">
        <div>
          <h1 className="text-lg font-semibold text-gray-800">Nurse Assignments</h1>
          <p className="text-xs text-gray-500">Manage and view all nurse scheduling assignments</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => router.push("/assignment-agreement")}
            className="px-3 py-1.5 bg-green-500 text-white text-sm rounded-sm hover:bg-green-600 transition-colors flex items-center gap-1"
          >
            <FilePlus size={16} />
            New Agreement
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

      <div className="p-3 bg-gray-50">
        <div className="flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative w-full sm:max-w-2xl">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Enter search term and press Enter"
                className="pl-9 pr-16 py-1 h-9 bg-white text-sm border-slate-200 focus-visible:ring-blue-400 text-gray-800"
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
            <div className="flex gap-2 items-center w-full sm:w-auto">
              <div className="relative flex items-center w-full sm:w-auto">
                <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="date"
                  placeholder="Filter by date"
                  className="pl-9 pr-8 py-1 h-9 bg-white text-sm border-slate-200 focus-visible:ring-blue-400 text-gray-800 w-full sm:w-auto"
                  value={dateFilter}
                  onChange={(e) => handleDateFilterChange(e.target.value)}
                />
                {dateFilter && (
                  <button 
                    onClick={() => handleDateFilterChange('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 z-10 rounded-full hover:bg-gray-100"
                    aria-label="Clear date filter"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
              <button
                onClick={setTodayDate}
                className={`text-xs py-1 px-2 rounded-sm transition-colors font-medium flex items-center justify-center h-9 whitespace-nowrap ${
                  isTodaySelected() ? buttonStyles.selected : buttonStyles.unselected
                }`}
              >
                <Calendar className={`h-3 w-3 mr-1 ${isTodaySelected() ? "text-blue-600" : ""}`} />
                Today
              </button>
            </div>
          </div>
          <div className="hidden sm:flex flex-col sm:flex-row gap-6">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs font-medium text-gray-600 whitespace-nowrap">Organization:</span>
              <div className="px-2.5 py-1 rounded-sm text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                {selectedCategory === "all" ? "All Organizations" : selectedCategory}
              </div>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto mt-2 sm:mt-0 sm:ml-8">
              <span className="text-xs font-medium text-gray-600 whitespace-nowrap">Status:</span>
              <div className="flex gap-1.5 items-center flex-wrap">
                {['all', 'active', 'completed', 'upcoming', 'starting_today', 'ending_today'].map((status) => (
                  <button
                    key={status}
                    onClick={() => handleStatusChange(status as 'all' | 'active' | 'completed' | 'upcoming' | 'ending_today' | 'starting_today')}
                    className={`px-2.5 py-1 rounded-sm text-xs font-medium transition-colors ${
                      selectedStatus === status ? buttonStyles.selected : buttonStyles.unselected
                    }`}
                  >
                    {status
                      .replace(/_/g, ' ')
                      .replace(/\b\w/g, c => c.toUpperCase())
                    }
                  </button>
                ))}
                <button
                  onClick={handleResetFilters}
                  disabled={selectedStatus === 'all' && !searchInput && !dateFilter}
                  className={`px-2.5 py-1 rounded-sm text-xs font-medium transition-colors border flex items-center gap-1 ${
                    selectedStatus === 'all' && !searchInput && !dateFilter
                      ? "bg-gray-50 text-gray-400 border-slate-200 cursor-not-allowed"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200 border-slate-200"
                  }`}
                >
                  <X className="h-3 w-3" />
                  Reset All
                </button>
              </div>
            </div>
          </div>
          <div className="sm:hidden flex flex-col gap-2 w-full">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-gray-600">Organization:</span>
              <div className="px-2.5 py-1 rounded-sm text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                {selectedCategory === "all" ? "All Organizations" : selectedCategory}
              </div>
            </div>
            <select
              value={selectedStatus}
              onChange={(e) => handleStatusChange(e.target.value as 'all' | 'active' | 'completed' | 'upcoming')}
              className="w-full rounded-sm border border-slate-200 bg-white py-1.5 px-2 text-sm text-gray-800 appearance-none focus:outline-none focus:ring-1 focus:ring-blue-400"
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
              <option value="upcoming">Upcoming</option>
            </select>
            <button
              onClick={handleResetFilters}
              disabled={selectedStatus === 'all' && !searchInput && !dateFilter}
              className={`px-2.5 py-1 rounded-sm text-xs font-medium transition-colors border flex items-center gap-1 ${
                selectedStatus === 'all' && !searchInput && !dateFilter
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