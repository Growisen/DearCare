'use client';

import React, { useState, useEffect, useMemo, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { listNurses } from '@/app/actions/add-nurse';
import { scheduleNurseShifts } from '@/app/actions/shift-schedule-actions';

interface Nurse {
  _id: string;
  firstName: string;
  lastName: string;
  experience: number;
  rating?: number;
  profileImage?: string;
  specialty?: string;
}

interface ShiftData {
  nurseId: string;
  startDate: string;
  endDate: string;
  shiftStart: string;
  shiftEnd: string;
}

// Create a separate component that uses useSearchParams
const ScheduleShiftsContent = () => {
  console.log('ScheduleShiftsPage rendering');
  
  const searchParams = useSearchParams();
  const nurseIds = useMemo(() => {
    console.log('Recalculating nurseIds');
    return searchParams.getAll('nurseIds');
  }, [searchParams]);
  
  const clientId = useMemo(() => {
    return searchParams.get('clientId');
  }, [searchParams]);
  
  const [nurses, setNurses] = useState<Nurse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [shifts, setShifts] = useState<ShiftData[]>([]);
  
  useEffect(() => {
  if (!nurseIds.length) {
    setLoading(false);
    return;
  }
  
  const fetchNurses = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { data: allNurses, error: nurseError } = await listNurses();
      
      if (nurseError) {
        throw new Error(`Error: ${nurseError}`);
      }
      
      if (!allNurses) {
        throw new Error('Failed to load nurse data');
      }
      
      const nursesData = allNurses.filter(nurse => 
        nurseIds.includes(nurse._id)
      );
      
      const initialShifts = nursesData.map((nurse) => ({
        nurseId: nurse._id,
        startDate: '',
        endDate: '',
        shiftStart: '09:00:00',
        shiftEnd: '17:00:00',
      }));
            
      setNurses(nursesData);
      setShifts(initialShifts);
    } catch (err) {
      console.error('Error fetching nurses:', err);
      setError('Failed to load nurse data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  fetchNurses();
}, [nurseIds]);
  
  // Memoize handleShiftChange to prevent recreating on every render
  const handleShiftChange = useCallback((nurseId: string, field: keyof ShiftData, value: string) => {
    if (field === 'shiftStart' || field === 'shiftEnd') {
      // Ensure time is in proper format (add :00 seconds if needed)
      const formattedTime = value.includes(':') && value.split(':').length === 2 
        ? `${value}:00` 
        : value;
      
      setShifts(prev => 
        prev.map(shift => 
          shift.nurseId === nurseId ? { ...shift, [field]: formattedTime } : shift
        )
      );
    } else {
      setShifts(prev => 
        prev.map(shift => 
          shift.nurseId === nurseId ? { ...shift, [field]: value } : shift
        )
      );
    }
  }, []);
    
    // Memoize handleSubmit to prevent recreating on every render
    const handleSubmit = useCallback(async () => {
      try {
        const isValid = shifts.every(shift => 
          shift.startDate && shift.endDate && shift.shiftStart && shift.shiftEnd
        );
        
        if (!isValid) {
          alert('Please complete all shift information for all nurses');
          return;
        }
        
        if (!clientId) {
          alert('Missing client information');
          return;
        }
        
        setLoading(true);
        
        // Call server action to schedule shifts with clientId
        const result = await scheduleNurseShifts(shifts, clientId);
        
        if (result.success) {
          alert('Shifts scheduled successfully!');
          window.close();
        } else {
          throw new Error(result.message);
        }
      } catch (error) {
        console.error('Error assigning nurses:', error);
        alert(`Failed to assign nurses: ${error instanceof Error ? error.message : 'Unknown error'}`);
      } finally {
        setLoading(false);
      }
    }, [shifts, clientId]);
  
  // Memoize today's date to avoid recalculating it on every render
  const today = useMemo(() => new Date().toISOString().split('T')[0], []);
  
  if (loading) {
    return (
      <div className="p-8 flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin h-10 w-10 border-4 border-blue-500 rounded-full border-t-transparent"></div>
        <span className="ml-3 text-gray-600">Loading nurse data...</span>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="p-8 text-center min-h-[60vh] flex flex-col items-center justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-red-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <h2 className="text-xl font-semibold text-gray-700 mb-2">Error Loading Data</h2>
        <p className="text-gray-500">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Try Again
        </button>
      </div>
    );
  }
  
  if (nurses.length === 0) {
    return (
      <div className="p-8 text-center min-h-[60vh] flex flex-col items-center justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <h2 className="text-xl font-semibold text-gray-700 mb-2">No nurses selected</h2>
        <p className="text-gray-500">Return to the nurse list and select nurses to schedule shifts.</p>
        <button 
          onClick={() => window.close()}
          className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Close This Window
        </button>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto p-3 sm:p-4 max-w-full">
      <div className="bg-white shadow-md rounded-lg p-6 border border-gray-100">
        <div className="mb-6 bg-blue-50 p-4 rounded-md border-l-4 border-blue-500">
          <h2 className="text-blue-800 font-medium">Assignment Information</h2>
          <p className="text-blue-700 text-sm mt-1">
            You are scheduling shifts for {nurses.length} nurse{nurses.length > 1 ? 's' : ''}. 
            Please specify the start date, end date, and daily shift times for each nurse.
          </p>
        </div>
        
        <div className="space-y-5">
          {nurses.map(nurse => {
            const nurseShift = shifts.find(s => s.nurseId === nurse._id) || {
              nurseId: nurse._id,
              startDate: '',
              endDate: '',
              shiftStart: '09:00',
              shiftEnd: '17:00',
            };
            
            return (
              <div key={nurse._id} className="border-b pb-4">
                <div className="flex items-center mb-4">
                  <div className="h-12 w-12 rounded-full bg-blue-100 mr-3 overflow-hidden relative">
                    {nurse.profileImage ? (
                        <Image 
                            src={nurse.profileImage} 
                            alt={`${nurse.firstName} ${nurse.lastName}`} 
                            className="object-cover"
                            fill={true}
                            sizes="48px"
                            priority={false}
                        />
                        ) : (
                        <span className="text-blue-700 font-semibold text-lg flex items-center justify-center h-full">
                            {nurse.firstName.charAt(0)}{nurse.lastName.charAt(0)}
                        </span>
                    )}
                    </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">
                      {nurse.firstName} {nurse.lastName}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {nurse.specialty} • {nurse.experience} years exp. • {nurse.rating}/5 rating
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Date *
                    </label>
                    <input
                      type="date"
                      value={nurseShift.startDate}
                      onChange={(e) => handleShiftChange(nurse._id, 'startDate', e.target.value)}
                      className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-700"
                      required
                      min={today}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      End Date *
                    </label>
                    <input
                      type="date"
                      value={nurseShift.endDate}
                      onChange={(e) => handleShiftChange(nurse._id, 'endDate', e.target.value)}
                      className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-700"
                      required
                      min={nurseShift.startDate || today}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Shift Start Time *
                    </label>
                    <input
                      type="time"
                      value={nurseShift.shiftStart.substring(0, 5)} // Display only HH:MM part
                      onChange={(e) => handleShiftChange(nurse._id, 'shiftStart', e.target.value)}
                      className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-700"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Shift End Time *
                    </label>
                    <input
                      type="time"
                      value={nurseShift.shiftEnd.substring(0, 5)} // Display only HH:MM part
                      onChange={(e) => handleShiftChange(nurse._id, 'shiftEnd', e.target.value)}
                      className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-700"
                      required
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="mt-8 flex justify-end space-x-4">
          <button
            onClick={() => window.close()}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
          >
            Confirm Assignments
          </button>
        </div>
      </div>
    </div>
  );
};

// Loading fallback component
function LoadingFallback() {
  return (
    <div className="p-8 flex justify-center items-center min-h-[60vh]">
      <div className="animate-spin h-10 w-10 border-4 border-blue-500 rounded-full border-t-transparent"></div>
      <span className="ml-3 text-gray-600">Loading...</span>
    </div>
  );
}

// Main component with Suspense boundary
const ScheduleShiftsPage = () => {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ScheduleShiftsContent />
    </Suspense>
  );
};

export default ScheduleShiftsPage;