"use client"

import { useQuery, useQueryClient } from "@tanstack/react-query"
import { fetchDashboardData, DashboardData } from "@/app/actions/dashboard-actions"

export function useDashboardData() {
  const queryClient = useQueryClient();
  
  const queryResult = useQuery<{
    success: boolean;
    data?: DashboardData;
    error?: string;
  }>({
    queryKey: ["dashboardData"],
    queryFn: fetchDashboardData,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: true,
    refetchInterval: 1000 * 60 * 10,
    select: (data) => data,
    throwOnError: false,
  });

  const invalidateDashboardCache = () => {
    queryClient.invalidateQueries({ queryKey: ["dashboardData"] });
  };

  return {
    ...queryResult,
    invalidateDashboardCache
  };
}