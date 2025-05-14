import React from "react"
import { Search, X, Plus, Download } from "lucide-react"
import { Input } from "@/components/ui/input"
import { ClientStatus } from "@/types/client.types"

type ClientHeader = {
  onAddClient: () => void
  onExport: () => void
  isExporting: boolean
  searchInput: string
  setSearchInput: (value: string) => void
  selectedStatus: string
  handleStatusChange: (status: ClientStatus) => void
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
  handleSearch,
  handleResetFilters
}: ClientHeader) {
  return (
    <div className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
      <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between p-5 border-b border-gray-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-800">Client Requests</h1>
          <p className="text-sm text-gray-500 mt-1">Manage and review client service requests</p>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <button 
            onClick={onAddClient}
            className="flex-1 sm:flex-none px-4 py-2.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
          >
            <Plus size={18} />
            Add Client
          </button>
          <button 
            onClick={onExport}
            disabled={isExporting}
            className="flex-1 sm:flex-none px-4 py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isExporting ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Exporting...
              </span>
            ) : (
              <>
                <Download size={18} />
                Export {selectedStatus === "all" ? "All" : 
                  selectedStatus.charAt(0).toUpperCase() + 
                  selectedStatus.slice(1).replace("_", " ")}
              </>
            )}
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-5 p-5 bg-gray-50">
        <div className="relative w-full">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by name, contact or location..."
              className="pl-10 w-full bg-white text-base text-gray-800 placeholder:text-gray-400 border-gray-200 h-11 focus-visible:ring-blue-400 focus-visible:ring-offset-2 shadow-sm"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSearch()
                }
              }}
            />
            {searchInput && (
              <button 
                onClick={() => {
                  setSearchInput("")
                  handleResetFilters()
                }}
                className="absolute right-20 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            )}
            
            <button
              onClick={handleSearch}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded-md text-sm transition-colors font-medium"
            >
              Search
            </button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
          <p className="text-sm font-medium text-gray-600">Filter by status:</p>
          {/* Desktop view buttons */}
          <div className="hidden sm:block overflow-x-auto">
            <div className="flex gap-2 min-w-max">
              {["pending", "approved", "under_review", "rejected", "all"].map((status) => (
                <button
                  key={status}
                  onClick={() => handleStatusChange(status as ClientStatus)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                    selectedStatus === status
                      ? "bg-blue-50 text-blue-700 border border-blue-200"
                      : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
                  }`}
                >
                  {status === "all" ? "All Clients" : status.charAt(0).toUpperCase() + status.slice(1).replace("_", " ")}
                </button>
              ))}
            </div>
          </div>
          {/* Mobile view select */}
          <div className="sm:hidden w-full">
            <select
              value={selectedStatus}
              onChange={(e) => handleStatusChange(e.target.value as ClientStatus)}
              className="w-full rounded-lg border border-gray-200 bg-white py-2.5 px-3 text-base text-gray-800 font-medium appearance-none focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 shadow-sm"
              style={{ 
                backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                backgroundPosition: `right 0.5rem center`,
                backgroundRepeat: `no-repeat`,
                backgroundSize: `1.5em 1.5em`,
                paddingRight: `2.5rem`
              }}
              aria-label="Filter status"
            >
              <option value="all">All Clients</option>
              {["approved", "pending", "under_review", "rejected"].map((status) => (
                <option key={status} value={status} className="py-2">
                  {status.charAt(0).toUpperCase() + status.slice(1).replace("_", " ")}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  )
}