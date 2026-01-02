import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchDashboardData, DashboardData } from "@/app/actions/dashboard/dashboard-actions";

export function useDashboardData(selectedDate?: Date | null) {
  const queryClient = useQueryClient();
  const dateKey = selectedDate ? selectedDate.toISOString() : null;
  const dashboardQueryKey = dateKey ? ["dashboardData", dateKey] : ["dashboardData"];

  const dashboardQuery = useQuery<{
    success: boolean;
    data?: DashboardData;
    error?: string;
  }>({
    queryKey: dashboardQueryKey,
    queryFn: () => fetchDashboardData({ selectedDate }),
    staleTime: 1000 * 60 * 2,
    refetchOnWindowFocus: true,
    select: (data) => data,
    throwOnError: false,
  });

  const invalidateDashboardCache = () => {
    queryClient.invalidateQueries({ queryKey: dashboardQueryKey });
  };

  return { dashboard: dashboardQuery, invalidateDashboardCache };
}