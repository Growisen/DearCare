import React from 'react'
import { ArrowLeft, ArrowRight } from 'lucide-react'

type PaginationControlsProps = {
  currentPage: number
  totalPages: number
  totalCount: number
  pageSize: number
  itemsLength: number
  onPageChange: (page: number) => void
  onPageSizeChange: (pageSize: number) => void
}

export function PaginationControls({
  currentPage,
  totalPages,
  totalCount,
  pageSize,
  itemsLength,
  onPageChange,
  onPageSizeChange
}: PaginationControlsProps) {
  return (
    <div className="px-6 py-4 border-t border-slate-200 bg-gray-50 flex flex-col sm:flex-row justify-between items-center gap-4">
      <div className="text-sm text-gray-600 w-full sm:w-auto text-center sm:text-left">
        Showing <span className="font-medium text-gray-900">{itemsLength}</span> of{" "}
        <span className="font-medium text-gray-900">{totalCount}</span> results
      </div>
      
      <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
        <select
          className="w-full sm:w-auto pl-3 pr-8 py-1.5 border border-slate-200 bg-white rounded-sm text-sm text-gray-700 shadow-none focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 transition-all duration-150"
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
        >
          {[5, 10, 25, 50].map(size => (
            <option key={size} value={size} className='text-gray-700'>
              {size} per page
            </option>
          ))}
        </select>
        
        <nav className="relative z-0 inline-flex rounded-sm shadow-none" aria-label="Pagination">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={`relative inline-flex items-center px-3 py-2 rounded-l-md border text-sm font-medium ${
              currentPage === 1 
                ? 'border-slate-200 bg-gray-50 text-gray-300 cursor-not-allowed' 
                : 'border-slate-200 bg-white text-gray-700 hover:bg-gray-50 transition-colors duration-150'
            }`}
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline ml-1">Previous</span>
          </button>
          
          <div className="hidden sm:flex">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum = currentPage - 2 + i;
              
              if (currentPage < 3) {
                pageNum = i + 1;
              } else if (currentPage > totalPages - 2) {
                pageNum = totalPages - 4 + i;
              }
              
              if (pageNum < 1 || pageNum > totalPages) return null;
              
              return (
                <button
                  key={pageNum}
                  onClick={() => onPageChange(pageNum)}
                  className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                    currentPage === pageNum
                      ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                      : 'bg-white border-slate-200 text-gray-700 hover:bg-gray-50 transition-colors duration-150'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>
          
          <div className="sm:hidden border border-slate-200 bg-white px-4 py-2">
            <span className="text-sm font-medium text-gray-700">
              {currentPage} / {totalPages || 1}
            </span>
          </div>
          
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages || totalPages === 0}
            className={`relative inline-flex items-center px-3 py-2 rounded-r-md border text-sm font-medium ${
              currentPage === totalPages || totalPages === 0
                ? 'border-slate-200 bg-gray-50 text-gray-300 cursor-not-allowed'
                : 'border-slate-200 bg-white text-gray-700 hover:bg-gray-50 transition-colors duration-150'
            }`}
          >
            <span className="hidden sm:inline mr-1">Next</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </nav>
      </div>
    </div>
  )
}