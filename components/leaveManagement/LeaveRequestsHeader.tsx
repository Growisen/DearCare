import React from "react"
import { Search, X, Download, Calendar, RefreshCw, Plus, Loader } from "lucide-react"
import { Input } from "@/components/ui/input"

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
}

export function LeaveRequestsHeader({ 
  onAddLeaveRequest,
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
  admittedTypeFilter = ""
}: LeaveRequestsHeaderProps) {
  const hasActiveFilters = searchTerm || statusFilter || dateRange.startDate || dateRange.endDate

  const getAdmittedTypeDisplay = (): string => {
    if (admittedTypeFilter === "") return "All Organizations";
    if (admittedTypeFilter === "Dearcare_Llp") return "DearCare LLP";
    if (admittedTypeFilter === "Tata_Homenursing") return "Tata HomeNursing";
    return "All Organizations";
  };

  return (
    <div className="bg-gray-50 rounded-sm border border-slate-200 overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-slate-200">
        <div>
          <h1 className="text-lg font-semibold text-gray-800">Leave Requests</h1>
          <p className="text-xs text-gray-500">Manage and review leave requests</p>
        </div>
        <div className="flex gap-2">
          {onAddLeaveRequest && (
            <button
              onClick={onAddLeaveRequest}
              className="px-3 py-1.5 bg-green-500 text-white text-sm rounded-sm hover:bg-green-600 transition-colors flex items-center gap-1"
            >
              <Plus size={16} />
              Add Leave
            </button>
          )}
          {onExport && (
            <button 
              onClick={onExport}
              disabled={isExporting}
              className="px-3 py-1.5 bg-blue-500 text-white text-sm rounded-sm hover:bg-blue-600 transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed flex items-center gap-1"
            >
              {isExporting ? (
                <span className="flex items-center">
                  <Loader className="animate-spin mr-1 h-3 w-3 text-white" />
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
      <div className="p-4 bg-gray-50 flex flex-col gap-2">
        <div className="relative w-full">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Type to search"
            className="pl-9 pr-16 py-1 h-9 bg-white text-sm text-gray-800 border-slate-200 rounded-sm w-full outline-none"
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
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-500 hover:bg-blue-600 text-white 
              px-2.5 py-1 rounded-sm text-xs transition-colors outline-none"
          >
            Search
          </button>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full mt-2">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs font-medium text-gray-600 whitespace-nowrap">Organization:</span>
            <div className="px-2.5 py-1 rounded-sm text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
              {getAdmittedTypeDisplay()}
            </div>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs font-medium text-gray-600 whitespace-nowrap">Status:</span>
            <div className="flex gap-1.5 items-center">
              {['All', ...statuses].map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status === 'All' ? null : status)}
                  className={`px-2.5 py-1 rounded-sm text-xs font-medium transition-colors ${
                    (status === 'All' && statusFilter === null) || statusFilter === status
                      ? "bg-blue-50 text-blue-700 border border-blue-200"
                      : "bg-white text-gray-600 hover:bg-gray-100 border border-slate-200"
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative">
              <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="date"
                className="pl-9 pr-3 py-1 h-7 bg-white text-xs border border-slate-200 rounded-sm text-gray-800 outline-none"
                style={{ boxShadow: "none" }}
                value={dateRange.startDate || ''}
                onChange={(e) => setDateRange({...dateRange, startDate: e.target.value || null})}
              />
            </div>
            <span className="text-gray-500">to</span>
            <input
              type="date"
              className="pl-3 pr-3 py-1 h-7 bg-white text-xs border border-slate-200 rounded-sm text-gray-800 outline-none"
              style={{ boxShadow: "none" }}
              value={dateRange.endDate || ''}
              onChange={(e) => setDateRange({...dateRange, endDate: e.target.value || null})}
            />
          </div>
          {hasActiveFilters && (
            <button
              onClick={handleResetFilters}
              className="px-2.5 py-1 rounded-sm text-xs font-medium bg-gray-100 text-gray-700 border border-slate-200 hover:bg-gray-200 transition-colors flex items-center gap-1"
              title="Reset all filters"
              style={{ outline: "none", boxShadow: "none" }}
            >
              <RefreshCw className="h-3 w-3" />
              Reset
            </button>
          )}
        </div>
      </div>
    </div>
  )
}