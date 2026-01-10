"use client"

import React from "react"
import { Search, X, Download, Loader } from "lucide-react"

type PaymentHeaderProps = {
  searchInput: string
  setSearchInputAction: (value: string) => void
  handleSearchAction: () => void
  handleResetFiltersAction: () => void
  onExportAction?: () => void
  isExporting?: boolean
  dateFilter?: string
  setDateFilterAction?: (value: string) => void
}

export default function PaymentHeader({
  searchInput,
  setSearchInputAction,
  handleSearchAction,
  handleResetFiltersAction,
  onExportAction,
  isExporting,
  dateFilter,
  setDateFilterAction
}: PaymentHeaderProps) {
  return (
    <div className="bg-gray-50 rounded-sm border border-slate-200 overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border-b
       border-slate-200 gap-3"
      >
        <div>
          <h1 className="text-lg font-semibold text-gray-800">Client Payments</h1>
          <p className="text-xs text-gray-500">View and manage payments made by clients</p>
        </div>
        <button
          onClick={onExportAction}
          disabled={isExporting}
          className="px-3 py-1.5 bg-blue-500 text-white text-sm rounded-sm 
          hover:bg-blue-600 transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed 
          flex items-center gap-1"
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
      </div>
      <div className="p-4 bg-gray-50 flex flex-col gap-2">
        <div className="relative w-full">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            placeholder="Type to search"
            className="pl-9 pr-20 py-1 h-9 bg-white text-sm border border-slate-200 focus:outline-none 
            text-gray-800 w-full rounded"
            value={searchInput}
            onChange={(e) => setSearchInputAction(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearchAction()}
          />
          {searchInput && (
            <button
              onClick={() => {
                setSearchInputAction("")
                handleResetFiltersAction()
              }}
              className="absolute right-16 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5"
              aria-label="Clear search"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
          <button
            onClick={handleSearchAction}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-500 hover:bg-blue-600 text-white
             px-2.5 py-1 rounded-sm text-xs transition-colors"
          >
            Search
          </button>
        </div>
        <div className="w-full flex items-center gap-2">
          <label htmlFor="dateFilter" className="text-xs text-gray-600">Date:</label>
          <input
            id="dateFilter"
            type="date"
            className="px-2.5 py-1 rounded-sm text-xs font-medium bg-white border border-slate-200 text-gray-800"
            value={dateFilter || ""}
            onChange={e => setDateFilterAction && setDateFilterAction(e.target.value)}
          />
        </div>
      </div>
    </div>
  )
}