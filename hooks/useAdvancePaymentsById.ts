import { useQuery, useQueryClient } from "@tanstack/react-query";
import { 
  fetchAdvancePaymentsById, 
  deleteAdvancePaymentById, 
  approveAdvancePayment,
  createAdvancePayment as createAdvancePaymentAction
} from "@/app/actions/staff-management/advance-payments";

export interface AdvancePayment {
  id: string;
  nurse_id: number;
  date: string;
  amount: number;
  transactionType: "ADVANCE" | "REPAYMENT";
  status: "PENDING" | "APPROVED" | "REJECTED" | "COMPLETED";
  returnType?: "full" | "installments" | null;
  installmentAmount?: number | null;
  paymentMethod?: string | null;
  receiptUrl?: string | null;
  info?: string | null;
  createdAt?: string;
}

export async function fetchAdvances(nurseId: number) {
  const res = await fetchAdvancePaymentsById(nurseId);
  if (!res || !res.data) throw new Error("Failed to fetch advances");
  console.log("Fetched advances data:", res.data);
  return (res.data as Record<string, unknown>[]).map(item => ({
    id: String(item.id),
    nurse_id: Number(item.nurse_id),
    date: String(item.date),
    amount: Number(item.amount),
    transactionType: item.transactionType as "ADVANCE" | "REPAYMENT",
    status: item.status as "PENDING" | "APPROVED" | "REJECTED" | "COMPLETED",
    returnType: item.returnType as "full" | "installments" | '',
    installmentAmount: item.installmentAmount != null ? Number(item.installmentAmount) : null,
    paymentMethod: item.paymentMethod != null ? String(item.paymentMethod) : null,
    receiptUrl: item.receiptUrl != null ? String(item.receiptUrl) : null,
    info: item.info != null ? String(item.info) : null,
    createdAt: item.createdAt != null ? String(item.createdAt) : null,
  })) as AdvancePayment[];
}

export function useAdvancePaymentsById(nurseId: number) {
  const queryClient = useQueryClient();

  const { data, isLoading, error, refetch } = useQuery<AdvancePayment[]>({
    queryKey: ["advancePayments", nurseId],
    queryFn: () => fetchAdvances(nurseId),
    enabled: !!nurseId,
  });

  const invalidateAdvancePayments = () => {
    queryClient.invalidateQueries({ queryKey: ["advancePayments", nurseId] });
  };

  const deleteAdvancePayment = async (paymentId: string) => {
    const result = await deleteAdvancePaymentById(paymentId);
    await refetch();
    return result;
  };

  const approveAdvancePaymentAndSend = async ({
    payment,
    nurseTenantName,
    nurseId,
  }: {
    payment: AdvancePayment;
    nurseTenantName: string;
    nurseId: number;
  }) => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_DAYBOOK_API_URL}/daybook/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nurse_id: String(nurseId),
        amount: payment.amount,
        description: payment.info,
        tenant: nurseTenantName,
        payment_type: "outgoing",
        pay_status: "paid",
      }),
    });

    const result = await response.json();

    if (!result.error) {
      if (!payment.status || payment.status !== "APPROVED") {
        await approveAdvancePayment(payment.id);
      }
      await refetch();
    }
    return result;
  };

  const createAdvancePayment = async (params: Parameters<typeof createAdvancePaymentAction>[0]) => {
    const result = await createAdvancePaymentAction(params);
    await refetch();
    return result;
  };

  return {
    advancePayments: data,
    isLoading,
    error,
    refetch,
    invalidateAdvancePayments,
    deleteAdvancePayment,
    approveAdvancePaymentAndSend,
    createAdvancePayment,
  };
}