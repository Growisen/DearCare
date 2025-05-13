import { useState, useEffect } from "react"
import { getClients } from "@/app/actions/client-actions"
import { Client } from '@/types/client.types'

export function useClientData() {
  const [searchInput, setSearchInput] = useState("")
  const [selectedStatus, setSelectedStatus] = useState<"pending" | "under_review" | "approved" | "rejected" | "assigned" | "all">("pending")
  const [searchQuery, setSearchQuery] = useState("")
  const [clients, setClients] = useState<Client[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshTrigger, setRefreshTrigger] = useState(0) 
  const [isStatusLoaded, setIsStatusLoaded] = useState(false)

  const [currentPage, setCurrentPage] = useState(1)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [pageSize, setPageSize] = useState(10)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)

  const handleSearch = () => {
    setCurrentPage(1) 
    setSearchQuery(searchInput)
  }

  const handleStatusChange = (status: "pending" | "under_review" | "approved" | "rejected" | "assigned" | "all") => {
    setCurrentPage(1) 
    setSelectedStatus(status);
    localStorage.setItem('clientsPageStatus', status);
  }

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage)
  }

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1)
    }
  }

  const refreshData = () => setRefreshTrigger(prev => prev + 1)

  // Load status from localStorage after initial render
  useEffect(() => {
    const saved = localStorage.getItem('clientsPageStatus');
    if (saved && ["pending", "under_review", "approved", "rejected", "assigned", "all"].includes(saved)) {
      setSelectedStatus(saved as "pending" | "under_review" | "approved" | "rejected" | "assigned" | "all");
    }
    setIsStatusLoaded(true);
  }, []);

  // Fetch clients when dependencies change
  useEffect(() => {
    if (!isStatusLoaded) return;
    
    async function loadClients() {
      setIsLoading(true)
      setError(null)
      
      try {
        const result = await getClients(selectedStatus, searchQuery, currentPage, pageSize)
        
        if (result.success && result.clients) {
          // Add type assertion to make sure the status is of the correct type
          const typedClients = result.clients.map(client => ({
            ...client,
            service: client.service || "Not specified",
            email: client.email || "No email provided",
            phone: client.phone || "No phone provided",
            location: client.location || "No location specified",
            status: client.status as "pending" | "under_review" | "approved" | "rejected" | "assigned"
          }))
          setClients(typedClients)
          
          // Set pagination data
          if (result.pagination) {
            setTotalPages(result.pagination.totalPages)
            setTotalCount(result.pagination.totalCount)
          }
        } else {
          setError(result.error || "Failed to load clients")
        }
      } catch (err) {
        setError("An unexpected error occurred")
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }

    loadClients()
  }, [selectedStatus, searchQuery, refreshTrigger, isStatusLoaded, currentPage, pageSize])

  return {
    clients,
    isLoading,
    error,
    searchInput,
    setSearchInput,
    searchQuery,
    setSearchQuery,
    selectedStatus,
    setSelectedStatus,
    handleSearch,
    handleStatusChange,
    currentPage,
    totalPages,
    totalCount,
    pageSize,
    handlePageChange,
    handlePreviousPage,
    handleNextPage,
    refreshData
  }
}