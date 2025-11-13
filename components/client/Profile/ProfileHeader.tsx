import React, { useState } from 'react';
import Image from 'next/image';
import { FiEdit2, FiSave, FiX, FiTrash2, FiEye, FiCalendar, FiClock } from 'react-icons/fi';
import CategorySelector from '@/components/client/Profile/CategorySelector';
import ImageViewer from '@/components/common/ImageViewer';
import EditCreatedAtModal from '@/components/client/Profile/EditCreatedAtModal';
import { ClientCategory } from '@/types/client.types';
import { formatName } from '@/utils/formatters';
import { getExperienceFromJoiningDate, formatDateToDDMMYYYY } from '@/utils/dateUtils';
import { updateClientCreatedAt } from '@/app/actions/clients/client-core';

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
    createdAt?: string;
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
  const [isEditDateOpen, setIsEditDateOpen] = useState(false);
  const [createdAt, setCreatedAt] = useState(patient.createdAt || '');

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

  const formattedCreatedAt = createdAt
    ? new Date(createdAt).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : null;

  const isNewClient = createdAt
    ? (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24) < 7
    : false;

  const daysSinceJoined = createdAt
    ? getExperienceFromJoiningDate(formatDateToDDMMYYYY(createdAt))
    : null;

  const handleSaveCreatedAt = async (newDate: string) => {
    if (patient._id) {
      const result = await updateClientCreatedAt(patient._id, newDate);
      if (result?.success) {
        setCreatedAt(newDate);
        return true;
      }
      return false;
    }
    return false;
  };

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

          <div className="mt-2 sm:mt-0 space-y-2">
            <div>
              <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">
                {formatName(`${patient.firstName} ${patient.lastName}`)}
              </h1>
              {isNewClient && (
                <span className="inline-block mt-1 px-2 py-0.5 bg-green-100 text-green-700
                 text-xs rounded-full font-semibold border border-green-300">
                  ✨ New Client
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
              <div className="flex items-center gap-1.5">
                <span className="text-gray-500 font-medium">Age:</span>
                <span className="text-gray-900">{patient.age} years</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-gray-500 font-medium">Gender:</span>
                <span className="text-gray-900">{patient.gender}</span>
              </div>
              {/* <div className="flex items-center gap-1.5">
                <span className="text-gray-500 font-medium">Blood Group:</span>
                <span className="text-gray-900 font-semibold">{patient.bloodGroup}</span>
              </div> */}
            </div>

            {formattedCreatedAt && (
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white border border-gray-200 rounded-md shadow-sm">
                  <FiCalendar className="h-3.5 w-3.5 text-gray-500" />
                  <span className="text-xs text-gray-600">
                    <span className="font-medium">Joined:</span> {formattedCreatedAt}
                  </span>
                  <button
                    onClick={() => setIsEditDateOpen(true)}
                    className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 border border-blue-200 transition"
                  >
                    Edit
                  </button>
                </div>
                {daysSinceJoined && (
                  <div className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 border border-blue-200 rounded-md">
                    <FiClock className="h-3.5 w-3.5 text-blue-600" />
                    <span className="text-xs text-blue-700 font-medium">
                      {daysSinceJoined} with us
                    </span>
                  </div>
                )}
              </div>
            )}

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="inline-flex items-center px-3 py-1.5 bg-white text-sm rounded-md text-gray-700 border border-gray-300 shadow-sm">
                <span className="font-medium text-gray-500 mr-1.5">Reg.No:</span>
                <span className="font-semibold">{patient.registrationNumber || "Not Available"}</span>
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
                  className="flex-1 sm:flex-none sm:w-auto px-4 py-2 text-sm font-medium text-indigo-700
                   bg-indigo-50/80 backdrop-blur-sm border border-indigo-200 rounded-md hover:bg-indigo-100/80 
                   transition-all flex items-center justify-center shadow-sm"
                >
                  <FiEye className="h-4 w-4 mr-1 text-indigo-600" />
                  Edit Profile
                </button>
              )}
              
              <button
                onClick={handleEdit}
                className="flex-1 sm:flex-none sm:w-auto px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50/80
                 backdrop-blur-sm border border-blue-200 rounded-md hover:bg-blue-100/80 transition-all flex
                  items-center justify-center shadow-sm"
              >
                <FiEdit2 className="h-4 w-4 mr-1 text-blue-600" />
                Edit Assessment
              </button>

              <button
                onClick={onDelete}
                className="flex-1 sm:flex-none sm:w-auto px-4 py-2 text-sm font-medium text-red-700 bg-red-50/80
                 backdrop-blur-sm border border-red-200 rounded-md hover:bg-red-100/80 transition-all flex 
                 items-center justify-center shadow-sm"
              >
                <FiTrash2 className="h-4 w-4 mr-1 text-red-600" />
                Delete Client
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleSave}
                className="flex-1 sm:flex-none sm:w-auto px-4 py-2 text-sm font-medium text-green-700
                 bg-green-50/80 backdrop-blur-sm border border-green-200 rounded-md hover:bg-green-100/80
                  transition-all flex items-center justify-center shadow-sm"
              >
                <FiSave className="h-4 w-4 mr-1 text-green-600" />
                Save Changes
              </button>
              <button
                onClick={handleCancel}
                className="flex-1 sm:flex-none sm:w-auto px-4 py-2 text-sm font-medium text-gray-700 
                bg-gray-50/80 backdrop-blur-sm border border-gray-200 rounded-md hover:bg-gray-100/80 
                transition-all flex items-center justify-center shadow-sm"
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
      <EditCreatedAtModal
        isOpen={isEditDateOpen}
        currentDate={createdAt}
        onClose={() => setIsEditDateOpen(false)}
        onSave={handleSaveCreatedAt}
      />
    </div>
  );
};

export default ProfileHeader;