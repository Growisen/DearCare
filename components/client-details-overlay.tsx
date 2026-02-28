import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { X, Trash2 } from 'lucide-react';
import { ApprovedContent } from '../components/client/ApprovedContent';
import { UnderReviewContent } from '../components/client/UnderReview';
import { PendingContent } from '../components/client/PendingContent';
import { RejectedContent } from '../components/client/RejectedContent';
import { ClientDetailsProps, StaffRequirement, DetailedClientIndividual, DetailedClientOrganization, ClientStatus } from '../types/client.types';
import { getClientDetails, deleteClient } from '@/app/actions/clients/client-actions';
import Image from 'next/image';
import { useDashboardData } from '@/hooks/useDashboardData';
import { useClientData } from '@/hooks/useClientData';
import toast from 'react-hot-toast';
import ConfirmationModal from '@/components/client/ApprovedContent/ConfirmationModal';
import { dutyPeriodOptions, serviceOptions } from '../utils/constants';
import { formatName, getServiceLabel } from '../utils/formatters';
import ImageViewer from './common/ImageViewer';
import ClientEditForm from './client/ClientEditFormOverlay';
import { relationOptions } from '@/utils/constants';
import { getRelationLabel, formatDate } from '@/utils/formatters';
import { calculateAge } from '@/utils/dateUtils';

type DetailedClient = DetailedClientIndividual | DetailedClientOrganization;

function ProfileImage({ src, alt, size = "md" }: { src: string | null | undefined; alt: string; size?: "sm" | "md" | "lg" }) {
  const [isImageViewerOpen, setIsImageViewerOpen] = useState(false);
  const sizeClasses = {
    sm: "w-10 h-10",
    md: "w-14 h-14",
    lg: "w-20 h-20"
  };
  const imageSize = size === "sm" ? 40 : size === "md" ? 56 : 80;
  if (!src) return null;
  return (
    <div className="flex flex-col items-center">
      <div 
        className={`${sizeClasses[size]} rounded-full overflow-hidden bg-gray-50 border border-slate-200 cursor-pointer hover:opacity-90 transition-opacity`}
        onClick={() => setIsImageViewerOpen(true)}
      >
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
      <ImageViewer
        src={src}
        alt={alt}
        isOpen={isImageViewerOpen}
        onClose={() => setIsImageViewerOpen(false)}
      />
    </div>
  );
}

function DetailItem({ 
  label, 
  value, 
  columns = 1 
}: { 
  label: string; 
  value: string | number | boolean | null | undefined;
  columns?: 1 | 2 | 3;
}) {
  const displayValue = value === null || value === undefined || value === '' 
    ? 'Not provided' 
    : value.toString();
  const colSpanClasses = {
    1: '',
    2: 'sm:col-span-2',
    3: 'sm:col-span-3'
  };
  console.log(`DetailItem - ${label}:`, displayValue);
  return (
    <div className={`border-b border-slate-200 pb-2 h-full ${colSpanClasses[columns]}`}>
      <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wide mb-0.5">{label}</p>
      <p className={`text-sm font-medium ${value === null || value === undefined || value === '' ? 'text-gray-300 italic' : 'text-gray-800'} break-words leading-tight`}>
        {displayValue}
      </p>
    </div>
  );
}

