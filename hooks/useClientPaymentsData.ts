import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchPaymentOverview, PaymentOverview } from "@/app/actions/dashboard/dashboard-actions";

export function usePaymentsData(selectedDate?: Date | null) {
  const queryClient = useQueryClient();
  const dateKey = selectedDate ? selectedDate.toISOString() : null;
  const paymentQueryKey = ["paymentOverview", dateKey];

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

  const invalidatePaymentOverviewCache = () => {
    queryClient.invalidateQueries({ queryKey: paymentQueryKey });
  };

  return { paymentOverview: paymentQuery, invalidatePaymentOverviewCache };
}