import React, { useState } from 'react';
import Image from 'next/image';
import InfoSection from './InfoSection';
import InfoField from './InfoField';
import ImageViewer from '@/components/common/ImageViewer';
import LocationLinkModal from '@/components/common/LocationLinkModal';
import { Json, LabInvestigations, RecorderInfo } from '@/types/client.types'; 
import { MapPin, Phone, Mail, Briefcase, User, Heart, Ruler, Weight, Users } from 'lucide-react';
import { createMapLink } from '../../../utils/mapUtils';
import { formatName } from '@/utils/formatters';
import { updateIndividualClientLocationLink } from '@/app/actions/clients/client-actions';

interface PatientInfoProps {
  patient: {
    _id?: string;
    email: string;
    phoneNumber: string;
    serviceRequired?: string;
    address?: {
      fullAddress: string;
      city: string;
      district: string;
      pincode: string;
      state?: string;
      patientLocationLink: string;
    };
    emergencyContact: {
      name: string;
      relation: string;
      phone: string;
    };
    assessments: Array<{
      guardianOccupation?: string;
      height?: string;
      weight?: string;
      maritalStatus?: string;
      cityTown?: string;
      district?: string;
      pincode?: string;
      state?: string;
      [key: string]: string | undefined | Json | LabInvestigations | RecorderInfo;
    }>;
    requestor: {
      name: string;
      relation: string;
      phone: string;
      email: string;
      profileImage?: string | null;
      emergencyPhone?: string;
      jobDetails?: string;
      address?: {
        fullAddress: string;
        city: string;
        district: string;
        pincode: string;
        state?: string;
        requestorLocationLink: string;
      };
    };
  };
  refetchClientData?: () => void;
}

