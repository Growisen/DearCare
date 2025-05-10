import React, { useState } from 'react';
import Image from 'next/image';
import CategorySelector from '@/components/client/Profile/CategorySelector';
import ImageViewer from '@/components/common/ImageViewer';

interface ProfileHeaderProps {
  patient: {
    registrationNumber?: string;
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
  isEditing,
  handleEdit,
  handleSave,
  handleCancel,
  handleCategoryChange,
  onDelete
}) => {

  const [isImageViewerOpen, setIsImageViewerOpen] = useState(false);

  return (
    <div className="bg-gray-100 border-b border-gray-200 px-4 sm:px-6 py-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        {/* Left Section: Profile Image and Details */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full md:w-auto">
          {/* Profile Image */}
          <div
            className="relative h-16 w-16 sm:h-20 sm:w-20 rounded-full overflow-hidden border-2 border-gray-200 flex-shrink-0"
            onClick={() => patient.profileImage && setIsImageViewerOpen(true)}
            style={{ cursor: patient.profileImage ? 'pointer' : 'default' }}
          >
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
  
          {/* Profile Details */}
          <div className="mt-2 sm:mt-0">
            <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">
              {patient.firstName} {patient.lastName}
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              {patient.age} years • {patient.gender} • {patient.bloodGroup}
            </p>
  
            {/* Additional Info */}
            <div className="flex flex-wrap items-center justify-center sm:justify-start mt-3 gap-2">
              <span className="inline-flex items-center px-3 py-1 bg-gray-100 text-sm rounded text-gray-700 border border-gray-200">
                <svg
                  className="mr-1"
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
                {patient.location}
              </span>
              <span className="inline-flex items-center px-3 py-1 bg-gray-100 text-sm rounded text-gray-700 border border-gray-200">
                Reg.No: {patient.registrationNumber || "Not Available"}
              </span>
              <CategorySelector
                currentCategory={patient.clientCategory}
                onCategoryChange={handleCategoryChange}
              />
            </div>
          </div>
        </div>
  
        {/* Right Section: Buttons */}
        <div className="flex flex-wrap sm:flex-nowrap gap-2 w-full md:w-auto mt-3 md:mt-0">
          {!isEditing ? (
            <>
              <button
                onClick={handleEdit}
                className="flex-1 sm:flex-none sm:w-auto px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-1"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-10 10a2 2 0 01-1.414.586H4V15a2 2 0 01-.586-1.414l10-10z" />
                  <path
                    fillRule="evenodd"
                    d="M12.293 2.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-12 12a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l12-12z"
                    clipRule="evenodd"
                  />
                </svg>
                Edit Assessment
              </button>

              <button
                onClick={onDelete}
                className="flex-1 sm:flex-none sm:w-auto px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-1"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                Delete Client
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleSave}
                className="flex-1 sm:flex-none sm:w-auto px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 transition-colors flex items-center justify-center"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-1"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                Save Changes
              </button>
              <button
                onClick={handleCancel}
                className="flex-1 sm:flex-none sm:w-auto px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors flex items-center justify-center"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-1"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
                Cancel
              </button>
            </>
          )}
        </div>
      </div>
  
      {/* Image Viewer */}
      {patient.profileImage && (
        <ImageViewer
          src={patient.profileImage}
          alt={`${patient.firstName} ${patient.lastName}`}
          isOpen={isImageViewerOpen}
          onClose={() => setIsImageViewerOpen(false)}
        />
      )}
    </div>
  );
};

export default ProfileHeader;