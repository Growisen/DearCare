import React, { useState } from 'react';
import { Nurse } from '@/types/staff.types';
import ConfirmationModal from '@/components/common/ConfirmationModal';
import ModalPortal from '@/components/ui/ModalPortal';
import { formatDate } from '@/utils/formatters';

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

interface NurseAssignmentsListProps {
  assignments: NurseAssignment[];
  nurses: Nurse[];
  onEditAssignment: (assignment: NurseAssignment) => void;
  onEndAssignment: (assignmentId: string) => void;
  onDeleteAssignment: (assignmentId: number | string) => void;
}

const NurseAssignmentsList: React.FC<NurseAssignmentsListProps> = ({
  assignments,
  nurses,
  onEditAssignment,
  onEndAssignment,
  onDeleteAssignment,
}) => {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [assignmentToDelete, setAssignmentToDelete] = useState<number | string | null>(null);

  const getDisplayStatus = (assignment: NurseAssignment) => {
    if (assignment.status === 'cancelled') return 'cancelled';
    
    if (assignment.endDate) {
      const endDate = new Date(assignment.endDate);
      const currentDate = new Date();
      if (endDate < currentDate) {
        return 'completed';
      }
    }
    
    return 'active';
  };

  const handleDeleteClick = (id: number | string) => {
    setAssignmentToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (assignmentToDelete !== null) {
      onDeleteAssignment(assignmentToDelete);
      setIsDeleteModalOpen(false);
      setAssignmentToDelete(null);
    }
  };

  const cancelDelete = () => {
    setIsDeleteModalOpen(false);
    setAssignmentToDelete(null);
  };

  return (
    <div className="space-y-4">
      {assignments.map((assignment) => {
        const nurse = nurses.find((n) => n._id === assignment.nurseId || n._id === assignment.nurseId.toString());
        if (!nurse) return null;

        const displayStatus = getDisplayStatus(assignment);

        return (
          <div
            key={`${assignment.nurseId}-${assignment.startDate}`}
            className="bg-white rounded-lg border border-gray-200 p-4"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium text-gray-900">
                  {nurse.firstName} {nurse.lastName}
                </h3>
                <div className="mt-1 text-sm text-gray-600">
                  <p>Shift: {assignment.shiftType}</p>
                  <p>Start Date: {formatDate(assignment.startDate)}</p>
                  {assignment.endDate && (
                    <p>End Date: {formatDate(assignment.endDate)}</p>
                  )}
                  <span
                    className={`inline-block px-2 py-1 text-xs rounded-full mt-2 ${
                      displayStatus === 'active'
                        ? 'bg-green-100 text-green-800'
                        : displayStatus === 'completed'
                        ? 'bg-gray-100 text-gray-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {displayStatus.charAt(0).toUpperCase() + displayStatus.slice(1)}
                  </span>
                </div>
              </div>
              <div className="space-x-2">
                {displayStatus === 'active' && (
                  <>
                    <button
                      onClick={() => onEditAssignment(assignment)}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onEndAssignment(assignment.nurseId.toString())}
                      className="text-red-600 hover:text-red-800 text-sm font-medium"
                    >
                      End Assignment
                    </button>
                  </>
                )}
                <button
                  onClick={() => handleDeleteClick(assignment.id || assignment.nurseId)}
                  className="text-gray-600 hover:text-gray-800 text-sm font-medium"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        );
      })}
      {assignments.length === 0 && (
        <p className="text-gray-500 text-center py-4">No nurse assignments found</p>
      )}

      <ModalPortal>
        <ConfirmationModal
          isOpen={isDeleteModalOpen}
          title="Delete Assignment"
          message="Are you sure you want to delete this nurse assignment? This action cannot be undone."
          onConfirm={confirmDelete}
          onCancel={cancelDelete}
          confirmButtonText="Delete"
          confirmButtonColor="red"
        />
      </ModalPortal>
    </div>
  );
};

export default NurseAssignmentsList;