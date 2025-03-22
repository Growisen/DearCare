import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { ClientInformation } from './clientInformation';
import { ApprovedContent } from '../components/client/ApprovedContent';
import { UnderReviewContent } from '../components/client/UnderReview';
import { PendingContent } from '../components/client/PendingContent';
import { RejectedContent } from '../components/client/RejectedContent';
import { ClientDetailsProps, StaffRequirement, DetailedClientIndividual, DetailedClientOrganization } from '../types/client.types';
import { getClientDetails } from '../app/actions/client-actions';

type ClientStatus = "pending" | "under_review" | "approved" | "rejected" | "assigned";
type DetailedClient = DetailedClientIndividual | DetailedClientOrganization;

export function ClientDetailsOverlay({ 
  client, 
  onClose,
  onStatusChange 
}: ClientDetailsProps & { onStatusChange?: () => void }) {
  const [detailedClient, setDetailedClient] = useState<DetailedClient | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentClientStatus, setCurrentClientStatus] = useState<ClientStatus>(client.status);

  useEffect(() => {
    async function fetchClientDetails() {
      if (client.id) {
        setLoading(true);
        const result = await getClientDetails(client.id);
        if (result.success && result.client && result.client.status) {
          setDetailedClient(result.client as DetailedClient);
          // Update current status
          setCurrentClientStatus(result.client.status);
        }
        setLoading(false);
      }
    }
    
    fetchClientDetails();
  }, [client.id]);

  // Handle status change by refetching client data
  const handleStatusChange = async (newStatus?: ClientStatus) => {
    if (newStatus) {
      setCurrentClientStatus(newStatus);
    }
  
    if (client.id) {
      setLoading(true);
      const result = await getClientDetails(client.id);
      if (result.success && result.client && result.client.status) {
        setDetailedClient(result.client as DetailedClient);
        setCurrentClientStatus(result.client.status);
        
        // Call the callback to refresh the client list
        if (onStatusChange) {
          onStatusChange();
        }
      }
      setLoading(false);
    }
  };

  const renderStatusSpecificContent = () => {
    switch (currentClientStatus) {
      case "approved":
      case "assigned":
        return <ApprovedContent client={client} />;
      case "under_review":
        return <UnderReviewContent clientId={client.id} onClose={onClose} onStatusChange={handleStatusChange} />;
      case "pending":
        return <PendingContent client={client} onStatusChange={handleStatusChange} />;
      case "rejected":
        return <RejectedContent />;
      default:
        return null;
    }
  };

  const renderDetailedInformation = () => {
    if (loading) {
      return <div className="p-4 text-gray-700 text-center">Loading client details...</div>;
    }
    
    if (!detailedClient) {
      return <div className="p-4 text-center text-gray-700">Could not load detailed information. Try sometime later.</div>;
    }
    
    const isIndividual = detailedClient.client_type === 'individual';
    
    return (
      <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200 mt-6">
        <h3 className="text-base font-semibold text-gray-800 mb-4">
          {isIndividual ? 'Detailed Patient Information' : 'Organization Details'}
        </h3>
        
        {isIndividual ? (
          <div className="grid grid-cols-1 lg:grid-cols-4 md:grid-cols-2 gap-y-4 gap-x-6">
            <DetailItem label="Patient Name" value={detailedClient.details?.patient_name} />
            <DetailItem label="Patient Age" value={detailedClient.details?.patient_age} />
            <DetailItem label="Patient Gender" value={detailedClient.details?.patient_gender} />
            <DetailItem label="Patient Phone" value={detailedClient.details?.patient_phone} />
            <DetailItem label="Requestor Name" value={detailedClient.details?.requestor_name} />
            <DetailItem label="Relation to Patient" value={detailedClient.details?.relation_to_patient} />
            <DetailItem label="Requestor Email" value={detailedClient.details?.requestor_email} />
            <DetailItem label="Requestor Phone" value={detailedClient.details?.requestor_phone} />
            <DetailItem label="Service Required" value={detailedClient.details?.service_required} />
            <DetailItem label="Care Duration" value={detailedClient.details?.care_duration} />
            <DetailItem label="Start Date" value={detailedClient.details?.start_date} />
            <DetailItem label="Complete Address" value={detailedClient.details?.complete_address} />
            <DetailItem label="Preferred Caregiver Gender" value={detailedClient.details?.preferred_caregiver_gender} />
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-6">
              <DetailItem label="Organization Name" value={detailedClient.details?.organization_name} />
              <DetailItem label="Organization Type" value={detailedClient.details?.organization_type} />
              <DetailItem label="Contact Person" value={detailedClient.details?.contact_person_name} />
              <DetailItem label="Contact Role" value={detailedClient.details?.contact_person_role} />
              <DetailItem label="Contact Email" value={detailedClient.details?.contact_email} />
              <DetailItem label="Contact Phone" value={detailedClient.details?.contact_phone} />
              <DetailItem label="Organization Address" value={detailedClient.details?.organization_address} />
              <DetailItem label="Contract Duration" value={detailedClient.details?.contract_duration} />
            </div>
            
            {detailedClient.staffRequirements && detailedClient.staffRequirements.length > 0 && (
              <div className="mt-6">
                <h4 className="text-sm font-semibold text-gray-800 mb-3">Staff Requirements</h4>
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Staff Type</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Count</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Shift Type</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {detailedClient.staffRequirements.map((req: StaffRequirement, index: number) => (
                      <tr key={index}>
                        <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{req.staffType}</td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{req.count}</td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{req.shiftType}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        <div className="mt-4">
          <h4 className="text-sm font-semibold text-gray-800 mb-2">Notes</h4>
          <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-md">
            {detailedClient.general_notes || "No notes provided"}
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl w-full max-w-7xl max-h-[90vh] flex flex-col">
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Request Details</h2>
            <p className="text-sm text-gray-500">ID: {client.id}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>
        
        <div className="px-6 py-4 space-y-6 overflow-y-auto">
          <ClientInformation client={client} />
          {renderDetailedInformation()}
          {renderStatusSpecificContent()}
        </div>
      </div>
    </div>
  );
}

// Helper component for displaying detail items
function DetailItem({ label, value }: { label: string; value: string | number | boolean | null | undefined }) {
  return value ? (
    <div>
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-sm text-gray-800">{value.toString()}</p>
    </div>
  ) : null;
}