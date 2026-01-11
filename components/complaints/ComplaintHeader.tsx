import React from "react"
import { Search, X, Download, Loader } from "lucide-react"
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
    <div className="bg-gray-50 rounded-sm border border-slate-200 overflow-hidden">
      <div className="flex items-center justify-between p-3 sm:p-4 border-b border-slate-200">
        <div>
          <h1 className="text-lg font-semibold text-gray-800">Complaints Management</h1>
          <p className="text-xs sm:text-sm text-gray-500">Track and resolve complaints</p>
        </div>
        <button 
          onClick={onExport}
          disabled={isExporting}
          className="px-3 py-2 bg-blue-500 text-white rounded-sm hover:bg-blue-600 transition-colors
           disabled:bg-blue-300 disabled:cursor-not-allowed flex items-center gap-1.5 text-sm"
        >
          {isExporting ? (
            <span className="flex items-center">
              <Loader className="animate-spin mr-1.5 h-3.5 w-3.5 text-white" />
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
      <div className="p-4 bg-gray-50">
        <div className="flex flex-col gap-3">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Type to search"
              className="pl-9 pr-20 py-1 h-9 bg-white text-sm border-slate-200 focus-visible:ring-blue-400 text-gray-800 w-full"  
              style={{ boxShadow: "none" }}
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            {searchInput && (
              <button 
                onClick={() => setSearchInput("")}
                className="absolute right-16 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                aria-label="Clear search"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
            <button
              onClick={handleSearch}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-500 hover:bg-blue-600 text-white
               px-2.5 py-1 rounded-sm text-xs transition-colors font-medium outline-none border-none"
              style={{ boxShadow: "none" }}
            >
              Search
            </button>
          </div>
          <div className="flex flex-col lg:flex-row gap-2 w-full">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-medium text-gray-600">Status:</span>
              <div className="flex gap-1">
                {["all", "open", "under_review", "resolved"].map((status) => (
                  <button
                    key={status}
                    onClick={() => handleStatusChange(status as ComplaintStatus | "all")}
                    className={`px-2.5 py-1.5 rounded-sm text-xs font-medium transition-colors outline-none border ${
                      selectedStatus === status
                        ? "bg-blue-50 text-blue-700 border-blue-200"
                        : "bg-white text-gray-600 hover:bg-gray-100 border-slate-200"
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
                    className={`px-2.5 py-1.5 rounded-sm text-xs font-medium transition-colors outline-none border ${
                      selectedSource === source
                        ? "bg-blue-50 text-blue-700 border-blue-200"
                        : "bg-white text-gray-600 hover:bg-gray-100 border-slate-200"
                    }`}
                  >
                    {source === "all" ? "All" : source.charAt(0).toUpperCase() + source.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <button
              onClick={handleResetFilters}
              disabled={selectedStatus === "all" && selectedSource === "all" && !searchInput}
              className={`px-2.5 py-1.5 rounded-sm text-xs font-medium transition-colors border flex items-center gap-1 ${
                selectedStatus === "all" && selectedSource === "all" && !searchInput
                  ? "bg-gray-50 text-gray-400 border-slate-200 cursor-not-allowed"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200 border-slate-200"
              }`}
            >
              <X className="h-3 w-3" />
              Reset All
            </button>
          </div>
        </div>
        <div className="lg:hidden flex flex-col gap-2 mt-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-gray-600 w-14">Status:</span>
            <select
              value={selectedStatus}
              onChange={(e) => handleStatusChange(e.target.value as ComplaintStatus | "all")}
              className="flex-1 rounded-sm border border-slate-200 bg-white py-1.5 px-2 text-sm text-gray-800
               appearance-none outline-none border-none"
              style={{ 
                backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none'
                 viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round'
                  stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                backgroundPosition: `right 0.5rem center`,
                backgroundRepeat: `no-repeat`,
                backgroundSize: `1em 1em`,
                paddingRight: `2rem`,
                boxShadow: "none"
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
              className="flex-1 rounded-sm border border-slate-200 bg-white py-1.5 px-2 text-sm text-gray-800
               appearance-none outline-none border-none"
              style={{ 
                backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' 
                  viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' 
                  stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                backgroundPosition: `right 0.5rem center`,
                backgroundRepeat: `no-repeat`,
                backgroundSize: `1em 1em`,
                paddingRight: `2rem`,
                boxShadow: "none"
              }}
            >
              <option value="all">All Sources</option>
              <option value="client">Clients</option>
              <option value="nurse">Nurses</option>
            </select>
          </div>
          <button
            onClick={handleResetFilters}
            disabled={selectedStatus === "all" && selectedSource === "all" && !searchInput}
            className={`mt-1 py-1.5 rounded-sm text-xs font-medium transition-colors border flex items-center justify-center gap-1 ${
              selectedStatus === "all" && selectedSource === "all" && !searchInput
                ? "bg-gray-50 text-gray-400 border-slate-200 cursor-not-allowed"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200 border-slate-200"
            }`}
            style={{ outline: "none", boxShadow: "none" }}
          >
            <X className="h-3 w-3" />
            Reset All Filters
          </button>
        </div>
      </div>
    </div>
  )
}