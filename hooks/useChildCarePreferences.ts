"use client"

import { useState } from "react"
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query"
import { fetchChildCareRequestsByClientId, updateChildCareRequest } from "@/app/actions/clients/individual-clients"
import { ChildCareFormData } from "@/types/childCare.types"

export function useChildCarePreferences(clientId: string, shouldFetch: boolean) {
  const queryClient = useQueryClient()
  const [searchInput, setSearchInput] = useState("")
  const [searchQuery, setSearchQuery] = useState("")

  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['childCareRequests', clientId, searchQuery],
    queryFn: () => fetchChildCareRequestsByClientId(clientId),
    enabled: !!clientId && shouldFetch,
    staleTime: 1000 * 60 * 2,
    refetchOnWindowFocus: true,
    refetchInterval: 1000 * 60 * 10,
  })

  const editMutation = useMutation({
    mutationFn: (formData: Partial<ChildCareFormData>) => updateChildCareRequest(clientId, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['childCareRequests', clientId] })
    },
  })

  const invalidateChildCareCache = () => {
    queryClient.invalidateQueries({ queryKey: ['childCareRequests'] })
  }

  const childCareRequests = data?.success && data?.data
    ? data.data.filter((req: ChildCareFormData) =>
        searchQuery
          ? req.primaryFocus?.toLowerCase().includes(searchQuery.toLowerCase())
          : true
      )
    : []

  const handleSearch = () => {
    setSearchQuery(searchInput)
  }

  return {
    childCareRequests,
    isLoading,
    error: error ? "An unexpected error occurred" : (data?.success ? null : (data?.error || "Failed to load child care requests")),
    searchInput,
    setSearchInput,
    searchQuery,
    setSearchQuery,
    handleSearch,
    refetch,
    invalidateChildCareCache,
    editChildCarePreferences: editMutation.mutate,
    editStatus: {
      isLoading: editMutation.isPending,
      isSuccess: editMutation.isSuccess,
      isError: editMutation.isError,
      error: editMutation.error,
    },
  }
}