import React from "react"
import { Search, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { ClientStatus } from "@/types/client.types"

type ClientFiltersProps = {
  searchInput: string
  setSearchInput: (value: string) => void
  selectedStatus: string
  handleStatusChange: (status: ClientStatus) => void
  handleSearch: () => void
  handleResetFilters: () => void
}

export function ClientFilters({ 
  searchInput, 
  setSearchInput, 
  selectedStatus, 
  handleStatusChange, 
  handleSearch,
  handleResetFilters
}: ClientFiltersProps) {
  return (
    <div className="flex flex-col gap-5 bg-white p-5 rounded-xl shadow-sm border border-gray-200">
      <div className="relative w-full">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by name, contact or location..."
            className="pl-10 w-full bg-white text-base text-gray-900 placeholder:text-gray-500 border-gray-200 h-11 focus-visible:ring-blue-500"
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
            >
              <X className="h-4 w-4" />
            </button>
          )}
          
          <button
            onClick={handleSearch}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-md text-sm transition-colors font-medium"
          >
            Search
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
        <p className="text-sm text-gray-500">Filter by status:</p>
        {/* Desktop view buttons */}
        <div className="hidden sm:block overflow-x-auto">
          <div className="flex gap-2 min-w-max">
            {["pending", "approved", "under_review", "rejected", "all"].map((status) => (
              <button
                key={status}
                onClick={() => handleStatusChange(status as ClientStatus)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                  selectedStatus === status
                    ? "bg-blue-100 text-blue-800 border border-blue-200"
                    : "bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-100"
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
            className="w-full rounded-lg border border-gray-200 bg-white py-2.5 px-3 text-base text-gray-900 font-medium appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            style={{ 
              backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
              backgroundPosition: `right 0.5rem center`,
              backgroundRepeat: `no-repeat`,
              backgroundSize: `1.5em 1.5em`,
              paddingRight: `2.5rem`
            }}
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
  )
}