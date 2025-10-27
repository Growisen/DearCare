import React from 'react';
import { NurseAssignmentWithClient } from '@/app/actions/staff-management/add-nurse';
import AssignmentCard from './AssignmentCard';

interface AssignmentsContentProps {
  assignments: NurseAssignmentWithClient[] | null;
}

const AssignmentsContent: React.FC<AssignmentsContentProps> = ({ assignments }) => {
  return (
    <div className="space-y-4 p-5">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Current and Past Assignments</h2>
      
      {assignments && assignments.length > 0 ? (
        <div className="space-y-4">
          {assignments.map((assignment, index) => (
            <AssignmentCard key={index} assignment={assignment} />
          ))}
        </div>
      ) : (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No assignments</h3>
          <p className="mt-1 text-sm text-gray-500">This nurse has not been assigned to any clients yet.</p>
        </div>
      )}
    </div>
  );
};

export default AssignmentsContent;