export function ClientDetailsOverlay({ 
  client, 
  onClose,
  onStatusChange 
}: ClientDetailsProps & { onStatusChange?: () => void }) {
  const { invalidateDashboardCache } = useDashboardData();
  const { invalidateClientCache } = useClientData()
  const [detailedClient, setDetailedClient] = useState<DetailedClient | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentClientStatus, setCurrentClientStatus] = useState<ClientStatus>(client.status);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  const fetchClientDetails = useCallback(async () => {
    if (!client.id) return;
    setLoading(true);
    const result = await getClientDetails(client.id);
    if (result.success && result.client && result.client.status) {
      setRejectionReason(result.client.rejection_reason);
      setDetailedClient(result.client as DetailedClient);
      setCurrentClientStatus(result.client.status);
    }
    setLoading(false);
  }, [client.id, setLoading, setRejectionReason, setDetailedClient, setCurrentClientStatus]);

  useEffect(() => {
    fetchClientDetails();
  }, [client.id, fetchClientDetails]);

  const handleSaveEdit = async (updatedClient: DetailedClient) => {
    setIsUpdating(true);
    setIsEditMode(false);
    setDetailedClient(updatedClient);
    invalidateClientCache()
    invalidateDashboardCache()
    await fetchClientDetails();
    setIsUpdating(false);
  };

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
        if (onStatusChange) onStatusChange();
      }
      setLoading(false);
    }
  };

  const handleDeleteClient = async () => {
    try {
      const result = await deleteClient(client.id);
      if (result.success) {
        invalidateDashboardCache();
        toast.success('Client deleted successfully');
        if (onClose) onClose();
        if (onStatusChange) onStatusChange();
      } else {
        toast.error(`Failed to delete client: ${result.error}`);
        setShowDeleteConfirmation(false);
      }
    } catch {
      toast.error('An error occurred while deleting the client');
      setShowDeleteConfirmation(false);
    }
  };

  const toggleEditMode = () => setIsEditMode(prev => !prev);

  const shouldShowProfileButton = () => 
    detailedClient !== null && ['approved', 'assigned'].includes(currentClientStatus);
  
  const isClientIndividual = () => 
    detailedClient?.client_type === 'individual';
  
  const renderStatusSpecificContent = () => {
    switch (currentClientStatus) {
      case "approved":
      case "assigned":
        return <ApprovedContent />;
      case "under_review":
        return <UnderReviewContent 
                  clientId={client.id} 
                  clientType={detailedClient?.client_type} 
                  onClose={onClose} 
                  onStatusChange={handleStatusChange} 
               />;
      case "pending":
        return <PendingContent 
                  client={client} 
                  onStatusChange={handleStatusChange} 
               />;
      case "rejected":
        return <RejectedContent 
                  clientId={client.id} 
                  rejectionReason={rejectionReason}
               />;
      default:
        return null;
    }
  };

  const sectionStyles = "p-5 bg-white rounded-sm border border-slate-200 mb-4";
  const sectionHeaderStyles = "text-xs font-semibold text-gray-800 uppercase tracking-wider mb-4 border-b border-gray-50 pb-2";

  const renderIndividualDetails = (client: DetailedClientIndividual) => (
  <div className="space-y-4">
    {(client.details?.patient_profile_pic_url || client.details?.requestor_profile_pic_url) && (
      <div className={sectionStyles}>
        <h4 className={sectionHeaderStyles}>Profiles</h4>
        <div className="flex flex-wrap gap-10">
          {client.details?.patient_profile_pic_url && (
            <div className="flex items-center gap-3">
              <ProfileImage 
                src={client.details.patient_profile_pic_url} 
                alt="Patient" 
                size="md" 
              />
              <div>
                <p className="text-sm font-semibold text-gray-800">Patient</p>
                <p className="text-xs text-gray-500">{formatName(client.details?.patient_name || "") || 'Unknown'}</p>
              </div>
            </div>
          )}
          
          {client.details?.requestor_profile_pic_url && (
            <div className="flex items-center gap-3">
              <ProfileImage 
                src={client.details.requestor_profile_pic_url} 
                alt="Requestor" 
                size="md" 
              />
              <div>
                <p className="text-sm font-semibold text-gray-800">Requestor</p>
                <p className="text-xs text-gray-500">{formatName(client.details?.requestor_name || "") || 'Unknown'}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    )}

    <div className={sectionStyles}>
      <h4 className={sectionHeaderStyles}>Requestor Information</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
        <div className="space-y-4">
          <h5 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Contact Details</h5>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
            <DetailItem label="Name" value={formatName(client.details?.requestor_name || "")} />
            <DetailItem label="Relation" value={getRelationLabel(relationOptions, client.details?.relation_to_patient || '')} />
            <DetailItem label="Email" value={client.details?.requestor_email} />
            <DetailItem label="Phone" value={client.details?.requestor_phone} />
            <DetailItem label="Emergency Phone" value={client.details?.requestor_emergency_phone} />
            <DetailItem label="Job Details" value={client.details?.requestor_job_details} />
          </div>
        </div>
        
        {(client.details?.requestor_address || client.details?.requestor_city || client.details?.requestor_district) && (
          <div className="space-y-4">
            <h5 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Address</h5>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
              <DetailItem label="Address" value={client.details?.requestor_address} />
              <DetailItem label="City" value={client.details?.requestor_city} />
              <DetailItem label="District" value={client.details?.requestor_district} />
              <DetailItem label="State" value={client.details?.requestor_state} />
              <DetailItem label="Pincode" value={client.details?.requestor_pincode} />
            </div>
          </div>
        )}
      </div>
    </div>

    <div className={sectionStyles}>
      <h4 className={sectionHeaderStyles}>Care Requirements</h4>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4">
        <DetailItem label="Service Required" value={getServiceLabel(serviceOptions, client.details?.service_required || '')} />
        <DetailItem label="Duty Period" value={getServiceLabel(dutyPeriodOptions, client.duty_period || '')} />
        <DetailItem label="Preferred Gender" value={client.details?.preferred_caregiver_gender} />
        <DetailItem label="Expected Start Date" value={formatDate(client.details?.start_date || '') || 'Not specified'} />
        <DetailItem label="Period Reason" value={client.duty_period_reason} columns={3} />
      </div>
    </div>

    {client.housemaidRequests && (
      <div className={sectionStyles}>
        <h4 className={sectionHeaderStyles}>Housemaid Requirements</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
          <div className="space-y-4">
            <h5 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Service Details</h5>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
              <DetailItem label="Service Type" value={client.housemaidRequests.serviceType === 'other' ? client.housemaidRequests.serviceTypeOther : client.housemaidRequests.serviceType} />
              <DetailItem label="Frequency" value={client.housemaidRequests.frequency} />
              <DetailItem label="Start Date" value={formatDate(client.housemaidRequests.startDate || '')} />
              <DetailItem label="Schedule" value={client.housemaidRequests.preferredSchedule} />
              <DetailItem label="Home Type" value={client.housemaidRequests.homeType} />
              <DetailItem label="Household Size" value={client.housemaidRequests.householdSize?.toString()} />
            </div>
          </div>

          <div className="space-y-4">
            <h5 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Environment & Specifics</h5>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
              <DetailItem label="Bedrooms/Baths" value={`${client.housemaidRequests.bedrooms} BHK / ${client.housemaidRequests.bathrooms} Bath`} />
              <DetailItem label="Has Pets" value={client.housemaidRequests.hasPets ? `Yes (${client.housemaidRequests.petDetails})` : 'No'} />
              <DetailItem label="Allergies" value={client.housemaidRequests.allergies || 'None'} />
              <DetailItem label="Restricted Areas" value={client.housemaidRequests.restrictedAreas || 'None'} />
            </div>
          </div>
        </div>
        
        <div className="mt-6 grid grid-cols-1 gap-y-4 border-t border-gray-50 pt-4">
          <DetailItem label="Meal Prep Details" value={client.housemaidRequests.mealPrepDetails} columns={3} />
          <DetailItem label="Childcare Details" value={client.housemaidRequests.childcareDetails} columns={3} />
          <DetailItem label="Special Instructions" value={client.housemaidRequests.specialInstructions} columns={3} />
        </div>
      </div>
    )}

    {(
      client.details?.patient_name ||
      client.details?.patient_age ||
      client.details?.patient_gender ||
      client.details?.patient_phone ||
      client.details?.patient_address ||
      client.details?.complete_address ||
      client.details?.patient_city ||
      client.details?.patient_district ||
      client.details?.patient_state ||
      client.details?.patient_pincode
    ) && (
      <div className={sectionStyles}>
        <h4 className={sectionHeaderStyles}>Patient Information</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
          <div className="space-y-4">
            <h5 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Personal Details</h5>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
              <DetailItem label="Name" value={formatName(client.details?.patient_name || "")} />
              <DetailItem label="Date of Birth" value={formatDate(client.details?.patient_dob || "")} />
              <DetailItem label="Age" value={calculateAge(client.details?.patient_dob || '')} />
              <DetailItem label="Gender" value={client.details?.patient_gender} />
              <DetailItem label="Phone" value={client.details?.patient_phone} />
            </div>
          </div>
          
          <div className="space-y-4">
            <h5 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Address</h5>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
              <DetailItem label="Address" value={client.details?.patient_address || client.details?.complete_address} />
              <DetailItem label="City" value={client.details?.patient_city} />
              <DetailItem label="District" value={client.details?.patient_district} />
              <DetailItem label="State" value={client.details?.patient_state} />
              <DetailItem label="Pincode" value={client.details?.patient_pincode} />
            </div>
          </div>
        </div>
      </div>
    )}
  </div>
);

  const renderOrganizationDetails = (client: DetailedClientOrganization) => (
    <div className={sectionStyles}>
      <h4 className={sectionHeaderStyles}>Organization Information</h4>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12 mb-6">
        <div className="space-y-4">
          <h5 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Organization Details</h5>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
            <DetailItem label="Organization Name" value={formatName(client.details?.organization_name || "")} />
            <DetailItem label="Organization Type" value={client.details?.organization_type} />
            <DetailItem label="Contract Duration" value={client.details?.contract_duration} />
          </div>
        </div>
        
        <div className="space-y-4">
          <h5 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Contact Person</h5>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
            <DetailItem label="Name" value={formatName(client.details?.contact_person_name || "")} />
            <DetailItem label="Role" value={client.details?.contact_person_role} />
            <DetailItem label="Email" value={client.details?.contact_email} />
            <DetailItem label="Phone" value={client.details?.contact_phone} />
          </div>
        </div>
      </div>
      
      <div className="mb-6">
        <h5 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">Organization Address</h5>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4">
          <DetailItem label="Address" value={client.details?.organization_address} />
          <DetailItem label="City" value={client.details?.organization_city} />
          <DetailItem label="District" value={client.details?.organization_district} />
          <DetailItem label="State" value={client.details?.organization_state} />
          <DetailItem label="Pincode" value={client.details?.organization_pincode} />
        </div>
      </div>
      
      {client.staffRequirements && client.staffRequirements.length > 0 && (
        <div>
          <h5 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">Staff Requirements</h5>
          <div className="overflow-x-auto border border-slate-200 rounded-sm">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider">Staff Type</th>
                  <th className="px-4 py-2 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider">Count</th>
                  <th className="px-4 py-2 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider">Shift Type</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {client.staffRequirements.map((req: StaffRequirement, index: number) => (
                  <tr key={index} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">{req['staff_type'] || req.staffType}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">{req.count}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">{req['shift_type'] || req.shiftType}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );

  const renderDetailedInformation = () => {
    if (loading || isUpdating) {
      return (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-slate-200 border-t-blue-600"></div>
          <p className="text-xs text-gray-500 mt-3 font-medium uppercase tracking-wide">
            {isUpdating ? 'Updating info...' : 'Loading details...'}
          </p>
        </div>
      );
    }
    if (!detailedClient) {
      return <div className="p-4 text-center text-sm text-gray-500">Could not load detailed information. Try sometime later.</div>;
    }
    if (isEditMode) {
      return (
        <ClientEditForm 
          client={detailedClient}
          onSave={handleSaveEdit}
          onCancel={() => setIsEditMode(false)}
        />
      );
    }
    const isIndividual = detailedClient.client_type === 'individual';
    return (
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between mb-2 gap-2">
          <div>
            {detailedClient?.client_category && (
              <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-sm border ${
                detailedClient.client_category === 'DearCare LLP' 
                  ? 'bg-blue-50 text-blue-700 border-blue-100' 
                  : 'bg-green-50 text-green-700 border-green-100'
              }`}>
                {detailedClient.client_category}
              </span>
            )}
          </div>
          <div>
            <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-sm border ${
              currentClientStatus === 'approved' ? 'bg-green-50 text-green-700 border-green-100' : 
              currentClientStatus === 'under_review' ? 'bg-yellow-50 text-yellow-700 border-yellow-100' :
              currentClientStatus === 'pending' ? 'bg-blue-50 text-blue-700 border-blue-100' :
              currentClientStatus === 'assigned' ? 'bg-purple-50 text-purple-700 border-purple-100' :
              'bg-red-50 text-red-700 border-red-100'
            }`}>
              {currentClientStatus.replace('_', ' ')}
            </span>
          </div>
        </div>
        
        {isIndividual ? renderIndividualDetails(detailedClient) : renderOrganizationDetails(detailedClient)}
        
        <div className={sectionStyles}>
          <h4 className={sectionHeaderStyles}>Notes</h4>
          <p className="text-sm text-gray-700 leading-relaxed bg-gray-50 p-3 rounded-sm border border-slate-200">
            {detailedClient.general_notes || "No notes provided"}
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-5xl max-h-[90vh] flex flex-col rounded-sm shadow-xl border border-slate-200">
        <div className="sticky top-0 z-10 bg-white border-b border-slate-200 px-5 py-3 flex items-center justify-between rounded-t-sm shrink-0">
          {isEditMode ? (
            <>
              <div className="flex-1">
                <h2 className="text-base font-semibold text-gray-800">Edit Client Details</h2>
              </div>
              <button
                onClick={() => setIsEditMode(false)}
                className="p-1.5 hover:bg-gray-50 rounded-sm transition-colors text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </>
          ) : (
            <>
              <div className="flex-1">
                <h2 className="text-base font-semibold text-gray-800">Request Details</h2>
                <div className="flex gap-4 mt-1 text-xs text-gray-500">
                  <p><span className="font-medium text-gray-600">Reg No:</span> {detailedClient?.registration_number || "N/A"}</p>
                  {detailedClient?.prev_registration_number && (
                    <p>
                      <span className="font-medium text-gray-600">Old Reg No:</span> {detailedClient.prev_registration_number}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {shouldShowProfileButton() && (
                  <Link 
                    href={isClientIndividual() ? `/client-profile/${client?.id}` : `/client-profile/organization-client/${client?.id}`} 
                    target='_blank'
                    prefetch={false}
                    className="inline-flex items-center justify-center px-3 py-1.5 border border-transparent 
                              rounded-sm text-xs font-medium text-white bg-blue-600 
                              hover:bg-blue-700 transition-colors shadow-none"
                  >
                    View Profile
                  </Link>
                )}
                {currentClientStatus !== "approved" && currentClientStatus !== "assigned" && (
                  <>
                    <button
                      onClick={toggleEditMode}
                      className="inline-flex items-center justify-center px-3 py-1.5 border border-slate-200 
                                rounded-sm text-xs font-medium text-gray-700 bg-white 
                                hover:bg-gray-50 hover:text-gray-900 transition-colors"
                      title="Edit client details"
                    >
                      Edit
                    </button>
                    
                    <button
                      onClick={() => setShowDeleteConfirmation(true)}
                      className="p-1.5 hover:bg-red-50 rounded-sm transition-colors text-gray-400 hover:text-red-600"
                      title="Delete client"
                    >
                      <Trash2 size={18} />
                    </button>
                  </>
                )}
                <button
                  onClick={onClose}
                  className="p-1.5 hover:bg-gray-50 rounded-sm transition-colors text-gray-400 hover:text-gray-600 ml-2"
                >
                  <X size={20} />
                </button>
              </div>
            </>
          )}
        </div>
        
        <div className="px-6 py-6 overflow-y-auto bg-gray-50/50 flex-1">
          {renderDetailedInformation()}
          {!loading && detailedClient && !isEditMode && (
            <div className="mt-6 border-t border-slate-200 pt-6">
              {renderStatusSpecificContent()}
            </div>
          )}
        </div>
      </div>
      
      {showDeleteConfirmation && (
        <ConfirmationModal
          isOpen={showDeleteConfirmation}
          title="Delete Client"
          message={
            <div>
              <p className="text-red-600 font-medium mb-2 text-sm">Warning: This action cannot be undone!</p>
              <p className="text-gray-600 text-sm">
                Are you sure you want to delete this client? All associated data will be permanently removed.
              </p>
            </div>
          }
          onConfirm={handleDeleteClient}
          onCancel={() => setShowDeleteConfirmation(false)}
          confirmText="Delete Client"
          confirmButtonClassName="bg-red-600 hover:bg-red-700 rounded-sm text-sm"
        />
      )}
    </div>
  );
}