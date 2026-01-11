import React from "react"
import { Calendar, X } from "lucide-react"

interface DashboardHeaderProps {
  greeting: string
  selectedDate: Date | null
  setSelectedDate: (date: Date | null) => void
  todayFormatted: string
  isLoading?: boolean
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  greeting,
  selectedDate,
  setSelectedDate,
  todayFormatted,
  isLoading = false
}) => (
  <header className="bg-white border border-slate-200 rounded-sm px-6 py-5">
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
      <div className="flex-1">
        {isLoading ? (
          <div className="space-y-2 animate-pulse">
            <div className="h-4 w-32 bg-slate-200 rounded-sm mb-2"></div>
            <div className="h-8 w-48 bg-slate-200 rounded-sm"></div>
            <div className="h-4 w-64 bg-slate-200 rounded-sm mt-2"></div>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2 text-gray-500 text-sm font-medium mb-1">
              <span>{greeting}, Administrator</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              {selectedDate ? "Archive View" : "General Overview"}
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              {selectedDate ? (
                <>
                  Specific metrics for{' '}
                  <span className="font-medium text-slate-700">
                    {selectedDate.toLocaleDateString('en-US', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </span>
                </>
              ) : (
                <>
                  Summary of all activities up to{' '}
                  <span className="font-medium text-slate-700">{todayFormatted}</span>
                </>
              )}
            </p>
          </>
        )}
      </div>

      <div className="flex items-end gap-3">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="date-filter" className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Date Filter
          </label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Calendar
                className={`h-4 w-4 ${selectedDate ? 'text-blue-500' : 'text-gray-400'}`}
                strokeWidth={2}
              />
            </div>
            <input
              id="date-filter"
              type="date"
              disabled={isLoading}
              value={selectedDate ? selectedDate.toISOString().split('T')[0] : ""}
              max={new Date().toISOString().split('T')[0]}
              onChange={(e) => setSelectedDate(e.target.value ? new Date(e.target.value) : null)}
              className={`block w-full pl-10 pr-4 py-2.5 border rounded-sm text-sm focus:outline-none transition-all 
                cursor-pointer disabled:cursor-not-allowed disabled:opacity-70
                ${selectedDate
                  ? 'border-blue-200 bg-blue-50 text-blue-900 font-medium'
                  : 'border-slate-200 text-gray-600 bg-white hover:bg-gray-50'
                }`}
            />
          </div>
        </div>
        
        {selectedDate && (
          <button
            onClick={() => setSelectedDate(null)}
            disabled={isLoading}
            className="h-[42px] px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 text-sm font-medium rounded-sm 
            transition-colors flex items-center gap-2 disabled:opacity-50 disabled:pointer-events-none"
            title="Clear filter and show general overview"
          >
            <span>Reset</span>
            <X className="w-4 h-4" strokeWidth={2} />
          </button>
        )}
      </div>
    </div>
  </header>
)

export default DashboardHeader