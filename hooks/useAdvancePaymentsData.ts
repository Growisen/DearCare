import { useQuery, useQueryClient } from "@tanstack/react-query";
import { 
  fetchAdvancePaymentRecords,
  fetchAdvancePaymentTotals
} from "@/app/actions/staff-management/advance-payments";

export function useAdvancePaymentsData({
  selectedDate,
  page = 1,
  pageSize = 10,
  advancePaymentsSearchTerm = "",
  paymentType,
}: {
  selectedDate?: Date | null;
  page?: number;
  pageSize?: number;
  advancePaymentsSearchTerm?: string;
  paymentType?: string;
} = {}) {
  const queryClient = useQueryClient();
  const dateKey = selectedDate ? selectedDate.toISOString() : null;
  const advancePaymentsQueryKey = ["advancePayments", dateKey, page, pageSize, advancePaymentsSearchTerm, paymentType];
  const advancePaymentsTotalsQueryKey = ["advancePaymentsTotals", dateKey, advancePaymentsSearchTerm, paymentType];

  const advancePaymentsQuery = useQuery({
    queryKey: advancePaymentsQueryKey,
    queryFn: () =>
      fetchAdvancePaymentRecords({
        startDate: selectedDate ? selectedDate.toISOString().slice(0, 10) : undefined,
        page,
        pageSize,
        searchTerm: advancePaymentsSearchTerm,
        paymentType,
      }),
    staleTime: 1000 * 60 * 2,
    refetchOnWindowFocus: true,
    throwOnError: false,
  });

  const advancePaymentsTotalsQuery = useQuery({
    queryKey: advancePaymentsTotalsQueryKey,
    queryFn: () =>
      fetchAdvancePaymentTotals({
        date: selectedDate ? selectedDate.toISOString().slice(0, 10) : undefined,
        searchTerm: advancePaymentsSearchTerm,
        paymentType,
      }),
    staleTime: 1000 * 60 * 2,
    refetchOnWindowFocus: true,
    throwOnError: false,
  });

  const invalidateAdvancePaymentsCache = () => {
    queryClient.invalidateQueries({ queryKey: advancePaymentsQueryKey });
  };

  const invalidateAdvancePaymentsTotalsCache = () => {
    queryClient.invalidateQueries({ queryKey: advancePaymentsTotalsQueryKey });
  };

  const exportAdvancePaymentsCSV = async () => {
    const startDate = selectedDate ? selectedDate.toISOString().slice(0, 10) : undefined;
    const csvData = await fetchAdvancePaymentRecords({
      startDate,
      page,
      pageSize,
      searchTerm: advancePaymentsSearchTerm,
      exportMode: true,
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
    advancePayments: advancePaymentsQuery,
    advancePaymentsTotals: advancePaymentsTotalsQuery,
    invalidateAdvancePaymentsCache,
    invalidateAdvancePaymentsTotalsCache,
    exportAdvancePaymentsCSV,
  };
}