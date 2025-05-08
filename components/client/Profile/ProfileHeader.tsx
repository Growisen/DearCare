import React from 'react';
import Image from 'next/image';
import CategorySelector from '@/components/client/Profile/CategorySelector';

interface ProfileHeaderProps {
  patient: {
    _id?: string;
    firstName: string;
    lastName: string;
    age: number | string;
    gender: string;
    bloodGroup: string;
    location: string;
    profileImage?: string | null;
    clientCategory: 'DearCare' | 'TataLife';
  };
  status: string | null;
  isEditing: boolean;
  handleEdit: () => void;
  handleSave: () => void;
  handleCancel: () => void;
  handleCategoryChange: (category: 'DearCare' | 'TataLife') => Promise<void>;
  setShowNurseList: (show: boolean) => void;
  onDelete: () => void;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  patient,
  status,
  isEditing,
  handleEdit,
  handleSave,
  handleCancel,
  handleCategoryChange,
  setShowNurseList,
  onDelete
}) => {
  return (
    <div className="bg-gray-100 border-b border-gray-200 px-6 py-4">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-4">
          <div className="flex-shrink-0 order-1 md:order-none">
            <div className="relative h-32 w-32 rounded-full overflow-hidden border-2 border-white shadow-md">
              {patient.profileImage ? (
                <Image 
                  src={patient.profileImage}
                  alt={`${patient.firstName} ${patient.lastName}`}
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 768px) 96px, 128px"
                />
              ) : (
                <div className="h-full w-full bg-gray-200 flex items-center justify-center">
                  <div className="text-center text-gray-600 font-medium text-xl">
                    <div>{patient.firstName[0]}</div>
                    <div>{patient.lastName[0]}</div>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="text-center md:text-left">
            <h1 className="text-2xl font-semibold text-gray-800">
              {patient.firstName} {patient.lastName}
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              {patient.age} years • {patient.gender} • {patient.bloodGroup}
            </p>
            
            <div className="flex flex-wrap items-center justify-center md:justify-start mt-3 gap-2">
              <span className="inline-flex items-center px-3 py-1 bg-gray-100 text-sm rounded text-gray-700 border border-gray-200">
                <svg className="mr-1" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
                {patient.location}
              </span>
              <span className="inline-flex items-center px-3 py-1 bg-gray-100 text-sm rounded text-gray-700 border border-gray-200">
                ID: {patient._id}
              </span>
              <CategorySelector 
                currentCategory={patient.clientCategory}
                onCategoryChange={handleCategoryChange}
              />
            </div>
          </div>
        </div>
        
        {/* Action buttons */}
        <div className="flex items-center space-x-3">
          {!isEditing ? (
            <>
              <button
                onClick={handleEdit}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                Edit Profile
              </button>
              {status === 'approved' && (
                <button
                  onClick={() => setShowNurseList(true)}
                  className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
                >
                  Assign Nurse
                </button>
              )}
              <button
                onClick={onDelete}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
              >
                Delete Client
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleSave}
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
              >
                Save Changes
              </button>
              <button
                onClick={handleCancel}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;