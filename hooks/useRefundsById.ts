import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createRefundPayment, fetchRefundPayments, RefundInput } from "@/app/actions/clients/client-payment-records";

export interface Refund {
  amount: number;
  reason?: string;
  paymentMethod: string;
  paymentType: string;
  createdAt: string;
  refundDate: string;
}

async function fetchRefunds(clientId: string): Promise<Refund[]> {
  const res = await fetchRefundPayments(clientId);
  if (!res.success) throw new Error(res.error || "Failed to fetch refunds");
	console.log("Fetched Refund Payments Response:", res.refunds);
  return (res.refunds || []).map((r: Record<string, unknown>) => ({
    amount: Number(r.amount),
    reason: r.reason as string | undefined,
    paymentMethod: r.paymentMethod as string,
    paymentType: r.paymentType as string,
		refundDate: r.refundDate as string,
    createdAt: r.createdAt as string,
  })) as Refund[];
}

export async function addRefund(refund: RefundInput, clientId: string) {
  return await createRefundPayment(refund, clientId);
}

export function useRefundsById(clientId: string) {
  const queryClient = useQueryClient();

  const { data: refunds, isLoading, error, refetch } = useQuery<Refund[]>({
    queryKey: ["refunds", clientId],
    queryFn: () => fetchRefunds(clientId),
  });

  const invalidateRefunds = () => {
    queryClient.invalidateQueries({ queryKey: ["refunds", clientId] });
  };

  return {
    refunds,
    isLoading,
    error,
    refetch,
    invalidateRefunds,
  };
}