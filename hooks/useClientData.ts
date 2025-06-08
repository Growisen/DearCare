"use client"

import { useState, useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { getClients } from "@/app/actions/client-actions"
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Client, ClientFilters, ClientStatus } from '@/types/client.types'

export function useClientData() {
  const [searchInput, setSearchInput] = useState("")
  const [selectedStatus, setSelectedStatus] = useState<ClientFilters>("pending")
  const [searchQuery, setSearchQuery] = useState("")
  const [isStatusLoaded, setIsStatusLoaded] = useState(false)

  const [currentPage, setCurrentPage] = useState(1)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [pageSize, setPageSize] = useState(10)

  // Load status from localStorage after initial render
  useEffect(() => {
    const saved = localStorage.getItem('clientsPageStatus');
    if (saved && ["pending", "under_review", "approved", "rejected", "assigned", "all"].includes(saved)) {
      setSelectedStatus(saved as ClientFilters);
    }
    setIsStatusLoaded(true);
  }, []);

  // Use React Query for data fetching with caching
  const { 
    data, 
    isLoading, 
    error, 
    refetch 
  } = useQuery({
    queryKey: ['clients', selectedStatus, searchQuery, currentPage, pageSize],
    queryFn: () => getClients(selectedStatus, searchQuery, currentPage, pageSize),
    enabled: isStatusLoaded,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: true,
    refetchInterval: 1000 * 60 * 10, // 10 minutes
  });

  // Process the data
  const clients = data?.success && data?.clients 
    ? data.clients.map(client => ({
        ...client,
        service: client.service || "Not specified",
        email: client.email || "No email provided",
        phone: client.phone || "No phone provided",
        status: client.status as ClientStatus
      }))
    : [];

  const totalPages = data?.pagination?.totalPages || 1;
  const totalCount = data?.pagination?.totalCount || 0;

  const handleSearch = () => {
    setCurrentPage(1) 
    setSearchQuery(searchInput)
  }

  const handleStatusChange = (status: ClientFilters) => {
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

  const refreshData = () => refetch();

  return {
    clients,
    isLoading,
    error: error ? "An unexpected error occurred" : (data?.success ? null : (data?.error || "Failed to load clients")),
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