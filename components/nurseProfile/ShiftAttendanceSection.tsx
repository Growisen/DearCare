'use client';

import React, { useState } from 'react';
import { useShiftAttendanceStats, useShiftHistory } from '@/hooks/useShiftAttendance';
import { formatOrganizationName } from '@/utils/formatters';
import { calculateShiftDays } from '@/types/shift-attendance.types';

interface ShiftAttendanceSectionProps {
  nurseId: number;
  admittedType: string | null;
}

const ShiftAttendanceSection: React.FC<ShiftAttendanceSectionProps> = ({ 
  nurseId, 
  admittedType 
}) => {
  const [activeView, setActiveView] = useState<'stats' | 'history'>('stats');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  // Fetch shift attendance stats
  const { data: stats, isLoading: statsLoading } = useShiftAttendanceStats(nurseId);

  // Fetch shift history
  const { data: historyData, isLoading: historyLoading } = useShiftHistory({
    nurseId: nurseId,
    page: currentPage,
    pageSize,
  });

  // Check if nurse belongs to Tata HomeNursing
  const isTataHomeNursing = admittedType === 'tata-home-nursing';

  if (!isTataHomeNursing) {
    return null; // Don't render for non-Tata nurses
  }

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return 'Invalid Date';
    }
  };

  const formatDateTime = (dateString: string | null | undefined) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return `${date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })} ${date.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      })}`;
    } catch {
      return 'Invalid DateTime';
    }
  };

  const formatDuration = (days: number | null | undefined) => {
    if (!days || days === 0) return '0 days';
    
    const wholeDays = Math.floor(days);
    const remainingHours = Math.round((days - wholeDays) * 24);
    
    if (wholeDays === 0) {
      return `${remainingHours} ${remainingHours === 1 ? 'hour' : 'hours'}`;
    } else if (remainingHours === 0) {
      return `${wholeDays} ${wholeDays === 1 ? 'day' : 'days'}`;
    } else {
      return `${wholeDays} ${wholeDays === 1 ? 'day' : 'days'}, ${remainingHours} ${remainingHours === 1 ? 'hour' : 'hours'}`;
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 px-6 py-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold text-gray-800 flex items-center">
              <svg className="w-5 h-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Shift-Based Attendance
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Tracking for {formatOrganizationName(admittedType)}
            </p>
          </div>
          
          {/* View Toggle */}
          <div className="flex bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
            <button
              onClick={() => setActiveView('stats')}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeView === 'stats'
                  ? 'bg-purple-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              <svg className="w-4 h-4 inline mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Statistics
            </button>
            <button
              onClick={() => setActiveView('history')}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeView === 'history'
                  ? 'bg-purple-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              <svg className="w-4 h-4 inline mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              History
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeView === 'stats' ? (
          // Statistics View
          <div>
            {statsLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600 mx-auto"></div>
                <p className="text-gray-600 mt-4">Loading statistics...</p>
              </div>
            ) : stats ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Total Attendance Days */}
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-blue-800">Total Attendance Days</h3>
                    <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="text-3xl font-bold text-blue-900">
                    {stats.totalAttendanceDays.toFixed(2)}
                  </p>
                  <p className="text-xs text-blue-700 mt-1">Days worked</p>
                </div>

                {/* Completed Shifts */}
                <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-green-800">Completed Shifts</h3>
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-3xl font-bold text-green-900">
                    {stats.totalShifts}
                  </p>
                  <p className="text-xs text-green-700 mt-1">Shifts finished</p>
                </div>

                {/* Active Shifts */}
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-lg p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-orange-800">Active Shifts</h3>
                    <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <p className="text-3xl font-bold text-orange-900">
                    {stats.activeShifts}
                  </p>
                  <p className="text-xs text-orange-700 mt-1">Currently active</p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No statistics available</h3>
                <p className="mt-1 text-sm text-gray-500">
                  No shift attendance data found for this nurse.
                </p>
              </div>
            )}
          </div>
        ) : (
          // History View
          <div>
            {historyLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600 mx-auto"></div>
                <p className="text-gray-600 mt-4">Loading history...</p>
              </div>
            ) : historyData && historyData.records.length > 0 ? (
              <div className="space-y-4">
                {/* Shift History Records */}
                {historyData.records.map((record, index) => (
                  <div
                    key={`${record.assignmentId}-${index}`}
                    className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                  >
                    <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                      <div className="flex flex-wrap justify-between items-center gap-2">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-gray-800">
                            {record.clientName}
                          </h4>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            record.status === 'completed'
                              ? 'bg-green-100 text-green-800 border border-green-200'
                              : 'bg-orange-100 text-orange-800 border border-orange-200'
                          }`}>
                            {record.status === 'completed' ? 'Completed' : 'Active'}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600">
                          Assignment #{record.assignmentId}
                        </div>
                      </div>
                    </div>

                    <div className="p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Shift Start */}
                        <div className="space-y-2">
                          <div className="flex items-center text-sm">
                            <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="font-medium text-gray-700 w-24">Shift Start:</span>
                            <span className="text-gray-900">{formatDateTime(record.shiftStartDatetime)}</span>
                          </div>
                          {record.startLocation && (
                            <div className="flex items-start text-xs text-gray-600 ml-6">
                              <svg className="w-3 h-3 text-gray-400 mr-1 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              </svg>
                              <span>
                                {record.startLocation.latitude.toFixed(6)}, {record.startLocation.longitude.toFixed(6)}
                                {record.startLocation.address && (
                                  <span className="block mt-0.5 text-gray-500">{record.startLocation.address}</span>
                                )}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Shift End */}
                        <div className="space-y-2">
                          {record.shiftEndDatetime ? (
                            <>
                              <div className="flex items-center text-sm">
                                <svg className="w-4 h-4 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span className="font-medium text-gray-700 w-24">Shift End:</span>
                                <span className="text-gray-900">{formatDateTime(record.shiftEndDatetime)}</span>
                              </div>
                              {record.endLocation && (
                                <div className="flex items-start text-xs text-gray-600 ml-6">
                                  <svg className="w-3 h-3 text-gray-400 mr-1 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                  </svg>
                                  <span>
                                    {record.endLocation.latitude.toFixed(6)}, {record.endLocation.longitude.toFixed(6)}
                                    {record.endLocation.address && (
                                      <span className="block mt-0.5 text-gray-500">{record.endLocation.address}</span>
                                    )}
                                  </span>
                                </div>
                              )}
                            </>
                          ) : (
                            <div className="flex items-center text-sm">
                              <svg className="w-4 h-4 text-orange-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <span className="font-medium text-gray-700 w-24">Shift End:</span>
                              <span className="text-orange-600 italic">Currently active</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Attendance Days Badge */}
                      {record.calculatedAttendanceDays !== null && (
                        <div className="mt-4 flex items-center justify-between bg-purple-50 border border-purple-200 rounded-lg px-4 py-2">
                          <span className="text-sm font-medium text-purple-800">Attendance Days:</span>
                          <span className="text-lg font-bold text-purple-900">
                            {formatDuration(record.calculatedAttendanceDays)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {/* Pagination */}
                {historyData.totalPages > 1 && (
                  <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                    <div className="text-sm text-gray-600">
                      Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, historyData.totalCount)} of{' '}
                      {historyData.totalCount} shifts
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setCurrentPage(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="px-3 py-1 text-sm font-medium bg-white border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                      >
                        Previous
                      </button>
                      <div className="flex items-center px-3 py-1 text-sm text-gray-700">
                        Page {historyData.currentPage} of {historyData.totalPages}
                      </div>
                      <button
                        onClick={() => setCurrentPage(currentPage + 1)}
                        disabled={currentPage === historyData.totalPages}
                        className="px-3 py-1 text-sm font-medium bg-white border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No shift history</h3>
                <p className="mt-1 text-sm text-gray-500">
                  This nurse hasn't started any shifts yet.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ShiftAttendanceSection;
