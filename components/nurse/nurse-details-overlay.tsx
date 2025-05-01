import React, { useState } from 'react';
import { X, Trash2, User, Star } from 'lucide-react';
import Link from 'next/link';
import { NurseBasicInfo } from "../../types/staff.types";

interface NurseDetailsProps {
  nurse: NurseBasicInfo;
  onClose: () => void;
  onDelete?: (nurseId: number) => void;
}

export function NurseDetailsOverlay({ nurse, onClose, onDelete }: NurseDetailsProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  console.log(nurse, 'nurse details overlay nurse data');
  const handleDelete = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    if (onDelete) {
      onDelete(nurse.nurse_id);
    }
    setShowDeleteConfirm(false);
  };

  const renderStars = (rating?: number) => {
    if (!rating) return null;
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= (rating || 0)
                ? 'text-yellow-400 fill-yellow-400'
                : 'text-gray-300'
            }`}
          />
        ))}
        <span className="ml-2 text-sm text-gray-600">{rating.toFixed(1)}</span>
      </div>
    );
  };

  // Updated dummy data with schedule information
  const dummyClients = [
    {
      id: "1",
      name: "John Doe",
      address: "123 Main St, Kochi",
      startDate: "2023-01-15",
      status: "active",
      schedule: {
        type: "24HOUR",
        startTime: "08:00 AM",
        endTime: "08:00 AM",
        days: "Monday to Sunday"
      }
    },
    { id: "2", name: "Jane Smith", address: "456 Park Ave, Kochi", startDate: "2023-02-20", status: "active", schedule: { type: "Day Shift", startTime: "09:00 AM", endTime: "05:00 PM", days: "Monday to Friday" } },
    { id: "3", name: "Alice Johnson", address: "789 Lake View, Kochi", startDate: "2023-03-10", status: "completed", schedule: { type: "Night Shift", startTime: "08:00 PM", endTime: "06:00 AM", days: "Monday to Sunday" } }
  ];

  // Add dummy rating if none exists
  const dummyRating = nurse.rating || 4.2;
  
  // Add dummy reviews if none exist
  const displayReviews = nurse.reviews?.length ? nurse.reviews : [
    {
      id: "r1",
      text: "Very professional and caring nurse. Always punctual and attentive to patient needs.",
      date: "2023-12-15",
      rating: 4.5,
      reviewer: "Thomas Kumar"
    },
    {
      id: "r2",
      text: "Excellent service and great communication skills. Highly recommended.",
      date: "2023-11-20",
      rating: 5,
      reviewer: "Mary Jacob"
    },
    {
      id: "r3",
      text: "Good experience overall. Could improve on documentation.",
      date: "2023-10-05",
      rating: 4,
      reviewer: "Sarah Philip"
    }
  ];

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white w-full max-w-7xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-3 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Nurse Profile</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDelete}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <Trash2 className="h-5 w-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>
        </div>
        
        <div className="px-3 sm:px-6 py-3 sm:py-4 space-y-4 sm:space-y-6">
          {/* Personal Details Section */}
          <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-6">
            <div className="flex flex-wrap justify-between items-start mb-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2 sm:mb-0">Personal Details</h3>
              <Link 
                href={`/nurses/${nurse.nurse_id}?fromNurseList=true`}
                target='_blank'
                className="px-3 py-1 sm:px-4 sm:py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
              >
                View Full Profile
              </Link>
            </div>
            
            <div className="flex flex-col md:flex-row md:gap-8 lg:gap-20">
              {/* Profile Image Column */}
              <div className="flex flex-col items-center space-y-3 mb-4 md:mb-0">
                <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden border-4 border-gray-200">
                  {nurse.photo ? (
                    <img src={nurse.photo} alt="Nurse" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                      <User className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400" />
                    </div>
                  )}
                </div>
                <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full truncate max-w-full">
                  {nurse.regNumber?.includes('TATA') ? 'Tata Home Nursing' : 'DearCare'}
                </span>
              </div>

              {/* Details Grid */}
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {[
                  { label: "Name", value: `${nurse.first_name} ${nurse.last_name}` },
                  { label: "Phone Number", value: nurse.phone_number },
                  { label: "Email", value: nurse.email },
                  { label: "Gender", value: nurse.gender },
                  { label: "Address", value: nurse.address },
                  { label: "Service Type", value: nurse.serviceType },
                  { label: "City", value: nurse.city },
                  { label: "Category", value: nurse.category },
                  { label: "Reg No", value: nurse.regNumber || 'Not assigned' },
                ].map((field, index) => (
                  <div key={index} className="space-y-1">
                    <span className="text-sm font-medium text-gray-600">{field.label}</span>
                    <p className="text-sm text-gray-900 break-words">{field.value || 'Not provided'}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Assigned Clients Section */}
          <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Assigned Clients</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {dummyClients.map((client) => (
                <div key={client.id} className="bg-gray-50 rounded-lg p-3 sm:p-4">
                  <div className="flex flex-wrap justify-between items-start gap-2">
                    <div className="max-w-[70%]">
                      <h4 className="text-base font-medium text-gray-900 break-words">{client.name}</h4>
                      <p className="text-sm text-gray-600 break-words">{client.address}</p>
                    </div>
                    <Link 
                      href={`/client-profile/${client.id}`}
                      target='_blank'
                      className="px-2 py-1 text-xs sm:text-sm text-blue-600 hover:bg-blue-50 rounded-md whitespace-nowrap"
                    >
                      View Profile
                    </Link>
                  </div>
                  <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div className="bg-white p-2 rounded-md">
                      <span className="text-xs text-gray-500 block">Schedule Type</span>
                      <span className="text-sm font-medium break-words">{client.schedule.type}</span>
                    </div>
                    <div className="bg-white p-2 rounded-md">
                      <span className="text-xs text-gray-500 block">Working Days</span>
                      <span className="text-sm font-medium break-words">{client.schedule.days}</span>
                    </div>
                    <div className="bg-white p-2 rounded-md">
                      <span className="text-xs text-gray-500 block">Timing</span>
                      <span className="text-sm font-medium break-words">
                        {client.schedule.startTime} - {client.schedule.endTime}
                      </span>
                    </div>
                    <div className="bg-white p-2 rounded-md">
                      <span className="text-xs text-gray-500 block">Status</span>
                      <span className={`text-sm font-medium ${
                        client.status === 'active' ? 'text-green-600' : 'text-gray-600'
                      }`}>
                        {client.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Ratings and Reviews Section */}
          <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Ratings & Reviews</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="text-2xl sm:text-3xl font-semibold text-gray-900">{dummyRating.toFixed(1)}</div>
                {renderStars(dummyRating)}
              </div>
              
              <div className="space-y-4">
                {displayReviews.map((review) => (
                  <div key={review.id} className="border-t border-gray-100 pt-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-sm font-medium text-gray-900 break-words">{review.reviewer}</span>
                      <span className="text-xs text-gray-500">{review.date}</span>
                    </div>
                    {renderStars(review.rating)}
                    <p className="mt-2 text-sm text-gray-600 break-words">{review.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 z-60 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-4 sm:p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Confirm Delete</h3>
            <p className="text-gray-600 mb-6">Are you sure you want to delete this nurse? This action cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-3 py-1 sm:px-4 sm:py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-3 py-1 sm:px-4 sm:py-2 text-sm text-white bg-red-600 hover:bg-red-700 rounded-lg"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


