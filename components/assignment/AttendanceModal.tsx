import React, { useState, useEffect } from 'react';
import { AttendanceRecord } from '@/hooks/useAssignment';

export function AttendanceModal({
  modalOpen,
  closeModal,
  selectedRecord,
  checkIn,
  setCheckIn,
  checkOut,
  setCheckOut,
  attendanceLoading,
  attendanceError,
  handleMarkAttendance,
  shiftStartTime,
  shiftEndTime,
}: {
  modalOpen: boolean;
  closeModal: () => void;
  selectedRecord: AttendanceRecord | null;
  checkIn: string;
  setCheckIn: (v: string) => void;
  checkOut: string;
  setCheckOut: (v: string) => void;
  attendanceLoading: boolean;
  attendanceError: string | null;
  handleMarkAttendance: () => void;
  shiftStartTime?: string;
  shiftEndTime?: string;
}) {
  const [localError, setLocalError] = useState<string | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

  useEffect(() => {
    if (localError) {
      const timer = setTimeout(() => setLocalError(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [localError]);

  useEffect(() => {
    if (modalOpen && selectedRecord && shiftStartTime && shiftEndTime) {
      const [startHours, startMinutes] = shiftStartTime.split(':').map(Number);
      const [endHours, endMinutes] = shiftEndTime.split(':').map(Number);
      
      const shiftStartMinutes = startHours * 60 + (startMinutes || 0);
      const shiftEndMinutes = endHours * 60 + (endMinutes || 0);
      
      let durationMinutes = shiftEndMinutes - shiftStartMinutes;
      if (durationMinutes < 0) {
        durationMinutes += 24 * 60;
      }
      
      if (durationMinutes >= 0) {
        const formattedStartTime = formatTimeFor24Hour(shiftStartTime);
        const formattedEndTime = formatTimeFor24Hour(shiftEndTime);
        
        setCheckIn(formattedStartTime);
        setCheckOut(formattedEndTime);
      } else {
        if (checkIn && checkOut) {
          setCheckIn('');
          setCheckOut('');
        }
      }
    }
  }, [modalOpen, selectedRecord, shiftStartTime, shiftEndTime, setCheckIn, setCheckOut, checkIn, checkOut]);
  
  function formatTimeFor24Hour(timeStr: string): string {
    if (timeStr.includes('AM') || timeStr.includes('PM')) {
      const [timePart, period] = timeStr.split(' ');
      // eslint-disable-next-line prefer-const
      let [hours, minutes] = timePart.split(':').map(Number);      

      if (period === 'PM' && hours < 12) hours += 12;
      if (period === 'AM' && hours === 12) hours = 0;
      
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    }
    
    return timeStr;
  }

  if (!modalOpen || !selectedRecord) return null;

  const calculateHoursWorked = (): string => {
    if (!checkIn || !checkOut) return "0h 0m";
    
    const [checkInHours, checkInMinutes] = checkIn.split(':').map(Number);
    const [checkOutHours, checkOutMinutes] = checkOut.split(':').map(Number);
    
    const checkInTotalMinutes = checkInHours * 60 + checkInMinutes;
    const checkOutTotalMinutes = checkOutHours * 60 + checkOutMinutes;
    
    let diffMinutes = checkOutTotalMinutes - checkInTotalMinutes;
    if (diffMinutes < 0) diffMinutes += 24 * 60;
    if (diffMinutes === 0 && checkIn === checkOut) diffMinutes = 24 * 60;

    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;
    
    return `${hours}h ${minutes}m`;
  };

  const hoursWorked = calculateHoursWorked();

  const validateTimes = () => {
    if (!checkIn || !checkOut) {
      setLocalError('Both check-in and check-out times are required.');
      return false;
    }
    if (checkIn === checkOut) {
      setLocalError('Check-in and check-out times cannot be the same.');
      return false;
    }
    if (checkIn > checkOut) {
      setLocalError('Check-in time must be before check-out time.');
      return false;
    }
    setLocalError(null);
    return true;
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateTimes()) {
      setShowConfirmation(true);
    }
  };

  const confirmAttendance = () => {
    setShowConfirmation(false);
    handleMarkAttendance();
  };

  const cancelConfirmation = () => {
    setShowConfirmation(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
      <div className="bg-white rounded-sm shadow-lg p-6 w-full max-w-md relative">
        <button
          className="absolute top-2 right-2 text-slate-400 hover:text-slate-600"
          onClick={closeModal}
          aria-label="Close"
        >
          ×
        </button>
        <h3 className="text-lg font-semibold mb-4 text-slate-800">Mark Attendance for {selectedRecord?.date}</h3>
        
        {showConfirmation ? (
          <div className="text-center">
            <div className="mb-4">
              <p className="mb-2 text-red-500">Are you sure you want to mark attendance with:</p>
              <p className="font-medium">
                <span className="text-slate-700">Check-in:</span>{' '}
                <span className="text-gray-800">{checkIn}</span>
              </p>
              <p className="font-medium">
                <span className="text-slate-700">Check-out:</span>{' '}
                <span className="text-gray-800">{checkOut}</span>
              </p>
              <p className="font-medium">
                <span className="text-slate-700">Hours worked:</span>{' '}
                <span className="text-gray-800">{hoursWorked}</span>
              </p>
              <p className="mt-4 text-xs text-red-600 font-semibold">
                This action cannot be undone !.
              </p>
            </div>
            <div className="flex justify-center gap-3">
              <button
                type="button"
                className="px-4 py-2 bg-slate-200 text-slate-700 rounded hover:bg-slate-300"
                onClick={cancelConfirmation}
                disabled={attendanceLoading}
              >
                Cancel
              </button>
              <button
                type="button"
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                onClick={confirmAttendance}
                disabled={attendanceLoading}
              >
                {attendanceLoading ? 'Marking...' : 'Confirm'}
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={onSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-1">Check-in Time</label>
              <input
                type="time"
                className="border rounded px-3 py-2 w-full text-slate-800"
                value={checkIn}
                onChange={e => setCheckIn(e.target.value)}
                required
                disabled={attendanceLoading}
                max={checkOut || undefined}
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-1">Check-out Time</label>
              <input
                type="time"
                className="border rounded px-3 py-2 w-full text-slate-800"
                value={checkOut}
                onChange={e => setCheckOut(e.target.value)}
                required
                disabled={attendanceLoading}
                min={checkIn || undefined}
              />
            </div>
            
            <div className="mb-4 flex items-center">
              <span className="text-sm font-medium text-slate-700 mr-2">Hours worked:</span>
              <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                {hoursWorked}
              </span>
            </div>
            
            {(localError || attendanceError) && (
              <div className="mb-3 text-red-600 text-sm">{localError || attendanceError}</div>
            )}
            <div className="flex justify-end gap-2">
              <button
                type="button"
                className="px-4 py-2 bg-slate-200 text-slate-700 rounded hover:bg-slate-300"
                onClick={closeModal}
                disabled={attendanceLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                disabled={attendanceLoading}
              >
                {attendanceLoading ? 'Marking...' : 'Mark Present'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}