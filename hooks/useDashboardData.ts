"use client"

import { useQuery, useQueryClient } from "@tanstack/react-query"
import { 
  fetchDashboardData, 
  DashboardData, 
  fetchPaymentOverview, 
  PaymentOverview 
} from "@/app/actions/dashboard/dashboard-actions"
import { fetchAdvancePaymentRecords } from "@/app/actions/staff-management/advance-payments"

export function useDashboardData({ 
  selectedDate, 
  page = 1, 
  pageSize = 10,
  advancePaymentsSearchTerm = '',
 }: { 
  selectedDate?: Date | null, 
  page?: number, 
  pageSize?: number, 
  advancePaymentsSearchTerm?: string,
} = {}) {
  const queryClient = useQueryClient();

  const dateKey = selectedDate ? selectedDate.toISOString() : null;

  const dashboardQueryKey = dateKey ? ["dashboardData", dateKey] : ["dashboardData"];
  const paymentQueryKey = ["paymentOverview", dateKey];
  const advancePaymentsQueryKey = ["advancePayments", dateKey, page, pageSize, advancePaymentsSearchTerm];

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

  const advancePaymentsQuery = useQuery({
    queryKey: advancePaymentsQueryKey,
    queryFn: () => fetchAdvancePaymentRecords({ 
      startDate: selectedDate ? selectedDate.toISOString().slice(0, 10) : undefined,
      page,
      pageSize,
      searchTerm: advancePaymentsSearchTerm,
    }),
    staleTime: 1000 * 60 * 2,
    refetchOnWindowFocus: true,
    throwOnError: false,
  });

  const invalidateDashboardCache = () => {
    queryClient.invalidateQueries({ queryKey: dashboardQueryKey });
  };

  const invalidatePaymentOverviewCache = () => {
    queryClient.invalidateQueries({ queryKey: paymentQueryKey });
  };

  const invalidateAdvancePaymentsCache = () => {
    queryClient.invalidateQueries({ queryKey: advancePaymentsQueryKey });
  };

  const exportAdvancePaymentsCSV = async () => {
    const startDate = selectedDate ? selectedDate.toISOString().slice(0, 10) : undefined;
    const csvData = await fetchAdvancePaymentRecords({
      startDate,
      page,
      pageSize,
      searchTerm: advancePaymentsSearchTerm,
      exportMode: true
    });

    const csvString = csvData.data ?? "";
    const blob = new Blob([csvString], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "advance_payments.csv";
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  };

  return {
    dashboard: dashboardQuery,
    paymentOverview: paymentQuery,
    advancePayments: advancePaymentsQuery,
    invalidateDashboardCache,
    invalidatePaymentOverviewCache,
    invalidateAdvancePaymentsCache,
    exportAdvancePaymentsCSV,
  };
}