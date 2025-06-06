import React from 'react';
import { Nurse } from '@/types/staff.types';
import Link from 'next/link';

interface NurseCardProps {
  nurse: Nurse;
  onAssign: (nurse: Nurse) => void;
  onViewProfile: (nurse: Nurse) => void;
  children?: React.ReactNode;
  selectable?: boolean;
  isSelected?: boolean;
  onSelectChange?: (nurseId: string, selected: boolean) => void;
}

const NurseCard: React.FC<NurseCardProps> = ({ 
  nurse, 
  children, 
  selectable = false, 
  isSelected = false, 
  onSelectChange 
}) => {
  return (
    <div className="border border-gray-200 rounded-lg p-2 sm:p-3 hover:shadow-sm transition-shadow duration-300 bg-white h-full">
      <div className="flex flex-row items-start justify-between gap-2">
        {/* Checkbox for selection */}
        {selectable && (
          <div className="mt-1">
            <input
              type="checkbox"
              id={`nurse-${nurse._id}`}
              checked={isSelected}
              onChange={(e) => onSelectChange?.(nurse._id, e.target.checked)}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
          </div>
        )}
        
        {/* Main content area */}
        <div className="flex-grow">
          <div className="flex items-center justify-between">
            <h3 className="text-sm sm:text-base font-semibold text-gray-900">{nurse.firstName} {nurse.lastName}</h3>
            <div className="text-xs text-gray-500">
              ID: {nurse._id.slice(-5)}
            </div>
          </div>
          
          {/* Details in two columns for better space usage */}
          <div className="grid grid-cols-1 xs:grid-cols-2 gap-x-2 gap-y-1 mt-1.5">
            <p className="text-xs text-gray-700">
              <span className="font-medium">Location:</span> {nurse.location}
            </p>
            <p className="text-xs text-gray-700">
              <span className="font-medium">Experience:</span> {nurse.experience} yrs
            </p>
            <p className="text-xs text-gray-700">
              <span className="font-medium">Email:</span> {nurse.email}
            </p>
            <p className="text-xs text-gray-700">
              <span className="font-medium">Phone:</span> {nurse.phoneNumber}
            </p>
          </div>
          
          {/* Badges row */}
          <div className="flex flex-wrap gap-1 mt-2">
            <span className="inline-flex items-center px-1.5 py-0.5 bg-blue-50 text-xs rounded-full text-blue-700">
              {nurse.experience} yrs exp
            </span>
            <span className="inline-flex items-center px-1.5 py-0.5 bg-yellow-50 text-xs rounded-full text-yellow-700">
              {nurse.rating}/5 ★
            </span>
            <span className="inline-flex items-center px-1.5 py-0.5 bg-green-50 text-xs rounded-full text-green-700">
              ₹{nurse.salaryPerHour}/hr
            </span>
            {nurse.status === 'leave' && (
              <span className="inline-flex items-center px-1.5 py-0.5 bg-orange-50 text-xs rounded-full text-orange-700">
                On Leave
              </span>
            )}
          </div>
        </div>
        
        {/* Action button - moved to the right side */}
        <div className="ml-2">
          <Link 
            href={`/nurses/${nurse._id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-2 py-1 text-blue-600 border border-blue-200 rounded hover:bg-blue-50 transition-colors text-xs font-medium text-center whitespace-nowrap block"
          >
            View
          </Link>
        </div>
      </div>
      
      {/* Additional content (assignment info, leave info) */}
      {children && (
        <div className="mt-2 pt-2 border-t border-gray-100">
          {children}
        </div>
      )}
    </div>
  );
};

export default NurseCard;