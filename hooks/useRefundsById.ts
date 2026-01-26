import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createRefundPayment, fetchRefundPayments, RefundInput, approveRefundPayment, editRefundPayment, deleteRefundPayment } from "@/app/actions/clients/client-payment-records";

export interface Refund {
  id: number;
  amount: number;
  reason?: string;
  paymentMethod: string;
  paymentType: string;
  createdAt: string;
  refundDate: string;
  paymentStatus?: string;
  approvedAt?: string;
}

async function fetchRefunds(clientId: string): Promise<Refund[]> {
  const res = await fetchRefundPayments(clientId);
  if (!res.success) throw new Error(res.error || "Failed to fetch refunds");
  console.log("Fetched Refund Payments Response:", res.refunds);
  return (res.refunds || []).map((r: Record<string, unknown>) => ({
    id: Number(r.id),
    amount: Number(r.amount),
    reason: r.reason as string | undefined,
    paymentMethod: r.paymentMethod as string,
    paymentType: r.paymentType as string,
    refundDate: r.refundDate as string,
    createdAt: r.createdAt as string,
    paymentStatus: r.paymentStatus as string,
    approvedAt: r.approvedAt as string | undefined,
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
  
  const approveRefund = async ({
    refundId,
  }: {
    refundId: number;
  }) => {
    const result = await approveRefundPayment({ 
      refundId
    });
    await refetch();
    return result;
  };

  const editRefund = async (refundId: number, data: Partial<RefundInput>) => {
    const result = await editRefundPayment(refundId, data);
    await refetch();
    return result;
  };

  const deleteRefund = async (refundId: number) => {
    const res = await deleteRefundPayment(refundId);
    if (res.success) {
      await refetch();
    }
    return res;
  };

  return {
    refunds,
    isLoading,
    error,
    refetch,
    invalidateRefunds,
    approveRefund,
    editRefund,
    deleteRefund,
  };
}