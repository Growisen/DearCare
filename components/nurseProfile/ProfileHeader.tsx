import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { SimplifiedNurseDetails } from '@/app/actions/staff-management/add-nurse';
import { getExperienceFromJoiningDate } from '@/utils/dateUtils';
import { formatOrganizationName } from '@/utils/formatters';
import { format, isValid } from 'date-fns'

interface ProfileHeaderProps {
  nurse: SimplifiedNurseDetails;
  onDelete: () => void;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ nurse, onDelete }) => {
  const basicInfo = nurse.basic;
  const documentsInfo = nurse.documents;

  return (
    <div className="bg-gradient-to-r from-blue-50 to-white border-b border-gray-200">
      <div className="px-5 py-2.5 border-b border-gray-100 flex justify-between items-center">
        <h2 className="text-xs font-medium text-gray-600 uppercase tracking-wide">Nurse Profile</h2>
        <div className="flex gap-2">
          <Link 
            href={`/nurses/${basicInfo.nurse_id}/edit`}
            className="inline-flex items-center px-3 py-1.5 bg-slate-700 hover:bg-slate-800 text-white text-sm font-medium rounded-md transition-colors shadow-sm"
          >
            <svg className="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
            Edit Profile
          </Link>
          <button
            onClick={onDelete}
            className="inline-flex items-center px-3 py-1.5 bg-white hover:bg-gray-50 text-gray-700 text-sm font-medium rounded-md transition-colors shadow-sm border border-gray-300"
            type="button"
          >
            <svg className="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Delete
          </button>
        </div>
      </div>

      <div className="px-5 py-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-shrink-0">
            <div className="relative h-24 w-24 rounded-lg overflow-hidden border-3 border-white shadow-md">
              {documentsInfo.profile_image ? (
                <Image 
                  src={documentsInfo.profile_image}
                  alt={`${basicInfo.first_name || ''} ${basicInfo.last_name || ''}`}
                  fill
                  className="object-cover"
                  priority
                  sizes="96px"
                />
              ) : (
                <div className="h-full w-full bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center">
                  <div className="text-center text-blue-600 font-semibold text-xl">
                    {(basicInfo.first_name?.[0] || '') + (basicInfo.last_name?.[0] || '')}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="mb-2.5">
              <h1 className="text-xl font-bold text-gray-900 mb-1">
                {basicInfo.first_name} {basicInfo.last_name}
              </h1>
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <span className="font-medium text-gray-700">
                  {basicInfo.category}
                </span>
                <span className="text-gray-300">•</span>
                <span className="text-gray-600">
                  {basicInfo.experience || 0} years total experience
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 mb-2.5">
              <div className="bg-white rounded-md p-2.5 border border-gray-200 shadow-sm">
                <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-0.5">
                  Monthly Salary
                </div>
                <div className="text-lg font-bold text-gray-900">
                  {basicInfo.salary_per_month ? `₹${basicInfo.salary_per_month.toLocaleString('en-IN')}` : 'N/A'}
                </div>
              </div>

              <div className="bg-white rounded-md p-2.5 border border-gray-200 shadow-sm">
                <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-0.5">
                  Joined
                </div>
                <div className="text-sm font-semibold text-gray-900">
                  {isValid(new Date(basicInfo.joining_date || "")) 
                    ? format(new Date(basicInfo.joining_date || ""), 'MMM dd, yyyy') 
                    : 'N/A'}
                </div>
              </div>

              <div className="bg-white rounded-md p-2.5 border border-gray-200 shadow-sm">
                <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-0.5">
                  Experience at {formatOrganizationName(basicInfo.admitted_type ?? '')}
                </div>
                <div className="text-sm font-semibold text-gray-900">
                  {getExperienceFromJoiningDate(basicInfo.joining_date ?? '')}
                </div>
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center px-2.5 py-1 bg-white text-xs font-medium rounded-md text-gray-700 border border-gray-200 shadow-sm">
                <svg className="w-3.5 h-3.5 text-blue-500 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {basicInfo.city}
              </span>
              <span className={`inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-md shadow-sm ${
                basicInfo.status === 'active' 
                  ? 'bg-green-50 text-green-700 border border-green-200' 
                  : 'bg-gray-50 text-gray-700 border border-gray-200'
              }`}>
                <svg className="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span className="capitalize">{basicInfo.status}</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;