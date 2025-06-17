import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { X, Trash2, Mail, Phone, Briefcase, Calendar, User } from 'lucide-react';
import { ApprovedContent } from '../components/client/ApprovedContent';
import { UnderReviewContent } from '../components/client/UnderReview';
import { PendingContent } from '../components/client/PendingContent';
import { RejectedContent } from '../components/client/RejectedContent';
import { ClientDetailsProps, StaffRequirement, DetailedClientIndividual, DetailedClientOrganization, ClientStatus } from '../types/client.types';
import { getClientDetails, deleteClient } from '../app/actions/client-actions';
import Image from 'next/image';
import { useDashboardData } from '@/hooks/useDashboardData';
import toast from 'react-hot-toast';
import ConfirmationModal from '@/components/client/ApprovedContent/ConfirmationModal';
import { dutyPeriodOptions, serviceOptions } from '../utils/constants';
import { getServiceLabel } from '../utils/formatters';
import ImageViewer from './common/ImageViewer';
import ClientEditForm from './client/ClientEditFormOverlay';

type DetailedClient = DetailedClientIndividual | DetailedClientOrganization;

function ProfileImage({ src, alt, size = "md" }: { src: string | null | undefined; alt: string; size?: "sm" | "md" | "lg" }) {
  const [isImageViewerOpen, setIsImageViewerOpen] = useState(false);
  const sizeClasses = {
    sm: "w-12 h-12",
    md: "w-16 h-16",
    lg: "w-20 h-20"
  };
  
  const imageSize = size === "sm" ? 48 : size === "md" ? 64 : 80;
  
  if (!src) return null;
  
  return (
    <div className="flex flex-col items-center">
      <div 
        className={`${sizeClasses[size]} rounded-full overflow-hidden bg-gray-100 border border-gray-200 cursor-pointer`}
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
  
  return (
    <div className={`bg-gray-50 p-3 rounded-md h-full ${colSpanClasses[columns]}`}>
      <p className="text-xs font-medium text-gray-500">{label}</p>
      <p className={`text-sm ${value === null || value === undefined || value === '' ? 'text-gray-500 italic' : 'text-gray-800'} break-words mt-1`}>
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
  const [detailedClient, setDetailedClient] = useState<DetailedClient | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentClientStatus, setCurrentClientStatus] = useState<ClientStatus>(client.status);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);

  useEffect(() => {
    async function fetchClientDetails() {
      if (!client.id) return;
      
      setLoading(true);
      const result = await getClientDetails(client.id);
      
      if (result.success && result.client && result.client.status) {
        setRejectionReason(result.client.rejection_reason);
        setDetailedClient(result.client as DetailedClient);
        setCurrentClientStatus(result.client.status);
      }
      
      setLoading(false);
    }
    
    fetchClientDetails();
  }, [client.id]);

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
    } catch (error) {
      console.error('Error deleting client:', error);
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

  const renderIndividualDetails = (client: DetailedClientIndividual) => (
    <div className="space-y-6">
      {/* Profile Images Section */}
      {(client.details?.patient_profile_pic_url || client.details?.requestor_profile_pic_url) && (
        <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200">
          <h4 className="text-sm font-semibold text-gray-800 mb-4">Profiles</h4>
          <div className="flex flex-wrap gap-8">
            {client.details?.patient_profile_pic_url && (
              <div className="flex flex-col items-center">
                <ProfileImage 
                  src={client.details.patient_profile_pic_url} 
                  alt="Patient" 
                  size="lg" 
                />
                <p className="text-sm font-medium mt-2 text-gray-700">Patient</p>
                <p className="text-xs text-gray-500">{client.details?.patient_name || 'Unknown'}</p>
              </div>
            )}
            
            {client.details?.requestor_profile_pic_url && (
              <div className="flex flex-col items-center">
                <ProfileImage 
                  src={client.details.requestor_profile_pic_url} 
                  alt="Requestor" 
                  size="lg" 
                />
                <p className="text-sm font-medium mt-2 text-gray-700">Requestor</p>
                <p className="text-xs text-gray-500">{client.details?.requestor_name || 'Unknown'}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Patient Information */}
      <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200">
        <h4 className="text-sm font-semibold text-gray-800 mb-4">Patient Information</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
          <div className="space-y-4">
            <h5 className="text-xs font-medium text-gray-500 uppercase tracking-wider">Personal Details</h5>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <DetailItem label="Name" value={client.details?.patient_name} />
              <DetailItem label="Age" value={client.details?.patient_age} />
              <DetailItem label="Gender" value={client.details?.patient_gender} />
              <DetailItem label="Phone" value={client.details?.patient_phone} />
              <DetailItem label="Preferred Caregiver Gender" value={client.details?.preferred_caregiver_gender} />
            </div>
          </div>
          
          <div className="space-y-4">
            <h5 className="text-xs font-medium text-gray-500 uppercase tracking-wider">Address</h5>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <DetailItem label="Address" value={client.details?.patient_address || client.details?.complete_address} />
              <DetailItem label="City" value={client.details?.patient_city} />
              <DetailItem label="District" value={client.details?.patient_district} />
              <DetailItem label="Pincode" value={client.details?.patient_pincode} />
            </div>
          </div>
        </div>
      </div>

      {/* Requestor Information */}
      <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200">
        <h4 className="text-sm font-semibold text-gray-800 mb-4">Requestor Information</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
          <div className="space-y-4">
            <h5 className="text-xs font-medium text-gray-500 uppercase tracking-wider">Contact Details</h5>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <DetailItem label="Name" value={client.details?.requestor_name} />
              <DetailItem label="Relation to Patient" value={client.details?.relation_to_patient} />
              <DetailItem label="Email" value={client.details?.requestor_email} />
              <DetailItem label="Phone" value={client.details?.requestor_phone} />
              <DetailItem label="Emergency Phone" value={client.details?.requestor_emergency_phone} />
              <DetailItem label="Job Details" value={client.details?.requestor_job_details} />
            </div>
          </div>
          
          {/* Only show if requestor address differs from patient */}
          {(client.details?.requestor_address || client.details?.requestor_city || client.details?.requestor_district) && (
            <div className="space-y-4">
              <h5 className="text-xs font-medium text-gray-500 uppercase tracking-wider">Requestor Address</h5>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <DetailItem label="Address" value={client.details?.requestor_address} />
                <DetailItem label="City" value={client.details?.requestor_city} />
                <DetailItem label="District" value={client.details?.requestor_district} />
                <DetailItem label="Pincode" value={client.details?.requestor_pincode} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Care Details */}
      <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200">
        <h4 className="text-sm font-semibold text-gray-800 mb-4">Care Requirements</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <DetailItem label="Service Required" value={getServiceLabel(serviceOptions, client.details?.service_required || '')} />
          <DetailItem label="Care Duration" value={client.details?.care_duration || 'Not specified'} />
          <DetailItem label="Duty Period" value={getServiceLabel(dutyPeriodOptions, client.duty_period || '')} />
          <DetailItem label="Start Date" value={client.details?.start_date || 'Not specified'} />
          <DetailItem label="Period Reason" value={client.duty_period_reason} columns={3} />
        </div>
      </div>
    </div>
  );

  const renderOrganizationDetails = (client: DetailedClientOrganization) => (
    <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200">
      <h4 className="text-sm font-semibold text-gray-800 mb-4">Organization Information</h4>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8 mb-6">
        <div className="space-y-4">
          <h5 className="text-xs font-medium text-gray-500 uppercase tracking-wider">Organization Details</h5>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <DetailItem label="Organization Name" value={client.details?.organization_name} />
            <DetailItem label="Organization Type" value={client.details?.organization_type} />
            <DetailItem label="Contract Duration" value={client.details?.contract_duration} />
          </div>
        </div>
        
        <div className="space-y-4">
          <h5 className="text-xs font-medium text-gray-500 uppercase tracking-wider">Contact Person</h5>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <DetailItem label="Name" value={client.details?.contact_person_name} />
            <DetailItem label="Role" value={client.details?.contact_person_role} />
            <DetailItem label="Email" value={client.details?.contact_email} />
            <DetailItem label="Phone" value={client.details?.contact_phone} />
          </div>
        </div>
      </div>
      
      {/* Organization Address Section */}
      <div className="mb-6">
        <h5 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">Organization Address</h5>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DetailItem label="Address" value={client.details?.organization_address} />
          <DetailItem label="City" value={client.details?.organization_city} />
          <DetailItem label="District" value={client.details?.organization_district} />
          <DetailItem label="State" value={client.details?.organization_state} />
          <DetailItem label="Pincode" value={client.details?.organization_pincode} />
        </div>
      </div>
      
      {client.staffRequirements && client.staffRequirements.length > 0 && (
        <div>
          <h5 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">Staff Requirements</h5>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-lg">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Staff Type</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Count</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Shift Type</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {client.staffRequirements.map((req: StaffRequirement, index: number) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{req['staff_type'] || req.staffType}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{req.count}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{req['shift_type'] || req.shiftType}</td>
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
    if (loading) {
      return <div className="p-4 text-gray-700 text-center">Loading client details...</div>;
    }
    
    if (!detailedClient) {
      return <div className="p-4 text-center text-gray-700">Could not load detailed information. Try sometime later.</div>;
    }

    if (isEditMode) {
      return (
        <ClientEditForm 
          client={detailedClient}
          onSave={(updatedClient) => {
            setDetailedClient(updatedClient as DetailedClient);
            setIsEditMode(false);
          }}
          onCancel={() => setIsEditMode(false)}
        />
      );
    }
    
    const isIndividual = detailedClient.client_type === 'individual';
    
    return (
      <div className="space-y-6">
        {/* Summary Card */}
        <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">
              {isIndividual ? 'Patient Request' : 'Organization Request'}
            </h3>
            <span className={`px-3 py-1 text-xs font-medium rounded-full ${
              currentClientStatus === 'approved' ? 'bg-green-100 text-green-800' : 
              currentClientStatus === 'under_review' ? 'bg-yellow-100 text-yellow-800' :
              currentClientStatus === 'pending' ? 'bg-blue-100 text-blue-800' :
              currentClientStatus === 'assigned' ? 'bg-purple-100 text-purple-800' :
              'bg-red-100 text-red-800'
            }`}>
              {currentClientStatus.replace('_', ' ').toUpperCase()}
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-50 rounded-full">
                <User className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Name</p>
                <p className="text-sm font-medium text-gray-800">{client.name}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-50 rounded-full">
                <Mail className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Email</p>
                <p className="text-sm font-medium text-gray-800">{client.email}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-50 rounded-full">
                <Phone className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Phone</p>
                <p className="text-sm font-medium text-gray-800">{client.phone || 'Not provided'}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-50 rounded-full">
                <Briefcase className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Service</p>
                <p className="text-sm font-medium text-gray-800">
                  {getServiceLabel(serviceOptions, client.service || 'Not specified')}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-50 rounded-full">
                <Calendar className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Request Date</p>
                <p className="text-sm font-medium text-gray-800">{client.requestDate || 'Not specified'}</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Detailed Information - Different layouts for Individual vs Organization */}
        {isIndividual ? renderIndividualDetails(detailedClient) : renderOrganizationDetails(detailedClient)}

        {/* Notes Section */}
        <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200">
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
          {isEditMode ? (
            <>
              <h2 className="text-xl font-semibold text-gray-900">Edit Client Details</h2>
              <button
                onClick={() => setIsEditMode(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </>
          ) : (
            <>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Request Details</h2>
                <p className="text-sm text-gray-500">Registration Number: {detailedClient?.registration_number || "Not Available"}</p>
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
                  <>
                    <button
                      onClick={toggleEditMode}
                      className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 
                                rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white 
                                hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 
                                focus:ring-blue-500 transition-colors"
                      title="Edit client details"
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
                          d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" 
                        />
                      </svg>
                      Edit
                    </button>
                    
                    <button
                      onClick={() => setShowDeleteConfirmation(true)}
                      className="p-2 hover:bg-red-100 rounded-lg transition-colors text-red-600"
                      title="Delete client"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </>
                )}
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>
            </>
          )}
        </div>
        
        <div className="px-6 py-4 space-y-6 overflow-y-auto">
          {renderDetailedInformation()}
          {!loading && detailedClient && !isEditMode && renderStatusSpecificContent()}
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