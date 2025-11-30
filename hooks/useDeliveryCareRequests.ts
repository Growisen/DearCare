"use client"

import { useState } from "react"
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query"
import { fetchDeliveryCareRequestsByClientId, updateDeliveryCareRequest } from "@/app/actions/clients/individual-clients"
import { DeliveryCareFormData } from "@/types/deliveryCare.types"

export function useDeliveryCareRequests(clientId: string, shouldFetch: boolean) {
  const queryClient = useQueryClient()
  const [searchInput, setSearchInput] = useState("")
  const [searchQuery, setSearchQuery] = useState("")

  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['deliveryCareRequests', clientId, searchQuery],
    queryFn: () => fetchDeliveryCareRequestsByClientId(clientId),
    enabled: !!clientId && shouldFetch,
    staleTime: 1000 * 60 * 2,
    refetchOnWindowFocus: true,
    refetchInterval: 1000 * 60 * 10,
  })

  const editMutation = useMutation({
    mutationFn: (formData: Partial<DeliveryCareFormData>) => updateDeliveryCareRequest(clientId, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deliveryCareRequests', clientId] })
    },
  })

  const invalidateDeliveryCareCache = () => {
    queryClient.invalidateQueries({ queryKey: ['deliveryCareRequests'] })
  }

  const deliveryCareRequests = data?.success && data?.data
    ? data.data.filter((req: DeliveryCareFormData) =>
        searchQuery
          ? req.carePreferred?.toLowerCase().includes(searchQuery.toLowerCase())
          : true
      )
    : []

  const handleSearch = () => {
    setSearchQuery(searchInput)
  }

  return {
    deliveryCareRequests,
    isLoading,
    error: error ? "An unexpected error occurred" : (data?.success ? null : (data?.error || "Failed to load delivery care requests")),
    searchInput,
    setSearchInput,
    searchQuery,
    setSearchQuery,
    handleSearch,
    refetch,
    invalidateDeliveryCareCache,
    editDeliveryCareRequest: editMutation.mutate,
    editStatus: {
      isLoading: editMutation.isPending,
      isSuccess: editMutation.isSuccess,
      isError: editMutation.isError,
      error: editMutation.error,
    },
  }
}