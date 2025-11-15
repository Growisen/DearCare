import React from "react"

interface DashboardHeaderProps {
  greeting: string
  selectedDate: Date | null
  setSelectedDate: (date: Date | null) => void
  todayFormatted: string
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  greeting,
  selectedDate,
  setSelectedDate,
  todayFormatted
}) => (
  <header className="bg-white border border-gray-200 rounded-xl shadow-sm px-6 py-5">
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
      <div className="flex-1">
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
      </div>
      <div className="flex items-end gap-3">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="date-filter" className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Date Filter
          </label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className={`h-4 w-4 ${selectedDate ? 'text-blue-500' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <input 
              id="date-filter"
              type="date" 
              value={selectedDate ? selectedDate.toISOString().split('T')[0] : ""}
              max={new Date().toISOString().split('T')[0]}
              onChange={(e) => setSelectedDate(e.target.value ? new Date(e.target.value) : null)}
              className={`block w-full pl-10 pr-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer
                ${selectedDate 
                  ? 'border-blue-200 bg-blue-50 text-blue-900 font-medium' 
                  : 'border-gray-300 text-gray-600 bg-white hover:bg-gray-50'
                }`}
            />
          </div>
        </div>
        {selectedDate && (
          <button
            onClick={() => setSelectedDate(null)}
            className="h-[42px] px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
            title="Clear filter and show general overview"
          >
            <span>Reset</span>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </div>
  </header>
)

export default DashboardHeader