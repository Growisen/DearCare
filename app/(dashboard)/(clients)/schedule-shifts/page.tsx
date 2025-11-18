'use client';

import React, { useState, useEffect, useMemo, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { listNurses } from '@/app/actions/staff-management/add-nurse';
import { scheduleNurseShifts } from '@/app/actions/scheduling/shift-schedule-actions';
import LoadingSpinner from '@/components/scheduleShifts/LoadingSpinner';
import StateDisplay from '@/components/scheduleShifts/StateDisplay';
import ErrorIcon from '@/components/scheduleShifts/ErrorIcon';
import InfoIcon from '@/components/scheduleShifts/InfoIcon';
import NurseShiftFormCard from '@/components/scheduleShifts/NurseShiftFormCard';
import { Button } from '@/components/ui/Button';
import { Nurse, ShiftData } from '@/types/scheduleShift.types';
import { toast } from "sonner"

function ScheduleShiftsContent() {
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

        const nursesData = allNurses.filter((nurse) =>
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

  const handleShiftChange = useCallback(
    (nurseId: string, field: keyof ShiftData, value: string) => {
      if (field === 'shiftStart' || field === 'shiftEnd') {
        const formattedTime =
          value.includes(':') && value.split(':').length === 2
            ? `${value}:00`
            : value;

        setShifts((prev) =>
          prev.map((shift) =>
            shift.nurseId === nurseId
              ? { ...shift, [field]: formattedTime }
              : shift
          )
        );
      } else {
        setShifts((prev) =>
          prev.map((shift) =>
            shift.nurseId === nurseId ? { ...shift, [field]: value } : shift
          )
        );
      }
    },
    []
  );

  const handleSubmit = useCallback(async () => {
    try {
      const isValid = shifts.every(
        (shift) =>
          shift.startDate &&
          shift.endDate &&
          shift.shiftStart &&
          shift.shiftEnd &&
          shift.salaryPerDay
      );

      if (!isValid) {
        toast.error('Please complete all shift information for all nurses', {
          action: {
            label: 'OK',
            onClick: () => toast.dismiss(),
          },
          duration: Infinity,
        });
        return;
      }

      if (!clientId) {
        toast.error('Missing client information', {
          action: {
            label: 'OK',
            onClick: () => toast.dismiss(),
          },
          duration: Infinity,
        });
        return;
      }

      setLoading(true);

      const result = await scheduleNurseShifts(shifts, clientId);

      if (result.success) {
        if (
          window.opener &&
          !window.opener.closed &&
          typeof window.opener.onNurseAssignmentComplete === 'function'
        ) {
          window.opener.onNurseAssignmentComplete();
        }
        toast.success('Shifts scheduled successfully!', {
          action: {
            label: 'OK',
            onClick: () => window.close(),
          },
          duration: 10000, 
        });
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error('Error assigning nurses:', error);
      toast.error(
        `Failed to assign nurses: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
        {
          action: {
            label: 'OK',
            onClick: () => toast.dismiss(),
          },
          duration: Infinity,
        }
      );
    } finally {
      setLoading(false);
    }
  }, [shifts, clientId]);

  const today = useMemo(() => new Date().toISOString().split('T')[0], []);

  if (loading) {
    return <LoadingSpinner text="Loading nurse data..." />;
  }

  if (error) {
    return (
      <StateDisplay
        title="Error Loading Data"
        message={error}
        buttonText="Try Again"
        onButtonClick={() => window.location.reload()}
      >
        <ErrorIcon />
      </StateDisplay>
    );
  }

  if (nurses.length === 0) {
    return (
      <StateDisplay
        title="No nurses selected"
        message="Return to the nurse list and select nurses to schedule shifts."
        buttonText="Close This Window"
        onButtonClick={() => window.close()}
      >
        <InfoIcon />
      </StateDisplay>
    );
  }

  return (
    <div className="container max-w-full">
      <div className="bg-white shadow-sm rounded-lg p-8 border border-gray-200">
        <div className="mb-8 bg-gray-50 p-5 rounded-lg border border-gray-200">
          <h2 className="text-gray-800 font-semibold text-lg mb-2">
            Assignment Information
          </h2>
          <p className="text-gray-600 text-sm leading-relaxed">
            You are scheduling shifts for {nurses.length} nurse
            {nurses.length > 1 ? 's' : ''}. Please specify the start date, end
            date, and daily shift times for each nurse.
          </p>
        </div>

        <div className="space-y-6">
          {nurses.map((nurse) => {
            const nurseShift = shifts.find((s) => s.nurseId === nurse._id);
            
            if (!nurseShift) return null;

            return (
              <NurseShiftFormCard
                key={nurse._id}
                nurse={nurse}
                shift={nurseShift}
                onChange={handleShiftChange}
                minDate={today}
              />
            );
          })}
        </div>

        <div className="mt-8 flex justify-end space-x-3 pt-6 border-t border-gray-200">
          <Button
            onClick={() => window.close()}
            className="border border-gray-300 text-gray-700 hover:bg-gray-100 font-medium"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            className="bg-blue-600 text-white hover:bg-blue-700 font-medium"
            disabled={loading}
          >
            {loading ? 'Submitting...' : 'Confirm Assignments'}
          </Button>
        </div>
      </div>
    </div>
  );
};

const ScheduleShiftsPage = () => {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <ScheduleShiftsContent />
    </Suspense>
  );
};

export default ScheduleShiftsPage;