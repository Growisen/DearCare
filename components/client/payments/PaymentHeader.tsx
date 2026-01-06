"use client"

import React from "react"
import { Search, X, Download } from "lucide-react"

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border-b border-slate-200 gap-3">
        <div>
          <h1 className="text-lg font-semibold text-gray-800">Client Payments</h1>
          <p className="text-xs text-gray-500">View and manage payments made by clients</p>
        </div>
        <button
          onClick={onExportAction}
          disabled={isExporting}
          className="px-3 py-1.5 bg-blue-500 text-white text-sm rounded-sm hover:bg-blue-600 transition-colors
           disabled:bg-blue-300 disabled:cursor-not-allowed flex items-center gap-1"
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
      <div className="p-4 bg-gray-50 flex flex-col sm:flex-row gap-2 items-center">
        <div className="relative w-full sm:w-2/3">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            placeholder="Search by client"
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
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-500 hover:bg-blue-600 text-white px-2.5 py-1 rounded text-xs transition-colors"
          >
            Search
          </button>
        </div>
        <div className="w-full sm:w-auto flex items-center gap-2">
          <label htmlFor="dateFilter" className="text-xs text-gray-600">Date:</label>
          <input
            id="dateFilter"
            type="date"
            className="border border-slate-200 rounded px-2 py-1 text-sm focus:outline-none text-gray-700"
            value={dateFilter || ""}
            onChange={e => setDateFilterAction && setDateFilterAction(e.target.value)}
          />
        </div>
      </div>
    </div>
  )
}