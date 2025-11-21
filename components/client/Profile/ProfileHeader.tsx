import React, { useState } from 'react';
import Image from 'next/image';
import { FiEdit2, FiExternalLink, FiTrash2, FiEye, FiCalendar, FiClock, FiCopy } from 'react-icons/fi';
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
    firstName?: string;
    lastName?: string;
    age?: number | string;
    gender?: string;
    bloodGroup?: string;
    location?: string;
    profileImage?: string | null;
    clientCategory: ClientCategory;
    createdAt?: string;
    requestor?: {
      name: string;
      profileImage?: string | null;
    };
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
  handleEdit,
  handleCategoryChange,
  onDelete,
  onEditProfile
}) => {

  console.log('Patient Data in ProfileHeader:', patient);

  const [isImageViewerOpen, setIsImageViewerOpen] = useState(false);
  const [isEditDateOpen, setIsEditDateOpen] = useState(false);
  const [createdAt, setCreatedAt] = useState(patient.createdAt || '');
  const [copied, setCopied] = useState(false);

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

  const handleCopyLink = () => {
    if (patient._id && typeof window !== 'undefined') {
      const baseUrl = window.location.origin;
      const link = `${baseUrl}/patient-assessment/${patient._id}`;
      navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  const hasName = !!(patient.firstName || patient.lastName);
  const displayName = hasName
    ? formatName(`${patient.firstName} ${patient.lastName}`)
    : patient.requestor?.name || "N/A";
  const displayProfileImage = hasName
    ? patient.profileImage
    : patient.requestor?.profileImage || null;

  const displayAge = patient.age !== undefined && patient.age !== null && patient.age !== '' && patient.age != 0
    ? patient.age
    : "N/A";

  return (
    <div className={`bg-gray-50 border-b border-gray-200 px-4 sm:px-6 py-5 ${patient.clientCategory ? `border-l-4 ${borderColor}` : ''}`}>
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div className="flex flex-col sm:flex-row items-start gap-5 w-full lg:w-auto">
          <div
            className="relative h-24 w-24 rounded-xl overflow-hidden border-4 border-white shadow-sm flex-shrink-0 mx-auto sm:mx-0"
            onClick={() => displayProfileImage && setIsImageViewerOpen(true)}
            style={{ cursor: displayProfileImage ? 'pointer' : 'default' }}
          >
            {displayProfileImage ? (
              <Image
                src={displayProfileImage}
                alt={displayName}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 768px) 96px, 128px"
              />
            ) : (
              <div className="h-full w-full bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center">
                <div className="text-center text-blue-600 font-bold text-2xl">
                  {hasName
                    ? formatName(patient.firstName?.[0] || '') + formatName(patient.lastName?.[0] || '')
                    : (patient.requestor?.name?.[0] || 'U')}
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2 w-full">
            
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900 leading-tight">
                {displayName}
              </h1>
              {isNewClient && (
                <span className="px-2.5 py-0.5 bg-green-100 text-green-700 text-xs rounded-full font-semibold border border-green-200 shadow-sm">
                  ✨ New Client
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
              {patient.firstName &&
                ( 
                  <div className="flex items-center gap-1.5 bg-white px-2 py-1 rounded border border-gray-200">
                    <span className="font-medium text-gray-400">Age:</span>
                    <span className="text-gray-900 font-medium">{displayAge}</span>
                  </div>
                )
              }
              {patient.gender && 
                (
                  <div className="flex items-center gap-1.5 bg-white px-2 py-1 rounded border border-gray-200">
                    <span className="font-medium text-gray-400">Gender:</span>
                    <span className="text-gray-900 font-medium">{patient.gender || "N/A"}</span>
                  </div>
                )
              }
              <div className="flex items-center gap-1.5 bg-white px-2 py-1 rounded border border-gray-200">
                <span className="font-medium text-gray-400">Reg:</span>
                <span className="text-gray-900 font-medium">{patient.registrationNumber || "N/A"}</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 mt-1">
               {formattedCreatedAt && (
                 <div className="flex items-center gap-2 text-xs">
                    <div className="flex items-center gap-1.5 text-gray-500">
                      <FiCalendar className="h-3.5 w-3.5" />
                      <span>Joined: {formattedCreatedAt}</span>
                    </div>
                    <button
                      onClick={() => setIsEditDateOpen(true)}
                      className="text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      Edit
                    </button>
                    {daysSinceJoined && (
                      <>
                        <span className="text-gray-300">|</span>
                        <div className="flex items-center gap-1.5 text-blue-600 font-medium">
                          <FiClock className="h-3.5 w-3.5" />
                          <span>{daysSinceJoined} with us</span>
                        </div>
                      </>
                    )}
                 </div>
               )}
               <div className="hidden sm:block text-gray-300">|</div>
               <div className="scale-90 origin-left sm:scale-100">
                  <CategorySelector
                    currentCategory={patient.clientCategory}
                    onCategoryChange={handleCategoryChange}
                  />
               </div>
            </div>
          </div>
        </div>
      </div>
      <div className="w-full lg:w-auto mt-2 lg:mt-5 flex flex-col lg:flex-row gap-3">
        <button
          onClick={onEditProfile}
          className="flex items-center justify-center px-4 py-2 text-sm font-medium text-indigo-700 bg-white border border-indigo-200 rounded-lg hover:bg-indigo-50 transition-all shadow-sm whitespace-nowrap"
        >
          <FiEye className="h-4 w-4 mr-2 text-indigo-600" />
          Edit Profile
        </button>
        <button
          onClick={handleCopyLink}
          className={`flex items-center justify-center px-4 py-2 text-sm font-medium border rounded-lg transition-all shadow-sm whitespace-nowrap ${copied ? 'bg-green-50 text-green-700 border-green-200' : 'text-gray-700 bg-white border-gray-300 hover:bg-gray-50'}`}
          title="Copy sharable assessment link"
        >
          <FiCopy className={`h-4 w-4 mr-2 ${copied ? 'text-green-600' : 'text-gray-600'}`} />
          {copied ? "Copied!" : "Copy Link"}
        </button>
        <button
          onClick={handleEdit}
          className="flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all shadow-sm whitespace-nowrap"
        >
          <FiEdit2 className="h-4 w-4 mr-2" />
          Edit Assessment
        </button>
        <button
          onClick={() => {
            if (patient._id && typeof window !== 'undefined') {
              window.open(`/patient-assessment/${patient._id}`, '_blank');
            }
          }}
          className="flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-all whitespace-nowrap"
        >
          <FiExternalLink className="h-4 w-4 mr-2" />
          New Assessment
        </button>
        <button
          onClick={onDelete}
          className="flex items-center justify-center px-4 py-2 text-sm font-medium text-red-700 bg-white border border-red-200 rounded-lg hover:bg-red-50 transition-all shadow-sm whitespace-nowrap"
        >
          <FiTrash2 className="h-4 w-4 mr-2 text-red-600" />
          Delete
        </button>
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