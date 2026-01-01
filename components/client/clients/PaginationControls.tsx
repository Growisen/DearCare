import React, { useMemo } from "react"

type PaginationControlsProps = {
  currentPage: number
  totalPages: number
  totalCount: number
  pageSize: number
  itemsLength: number
  onPageChange: (page: number) => void
  onPreviousPage: () => void
  onNextPage: () => void
  setPageSize?: (size: number) => void
}

export function PaginationControls({
  currentPage,
  totalPages,
  totalCount,
  pageSize,
  setPageSize,
  itemsLength,
  onPageChange,
  onPreviousPage,
  onNextPage
}: PaginationControlsProps) {
  
  const paginationRange = useMemo(() => {
    const range = []
    const showEllipsisStart = currentPage > 3
    const showEllipsisEnd = currentPage < totalPages - 2

    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) {
        range.push(i)
      }
    } else {
      range.push(1)

      if (showEllipsisStart) {
        range.push('...')
      }

      let start = Math.max(2, currentPage - 1)
      let end = Math.min(totalPages - 1, currentPage + 1)

      if (currentPage <= 2) {
        end = 3
      }
      if (currentPage >= totalPages - 1) {
        start = totalPages - 2
      }

      for (let i = start; i <= end; i++) {
        range.push(i)
      }

      if (showEllipsisEnd) {
        range.push('...')
      }

      if (totalPages > 1) {
        range.push(totalPages)
      }
    }
    return range
  }, [currentPage, totalPages])

  return (
    <div className="w-full flex flex-col sm:flex-row justify-between items-center gap-4 px-6 py-4 bg-white border-t border-gray-200">
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <div className="text-sm text-gray-700">
          Showing <span className="font-medium">{itemsLength > 0 ? (currentPage - 1) * pageSize + 1 : 0}</span> to <span className="font-medium">{Math.min(currentPage * pageSize, totalCount)}</span> of <span className="font-medium">{totalCount}</span> results
        </div>
        
        {setPageSize && (
          <div className="flex items-center gap-2">
            <label htmlFor="page-size" className="text-sm text-gray-600">
              Show
            </label>
            <select
              id="page-size"
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="block w-16 pl-2 pr-6 py-1 text-sm text-gray-700 bg-white border border-gray-300 rounded-md focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
            </select>
          </div>
        )}
      </div>
      
      <div className="flex items-center gap-2">
        <button
          onClick={onPreviousPage}
          disabled={currentPage === 1}
          className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M15 18l-6-6 6-6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Previous
        </button>
        
        <div className="hidden sm:flex items-center gap-1">
          {paginationRange.map((page, index) => {
            if (page === '...') {
              return (
                <span key={`ellipsis-${index}`} className="px-2 py-2 text-sm text-gray-500 select-none">
                  ...
                </span>
              )
            }
            
            return (
              <button
                key={index}
                onClick={() => onPageChange(page as number)}
                className={`min-w-[2rem] px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  currentPage === page
                    ? "bg-blue-600 text-white border border-blue-600" 
                    : "text-gray-700 bg-white border border-gray-300 hover:bg-gray-50"
                }`}
              >
                {page}
              </button>
            )
          })}
        </div>
        
        <div className="sm:hidden text-sm font-medium text-gray-700">
          Page {currentPage} of {totalPages}
        </div>
        
        <button
          onClick={onNextPage}
          disabled={currentPage === totalPages}
          className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Next
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M9 18l6-6-6-6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
    </div>
  )
}