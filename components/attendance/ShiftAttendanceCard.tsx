/**
 * @module ShiftAttendanceCard
 */

'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiClock, FiMapPin, FiPlay, FiSquare, FiCheckCircle } from 'react-icons/fi';
import { BiTimer } from 'react-icons/bi';
import { useShiftByAssignment, useStartShift, useEndShift, useShiftDuration } from '@/hooks/useShiftAttendance';
import type { ShiftLocation } from '@/types/shift-attendance.types';

interface ShiftAttendanceCardProps {
  /** Nurse ID for shift operations */
  nurseId: string;
  /** Assignment ID for shift tracking */
  assignmentId: number;
  /** Client name for display */
  clientName: string;
  /** Assignment start date */
  assignmentStartDate: string;
  /** Assignment end date */
  assignmentEndDate: string;
  /** Optional callback when shift operations complete */
  onShiftChange?: () => void;
}

/**
 * Shift Attendance Card Component
 * 
 * Displays shift controls and status for Tata Home Nursing employees
 */
export default function ShiftAttendanceCard({
  nurseId,
  assignmentId,
  clientName,
  assignmentStartDate,
  assignmentEndDate,
  onShiftChange,
}: ShiftAttendanceCardProps) {
  const [location, setLocation] = useState<ShiftLocation | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  // Query the specific assignment's shift data
  const shiftQuery = useShiftByAssignment(assignmentId, {
    enabled: !!assignmentId,
  });

  // Mutations for start/end shift
  const startShift = useStartShift({
    onSuccess: () => {
      shiftQuery.refetch();
      onShiftChange?.();
    },
  });

  const endShift = useEndShift({
    onSuccess: () => {
      shiftQuery.refetch();
      onShiftChange?.();
    },
  });

  // Derive shift status from the assignment data
  const activeShiftData = shiftQuery.data;
  const hasActiveShift = activeShiftData?.status === 'in_progress';
  const hasNotStarted = activeShiftData?.status === 'not_started' || !activeShiftData;
  const isCompleted = activeShiftData?.status === 'completed';
  const canStartShift = hasNotStarted && !startShift.isPending;
  const canEndShift = hasActiveShift && !endShift.isPending;
  const isStarting = startShift.isPending;
  const isEnding = endShift.isPending;

  // Calculate current shift duration
  const shiftDuration = useShiftDuration(
    activeShiftData?.shiftStartDatetime || null,
    activeShiftData?.shiftEndDatetime || null
  );

  // Get user's current location
  const getCurrentLocation = (): Promise<ShiftLocation> => {
    return new Promise((resolve, reject) => {
      setIsGettingLocation(true);
      setLocationError(null);

      if (!navigator.geolocation) {
        const error = 'Geolocation is not supported by your browser';
        setLocationError(error);
        setIsGettingLocation(false);
        reject(new Error(error));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const loc: ShiftLocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            timestamp: new Date().toISOString(),
          };
          setLocation(loc);
          setIsGettingLocation(false);
          resolve(loc);
        },
        (error) => {
          let errorMessage = 'Failed to get location';
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Location permission denied. Please enable location access.';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location information unavailable';
              break;
            case error.TIMEOUT:
              errorMessage = 'Location request timed out';
              break;
          }
          setLocationError(errorMessage);
          setIsGettingLocation(false);
          reject(new Error(errorMessage));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    });
  };

  // Handle shift start
  const handleStartShift = async () => {
    try {
      const currentLocation = await getCurrentLocation();
      
      await startShift.mutateAsync({
        assignmentId,
        location: currentLocation,
      });
    } catch (error) {
      console.error('Error starting shift:', error);
    }
  };

  // Handle shift end
  const handleEndShift = async () => {
    try {
      const currentLocation = await getCurrentLocation();
      
      await endShift.mutateAsync({
        assignmentId,
        location: currentLocation,
      });
    } catch (error) {
      console.error('Error ending shift:', error);
    }
  };

  // Format duration display
  const formatDuration = () => {
    if (shiftDuration.days > 0) {
      return `${shiftDuration.days}d ${shiftDuration.hours}h ${shiftDuration.minutes}m`;
    } else if (shiftDuration.hours > 0) {
      return `${shiftDuration.hours}h ${shiftDuration.minutes}m`;
    } else {
      return `${shiftDuration.minutes}m`;
    }
  };

  // Format date for display
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

  // Format time for display
  const formatTime = (dateString: string | null | undefined) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
    } catch {
      return 'Invalid Time';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-white font-semibold text-lg">Shift Attendance</h3>
            <p className="text-blue-100 text-sm mt-1">
              Client: {clientName}
            </p>
          </div>
          <div className="flex items-center gap-2 bg-white/20 px-3 py-2 rounded-lg">
            <FiClock className="text-white" />
            <span className="text-white font-medium text-sm">
              {formatDate(assignmentStartDate)} - {formatDate(assignmentEndDate)}
            </span>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="p-6">
        <AnimatePresence mode="wait">
          {/* No Active Shift or Completed */}
          {(hasNotStarted || isCompleted) && (
            <motion.div
              key="no-shift"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-center py-8"
            >
              {isCompleted ? (
                <>
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FiCheckCircle className="text-green-600 text-3xl" />
                  </div>
                  <h4 className="text-gray-700 font-medium text-lg mb-2">
                    Shift Completed
                  </h4>
                  <p className="text-gray-500 text-sm mb-2">
                    This shift has been completed
                  </p>
                  {activeShiftData && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4 max-w-md mx-auto">
                      <div className="text-sm space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Started:</span>
                          <span className="font-medium">{formatDate(activeShiftData.shiftStartDatetime)} {formatTime(activeShiftData.shiftStartDatetime)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Ended:</span>
                          <span className="font-medium">{formatDate(activeShiftData.shiftEndDatetime)} {formatTime(activeShiftData.shiftEndDatetime)}</span>
                        </div>
                        <div className="flex justify-between border-t border-green-300 pt-2">
                          <span className="text-gray-700 font-medium">Attendance Days:</span>
                          <span className="font-bold text-green-700">{activeShiftData.calculatedAttendanceDays.toFixed(2)} days</span>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FiPlay className="text-gray-400 text-3xl" />
                  </div>
                  <h4 className="text-gray-700 font-medium text-lg mb-2">
                    Ready to Start Shift
                  </h4>
                  <p className="text-gray-500 text-sm mb-6">
                    Click the button below to start your shift for this assignment
                  </p>

                  {locationError && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-red-600 text-sm">{locationError}</p>
                    </div>
                  )}

                  <button
                    onClick={handleStartShift}
                    disabled={isStarting || isGettingLocation || !canStartShift}
                    className="px-8 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors flex items-center gap-2 mx-auto"
                  >
                    {isStarting || isGettingLocation ? (
                      <>
                        <BiTimer className="animate-spin" />
                        {isGettingLocation ? 'Getting Location...' : 'Starting Shift...'}
                      </>
                    ) : (
                      <>
                        <FiPlay />
                        Start Shift
                      </>
                    )}
                  </button>
                </>
              )}
            </motion.div>
          )}

          {/* Active Shift */}
          {hasActiveShift && activeShiftData && (
            <motion.div
              key="active-shift"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              {/* Shift Status Badge */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 rounded-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-green-700 font-medium text-sm">
                    Shift In Progress
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-gray-500 text-xs">Shift Started</p>
                  <p className="text-gray-900 font-medium text-sm">
                    {formatDate(activeShiftData.shiftStartDatetime)} at{' '}
                    {formatTime(activeShiftData.shiftStartDatetime)}
                  </p>
                </div>
              </div>

              {/* Duration Display */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 mb-6 border border-blue-100">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <BiTimer className="text-blue-600 text-xl" />
                    <span className="text-gray-700 font-medium">Current Duration</span>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-blue-600">
                      {shiftDuration.days}
                    </p>
                    <p className="text-gray-600 text-sm mt-1">Days</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-blue-600">
                      {shiftDuration.hours}
                    </p>
                    <p className="text-gray-600 text-sm mt-1">Hours</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-blue-600">
                      {shiftDuration.minutes}
                    </p>
                    <p className="text-gray-600 text-sm mt-1">Minutes</p>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-blue-200">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Estimated Attendance Days</span>
                    <span className="text-blue-700 font-semibold">
                      {activeShiftData.calculatedAttendanceDays.toFixed(2)} days
                    </span>
                  </div>
                </div>
              </div>

              {/* Location Info */}
              {activeShiftData.startLocation && (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-start gap-3">
                    <FiMapPin className="text-gray-500 mt-1" />
                    <div className="flex-1">
                      <p className="text-gray-700 font-medium text-sm mb-1">
                        Start Location
                      </p>
                      <p className="text-gray-600 text-xs">
                        {activeShiftData.startLocation.address || 
                          `${activeShiftData.startLocation.latitude.toFixed(6)}, ${activeShiftData.startLocation.longitude.toFixed(6)}`
                        }
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* End Shift Button */}
              {locationError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600 text-sm">{locationError}</p>
                </div>
              )}

              <button
                onClick={handleEndShift}
                disabled={isEnding || isGettingLocation || !canEndShift}
                className="w-full px-6 py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {isEnding || isGettingLocation ? (
                  <>
                    <BiTimer className="animate-spin" />
                    {isGettingLocation ? 'Getting Location...' : 'Ending Shift...'}
                  </>
                ) : (
                  <>
                    <FiSquare />
                    End Shift
                  </>
                )}
              </button>

              {/* Warning Message */}
              <p className="text-center text-gray-500 text-xs mt-3">
                Ending the shift will calculate your attendance days automatically
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer Info */}
      <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
        <div className="flex items-center justify-between text-xs text-gray-600">
          <span>Shift-based attendance for Tata Home Nursing</span>
          <div className="flex items-center gap-1">
            <FiCheckCircle className="text-green-500" />
            <span>Auto-calculation enabled</span>
          </div>
        </div>
      </div>
    </div>
  );
}
