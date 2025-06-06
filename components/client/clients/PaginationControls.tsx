import React from "react"

type PaginationControlsProps = {
  currentPage: number
  totalPages: number
  totalCount: number
  pageSize: number
  itemsLength: number
  onPageChange: (page: number) => void
  onPreviousPage: () => void
  onNextPage: () => void
}

export function PaginationControls({
  currentPage,
  totalPages,
  totalCount,
  pageSize,
  itemsLength,
  onPageChange,
  onPreviousPage,
  onNextPage
}: PaginationControlsProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 py-5 px-6 border-t border-gray-200 bg-gray-50">
      <div className="text-sm text-gray-600">
        Showing <span className="font-medium">{itemsLength > 0 ? (currentPage - 1) * pageSize + 1 : 0}-
        {Math.min(currentPage * pageSize, totalCount)}</span> of <span className="font-medium">{totalCount}</span>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={onPreviousPage}
          disabled={currentPage === 1}
          className={`rounded-lg border p-2 flex items-center gap-1 ${
            currentPage === 1
              ? "border-gray-200 text-gray-400 cursor-not-allowed"
              : "border-gray-300 text-gray-700 hover:bg-gray-50"
          }`}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M15 18l-6-6 6-6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Previous
        </button>
        <div className="hidden sm:flex items-center gap-1">
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            // Determine which pages to show
            let pageNum;
            if (totalPages <= 5) {
              pageNum = i + 1;
            } else if (currentPage <= 3) {
              pageNum = i + 1;
            } else if (currentPage >= totalPages - 2) {
              pageNum = totalPages - 4 + i;
            } else {
              pageNum = currentPage - 2 + i;
            }
            
            return (
              <button
                key={i}
                onClick={() => onPageChange(pageNum)}
                className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                  currentPage === pageNum
                    ? "bg-blue-600 text-white" 
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                {pageNum}
              </button>
            );
          })}
        </div>
        <div className="sm:hidden text-sm font-medium text-gray-700">
          Page {currentPage} of {totalPages}
        </div>
        <button
          onClick={onNextPage}
          disabled={currentPage === totalPages}
          className={`rounded-lg border p-2 flex items-center gap-1 ${
            currentPage === totalPages
              ? "border-gray-200 text-gray-400 cursor-not-allowed"
              : "border-gray-300 text-gray-700 hover:bg-gray-50"
          }`}
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