const PatientInfo: React.FC<PatientInfoProps> = ({ patient, refetchClientData }) => {
  const [isImageViewerOpen, setIsImageViewerOpen] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'patient' | 'requestor' | null>(null);
  
  const [patientMapLink, setPatientMapLink] = useState(
    patient.address?.patientLocationLink
      ? patient.address.patientLocationLink
      : createMapLink(patient.address)
  );

  const [requestorMapLink, setRequestorMapLink] = useState(
    patient.requestor.address?.requestorLocationLink
      ? patient.requestor.address.requestorLocationLink
      : createMapLink(patient.requestor.address)
  );

  const latestAssessment = patient.assessments[0];

  const handleEditLink = (type: 'patient' | 'requestor') => {
    setModalType(type);
    setModalOpen(true);
  };

  const handleSaveLink = async (link: string) => {
    if (modalType === 'patient') {
      setPatientMapLink(link);
      if (patient._id) {
        await updateIndividualClientLocationLink(patient._id, 'patient_location_link', link);
      }
    }
    if (modalType === 'requestor') {
      setRequestorMapLink(link);
      if (patient._id) {
        await updateIndividualClientLocationLink(patient._id, 'requestor_location_link', link);
      }
    }
    setModalOpen(false);
    setModalType(null);
    if (refetchClientData) {
      refetchClientData();
    }
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setModalType(null);
  };

  console.log('PatientInfo component rendered with patient:', patient);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
      <InfoSection title="Personal Information" className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-200">
        <div className="space-y-3">
          <InfoField 
            label="Email" 
            value={patient.email} 
            icon={<Mail className="w-4 h-4 text-blue-500" />} 
          />
          <InfoField 
            label="Phone" 
            value={patient.phoneNumber} 
            icon={<Phone className="w-4 h-4 text-blue-500" />} 
          />
          <div className="p-3 rounded-lg bg-gray-50 border border-gray-100">
            <p className="text-xs font-medium text-gray-500 mb-1 flex items-center">
              <Users className="w-3 h-3 mr-1 text-blue-500" />
              Emergency Contact
            </p>
            <p className="text-sm font-medium text-gray-800">{formatName(patient.emergencyContact.name)}</p>
            <p className="text-xs text-gray-600 flex items-center gap-1 mt-1">
              <span className="text-blue-600">{patient.emergencyContact.relation}</span> • 
              <span className="text-gray-700">{patient.emergencyContact.phone}</span>
            </p>
          </div>
          <InfoField 
            label="Guardian Occupation" 
            value={latestAssessment?.guardianOccupation} 
            icon={<Briefcase className="w-4 h-4 text-blue-500" />} 
          />
        </div>
      </InfoSection>

      <InfoSection title="Patient Address" className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-200">
        <div className="space-y-3">
          <InfoField 
            label="Address" 
            value={patient.address?.fullAddress}
            icon={<MapPin className="w-4 h-4 text-blue-500" />}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <InfoField label="City" value={patient.address?.city} />
            <InfoField label="District" value={patient.address?.district} />
            <InfoField label="State" value={patient.address?.state} />
          </div>
          <InfoField label="Pincode" value={patient.address?.pincode} />
          
          {patient.address && (
            <div className="mt-2 pt-3 border-t border-gray-100 flex items-center gap-3">
              <a 
                href={patientMapLink || '#'} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                View on Google Maps
              </a>
              <button
                type="button"
                className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 border border-blue-200 transition"
                onClick={() => handleEditLink('patient')}
              >
                Edit
              </button>
            </div>
          )}
        </div>
      </InfoSection>


      <InfoSection title="Physical Attributes" className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-200">
        <div className='space-y-3'>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <InfoField 
              label="Height" 
              value={latestAssessment?.height} 
              icon={<Ruler className="w-4 h-4 text-blue-500" />} 
            />
            <InfoField 
              label="Weight" 
              value={latestAssessment?.weight} 
              icon={<Weight className="w-4 h-4 text-blue-500" />} 
            />
          </div>
          <InfoField 
            label="Marital Status" 
            value={latestAssessment?.maritalStatus} 
            icon={<Heart className="w-4 h-4 text-blue-500" />} 
          />
        </div>
      </InfoSection>
      
      <InfoSection title="Requestor Information" className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-200">
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <div 
              className="relative h-14 w-14 rounded-full overflow-hidden border-2 border-gray-100 shadow-sm hover:shadow-md transition-all duration-300"
              onClick={() => patient.requestor.profileImage && setIsImageViewerOpen(true)}
              style={{ cursor: patient.requestor.profileImage ? 'pointer' : 'default' }}
            >
              {patient.requestor.profileImage ? (
                <Image
                  src={patient.requestor.profileImage}
                  alt={formatName(patient.requestor.name)}
                  fill
                  className="object-cover hover:scale-105 transition-transform"
                  sizes="(max-width: 768px) 56px, 56px"
                />
              ) : (
                <div className="h-full w-full bg-gray-200 flex items-center justify-center">
                  <User className="w-6 h-6 text-gray-600" />
                </div>
              )}
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800">{formatName(patient.requestor.name)}</p>
              <p className="text-xs text-blue-600">{patient.requestor.relation}</p>
            </div>
          </div>
          <div className="space-y-3">
            <InfoField 
              label="Phone" 
              value={patient.requestor.phone}
              icon={<Phone className="w-4 h-4 text-blue-500" />}
            />
            <InfoField 
              label="Emergency Phone" 
              value={patient.requestor.emergencyPhone} 
              icon={<Phone className="w-4 h-4 text-red-500" />}
            />
            <InfoField 
              label="Email" 
              value={patient.requestor.email} 
              fallback="Not provided"
              icon={<Mail className="w-4 h-4 text-blue-500" />}
            />
            <InfoField 
              label="Job Details" 
              value={patient.requestor.jobDetails}
              icon={<Briefcase className="w-4 h-4 text-blue-500" />}
            />
          </div>
        </div>
      </InfoSection>

      <InfoSection title="Requestor Address" className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-200">
        <div className="space-y-3">
          <InfoField 
            label="Address" 
            value={patient.requestor.address?.fullAddress}
            icon={<MapPin className="w-4 h-4 text-blue-500" />}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <InfoField label="City" value={patient.requestor.address?.city} />
            <InfoField label="District" value={patient.requestor.address?.district} />
            <InfoField label="State" value={patient.requestor.address?.state} />
          </div>
          <InfoField label="Pincode" value={patient.requestor.address?.pincode} />
          
          {patient.requestor.address && (
            <div className="mt-2 pt-3 border-t border-gray-100 flex items-center gap-3">
              <a 
                href={requestorMapLink || '#'} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                View on Google Maps
              </a>
              <button
                type="button"
                className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 border border-blue-200 transition"
                onClick={() => handleEditLink('requestor')}
              >
                Edit
              </button>
            </div>
          )}
        </div>
      </InfoSection>

      {patient.requestor.profileImage && (
        <ImageViewer
          src={patient.requestor.profileImage}
          alt={formatName(patient.requestor.name)}
          isOpen={isImageViewerOpen}
          onClose={() => setIsImageViewerOpen(false)}
        />
      )}

      <LocationLinkModal
        isOpen={modalOpen}
        initialLink={
          modalType === 'patient'
            ? patientMapLink ?? undefined
            : requestorMapLink ?? undefined
        }
        onClose={handleCloseModal}
        onSave={handleSaveLink}
        title={modalType === 'patient' ? 'Edit Patient Location Link' : 'Edit Requestor Location Link'}
      />
    </div>
  );
};

export default PatientInfo;