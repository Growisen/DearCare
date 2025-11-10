import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';

interface Nurse {
  firstName: string;
  lastName: string;
}

interface NurseAssignment {
  id?: number;
  nurseId: number | string;
  startDate: string;
  endDate?: string;
  shiftStart?: string;
  shiftEnd?: string;
  status: 'active' | 'completed' | 'cancelled';
  shiftType?: 'day' | 'night' | '24h';
  salaryPerDay?: number;
}

interface EditAssignmentModalProps {
  isOpen: boolean;
  assignment: NurseAssignment | null;
  nurse?: Nurse | null;
  onClose: () => void;
  onSave: (updatedAssignment: NurseAssignment) => void;
}

const EditAssignmentModal: React.FC<EditAssignmentModalProps> = ({
  isOpen,
  assignment,
  nurse,
  onClose,
  onSave,
}) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [shiftStart, setShiftStart] = useState('09:00');
  const [shiftEnd, setShiftEnd] = useState('17:00');
  const [salaryPerDay, setSalaryPerDay] = useState<number | ''>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  useEffect(() => {
    if (assignment) {
      if (assignment.startDate) {
        const formattedStartDate = new Date(assignment.startDate).toISOString().split('T')[0];
        setStartDate(formattedStartDate);
      }
      
      if (assignment.endDate) {
        const formattedEndDate = new Date(assignment.endDate).toISOString().split('T')[0];
        setEndDate(formattedEndDate);
      }
      
      setShiftStart(assignment.shiftStart?.substring(0, 5) || '09:00');
      setShiftEnd(assignment.shiftEnd?.substring(0, 5) || '17:00');
      setSalaryPerDay(assignment.salaryPerDay ?? '');
    }
    setIsSubmitting(false);
    setError('');
  }, [assignment, isOpen]);
  
  if (!isOpen || !assignment) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (endDate && startDate && new Date(endDate) < new Date(startDate)) {
      setError('End date cannot be before start date');
      return;
    }
    if (salaryPerDay === '' || Number(salaryPerDay) <= 0) {
      setError('Salary per day must be a positive number');
      return;
    }

    setIsSubmitting(true);

    const updatedAssignment: NurseAssignment = {
      ...assignment,
      startDate,
      endDate,
      shiftStart: `${shiftStart}:00`,
      shiftEnd: `${shiftEnd}:00`,
      salaryPerDay: Number(salaryPerDay),
    };

    try {
      onSave(updatedAssignment);
    } catch {
      setIsSubmitting(false);
      setError('Failed to save changes');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Edit Assignment
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            {nurse?.firstName} {nurse?.lastName}
          </p>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="p-6">
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Start Date <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                    required
                    disabled={isSubmitting}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    End Date
                  </label>
                  <Input
                    type="date"
                    value={endDate || ''}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                    min={startDate}
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Shift Start <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="time"
                    value={shiftStart}
                    onChange={(e) => setShiftStart(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                    required
                    disabled={isSubmitting}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Shift End <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="time"
                    value={shiftEnd}
                    onChange={(e) => setShiftEnd(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                    required
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Salary Per Day <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-gray-500">₹</span>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={salaryPerDay}
                    onChange={(e) => setSalaryPerDay(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md text-gray-900"
                    required
                    disabled={isSubmitting}
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3 rounded-b-lg">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-5 py-2 text-sm font-medium text-white rounded-md transition-colors min-w-[100px] ${
                isSubmitting 
                  ? 'bg-blue-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isSubmitting ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditAssignmentModal;