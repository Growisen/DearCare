"use client"

import { useQuery, useQueryClient } from "@tanstack/react-query"
import { fetchDashboardData, DashboardData } from "@/app/actions/dashboard/dashboard-actions"

export function useDashboardData({ selectedDate }: { selectedDate?: Date | null } = {}) {
  const queryClient = useQueryClient();

  const queryKey = selectedDate ? ["dashboardData", selectedDate] : ["dashboardData"];

  const queryResult = useQuery<{
    success: boolean;
    data?: DashboardData;
    error?: string;
  }>({
    queryKey,
    queryFn: () => fetchDashboardData({ selectedDate }),
    staleTime: 1000 * 60 * 2,
    refetchOnWindowFocus: true,
    select: (data) => data,
    throwOnError: false,
  });

  const invalidateDashboardCache = () => {
    queryClient.invalidateQueries({ queryKey });
  };

  return {
    ...queryResult,
    invalidateDashboardCache
  };
}