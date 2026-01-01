import React from 'react';
import { Nurse } from '@/types/staff.types';

interface NurseProfileModalProps {
  nurse: Nurse | null;
  onClose: () => void;
  onAssign: (nurse: Nurse) => void;
  onUnassign: (nurseId: string) => void;
}

const NurseProfileModal: React.FC<NurseProfileModalProps> = ({ 
  nurse, 
  onClose, 
  onAssign, 
  onUnassign 
}) => {
  if (!nurse) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-sm p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
        {/* Header section */}
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-gray-900">Nurse Profile</h3>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>
        
        {/* Profile header with initials */}
        <div className="flex items-start space-x-4 mb-6">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-xl font-semibold">
            {nurse.firstName[0]}{nurse.lastName[0]}
          </div>
          <div>
            <h4 className="text-lg font-medium text-gray-900">{nurse.firstName} {nurse.lastName}</h4>
            <p className="text-gray-700">{nurse.email} • {nurse.phoneNumber}</p>
            <div className="flex flex-wrap gap-2 mt-2">
              <span className="inline-flex items-center px-2 py-1 bg-gray-200 text-sm font-medium rounded text-gray-800">
                {nurse.gender}
              </span>
              <span className="inline-flex items-center px-2 py-1 bg-gray-200 text-sm font-medium rounded text-gray-800">
                {nurse.experience} years experience
              </span>
              <span className="inline-flex items-center px-2 py-1 bg-yellow-100 text-sm font-medium rounded text-yellow-800">
                {nurse.rating}/5 rating
              </span>
            </div>
          </div>
        </div>
        
        {/* Details grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="p-4 bg-gray-100 rounded-sm">
            <h5 className="font-semibold text-gray-800 mb-2">Personal Details</h5>
            <div className="space-y-2">
              <p><span className="font-medium text-gray-700">Location:</span> <span className="text-gray-900">{nurse.location}</span></p>
              <p><span className="font-medium text-gray-700">Salary:</span> <span className="text-gray-900">₹{nurse.salaryPerHour}/hr (cap: ₹{nurse.salaryCap})</span></p>
              <p><span className="font-medium text-gray-700">Hired on:</span> <span className="text-gray-900">{nurse.hiringDate && new Date(nurse.hiringDate).toLocaleDateString()}</span></p>
              <p><span className="font-medium text-gray-700">Preferred locations:</span> <span className="text-gray-900">{nurse.preferredLocations.join(', ')}</span></p>
            </div>
          </div>
          
          <div className="p-4 bg-gray-100 rounded-sm">
            <h5 className="font-semibold text-gray-800 mb-2">Reviews ({nurse.reviews && nurse.reviews.length})</h5>
            {nurse.reviews && nurse.reviews.length > 0 ? (
              <div className="space-y-3 max-h-40 overflow-y-auto pr-1">
                {nurse.reviews.map(review => (
                  <div key={review.id} className="border-b pb-2">
                    <div className="flex items-center">
                      <div className="flex items-center text-yellow-500 text-lg">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <span key={i}>{i < review.rating ? '★' : '☆'}</span>
                        ))}
                      </div>
                      <span className="ml-2 text-gray-700 text-sm">{review.reviewer}</span>
                    </div>
                    <p className="mt-1 text-gray-900">{review.text}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-700">No reviews yet</p>
            )}
          </div>
        </div>
        
        {/* Action buttons */}
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 border border-slate-200 rounded-sm hover:bg-gray-50 font-medium"
          >
            Close
          </button>
          {nurse.status === 'unassigned' ? (
            <button
              onClick={() => onAssign(nurse)}
              className="px-4 py-2 text-white bg-green-600 rounded-sm hover:bg-green-700 font-medium"
            >
              Assign Nurse
            </button>
          ) : (
            <button
              onClick={() => onUnassign(nurse._id)}
              className="px-4 py-2 text-white bg-red-600 rounded-sm hover:bg-red-700 font-medium"
            >
              Remove Assignment
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default NurseProfileModal;