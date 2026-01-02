import React from 'react';
import { formatDate } from '@/utils/formatters';

interface Assignment {
  startDate: string;
  endDate: string | null;
  shiftType: 'day' | 'night' | '24h';
  clientId: string;
  clientType: string;
  registrationNumber: string;
}

interface AssignmentListProps {
  assignments?: Assignment[];
}

export default function AssignmentList({ assignments }: AssignmentListProps) {
  if (!assignments || assignments.length === 0) {
    return (
      <div className="mt-2 bg-gray-50 border border-slate-200 rounded p-2 flex items-center">
        <span className="text-gray-500 mr-2 font-bold text-xs">○</span>
        <span className="text-gray-600 text-xs font-medium">No assignments upcoming</span>
      </div>
    );
  }

  return (
    <div className="mt-2">
      <div className="flex items-center mb-2">
        <span className="px-3 py-1 rounded border text-xs font-semibold bg-white text-black border-slate-200">
          ✓ Assigned
        </span>
        <span className="ml-2 text-xs text-gray-600 font-medium">
          ({assignments.length} assignment{assignments.length > 1 ? 's' : ''})
        </span>
      </div>
      <div className="space-y-2">
        {assignments.map((assignment, index) => (
          <div key={index} className="bg-gray-50 border border-slate-200 rounded p-2">
            <div className="flex items-center mb-1 flex-wrap gap-1">
              <span className="text-black mr-1 font-bold text-xs">•</span>
              <span className="font-semibold text-black text-xs">Assignment {index + 1}</span>
              {assignment.clientType && (
                <span className="px-2 py-0.5 bg-white border border-slate-200 rounded text-xs font-medium text-black">
                  {assignment.clientType}
                </span>
              )}
              {assignment.shiftType && (
                <span className="px-2 py-0.5 bg-white border border-slate-200 rounded text-xs font-medium text-black">
                  {assignment.shiftType} shift
                </span>
              )}
            </div>
            <div className="text-xs text-gray-600 ml-3 space-y-1">
              <div>
                {assignment.startDate && <span className="font-medium">From: {formatDate(assignment.startDate)}</span>}
                {assignment.endDate ? (
                  <span className="ml-3 font-medium">To: {formatDate(assignment.endDate)}</span>
                ) : (
                  <span className="ml-3 px-2 py-0.5 bg-black text-white rounded text-xs font-semibold">Ongoing</span>
                )}
              </div>
              {assignment.registrationNumber && (
                <div><span className="font-medium">Client ID:</span> {assignment.registrationNumber}</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}