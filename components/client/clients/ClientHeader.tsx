import React from "react"

type ClientHeaderProps = {
  onAddClient: () => void
  onExport: () => void
  isExporting: boolean
  selectedStatus: string
}

export function ClientHeader({ onAddClient, onExport, isExporting, selectedStatus }: ClientHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between bg-white p-5 rounded-xl shadow-sm border border-gray-200">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Client Requests</h1>
        <p className="text-sm text-gray-500 mt-1">Manage and review client service requests</p>
      </div>
      <div className="flex gap-3 w-full sm:w-auto">
        <button 
          onClick={onAddClient}
          className="flex-1 sm:flex-none px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
        >
          <span className="text-white">+</span>
          Add Client
        </button>
        <button 
          onClick={onExport}
          disabled={isExporting}
          className="flex-1 sm:flex-none px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 16L12 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M9 13L12 16L15 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M20 16L20 18C20 19.1046 19.1046 20 18 20L6 20C4.89543 20 4 19.1046 4 18L4 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Export {selectedStatus === "all" ? "All" : 
                selectedStatus.charAt(0).toUpperCase() + 
                selectedStatus.slice(1).replace("_", " ")}
            </>
          )}
        </button>
      </div>
    </div>
  )
}