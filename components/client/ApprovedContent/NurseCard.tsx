import React from 'react';
import { Nurse } from '@/types/staff.types';

interface NurseCardProps {
  nurse: Nurse;
  onAssign: (nurse: Nurse) => void;
  onViewProfile: (nurse: Nurse) => void;
}

const NurseCard: React.FC<NurseCardProps> = ({ nurse, onAssign, onViewProfile }) => {
  return (
    <div className="border rounded-lg p-4 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold overflow-hidden">
            {nurse.profileImage ? (
              <img src={nurse.profileImage} alt={`${nurse.firstName} ${nurse.lastName}`} className="w-full h-full object-cover" />
            ) : (
              <span className="text-lg">{nurse.firstName[0]}{nurse.lastName[0]}</span>
            )}
          </div>
          <div>
            <h4 className="font-medium text-gray-900">{nurse.firstName} {nurse.lastName}</h4>
            <div className="flex flex-wrap gap-2 mt-1">
              <span className="inline-flex items-center px-2 py-1 bg-gray-100 text-xs rounded text-gray-800">
                <svg className="mr-1" xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                {nurse.location}
              </span>
              <span className="inline-flex items-center px-2 py-1 bg-blue-50 text-xs rounded text-blue-700">
                <svg className="mr-1" xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                {nurse.experience} yrs exp
              </span>
              <span className="inline-flex items-center px-2 py-1 bg-yellow-50 text-xs rounded text-yellow-700">
                <svg className="mr-1" xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                {nurse.rating}/5
              </span>
              <span className="inline-flex items-center px-2 py-1 bg-green-50 text-xs rounded text-green-700">
                <svg className="mr-1" xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v6m0 12V12m0 0l8.5-8.5M12 12l-8.5 8.5"></path></svg>
                ₹{nurse.salaryPerHour}/hr
              </span>
            </div>
            {nurse.preferredLocations.length > 0 && (
              <p className="text-xs text-gray-500 mt-2">
                Preferred locations: {nurse.preferredLocations.join(', ')}
              </p>
            )}
            <p className="text-xs text-gray-600 mt-2">
              <span className="font-medium">Contact:</span> {nurse.email} • {nurse.phoneNumber}
            </p>
          </div>
        </div>
        <div className="flex flex-col space-y-2">
          <button
            onClick={() => onAssign(nurse)}
            className="px-4 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700 transition-all duration-200 text-sm font-medium"
          >
            Assign
          </button>
          <button
            onClick={() => onViewProfile(nurse)}
            className="px-4 py-2 text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors text-sm"
          >
            View Profile
          </button>
        </div>
      </div>
    </div>
  );
};

export default NurseCard;