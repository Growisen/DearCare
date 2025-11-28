"use client"

import { useState } from "react"
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query"
import { fetchHousemaidRequestsByClientId, updateHousemaidRequest } from "@/app/actions/clients/individual-clients"
import { FormData } from "@/types/homemaid.types"

export function useHousemaidData(clientId: string, shouldFetch: boolean) {
  const queryClient = useQueryClient()
  const [searchInput, setSearchInput] = useState("")
  const [searchQuery, setSearchQuery] = useState("")

  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['housemaidRequests', clientId, searchQuery],
    queryFn: () => fetchHousemaidRequestsByClientId(clientId),
    enabled: !!clientId && shouldFetch,
    staleTime: 1000 * 60 * 2,
    refetchOnWindowFocus: true,
    refetchInterval: 1000 * 60 * 10,
  })

  const editMutation = useMutation({
    mutationFn: (formData: Partial<FormData>) => updateHousemaidRequest(clientId, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['housemaidRequests', clientId] })
    },
  })

  const invalidateHousemaidCache = () => {
    queryClient.invalidateQueries({ queryKey: ['housemaidRequests'] })
  }

  const housemaidRequests = data?.success && data?.data
    ? data.data.filter((req: FormData) =>
        searchQuery
          ? req.serviceType?.toLowerCase().includes(searchQuery.toLowerCase())
          : true
      )
    : []

  const handleSearch = () => {
    setSearchQuery(searchInput)
  }

  return {
    housemaidRequests,
    isLoading,
    error: error ? "An unexpected error occurred" : (data?.success ? null : (data?.error || "Failed to load housemaid requests")),
    searchInput,
    setSearchInput,
    searchQuery,
    setSearchQuery,
    handleSearch,
    refetch,
    invalidateHousemaidCache,
    editHousemaidPreferences: editMutation.mutate,
    editStatus: {
      isLoading: editMutation.isPending,
      isSuccess: editMutation.isSuccess,
      isError: editMutation.isError,
      error: editMutation.error,
    },
  }
}