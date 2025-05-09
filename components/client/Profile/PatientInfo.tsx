import React, { useState } from 'react';
import Image from 'next/image';
import InfoSection from './InfoSection';
import InfoField from './InfoField';
import ImageViewer from '@/components/common/ImageViewer';
import { Json } from '@/types/client.types'; 

interface PatientInfoProps {
  patient: {
    email: string;
    phoneNumber: string;
    serviceRequired?: string;
    address?: {
      fullAddress: string;
      city: string;
      district: string;
      pincode: string;
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
      [key: string]: string | undefined | Json;
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
      };
    };
  };
}

const PatientInfo: React.FC<PatientInfoProps> = ({ patient }) => {

  const [isImageViewerOpen, setIsImageViewerOpen] = useState(false);
  const latestAssessment = patient.assessments[0];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
      <InfoSection title="Personal Information">
        <div className="space-y-2 sm:space-y-3">
          <InfoField label="Email" value={patient.email} />
          <InfoField label="Phone" value={patient.phoneNumber} />
          <div>
            <p className="text-xs text-gray-500 font-medium">Emergency Contact</p>
            <p className="text-sm text-gray-700">{patient.emergencyContact.name}</p>
            <p className="text-xs text-gray-600">
              {patient.emergencyContact.relation} • {patient.emergencyContact.phone}
            </p>
          </div>
          <InfoField 
            label="Guardian Occupation" 
            value={latestAssessment?.guardianOccupation} 
          />
        </div>
      </InfoSection>

      <InfoSection title="Patient Address">
        <div className="space-y-3">
          <InfoField label="Address" value={patient.address?.fullAddress} />
          <div className="grid grid-cols-2 gap-3">
            <InfoField label="City" value={patient.address?.city} />
            <InfoField label="District" value={patient.address?.district} />
          </div>
          <InfoField label="Pincode" value={patient.address?.pincode} />
        </div>
      </InfoSection>

      <InfoSection title="Physical Attributes">
        <div className='space-y-3'>
          <div className="grid grid-cols-2 gap-3">
            <InfoField label="Height" value={latestAssessment?.height} />
            <InfoField label="Weight" value={latestAssessment?.weight} />
          </div>
          <InfoField label="Marital Status" value={latestAssessment?.maritalStatus} />
        </div>
      </InfoSection>
      
      <InfoSection title="Requestor Information">
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <div 
              className="relative h-12 w-12 rounded-full overflow-hidden border-2 border-gray-200"
              onClick={() => patient.requestor.profileImage && setIsImageViewerOpen(true)}
              style={{ cursor: patient.requestor.profileImage ? 'pointer' : 'default' }}
            >
              {patient.requestor.profileImage ? (
                <Image
                  src={patient.requestor.profileImage}
                  alt={patient.requestor.name}
                  fill
                  className="object-cover"
                  sizes="48px"
                />
              ) : (
                <div className="h-full w-full bg-gray-100 flex items-center justify-center">
                  <span className="text-sm text-gray-500">
                    {patient.requestor.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-800">{patient.requestor.name}</p>
              <p className="text-xs text-gray-600">{patient.requestor.relation}</p>
            </div>
          </div>
          <div className="space-y-2">
            <InfoField label="Phone" value={patient.requestor.phone} />
            <InfoField label="Emergency Phone" value={patient.requestor.emergencyPhone} />
            <InfoField label="Email" value={patient.requestor.email} fallback="Not provided" />
            <InfoField label="Job Details" value={patient.requestor.jobDetails} />
          </div>
        </div>
      </InfoSection>

      <InfoSection title="Requestor Address">
        <div className="space-y-3">
          <InfoField label="Address" value={patient.requestor.address?.fullAddress} />
          <div className="grid grid-cols-2 gap-3">
            <InfoField label="City" value={patient.requestor.address?.city} />
            <InfoField label="District" value={patient.requestor.address?.district} />
          </div>
          <InfoField label="Pincode" value={patient.requestor.address?.pincode} />
        </div>
      </InfoSection>
      
      {patient.requestor.profileImage && (
        <ImageViewer
          src={patient.requestor.profileImage}
          alt={patient.requestor.name}
          isOpen={isImageViewerOpen}
          onClose={() => setIsImageViewerOpen(false)}
        />
      )}
    </div>
  );
};

export default PatientInfo;