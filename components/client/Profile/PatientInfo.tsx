import React from 'react';
import Image from 'next/image';
import InfoSection from './InfoSection';
import InfoField from './InfoField';
import { Json } from '@/types/client.types'; 

interface PatientInfoProps {
  patient: {
    email: string;
    phoneNumber: string;
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
    };
  };
}

const PatientInfo: React.FC<PatientInfoProps> = ({ patient }) => {
  const latestAssessment = patient.assessments[0];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <InfoSection title="Personal Information">
        <div className="space-y-3">
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

      <InfoSection title="Requestor Information">
        <div className="space-y-4">
          {/* Requestor Profile Image */}
          <div className="flex justify-center">
            <div className="relative h-20 w-20 rounded-full overflow-hidden border-2 border-gray-200">
              {patient.requestor.profileImage ? (
                <Image
                  src={patient.requestor.profileImage}
                  alt={patient.requestor.name}
                  fill
                  className="object-cover"
                  sizes="80px"
                />
              ) : (
                <div className="h-full w-full bg-gray-100 flex items-center justify-center">
                  <span className="text-xl text-gray-500">
                    {patient.requestor.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>
          </div>
          <div className="space-y-3">
            <InfoField label="Name" value={patient.requestor.name} />
            <InfoField label="Relation to Patient" value={patient.requestor.relation} />
            <InfoField label="Phone" value={patient.requestor.phone} />
            <InfoField 
              label="Email" 
              value={patient.requestor.email} 
              fallback="Not provided" 
            />
          </div>
        </div>
      </InfoSection>

      <InfoSection title="Physical Attributes">
        <div className='space-y-3'>
          <InfoField label="Height" value={latestAssessment?.height} />
          <InfoField label="Weight" value={latestAssessment?.weight} />
          <InfoField label="Marital Status" value={latestAssessment?.maritalStatus} />
        </div>
      </InfoSection>

      <InfoSection title="Location Details">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <InfoField label="City/Town" value={latestAssessment?.cityTown} />
          <InfoField label="District" value={latestAssessment?.district} />
          <InfoField label="Pincode" value={latestAssessment?.pincode} />
        </div>
      </InfoSection>
    </div>
  );
};

export default PatientInfo;