import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { SimplifiedNurseDetails } from '@/app/actions/staff-management/add-nurse';
import { getExperienceFromJoiningDate } from '@/utils/dateUtils';
import { formatOrganizationName } from '@/utils/formatters';

interface ProfileHeaderProps {
  nurse: SimplifiedNurseDetails;
  onDelete: () => void;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ nurse, onDelete }) => {
  const basicInfo = nurse.basic;
  const documentsInfo = nurse.documents;

  return (
    <div className="bg-gradient-to-r from-blue-50 to-white border-b border-gray-200 px-6 py-4">
      <div className="flex justify-between items-start mb-4">
        <h1 className="text-xl font-semibold text-gray-800">Nurse Profile</h1>
        <div className="flex gap-2">
          <Link 
            href={`/nurses/${basicInfo.nurse_id}/edit`}
            className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors shadow-sm"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
            Edit Profile
          </Link>
          <button
            onClick={onDelete}
            className="inline-flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-md transition-colors shadow-sm"
            type="button"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
            Delete Nurse
          </button>
        </div>
      </div>
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex flex-col md:flex-row items-center gap-4">
          <div className="flex-shrink-0">
            <div className="relative h-32 w-32 rounded-full overflow-hidden border-4 border-white shadow-lg">
              {documentsInfo.profile_image ? (
                <Image 
                  src={documentsInfo.profile_image}
                  alt={`${basicInfo.first_name || ''} ${basicInfo.last_name || ''}`}
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 768px) 96px, 128px"
                />
              ) : (
                <div className="h-full w-full bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center">
                  <div className="text-center text-blue-600 font-semibold text-2xl">
                    {(basicInfo.first_name?.[0] || '') + (basicInfo.last_name?.[0] || '')}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="text-center md:text-left mt-3 md:mt-0">
            <h1 className="text-2xl font-bold text-gray-900">
              {basicInfo.first_name} {basicInfo.last_name}
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              {basicInfo.category} • {basicInfo.experience || 0} years experience
            </p>
            {/* Salary Per Month */}
            <p className="text-sm text-gray-700 mt-1">
              Salary Per Month: <span className="font-semibold">
                {basicInfo.salary_per_month ? `₹${basicInfo.salary_per_month}` : 'N/A'}
              </span>
            </p>
            <div className="text-sm text-gray-700 mt-1">
              <span>
                Joined: {basicInfo.joining_date 
                  ? basicInfo.joining_date 
                  : 'N/A'}
              </span>
              <span className="mx-2">|</span>
              <span>
                Experience in 
                <span className="inline-block bg-gray-200 text-gray-800 font-serif px-2 py-0.5 rounded ml-1 mr-1">
                  {formatOrganizationName(basicInfo.admitted_type ?? '') || 'Organization'}
                </span>
                : {getExperienceFromJoiningDate(basicInfo.joining_date ?? '')}
              </span>
            </div>
            
            <div className="flex flex-wrap items-center justify-center md:justify-start mt-3 gap-2">
              <span className="inline-flex items-center px-3 py-1 bg-white text-sm rounded-full text-gray-700 border border-gray-200 shadow-sm">
                <svg className="w-4 h-4 text-blue-500 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {basicInfo.city}
              </span>
              <span className="inline-flex items-center px-3 py-1 bg-white text-sm rounded-full text-gray-700 border border-gray-200 shadow-sm">
                <svg className="w-4 h-4 text-green-500 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                Status: <span className="font-medium capitalize">{basicInfo.status}</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;