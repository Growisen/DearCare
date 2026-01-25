import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchAllRefunds } from "@/app/actions/clients/client-payment-records";

export interface Refund {
  id: string;
  amount: number;
  reason?: string;
  paymentMethod: string;
  paymentType: string;
  createdAt: string;
  refundDate: string;
  clientId: string;
  registrationNumber?: string;
  prevRegistrationNumber?: string;
  clientName?: string;
}

export interface RefundPaymentsFilters {
  createdAt?: Date | null;
  refundDate?: Date | null;
  search?: string;
  paymentType?: string;
  page?: number;
  limit?: number;
  date: Date | null;
}

async function fetchRefunds(filters: RefundPaymentsFilters): Promise<{ refunds: Refund[]; totalCount: number }> {
  const res = await fetchAllRefunds({...filters, createdAt: filters.date, refundDate: filters.date});
  if (!res.success) throw new Error(res.error || "Failed to fetch refunds");
  console.log("Fetched Refund Payments Response:", res.refunds);
  return {
    refunds: (res.refunds || []).map((r: Record<string, unknown>) => ({
      id: r.id as string,
      amount: Number(r.amount),
      reason: r.reason as string | undefined,
      paymentMethod: r.paymentMethod as string,
      paymentType: r.paymentType as string,
      refundDate: r.refundDate as string,
      createdAt: r.createdAt as string,
      clientId: r.clientId as string,
      registrationNumber: r.registrationNumber as string | undefined,
      prevRegistrationNumber: r.prevRegistrationNumber as string | undefined,
      clientName: r.clientName as string | undefined,
    })) as Refund[],
    totalCount: res.total ?? 1,
  };
}

export function useRefunds(filters: RefundPaymentsFilters) {
  const queryClient = useQueryClient();

  console.log("Using useRefunds with filters:", filters);

  const { data, isLoading, error, refetch } = useQuery<{ refunds: Refund[]; totalCount: number }>({
    queryKey: ["refunds", filters],
    queryFn: () => fetchRefunds(filters),
  });

  const invalidateRefunds = () => {
    queryClient.invalidateQueries({ queryKey: ["refunds", filters] });
  };

  return {
    refunds: data?.refunds,
    totalCount: data?.totalCount ?? 1,
    isLoading,
    error,
    refetch,
    invalidateRefunds,
  };
}