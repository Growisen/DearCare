import { useState, useCallback } from "react"

export function usePagination(initialPage = 1, initialPageSize = 10) {
  const [pagination, setPagination] = useState({ 
    page: initialPage, 
    pageSize: initialPageSize 
  })

  const resetPage = useCallback(() => {
    setPagination(prev => ({ ...prev, page: 1 }))
  }, [])

  const changePageSize = useCallback((newPageSize: number) => {
    setPagination(prev => ({ ...prev, pageSize: newPageSize, page: 1 }))
  }, [])

  const changePage = useCallback((newPage: number, totalPages: number) => {
    const validPage = Math.max(1, Math.min(newPage, totalPages))
    setPagination(prev => ({ ...prev, page: validPage }))
  }, [])

  return {
    page: pagination.page,
    pageSize: pagination.pageSize,
    resetPage,
    changePageSize,
    changePage,
  }
}