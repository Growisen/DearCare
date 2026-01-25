import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchPaymentOverview, PaymentOverview } from "@/app/actions/dashboard/dashboard-actions";

type PaymentFilters = { 
  date?: Date | null; 
  paymentType?: string 
};

export function usePaymentsData(filters: PaymentFilters) {
  const queryClient = useQueryClient();
  
  const paymentQueryKey = ["paymentOverview", filters];

  const paymentQuery = useQuery<{
    success: boolean;
    data?: PaymentOverview;
    error?: string;
  }>({
    queryKey: paymentQueryKey,
    queryFn: () => fetchPaymentOverview({ filters }),
    staleTime: 1000 * 60 * 2,
    refetchOnWindowFocus: true,
  });

  const invalidatePaymentOverviewCache = () => {
    queryClient.invalidateQueries({ queryKey: paymentQueryKey });
  };

  return { 
    paymentOverview: paymentQuery, 
    invalidatePaymentOverviewCache 
  };
}