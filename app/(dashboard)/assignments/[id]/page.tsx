'use client';

import React from 'react';
import { format } from 'date-fns';
import { UserIcon, BuildingOffice2Icon, CalendarIcon, ClockIcon, MapPinIcon } from '@heroicons/react/24/outline';
import { useAssignment } from '@/hooks/useAssignment';
import { useParams } from 'next/navigation';
import { PaginationControls } from '@/components/client/clients/PaginationControls';
import Link from 'next/link';

export default function AssignmentDetailsPage() {
  const { id } = useParams() as { id: string };
  const { 
    loading, 
    error, 
    assignmentDetails, 
    attendanceRecords,
    recordsCount,
    currentPage,
    pageSize,
    handlePreviousPage,
    handleNextPage,
    tableLoading,
  } = useAssignment(id);

  const totalPages = Math.ceil(recordsCount / pageSize);
  
  const handlePageChange = (page: number) => {
    if (page > currentPage) {
      for (let i = currentPage; i < page; i++) {
        handleNextPage();
      }
    } else if (page < currentPage) {
      for (let i = currentPage; i > page; i--) {
        handlePreviousPage();
      }
    }
  };

  function formatTime(timeString: string | null) {
    if (!timeString) return "—";
    const [hours, minutes] = timeString.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  }

  function getStatusBadgeClasses(status: string) {
    switch (status) {
      case 'completed':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'absent':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'overtime':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'early-departure':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  }
  
  // Helper function to create Google Maps URL from location string
  function createGoogleMapsLink(location: string | null): { url: string | null, isValidLocation: boolean } {
    if (!location) return { url: null, isValidLocation: false };
    
    // Try to parse the location string which might be in "lat,lng" format
    const parts = location.split(',').map(part => part.trim());
    
    if (parts.length !== 2) return { url: null, isValidLocation: false };
    
    const lat = parseFloat(parts[0]);
    const lng = parseFloat(parts[1]);
    
    // Check if both parts are valid numbers
    if (isNaN(lat) || isNaN(lng)) return { url: null, isValidLocation: false };
    
    // Create Google Maps URL
    const url = `https://www.google.com/maps?q=${lat},${lng}`;
    return { url, isValidLocation: true };
  }

  // Loading state for entire page
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="bg-white shadow-sm border border-slate-200 rounded-lg p-8 text-center">
          <div className="animate-pulse">
            <div className="h-6 bg-slate-200 rounded w-1/4 mb-4 mx-auto"></div>
            <div className="h-4 bg-slate-200 rounded w-1/2 mb-2 mx-auto"></div>
            <div className="h-4 bg-slate-200 rounded w-3/4 mx-auto"></div>
          </div>
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mt-4"></div>
          <p className="text-slate-500 mt-4">Loading assignment details...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !assignmentDetails) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="bg-white shadow-sm border border-slate-200 rounded-lg p-8 text-center">
          <div className="text-red-500 text-xl mb-4">Error Loading Assignment</div>
          <p className="text-slate-700">{error || 'Assignment not found'}</p>
          <button 
            onClick={() => window.history.back()}
            className="mt-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 shadow-sm transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Table loading skeleton
  const AttendanceTableSkeleton = () => (
    <div className="animate-pulse">
      <div className="h-8 bg-slate-200 rounded w-1/3 mb-4"></div>
      <div className="space-y-3">
        <div className="h-10 bg-slate-200 rounded w-full"></div>
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-12 bg-slate-100 rounded w-full"></div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <div className="bg-white shadow-sm border border-slate-200 rounded-lg overflow-hidden">
        {/* Header section */}
        <div className="p-5 border-b border-slate-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h1 className="text-xl font-bold text-slate-900">Assignment #{assignmentDetails.id}</h1>
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium
              ${assignmentDetails.status === 'active' ? 'bg-blue-100 text-blue-700 border border-blue-200' : 
                assignmentDetails.status === 'upcoming' ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                'bg-emerald-100 text-emerald-700 border border-emerald-200'}`}>
              {assignmentDetails.status.charAt(0).toUpperCase() + assignmentDetails.status.slice(1)}
            </div>
          </div>

          {/* Assignment basic details grid */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6">
            {/* Nurse Information */}
            <div className="border border-slate-200 rounded-lg p-4 shadow-sm">
              <h2 className="text-base font-semibold text-slate-800 mb-3 flex items-center">
                <UserIcon className="h-5 w-5 mr-2 text-blue-600" />
                Nurse Information
              </h2>
              <div className="space-y-3 ml-7">
                <div>
                  <p className="text-sm font-medium text-slate-500">Name</p>
                  <Link
                    target='_blank'  
                    href={`/nurses/${assignmentDetails.nurseDetails.id}`} className="text-blue-600 hover:text-blue-800 hover:underline">
                    {assignmentDetails.nurseDetails.name}
                  </Link>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">Nurse ID</p>
                  <p className="text-slate-800">{assignmentDetails.nurseDetails.id}</p>
                </div>
              </div>
            </div>

            {/* Client Information */}
            <div className="border border-slate-200 rounded-lg p-4 shadow-sm">
              <h2 className="text-base font-semibold text-slate-800 mb-3 flex items-center">
                <BuildingOffice2Icon className="h-5 w-5 mr-2 text-blue-600" />
                Client Information
              </h2>
              <div className="space-y-3 ml-7">
                <div>
                  <p className="text-sm font-medium text-slate-500">Name</p>
                  <Link
                    target='_blank' 
                    href={assignmentDetails.clientDetails.clientProfileUrl || ""} className="text-blue-600 hover:text-blue-800 hover:underline">
                    {assignmentDetails.clientDetails.name}
                  </Link>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">Type</p>
                  <p className="text-slate-800">{assignmentDetails.clientDetails.type}</p>
                </div>
              </div>
            </div>

            {/* Assignment Period */}
            <div className="border border-slate-200 rounded-lg p-4 shadow-sm">
              <h2 className="text-base font-semibold text-slate-800 mb-3 flex items-center">
                <CalendarIcon className="h-5 w-5 mr-2 text-blue-600" />
                Assignment Period
              </h2>
              <div className="space-y-3 ml-7">
                <div>
                  <p className="text-sm font-medium text-slate-500">Start Date</p>
                  <p className="text-slate-800">
                    {format(new Date(assignmentDetails.assignmentPeriod.startDate), 'MMMM d, yyyy')}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">End Date</p>
                  <p className="text-slate-800">
                    {format(new Date(assignmentDetails.assignmentPeriod.endDate), 'MMMM d, yyyy')}
                  </p>
                </div>
              </div>
            </div>

            {/* Shift Details */}
            <div className="border border-slate-200 rounded-lg p-4 shadow-sm">
              <h2 className="text-base font-semibold text-slate-800 mb-3 flex items-center">
                <ClockIcon className="h-5 w-5 mr-2 text-blue-600" />
                Shift Details
              </h2>
              <div className="space-y-3 ml-7">
                <div>
                  <p className="text-sm font-medium text-slate-500">Hours</p>
                  <p className="text-slate-800">
                    {(assignmentDetails.shiftDetails.startTime)} - {(assignmentDetails.shiftDetails.endTime)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Daily attendance records table */}
        <div className="p-5">
            <div className="flex flex-col xs:flex-row sm:flex-row items-start xs:items-center sm:items-center justify-between mb-4 pb-2 border-b border-slate-200">
              <h2 className="text-sm sm:text-md font-medium text-slate-800 flex items-center">
                <CalendarIcon className="w-5 h-5 text-slate-700 mr-2" />
                Daily Attendance Records
              </h2>
            </div>
            
            {tableLoading ? (
              <AttendanceTableSkeleton />
            ) : attendanceRecords.length === 0 ? (
              <div className="py-12 text-center">
                <div className="bg-slate-50 border border-slate-200 rounded-lg px-6 py-8 max-w-md mx-auto">
                  <CalendarIcon className="h-12 w-12 mx-auto text-slate-400" />
                  <h3 className="mt-4 text-lg font-medium text-slate-700">No attendance records</h3>
                  <p className="mt-2 text-sm text-slate-500">
                    There are no attendance records available for this assignment yet.
                  </p>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="px-4 py-3 text-left text-sm font-semibold text-slate-600">Date</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-slate-600">Check-in Time</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-slate-600">Check-out Time</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-slate-600">Total Hours</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-slate-600">Status</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-slate-600">Location</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-slate-600">Entry Type</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {attendanceRecords.map((record, index) => {
                      const { url: locationUrl, isValidLocation } = createGoogleMapsLink(record.location || null);                      
                      return (
                        <tr key={index} className={index % 2 === 0 ? 'bg-white hover:bg-slate-50 transition-colors' : 'bg-slate-50 hover:bg-slate-100 transition-colors'}>
                          <td className="px-4 py-4 text-sm text-slate-900 font-medium">
                            {format(new Date(record.date), 'EEE, MMM d, yyyy')}
                          </td>
                          <td className="px-4 py-4 text-sm text-slate-700">
                            {record.checkIn ? formatTime(record.checkIn) : '—'}
                          </td>
                          <td className="px-4 py-4 text-sm text-slate-700">
                            {record.checkOut ? formatTime(record.checkOut) : '—'}
                          </td>
                          <td className="px-4 py-4 text-sm text-slate-700">
                            {record.totalHours === '0' ? '—' : `${record.totalHours}`}
                          </td>
                          <td className="px-4 py-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusBadgeClasses(record.status)}`}>
                              {record.status.charAt(0).toUpperCase() + record.status.slice(1).replace('-', ' ')}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-sm text-slate-700 max-w-xs">
                            {isValidLocation ? (
                              <a 
                                href={locationUrl || "#"} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="inline-flex items-center text-blue-600 hover:text-blue-800 hover:underline"
                              >
                                <MapPinIcon className="h-4 w-4 mr-1" />
                                View on Map
                              </a>
                            ) : (
                              <span className="text-slate-500">—</span>
                            )}
                          </td>
                          <td className="px-4 py-4 text-sm">
                            {record.status === 'Absent' ? (
                              '—'
                            ) : record.isAdminAction ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200">
                                Admin Entry
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800 border border-slate-200">
                                Self Check-in
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
            
            <div className="mt-4">
              {attendanceRecords.length > 0 && (
                <PaginationControls
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalCount={recordsCount}
                  pageSize={pageSize}
                  itemsLength={attendanceRecords.length}
                  onPageChange={handlePageChange}
                  onPreviousPage={handlePreviousPage}
                  onNextPage={handleNextPage}
                />
              )}
            </div>
        </div>
      </div>
    </div>
  );
}