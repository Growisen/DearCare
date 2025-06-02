import { useState, useEffect } from 'react'
import { getAllNurseAssignments, NurseAssignmentData } from '../app/actions/shift-schedule-actions'

export function useAssignmentData() {
  const [assignments, setAssignments] = useState<NurseAssignmentData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'completed' | 'cancelled'>('all')
  const [searchInput, setSearchInput] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const pageSize = 10
  const [totalCount, setTotalCount] = useState(0)
  const [isExporting, setIsExporting] = useState(false)

  useEffect(() => {
    fetchAssignments()
  }, [filterStatus, searchQuery, currentPage])

  async function fetchAssignments() {
    setLoading(true)
    try {
      // Use the updated server-side pagination API
      const response = await getAllNurseAssignments(
        currentPage,
        pageSize,
        filterStatus,
        searchQuery
      )
      
      if (response.success) {
        setAssignments(response.data || [])
        
        if (response.count !== undefined) {
          setTotalCount(response.count)
          setTotalPages(Math.max(1, Math.ceil(response.count / pageSize)))
        }
        
        // Handle "no results" scenario
        if (response.noResults) {
          setError(`No matches found for "${searchQuery}". Please try a different search term.`)
        } else {
          setError(null)
        }
      } else {
        setError(response.error || 'Failed to load assignments')
        setAssignments([])
      }
    } catch (err) {
      setError('Unexpected error occurred while fetching assignments')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setSearchQuery(searchInput)
    setCurrentPage(1)
  }

  const handleStatusChange = (status: 'all' | 'active' | 'completed' | 'cancelled') => {
    setFilterStatus(status)
    setCurrentPage(1)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handlePreviousPage = () => {
    setCurrentPage(prev => Math.max(1, prev - 1))
  }

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(totalPages, prev + 1))
  }

  const handleResetFilters = () => {
    setSearchInput('')
    setSearchQuery('')
    setFilterStatus('all')
    setCurrentPage(1)
  }

  const refreshData = () => {
    fetchAssignments()
  }

  const handleExport = async () => {
    setIsExporting(true)
    try {
      // Implement export functionality here
      await new Promise(resolve => setTimeout(resolve, 1000))
      console.log('Export assignments with filters:', { filterStatus, searchQuery })
      // Actual export logic would go here
    } catch (error) {
      console.error('Export failed:', error)
    } finally {
      setIsExporting(false)
    }
  }

  return {
    assignments,
    loading,
    error,
    filterStatus,
    searchInput,
    setSearchInput,
    searchQuery,
    currentPage,
    totalPages,
    totalCount,
    pageSize,
    isExporting,
    handleSearch,
    handleStatusChange,
    handlePageChange,
    handlePreviousPage,
    handleNextPage,
    handleResetFilters,
    refreshData,
    handleExport
  }
}