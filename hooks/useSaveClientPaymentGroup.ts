import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { saveClientPaymentGroup, getClientPaymentGroups } from "@/app/actions/clients/client-payment-records";
import { SavePaymentGroupInput } from "@/types/clientPayment.types";

export function useSaveClientPaymentGroup() {
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const saveGroup = async (input: SavePaymentGroupInput) => {
    setIsSaving(true);
    setError(null);
    const result = await saveClientPaymentGroup(input);
    if (!result.success) {
      setError(result.error || "Unknown error");
    }
    setIsSaving(false);
    return result;
  };

  const useFetchGroups = (clientId: string) => {
    return useQuery({
      queryKey: ["clientPaymentGroups", clientId],
      queryFn: async () => {
        try {
          const groups = await getClientPaymentGroups(clientId);
          return groups.records;
        } catch {
          throw new Error("Failed to fetch groups");
        }
      }
    });
  };


  const invalidateGroups = (clientId: string) => {
    queryClient.invalidateQueries({ queryKey: ["clientPaymentGroups", clientId] });
  };

  return { saveGroup, useFetchGroups, invalidateGroups, isSaving, error };
}