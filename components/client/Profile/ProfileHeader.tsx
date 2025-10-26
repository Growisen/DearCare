import React, { useState } from 'react';
import Image from 'next/image';
import { FiEdit2, FiSave, FiX, FiTrash2, FiEye } from 'react-icons/fi';
import CategorySelector from '@/components/client/Profile/CategorySelector';
import ImageViewer from '@/components/common/ImageViewer';
import { ClientCategory } from '@/types/client.types';
import { formatName } from '@/utils/formatters';

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
    clientCategory: ClientCategory;
  };
  status: string | null;
  isEditing: boolean;
  handleEdit: () => void;
  handleSave: () => void;
  handleCancel: () => void;
  handleCategoryChange: (category: ClientCategory) => Promise<void>;
  setShowNurseList: (show: boolean) => void;
  onDelete: () => void;
  onEditProfile?: () => void;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  patient,
  isEditing,
  handleEdit,
  handleSave,
  handleCancel,
  handleCategoryChange,
  onDelete,
  onEditProfile
}) => {

  const [isImageViewerOpen, setIsImageViewerOpen] = useState(false);

  const getCategoryBorderColor = () => {
    switch (patient.clientCategory) {
      case 'DearCare LLP':
        return 'border-blue-400';
      case 'Tata HomeNursing':
        return 'border-green-400';
      default:
        return 'border-gray-200';
    }
  };

  const borderColor = getCategoryBorderColor();

  return (
    <div className={`bg-gray-100 border-b border-gray-200 px-4 sm:px-6 py-4 ${patient.clientCategory ? `border-l-4 ${borderColor}` : ''}`}>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full md:w-auto">
          <div
            className={`relative h-20 w-20 sm:h-24 sm:w-24 rounded-lg overflow-hidden border-3 border-white shadow-md flex-shrink-0`}
            onClick={() => patient.profileImage && setIsImageViewerOpen(true)}
            style={{ cursor: patient.profileImage ? 'pointer' : 'default' }}
          >
            {patient.profileImage ? (
              <Image
                src={patient.profileImage}
                alt={formatName(`${patient.firstName} ${patient.lastName}`)}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 768px) 96px, 128px"
              />
            ) : (
              <div className="h-full w-full bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center">
                <div className="text-center text-blue-600 font-semibold text-xl">
                  {formatName(patient.firstName[0]) + formatName(patient.lastName[0])}
                </div>
              </div>
            )}
          </div>

          <div className="mt-2 sm:mt-0">
            <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">
              {formatName(`${patient.firstName} ${patient.lastName}`)}
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              {patient.age} years • {patient.gender} • {patient.bloodGroup}
            </p>
            <div className="flex flex-wrap items-center justify-center sm:justify-start mt-3 gap-2">
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

        <div className="flex flex-wrap sm:flex-nowrap gap-2 w-full md:w-auto mt-3 md:mt-0">
          {!isEditing ? (
            <>
              {onEditProfile && (
                <button
                  onClick={onEditProfile}
                  className="flex-1 sm:flex-none sm:w-auto px-4 py-2 text-sm font-medium text-indigo-700 bg-indigo-50/80 backdrop-blur-sm border border-indigo-200 rounded-md hover:bg-indigo-100/80 transition-all flex items-center justify-center shadow-sm"
                >
                  <FiEye className="h-4 w-4 mr-1 text-indigo-600" />
                  Edit Profile
                </button>
              )}
              
              <button
                onClick={handleEdit}
                className="flex-1 sm:flex-none sm:w-auto px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50/80 backdrop-blur-sm border border-blue-200 rounded-md hover:bg-blue-100/80 transition-all flex items-center justify-center shadow-sm"
              >
                <FiEdit2 className="h-4 w-4 mr-1 text-blue-600" />
                Edit Assessment
              </button>

              <button
                onClick={onDelete}
                className="flex-1 sm:flex-none sm:w-auto px-4 py-2 text-sm font-medium text-red-700 bg-red-50/80 backdrop-blur-sm border border-red-200 rounded-md hover:bg-red-100/80 transition-all flex items-center justify-center shadow-sm"
              >
                <FiTrash2 className="h-4 w-4 mr-1 text-red-600" />
                Delete Client
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleSave}
                className="flex-1 sm:flex-none sm:w-auto px-4 py-2 text-sm font-medium text-green-700 bg-green-50/80 backdrop-blur-sm border border-green-200 rounded-md hover:bg-green-100/80 transition-all flex items-center justify-center shadow-sm"
              >
                <FiSave className="h-4 w-4 mr-1 text-green-600" />
                Save Changes
              </button>
              <button
                onClick={handleCancel}
                className="flex-1 sm:flex-none sm:w-auto px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50/80 backdrop-blur-sm border border-gray-200 rounded-md hover:bg-gray-100/80 transition-all flex items-center justify-center shadow-sm"
              >
                <FiX className="h-4 w-4 mr-1 text-gray-600" />
                Cancel
              </button>
            </>
          )}
        </div>
      </div>
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