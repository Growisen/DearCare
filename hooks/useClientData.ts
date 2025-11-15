"use client"

import { useState, useEffect } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { getUnifiedClients } from "@/app/actions/clients/client-actions"
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Client, ClientFilters, ClientStatus, ClientCategory } from '@/types/client.types'
import useOrgStore from '@/app/stores/UseOrgStore'

export function useClientData() {
  const queryClient = useQueryClient();
  const { organization } = useOrgStore();
  const [searchInput, setSearchInput] = useState("")
  const [selectedStatus, setSelectedStatus] = useState<ClientFilters>("pending")
  const [searchQuery, setSearchQuery] = useState("")
  const [isStatusLoaded, setIsStatusLoaded] = useState(false)
  const [createdAt, setCreatedAt] = useState<Date | null>(null)

  const [currentPage, setCurrentPage] = useState(1)

  const [pageSize, setPageSize] = useState(10)

  const getClientCategory = (): ClientCategory | "all" => {
    if (!organization) return "all";
    if (organization === "TataHomeNursing") return "Tata HomeNursing";
    if (organization === "DearCare") return "DearCare LLP";
    return "all";
  };

  const selectedCategory = getClientCategory();

  useEffect(() => {
    const savedStatus = localStorage.getItem('clientsPageStatus');
    if (savedStatus && ["pending", "under_review", "approved", "rejected", "assigned", "all"].includes(savedStatus)) {
      setSelectedStatus(savedStatus as ClientFilters);
    }
    setIsStatusLoaded(true);
  }, []);

  const { 
    data, 
    isLoading, 
    error, 
    refetch 
  } = useQuery({
    queryKey: ['clients', selectedStatus, searchQuery, currentPage, pageSize, selectedCategory, createdAt],
    queryFn: () => getUnifiedClients(selectedStatus, searchQuery, currentPage, pageSize, createdAt),
    enabled: isStatusLoaded && !!selectedStatus,
    staleTime: 1000 * 60 * 2,
    refetchOnWindowFocus: true,
    refetchInterval: 1000 * 60 * 10,
  });

  const invalidateClientCache = () => {
    queryClient.invalidateQueries({ queryKey: ['clients'] });
  };

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

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize)
    setCurrentPage(1)
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
    isLoading: isLoading || !isStatusLoaded,
    error: error ? "An unexpected error occurred" : (data?.success ? null : (data?.error || "Failed to load clients")),
    searchInput,
    setSearchInput,
    searchQuery,
    setSearchQuery,
    selectedStatus,
    setSelectedStatus,
    selectedCategory,
    handleSearch,
    handleStatusChange,
    currentPage,
    totalPages,
    totalCount,
    pageSize,
    handlePageSizeChange,
    handlePageChange,
    handlePreviousPage,
    handleNextPage,
    refreshData,
    invalidateClientCache,
    createdAt,
    setCreatedAt,
  }
}