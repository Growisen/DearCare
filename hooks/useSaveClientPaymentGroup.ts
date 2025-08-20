import { useState } from "react";
import { saveClientPaymentGroup, getClientPaymentGroups } from "@/app/actions/clients/client-payment-records";

interface LineItemInput {
  fieldName: string;
  amount: number;
}

interface SavePaymentGroupInput {
  clientId: string;
  groupName: string;
  lineItems: LineItemInput[];
  dateAdded: string;
  notes?: string;
  showToClient: boolean;
}


export function useSaveClientPaymentGroup() {
  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  // Fetches all payment groups for a client
  const fetchGroups = async (clientId: string) => {
    setLoading(true);
    setError(null);
    try {
      const groups = await getClientPaymentGroups(clientId);
      setLoading(false);
      return groups.records;
    } catch {
      setError("Failed to fetch groups");
      setLoading(false);
      return [];
    }
  };

  return { saveGroup, fetchGroups, loading, isSaving, error };
}