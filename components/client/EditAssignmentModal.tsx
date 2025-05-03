import React, { useState, useEffect } from 'react';
import { Nurse } from '@/types/staff.types';
import toast from 'react-hot-toast';

interface NurseAssignment {
  id?: number;
  nurseId: number | string;
  startDate: string;
  endDate?: string;
  shiftStart?: string;
  shiftEnd?: string;
  status: 'active' | 'completed' | 'cancelled';
  shiftType?: 'day' | 'night' | '24h';
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  
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
    }
    // Reset submitting state when modal opens/closes
    setIsSubmitting(false);
  }, [assignment, isOpen]);
  
  if (!isOpen || !assignment) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (endDate && startDate && new Date(endDate) < new Date(startDate)) {
      toast.error('End date cannot be before start date');
      return;
    }
    
    setIsSubmitting(true);
    
    const updatedAssignment: NurseAssignment = {
      ...assignment,
      startDate,
      endDate,
      shiftStart: `${shiftStart}:00`,
      shiftEnd: `${shiftEnd}:00`,
    };
    
    try {
      onSave(updatedAssignment);
    } catch {
      setIsSubmitting(false);
      toast.error('Failed to save changes');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="border-b px-6 py-4">
          <h3 className="text-lg font-medium text-gray-900">
            Edit Assignment for {nurse?.firstName} {nurse?.lastName}
          </h3>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-800"
                required
                disabled={isSubmitting}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <input
                type="date"
                value={endDate || ''}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-800"
                min={startDate}
                disabled={isSubmitting}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Shift Start Time
              </label>
              <input
                type="time"
                value={shiftStart}
                onChange={(e) => setShiftStart(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-800"
                required
                disabled={isSubmitting}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Shift End Time
              </label>
              <input
                type="time"
                value={shiftEnd}
                onChange={(e) => setShiftEnd(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-800"
                required
                disabled={isSubmitting}
              />
            </div>
          </div>
          
          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-4 py-2 ${isSubmitting ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'} text-white rounded-md flex items-center justify-center min-w-[120px]`}
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditAssignmentModal;