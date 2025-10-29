'use client';

import React, { useState, useEffect, useMemo, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { listNurses } from '@/app/actions/staff-management/add-nurse';
import { scheduleNurseShifts } from '@/app/actions/scheduling/shift-schedule-actions';

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
  salaryPerDay: string;
}

const ScheduleShiftsContent = () => {  
  const searchParams = useSearchParams();
  const nurseIds = useMemo(() => {
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
        salaryPerDay: '',
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
  
  const handleShiftChange = useCallback((nurseId: string, field: keyof ShiftData, value: string) => {
    if (field === 'shiftStart' || field === 'shiftEnd') {
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
    
    const handleSubmit = useCallback(async () => {
      try {
        const isValid = shifts.every(shift => 
          shift.startDate && shift.endDate && shift.shiftStart && shift.shiftEnd && shift.salaryPerDay // Add salary validation
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
        
        const result = await scheduleNurseShifts(shifts, clientId);
        
        if (result.success) {
          if (window.opener && !window.opener.closed && typeof window.opener.onNurseAssignmentComplete === 'function') {
            window.opener.onNurseAssignmentComplete();
          }
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
    <div className="container max-w-full">
      <div className="bg-white shadow-sm rounded-lg p-8 border border-gray-200">
        <div className="mb-8 bg-gray-50 p-5 rounded-lg border border-gray-200">
          <h2 className="text-gray-800 font-semibold text-lg mb-2">Assignment Information</h2>
          <p className="text-gray-600 text-sm leading-relaxed">
            You are scheduling shifts for {nurses.length} nurse{nurses.length > 1 ? 's' : ''}. 
            Please specify the start date, end date, and daily shift times for each nurse.
          </p>
        </div>
        
        <div className="space-y-6">
          {nurses.map(nurse => {
            const nurseShift = shifts.find(s => s.nurseId === nurse._id) || {
              nurseId: nurse._id,
              startDate: '',
              endDate: '',
              shiftStart: '09:00',
              shiftEnd: '17:00',
              salaryPerDay: '',
            };
            
            let estimatedSalary = '';
            if (nurseShift.startDate && nurseShift.endDate && nurseShift.salaryPerDay) {
              const start = new Date(nurseShift.startDate);
              const end = new Date(nurseShift.endDate);
              const days =
                Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
              const salary = parseFloat(nurseShift.salaryPerDay);
              if (!isNaN(days) && !isNaN(salary) && days > 0) {
                estimatedSalary = `Estimated Salary: ₹${(days * salary).toFixed(2)} for ${days} day${days > 1 ? 's' : ''}`;
              }
            }

            return (
              <div key={nurse._id} className="border border-gray-200 rounded-lg p-6 bg-gray-50">
                <div className="flex items-center mb-5 justify-between">
                  <div className="flex items-center">
                    <div className="h-14 w-14 rounded-full bg-gray-200 mr-4 overflow-hidden relative border border-gray-300">
                      {nurse.profileImage ? (
                        <Image 
                            src={nurse.profileImage} 
                            alt={`${nurse.firstName} ${nurse.lastName}`} 
                            className="object-cover"
                            fill={true}
                            sizes="56px"
                            priority={false}
                        />
                        ) : (
                        <span className="text-gray-700 font-semibold text-lg flex items-center justify-center h-full">
                            {nurse.firstName.charAt(0)}{nurse.lastName.charAt(0)}
                        </span>
                    )}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {nurse.firstName} {nurse.lastName}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {nurse.specialty} • {nurse.experience} years exp. • {nurse.rating}/5 rating
                      </p>
                    </div>
                  </div>
                  {estimatedSalary && (
                    <div className="text-gray-700 text-sm font-semibold ml-4 whitespace-nowrap bg-white px-4 py-2 rounded-md border border-gray-300">
                      {estimatedSalary}
                    </div>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5 bg-white p-5 rounded-lg border border-gray-200">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Start Date *
                    </label>
                    <input
                      type="date"
                      value={nurseShift.startDate}
                      onChange={(e) => handleShiftChange(nurse._id, 'startDate', e.target.value)}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-md focus:border-gray-400 text-gray-800 bg-white focus:outline-none"
                      required
                      min={today}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      End Date *
                    </label>
                    <input
                      type="date"
                      value={nurseShift.endDate}
                      onChange={(e) => handleShiftChange(nurse._id, 'endDate', e.target.value)}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-md focus:border-gray-400 text-gray-800 bg-white focus:outline-none"
                      required
                      min={nurseShift.startDate || today}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Shift Start Time *
                    </label>
                    <input
                      type="time"
                      value={nurseShift.shiftStart.substring(0, 5)}
                      onChange={(e) => handleShiftChange(nurse._id, 'shiftStart', e.target.value)}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-md focus:border-gray-400 text-gray-800 bg-white focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Shift End Time *
                    </label>
                    <input
                      type="time"
                      value={nurseShift.shiftEnd.substring(0, 5)}
                      onChange={(e) => handleShiftChange(nurse._id, 'shiftEnd', e.target.value)}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-md focus:border-gray-400 text-gray-800 bg-white focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Salary Per Day *
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={nurseShift.salaryPerDay}
                      onChange={(e) => handleShiftChange(nurse._id, 'salaryPerDay', e.target.value)}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-md focus:border-gray-400 text-gray-800 bg-white focus:outline-none"
                      required
                      placeholder="Enter salary amount"
                    />
                    {estimatedSalary && (
                      <div className="text-gray-700 text-sm mt-2 font-medium">
                        {estimatedSalary}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="mt-8 flex justify-end space-x-3 pt-6 border-t border-gray-200">
          <button
            onClick={() => window.close()}
            className="px-5 py-2.5 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
          >
            Confirm Assignments
          </button>
        </div>
      </div>
    </div>
  );
};

function LoadingFallback() {
  return (
    <div className="p-8 flex justify-center items-center min-h-[60vh]">
      <div className="animate-spin h-10 w-10 border-4 border-blue-500 rounded-full border-t-transparent"></div>
      <span className="ml-3 text-gray-600">Loading...</span>
    </div>
  );
}

const ScheduleShiftsPage = () => {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ScheduleShiftsContent />
    </Suspense>
  );
};

export default ScheduleShiftsPage;