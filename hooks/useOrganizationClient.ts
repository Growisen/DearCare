import { useState, useEffect } from 'react';
import { getOrganizationClientDetails, getClientStatus } from '@/app/actions/clients/client-actions';
import { ClientCategory } from '@/types/client.types';

// Define interfaces
interface OrganizationClientData {
  id: string;
  client_type: string;
  client_category: ClientCategory;
  status: string;
  created_at: string;
  general_notes?: string;
  details: {
    organization_name: string;
    organization_type: string;
    contact_person_name: string;
    contact_person_role: string;
    contact_email: string;
    contact_phone: string;
    organization_address: string;
    organization_state: string;
    organization_district: string;
    organization_city: string;
    organization_pincode: string;
    start_date?: string;
    registration_number?: string;
  };
  staffRequirements: Array<{
    id: string;
    client_id: string;
    staff_type: string;
    count: number;
    shift_type: string;
  }>;
}

export const useOrganizationClient = (clientId: string) => {
  const [client, setClient] = useState<OrganizationClientData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  
  const fetchClientData = async () => {
    try {
      setLoading(true);
      
      // Get client status
      const statusResult = await getClientStatus(clientId);
      if (statusResult.success) {
        setStatus(statusResult.status);
      }
      
      // Get client details
      const result = await getOrganizationClientDetails(clientId);
      
      if (!result.success) {
        setError(result.error || 'Failed to load organization details');
        return;
      }
      
      setClient(result.client as OrganizationClientData);
      setError(null);
    } catch (err) {
      setError('Failed to load organization details');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    if (clientId) {
      fetchClientData();
    }
  }, [clientId]);

  // Function to update client data
  const updateClientData = (updatedData: Partial<OrganizationClientData>) => {
    if (client) {
      setClient({...client, ...updatedData});
    }
  };

  return {
    client,
    loading,
    error,
    status,
    fetchClientData,
    updateClientData,
    setClient
  };
};