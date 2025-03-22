import React from 'react';
import { Nurse } from '@/types/staff.types';
import Link from 'next/link';

interface NurseCardProps {
  nurse: Nurse;
  onAssign: (nurse: Nurse) => void;
  onViewProfile: (nurse: Nurse) => void;
}

const NurseCard: React.FC<NurseCardProps> = ({ nurse, onAssign, onViewProfile }) => {
  return (
    <div className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow duration-300 bg-white mb-5">
      <div className="flex items-start justify-between gap-6">
        <div className="flex items-start space-x-6">
          <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold overflow-hidden shadow-sm border border-blue-50">
            {nurse.profileImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={nurse.profileImage} alt={`${nurse.firstName} ${nurse.lastName}`} className="w-full h-full object-cover" />
            ) : (
              <span className="text-2xl">{nurse.firstName[0]}{nurse.lastName[0]}</span>
            )}
          </div>
          <div className="pt-2">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">{nurse.firstName} {nurse.lastName}</h3>
            <div className="flex flex-wrap gap-3 mb-4">
              <span className="inline-flex items-center px-3 py-1.5 bg-gray-100 text-sm rounded-full text-gray-800 shadow-sm">
                <svg className="mr-1.5" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                {nurse.location}
              </span>
              <span className="inline-flex items-center px-3 py-1.5 bg-blue-50 text-sm rounded-full text-blue-700 shadow-sm">
                <svg className="mr-1.5" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                {nurse.experience} yrs exp
              </span>
              <span className="inline-flex items-center px-3 py-1.5 bg-yellow-50 text-sm rounded-full text-yellow-700 shadow-sm">
                <svg className="mr-1.5" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                {nurse.rating}/5
              </span>
              <span className="inline-flex items-center px-3 py-1.5 bg-green-50 text-sm rounded-full text-green-700 shadow-sm">
                <svg className="mr-1.5" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v6m0 12V12m0 0l8.5-8.5M12 12l-8.5 8.5"></path></svg>
                ₹{nurse.salaryPerHour}/hr
              </span>
            </div>
            {nurse.preferredLocations.length > 0 && (
              <p className="text-sm text-gray-600 mb-3">
                <span className="font-medium">Preferred locations:</span> {nurse.preferredLocations.join(', ')}
              </p>
            )}
            <div className="border-t pt-3 mt-3">
              <p className="text-sm text-gray-700 mb-1.5">
                <span className="font-medium">Email:</span> {nurse.email}
              </p>
              <p className="text-sm text-gray-700">
                <span className="font-medium">Phone:</span> {nurse.phoneNumber}
              </p>
            </div>
          </div>
        </div>
        <div className="flex flex-col space-y-3 min-w-[140px]">
          <button
            onClick={() => onAssign(nurse)}
            className="px-6 py-3 text-white bg-green-600 rounded-lg hover:bg-green-700 transition-all duration-200 text-sm font-medium shadow-sm"
          >
            Assign
          </button>
          <Link 
            href={`/nurses/${nurse._id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors text-sm font-medium text-center"
          >
            View Profile
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NurseCard;