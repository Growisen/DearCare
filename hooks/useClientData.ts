"use client"

import { useState, useEffect } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { getUnifiedClients } from "@/app/actions/clients/client-actions"
import { ClientFilters, ClientStatus, ClientCategory } from '@/types/client.types'
import useOrgStore from '@/app/stores/UseOrgStore'

export function useClientData() {
  const queryClient = useQueryClient();
  const { organization } = useOrgStore();
  const [searchInput, setSearchInput] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedStatus, setSelectedStatus] = useState<ClientFilters>("pending")
  const [isStatusLoaded, setIsStatusLoaded] = useState(false)
  const [createdAt, setCreatedAt] = useState<Date | null>(null)

  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)

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

  useEffect(() => {
    if (data?.pagination) {
      setTotalPages(data.pagination.totalPages || 1);
      setTotalCount(data.pagination.totalCount || 0);
    }
  }, [data]);

  const invalidateClientCache = () => {
    queryClient.invalidateQueries({ queryKey: ['clients'] });
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      setSearchQuery(searchInput)
      setCurrentPage(1)
    }, 400)
    return () => clearTimeout(handler)
  }, [searchInput])

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

  const clients = data?.success && data?.clients 
    ? data.clients.map(client => ({
        ...client,
        service: client.service || "Not specified",
        email: client.email || "No email provided",
        phone: client.phone || "No phone provided",
        status: client.status as ClientStatus
      }))
    : [];

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