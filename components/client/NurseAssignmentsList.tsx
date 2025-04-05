import React from 'react';
import { Nurse } from '@/types/staff.types';

interface NurseAssignment {
  nurseId: string;
  startDate: string;
  endDate?: string;
  status: 'active' | 'completed' | 'cancelled';
  shiftType: 'day' | 'night' | '24h';
}

interface NurseAssignmentsListProps {
  assignments: NurseAssignment[];
  nurses: Nurse[];
  onEditAssignment: (assignment: NurseAssignment) => void;
  onEndAssignment: (assignmentId: string) => void;
}

const NurseAssignmentsList: React.FC<NurseAssignmentsListProps> = ({
  assignments,
  nurses,
  onEditAssignment,
  onEndAssignment,
}) => {
  return (
    <div className="space-y-4">
      {assignments.map((assignment) => {
        const nurse = nurses.find((n) => n._id === assignment.nurseId);
        if (!nurse) return null;

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
                  <p>Start Date: {new Date(assignment.startDate).toLocaleDateString()}</p>
                  {assignment.endDate && (
                    <p>End Date: {new Date(assignment.endDate).toLocaleDateString()}</p>
                  )}
                  <span
                    className={`inline-block px-2 py-1 text-xs rounded-full mt-2 ${
                      assignment.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : assignment.status === 'completed'
                        ? 'bg-gray-100 text-gray-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {assignment.status.charAt(0).toUpperCase() + assignment.status.slice(1)}
                  </span>
                </div>
              </div>
              <div className="space-x-2">
                {assignment.status === 'active' && (
                  <>
                    <button
                      onClick={() => onEditAssignment(assignment)}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onEndAssignment(assignment.nurseId)}
                      className="text-red-600 hover:text-red-800 text-sm font-medium"
                    >
                      End Assignment
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        );
      })}
      {assignments.length === 0 && (
        <p className="text-gray-500 text-center py-4">No nurse assignments found</p>
      )}
    </div>
  );
};

export default NurseAssignmentsList;