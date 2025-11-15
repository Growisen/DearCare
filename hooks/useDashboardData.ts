"use client"

import { useQuery, useQueryClient } from "@tanstack/react-query"
import { 
  fetchDashboardData, 
  DashboardData, 
  fetchPaymentOverview, 
  PaymentOverview 
} from "@/app/actions/dashboard/dashboard-actions"

export function useDashboardData({ selectedDate }: { selectedDate?: Date | null } = {}) {
  const queryClient = useQueryClient();

  const dateKey = selectedDate ? selectedDate.toISOString() : null;

  const dashboardQueryKey = dateKey ? ["dashboardData", dateKey] : ["dashboardData"];
  const paymentQueryKey = ["paymentOverview", dateKey];

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

  const paymentQuery = useQuery<{
    success: boolean;
    data?: PaymentOverview;
    error?: string;
  }>({
    queryKey: paymentQueryKey,
    queryFn: () => fetchPaymentOverview({ selectedDate }),
    staleTime: 1000 * 60 * 2,
    refetchOnWindowFocus: true,
    select: (data) => data,
    throwOnError: false,
  });

  const invalidateDashboardCache = () => {
    queryClient.invalidateQueries({ queryKey: dashboardQueryKey });
  };

  const invalidatePaymentOverviewCache = () => {
    queryClient.invalidateQueries({ queryKey: paymentQueryKey });
  };

  return {
    dashboard: dashboardQuery,
    paymentOverview: paymentQuery,
    invalidateDashboardCache,
    invalidatePaymentOverviewCache
  };
}