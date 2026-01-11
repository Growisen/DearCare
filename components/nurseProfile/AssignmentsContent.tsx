import React from 'react';
import { NurseAssignmentWithClient } from '@/app/actions/staff-management/add-nurse';
import AssignmentCard from './AssignmentCard';
import { ClipboardList } from 'lucide-react';

const AssignmentCardSkeleton: React.FC = () => (
  <div className="animate-pulse bg-white border border-slate-200 rounded-sm p-5 mb-2">
    <div className="flex justify-between items-center mb-4">
      <div className="h-5 bg-slate-200 rounded w-1/3" />
      <div className="h-4 bg-slate-100 rounded w-16" />
    </div>
    <div className="h-4 bg-slate-100 rounded w-1/2 mb-2" />
    <div className="h-4 bg-slate-100 rounded w-1/4 mb-2" />
    <div className="h-3 bg-slate-100 rounded w-1/5" />
    <div className="mt-4 flex gap-2">
      <div className="h-8 w-24 bg-slate-100 rounded" />
      <div className="h-8 w-20 bg-slate-100 rounded" />
    </div>
  </div>
);

interface AssignmentsContentProps {
  assignments: NurseAssignmentWithClient[] | null;
  loading?: boolean;
}

export default function AssignmentsContent({ assignments, loading }: AssignmentsContentProps) {
  return (
    <div className="space-y-4 p-5">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Current and Past Assignments</h2>
      
      {loading ? (
        <div className="space-y-4">
          <AssignmentCardSkeleton />
          <AssignmentCardSkeleton />
        </div>
      ) : assignments && assignments.length > 0 ? (
        <div className="space-y-4">
          {assignments.map((assignment, index) => (
            <AssignmentCard key={index} assignment={assignment} />
          ))}
        </div>
      ) : (
        <div className="bg-gray-50 border border-slate-200 rounded-sm p-6 text-center">
          <ClipboardList className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No assignments</h3>
          <p className="mt-1 text-sm text-gray-500">This nurse has not been assigned to any clients yet.</p>
        </div>
      )}
    </div>
  );
}