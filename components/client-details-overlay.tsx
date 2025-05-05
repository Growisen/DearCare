import React, { useEffect, useState } from 'react';
import { X, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { ClientInformation } from './clientInformation';
import { ApprovedContent } from '../components/client/ApprovedContent';
import { UnderReviewContent } from '../components/client/UnderReview';
import { PendingContent } from '../components/client/PendingContent';
import { RejectedContent } from '../components/client/RejectedContent';
import { ClientDetailsProps, StaffRequirement, DetailedClientIndividual, DetailedClientOrganization } from '../types/client.types';
import { getClientDetails, deleteClient } from '../app/actions/client-actions';
import Image from 'next/image';
import toast from 'react-hot-toast';
import ConfirmationModal from '@/components/client/ApprovedContent/ConfirmationModal';

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
  const [rejectionReason, setRejectionReason] = useState('')
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

  useEffect(() => {
    async function fetchClientDetails() {
      if (client.id) {
        setLoading(true);
        const result = await getClientDetails(client.id);
        if (result.success && result.client && result.client.status) {
          setRejectionReason(result.client.rejection_reason)
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

  const handleDeleteClient = async (): Promise<void> => {
    try {
      const result = await deleteClient(client.id);
      if (result.success) {
        toast.success('Client deleted successfully');
        if (onClose) onClose();
        if (onStatusChange) onStatusChange();
      } else {
        toast.error(`Failed to delete client: ${result.error}`);
        setShowDeleteConfirmation(false);
      }
    } catch (error) {
      console.error('Error deleting client:', error);
      toast.error('An error occurred while deleting the client');
      setShowDeleteConfirmation(false);
    }
  };

  // Helper function to determine if the View Profile button should be shown
  const shouldShowProfileButton = () => {
    // Only show if we have detailedClient data AND the status is appropriate
    return detailedClient !== null && 
           (currentClientStatus === "approved" || currentClientStatus === "assigned");
  };

  // Helper function to determine if client is individual type
  const isClientIndividual = () => {
    // We only call this when detailedClient exists (in shouldShowProfileButton)
    if (detailedClient) {
      return detailedClient.client_type === 'individual';
    }
    // Return a default value to prevent undefined
    return false;
  };
  const renderStatusSpecificContent = () => {
    switch (currentClientStatus) {
      case "approved":
      case "assigned":
        return <ApprovedContent />;
      case "under_review":
        return <UnderReviewContent clientId={client.id} clientType={detailedClient?.client_type} onClose={onClose} onStatusChange={handleStatusChange} />;
      case "pending":
        return <PendingContent client={client} onStatusChange={handleStatusChange} />;
      case "rejected":
        return <RejectedContent clientId={client.id} rejectionReason={rejectionReason}/>;
      default:
        return null;
    }
  };


  function ProfileImage({ src, alt, size = "md" }: { src: string | null | undefined; alt: string; size?: "sm" | "md" | "lg" }) {
    const sizeClasses = {
      sm: "w-12 h-12",
      md: "w-16 h-16",
      lg: "w-20 h-20"
    };
    
    const imageSize = size === "sm" ? 48 : size === "md" ? 64 : 80;
    
    return src ? (
      <div className="flex flex-col items-center">
        <div className={`${sizeClasses[size]} rounded-full overflow-hidden bg-gray-100 border border-gray-200`}>
          <Image 
            src={src} 
            alt={alt} 
            width={imageSize}
            height={imageSize}
            className="w-full h-full object-cover" 
            onError={(e) => {
              e.currentTarget.src = "/images/default-avatar.png";
            }}
          />
        </div>
      </div>
    ) : null;
  }

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
          <div>
          {/* Profile Images Section */}
            <div className="flex flex-wrap gap-8 mb-6">
              {detailedClient.details?.patient_profile_pic_url && (
                <div className="flex flex-col items-center">
                  <ProfileImage 
                    src={detailedClient.details.patient_profile_pic_url} 
                    alt="Patient" 
                    size="lg" 
                  />
                  <p className="text-sm font-medium mt-2 text-gray-700">Patient</p>
                  <p className="text-xs text-gray-500">{detailedClient.details?.patient_name}</p>
                </div>
              )}
              
              {detailedClient.details?.requestor_profile_pic_url && (
                <div className="flex flex-col items-center">
                  <ProfileImage 
                    src={detailedClient.details.requestor_profile_pic_url} 
                    alt="Requestor" 
                    size="lg" 
                  />
                  <p className="text-sm font-medium mt-2 text-gray-700">Requestor</p>
                  <p className="text-xs text-gray-500">{detailedClient.details?.requestor_name}</p>
                </div>
              )}
            </div>
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
                        <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{req['staff_type'] || req.staffType}</td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{req.count}</td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{req['shift_type'] || req.shiftType}</td>
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
          <div className="flex items-center gap-3">
            {shouldShowProfileButton() && (
              <Link 
                href={isClientIndividual() ? `/client-profile/${client?.id}` : `/client-profile/organization-client/${client?.id}`} 
                target='_blank'
                className="inline-flex items-center justify-center px-4 py-2 border border-transparent 
                          rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 
                          hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 
                          focus:ring-blue-500 transition-colors"
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-4 w-4 mr-2" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" 
                  />
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" 
                  />
                </svg>
                View Profile
              </Link>
            )}
            {currentClientStatus !== "approved" && currentClientStatus !== "assigned" && (
              <button
                onClick={() => setShowDeleteConfirmation(true)}
                className="p-2 hover:bg-red-100 rounded-lg transition-colors text-red-600"
                title="Delete client"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>
        </div>
        
        <div className="px-6 py-4 space-y-6 overflow-y-auto">
          <ClientInformation client={client} />
          {renderDetailedInformation()}
          {loading ? (
            <div className="p-4 text-gray-700 text-center">Loading status content...</div>
          ) : (
            renderStatusSpecificContent()
          )}
        </div>
      </div>
      {showDeleteConfirmation && (
        <ConfirmationModal
          isOpen={showDeleteConfirmation}
          title="Delete Client"
          message={
            <div>
              <p className="text-red-600 font-medium mb-2">Warning: This action cannot be undone!</p>
              <p className="text-gray-600">
                Are you sure you want to delete this client? All associated data will be permanently removed.
              </p>
            </div>
          }
          onConfirm={handleDeleteClient}
          onCancel={() => setShowDeleteConfirmation(false)}
          confirmText="Delete Client"
          confirmButtonClassName="bg-red-600 hover:bg-red-700"
        />
      )}
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