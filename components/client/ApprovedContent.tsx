import React, { useEffect, useState } from 'react';
import { ApprovedContentProps } from '../../types/client.types';
import { Nurse } from '@/types/staff.types';

import CareDetailsHeader from './ApprovedContent/CareDetailsHeader';
import PatientAssessment from './PatientAssessment';
import NurseListModal from './ApprovedContent/NurseListModal';
import ConfirmationModal from './ApprovedContent/ConfirmationModal';
import LocationTracker from './ApprovedContent/LocationTracker';

export function ApprovedContent({ client }: ApprovedContentProps) {
  const [showNurseList, setShowNurseList] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedNurse, setSelectedNurse] = useState<Nurse | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

  // Example nurse data (in a real app, this would come from an API)
  const [nurses] = useState([
    {
      _id: "1",
      firstName: "Anjali",
      lastName: "Menon",
      location: "Kochi",
      status: "unassigned" as const,
      email: "anjali.menon@example.com",
      phoneNumber: "123-456-7890",
      gender: "Female",
      dob: "1990-01-01",
      salaryPerHour: 900,
      salaryCap: 1200, 
      hiringDate: "2020-01-01",
      experience: 5,
      rating: 4.5,
      reviews: [
        { id: "r1", text: "Great nurse!", date: "2021-01-01", rating: 5, reviewer: "John Doe" },
        { id: "r2", text: "Very professional.", date: "2021-06-15", rating: 4, reviewer: "Jane Smith" }
      ],
      preferredLocations: ["Kollam", "Palakkad", "Malappuram"]
    },
    {
      _id: "3",
      firstName: "Anjali",
      lastName: "Menon",
      location: "Kochi",
      status: "unassigned" as const,
      email: "anjali.menon@example.com",
      phoneNumber: "123-456-7890",
      gender: "Female",
      dob: "1990-01-01",
      salaryPerHour: 900,
      salaryCap: 1200, 
      hiringDate: "2020-01-01",
      experience: 5,
      rating: 4.5,
      reviews: [
        { id: "r1", text: "Great nurse!", date: "2021-01-01", rating: 5, reviewer: "John Doe" },
        { id: "r2", text: "Very professional.", date: "2021-06-15", rating: 4, reviewer: "Jane Smith" }
      ],
      preferredLocations: ["Kollam", "Palakkad", "Malappuram"]
    },
    {
      _id: "4",
      firstName: "Anjali",
      lastName: "Menon",
      location: "Kochi",
      status: "unassigned" as const,
      email: "anjali.menon@example.com",
      phoneNumber: "123-456-7890",
      gender: "Female",
      dob: "1990-01-01",
      salaryPerHour: 900,
      salaryCap: 1200, 
      hiringDate: "2020-01-01",
      experience: 5,
      rating: 4.5,
      reviews: [
        { id: "r1", text: "Great nurse!", date: "2021-01-01", rating: 5, reviewer: "John Doe" },
        { id: "r2", text: "Very professional.", date: "2021-06-15", rating: 4, reviewer: "Jane Smith" }
      ],
      preferredLocations: ["Kollam", "Palakkad", "Malappuram"]
    },
    {
      _id: "2",
      firstName: "Ravi",
      lastName: "Nair",
      location: "Thiruvananthapuram",
      status: "assigned" as const,
      email: "ravi.nair@example.com",
      phoneNumber: "987-654-3210",
      gender: "Male",
      dob: "1985-05-15",
      salaryPerHour: 800,
      salaryCap: 1000, 
      hiringDate: "2018-05-15",
      experience: 8,
      rating: 4,
      reviews: [
        { id: "r3", text: "Good service.", date: "2020-03-10", rating: 4, reviewer: "Anjali Menon" }
      ],
      preferredLocations: ["Palakkad"]
    }
  ]);

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

  useEffect(() => {
    // console.log(client.)
  })

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