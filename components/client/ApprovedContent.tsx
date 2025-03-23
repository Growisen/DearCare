import React, { useState } from 'react';
import { ApprovedContentProps } from '../../types/client.types';
import { Nurse } from '@/types/staff.types';

import CareDetailsHeader from './ApprovedContent/CareDetailsHeader';
import PatientAssessment from './PatientAssessment';
import NurseListModal from './ApprovedContent/NurseListModal';
import ConfirmationModal from './ApprovedContent/ConfirmationModal';
import LocationTracker from './ApprovedContent/LocationTracker';
import { nurses_test_data } from '../../test_data/nurses_data'

export function ApprovedContent({ client }: ApprovedContentProps) {
  const [showNurseList, setShowNurseList] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedNurse, setSelectedNurse] = useState<Nurse | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

  // Example nurse data (in a real app, this would come from an API)
  const [nurses] = useState(nurses_test_data);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleAssignNurse = async (nurseId: string) => {
    setShowNurseList(false);
    setShowConfirmation(false);
    // Here you would typically make an API call to update the assignment
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleUnassignNurse = async (nurseId: string) => {
    // Here you would typically make an API call to remove the assignment
  };

  const handleSave = () => {
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset any other edited state if needed
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleAssignFromNurseList = (nurse: Nurse) => {
    setSelectedNurse(nurse);
    setShowConfirmation(true);
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="space-y-4">
        <CareDetailsHeader 
          isEditing={isEditing}
          onAssignNurse={() => setShowNurseList(true)}
          onEdit={() => setIsEditing(true)}
          onSave={handleSave}
          onCancel={handleCancel}
          onEndCare={() => console.log('End care clicked')}
        />
      </div>

      <PatientAssessment 
        clientId={client.id} 
        isEditing={isEditing}
        onSave={() => console.log('Assessment saved')}
      />

      <LocationTracker clientLocation={client.clientLocation} />

      {/* Modals */}
      <NurseListModal 
        isOpen={showNurseList}
        nurses={nurses}
        onClose={() => setShowNurseList(false)}
        onAssignNurse={(nurseId) => {
          const nurse = nurses.find(n => n._id === nurseId);
          if (nurse) {
            setSelectedNurse(nurse);
            setShowConfirmation(true);
          }
        }}
        onViewProfile={() => {}} // This is now handled by the Link in NurseCard
      />

      <ConfirmationModal 
        isOpen={showConfirmation}
        title="Confirm Assignment"
        message={
          <p>
            Are you sure you want to assign <span className="font-medium">
              {selectedNurse?.firstName} {selectedNurse?.lastName}
            </span> to this client?
          </p>
        }
        onConfirm={() => selectedNurse && handleAssignNurse(selectedNurse._id)}
        onCancel={() => setShowConfirmation(false)}
        confirmText="Confirm Assignment"
      />
    </div>
  );
}

export default ApprovedContent;