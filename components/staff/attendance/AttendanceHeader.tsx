import React from "react"
import { Calendar, Download } from "lucide-react"

type AttendanceHeaderProps = {
  selectedDate: string
  handleDateChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  searchTerm: string
  setSearchTerm: (term: string) => void
  onExport: () => void
  isExporting: boolean
  selectedCategory: string
}

export function AttendanceHeader({
  selectedDate,
  handleDateChange,
  searchTerm,
  setSearchTerm,
  onExport,
  isExporting,
  selectedCategory
}: AttendanceHeaderProps) {

  // Get display name for category (database enum to display format)
  const getCategoryDisplay = (): string => {
    if (!selectedCategory || selectedCategory === "") return "All Organizations";
    if (selectedCategory === "Dearcare_Llp") return "DearCare LLP";
    if (selectedCategory === "Tata_Homenursing") return "Tata HomeNursing";
    return "All Organizations";
  };

  return (
    <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between p-4 border-b border-gray-200">
        <div>
          <h1 className="text-lg font-semibold text-gray-800">Staff Attendance</h1>
          <p className="text-xs text-gray-500 mt-0.5">Track and manage nursing staff attendance records</p>
        </div>
        <div>
          <button 
            onClick={onExport}
            disabled={isExporting}
            className="px-3.5 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 text-sm"
          >
            {isExporting ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-3.5 w-3.5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Exporting...
              </span>
            ) : (
              <>
                <Download size={16} />
                Export Data
              </>
            )}
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-4 p-4 bg-gray-50">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="date"
              value={selectedDate}
              onChange={handleDateChange}
              className="pl-10 pr-4 py-2 bg-white text-gray-800 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 w-full"
            />
          </div>
          
          <div className="relative sm:col-span-2">
            <svg className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" strokeWidth="2" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" strokeLinecap="round" strokeLinejoin="round"></path>
            </svg>
            <input
              type="text"
              placeholder="start typing to search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full bg-white text-sm text-gray-800 placeholder:text-gray-400 border-gray-200 h-10 focus-visible:ring-blue-400 focus-visible:ring-offset-2 shadow-sm rounded-lg border px-4 py-2"
            />
          </div>
        </div>
        
        {/* Organization badge - read only */}
        <div className="mt-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-gray-600 whitespace-nowrap">Organization:</span>
            <div className="px-2.5 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
              {getCategoryDisplay()}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}