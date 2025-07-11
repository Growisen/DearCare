import React from 'react';
import { NurseAssignmentWithClient } from '@/app/actions/staff-management/add-nurse';

interface AssignmentCardProps {
  assignment: NurseAssignmentWithClient;
}

const AssignmentCard: React.FC<AssignmentCardProps> = ({ assignment }) => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
        <div className="flex flex-wrap justify-between items-center gap-2">
          <div className="flex items-center gap-2">
            <h3 className="font-medium text-gray-800 truncate">
              {assignment.client.type === 'individual' 
                ? assignment.client.details.individual?.patient_name
                : assignment.client.details.organization?.organization_name}
            </h3>
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
              assignment.client.type === 'individual' 
                ? 'bg-indigo-100 text-indigo-800 border border-indigo-200' 
                : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
            }`}>
              {assignment.client.type === 'individual' ? 'Individual' : 'Organization'}
            </span>
          </div>
          <span className={`px-3 py-1 text-xs font-medium rounded-full flex items-center ${
            new Date(assignment.assignment.start_date) > new Date()
              ? 'bg-purple-100 text-purple-800 border border-purple-200'
              : !assignment.assignment.end_date 
                ? 'bg-green-100 text-green-800 border border-green-200' 
                : new Date(assignment.assignment.end_date) > new Date() 
                  ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' 
                  : 'bg-gray-100 text-gray-800 border border-gray-200'
          }`}>
            {new Date(assignment.assignment.start_date) > new Date() ? (
              <>
                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
                Not Yet Started
              </>
            ) : !assignment.assignment.end_date ? (
              <>
                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
                Active - Ongoing
              </>
            ) : new Date(assignment.assignment.end_date) > new Date() ? (
              <>
                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
                Active - Ending Soon
              </>
            ) : (
              <>
                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Completed
              </>
            )}
          </span>
        </div>
      </div>
      <div className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Assignment Details */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-700 flex items-center mb-3 border-b pb-2">
              <svg className="w-4 h-4 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Assignment Details
            </h4>
            <div className="grid grid-cols-1 gap-2">
              <div className="flex">
                <span className="text-sm font-medium w-32 text-gray-500 flex items-center">
                  <svg className="w-3.5 h-3.5 mr-1.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Start Date:
                </span>
                <span className="text-sm text-gray-700">
                  {new Date(assignment.assignment.start_date).toLocaleDateString()}
                </span>
              </div>
              
              {assignment.assignment.end_date && (
                <div className="flex">
                  <span className="text-sm font-medium w-32 text-gray-500 flex items-center">
                    <svg className="w-3.5 h-3.5 mr-1.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    End Date:
                  </span>
                  <span className="text-sm text-gray-700">
                    {new Date(assignment.assignment.end_date).toLocaleDateString()}
                  </span>
                </div>
              )}
              
              {assignment.assignment.shift_start_time && (
                <div className="flex">
                  <span className="text-sm font-medium w-32 text-gray-500 flex items-center">
                    <svg className="w-3.5 h-3.5 mr-1.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Shift Time:
                  </span>
                  <span className="text-sm text-gray-700">
                    {assignment.assignment.shift_start_time} - {assignment.assignment.shift_end_time}
                  </span>
                </div>
              )}
              
              {assignment.assignment.salary_hour && (
                <div className="flex">
                  <span className="text-sm font-medium w-32 text-gray-500 flex items-center">
                    <svg className="w-3.5 h-3.5 mr-1.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Hourly Rate:
                  </span>
                  <span className="text-sm text-gray-700 font-medium">₹{assignment.assignment.salary_hour}</span>
                </div>
              )}
            </div>
          </div>
          
          {/* Client Details */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-700 flex items-center mb-3 border-b pb-2">
              {assignment.client.type === 'individual' ? (
                <>
                  <svg className="w-4 h-4 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Patient Details
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  Organization Details
                </>
              )}
            </h4>
            
            {assignment.client.type === 'individual' ? (
              <div className="grid grid-cols-1 gap-2">
                <div className="flex">
                  <span className="text-sm font-medium w-32 text-gray-500 flex items-center">
                    <svg className="w-3.5 h-3.5 mr-1.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Patient:
                  </span>
                  <span className="text-sm text-gray-700">
                    {assignment.client.details.individual?.patient_name}, {assignment.client.details.individual?.patient_age} years
                  </span>
                </div>
                
                <div className="flex">
                  <span className="text-sm font-medium w-32 text-gray-500 flex items-center">
                    <svg className="w-3.5 h-3.5 mr-1.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Gender:
                  </span>
                  <span className="text-sm text-gray-700">
                    {assignment.client.details.individual?.patient_gender}
                  </span>
                </div>
                
                <div className="flex">
                  <span className="text-sm font-medium w-32 text-gray-500 flex items-center">
                    <svg className="w-3.5 h-3.5 mr-1.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 002 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    Service:
                  </span>
                  <span className="text-sm text-gray-700">
                    {assignment.client.details.individual?.service_required}
                  </span>
                </div>
                
                <div className="flex">
                  <span className="text-sm font-medium w-32 text-gray-500 flex items-center">
                    <svg className="w-3.5 h-3.5 mr-1.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    Contact:
                  </span>
                  <span className="text-sm text-gray-700">
                    {assignment.client.details.individual?.requestor_name} ({assignment.client.details.individual?.relation_to_patient})
                  </span>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-2">
                <div className="flex">
                  <span className="text-sm font-medium w-32 text-gray-500 flex items-center">
                    <svg className="w-3.5 h-3.5 mr-1.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    Organization:
                  </span>
                  <span className="text-sm text-gray-700">
                    {assignment.client.details.organization?.organization_name} ({assignment.client.details.organization?.organization_type})
                  </span>
                </div>
                
                <div className="flex">
                  <span className="text-sm font-medium w-32 text-gray-500 flex items-center">
                    <svg className="w-3.5 h-3.5 mr-1.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Address:
                  </span>
                  <span className="text-sm text-gray-700">
                    {assignment.client.details.organization?.organization_address}
                  </span>
                </div>
                
                <div className="flex">
                  <span className="text-sm font-medium w-32 text-gray-500 flex items-center">
                    <svg className="w-3.5 h-3.5 mr-1.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Contact Person:
                  </span>
                  <span className="text-sm text-gray-700">
                    {assignment.client.details.organization?.contact_person_name} ({assignment.client.details.organization?.contact_person_role})
                  </span>
                </div>
                
                <div className="flex">
                  <span className="text-sm font-medium w-32 text-gray-500 flex items-center">
                    <svg className="w-3.5 h-3.5 mr-1.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    Contact:
                  </span>
                  <span className="text-sm text-gray-700">
                    {assignment.client.details.organization?.contact_phone}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssignmentCard;