import React from 'react';
import { SimplifiedNurseDetails } from '@/app/actions/staff-management/add-nurse';
import PersonalInfoSection from './PersonalInfoSection';
import DocumentsSection from './DocumentsSection';
import ReferencesSection from './ReferencesSection';
import HealthInfoSection from './HealthInfoSection';
import ShiftAttendanceSection from './ShiftAttendanceSection';

interface ProfileContentProps {
  nurse: SimplifiedNurseDetails;
  calculateAge: (dateOfBirth: string | null) => number;
}

const ProfileContent: React.FC<ProfileContentProps> = ({ nurse, calculateAge }) => {
  const basicInfo = nurse.basic;
  const healthInfo = nurse.health;
  const referencesInfo = nurse.references;
  const documentsInfo = nurse.documents;

  return (
    <div className="space-y-6">
      {/* Shift Attendance Section (only for Tata Home Nursing) */}
      {basicInfo.nurse_id && basicInfo.admitted_type && (
        <ShiftAttendanceSection 
          nurseId={basicInfo.nurse_id} 
          admittedType={basicInfo.admitted_type}
        />
      )}
      
      <PersonalInfoSection basicInfo={basicInfo} calculateAge={calculateAge} />
      <DocumentsSection documentsInfo={documentsInfo} />
      <ReferencesSection referencesInfo={referencesInfo} />
      <HealthInfoSection healthInfo={healthInfo} />
    </div>
  );
};

export default ProfileContent;