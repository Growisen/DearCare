import React from 'react';
import { formatDate } from '@/utils/formatters';

interface LeaveInfo {
  startDate: string;
  endDate?: string;
  reason?: string;
}

interface LeaveStatusProps {
  leaveInfo: LeaveInfo;
}

export default function LeaveStatus({ leaveInfo }: LeaveStatusProps) {
  return (
    <div className="mt-2 bg-gray-100 border-l-4 border-black rounded p-3">
      <div className="flex items-center mb-2">
        <span className="text-black mr-2 font-bold text-sm">⏸</span>
        <span className="font-semibold text-black text-sm">On Leave</span>
      </div>
      <div className="text-xs text-black ml-5">
        <div className="mb-1">
          <span className="font-medium">From:</span> {formatDate(leaveInfo.startDate)}
          {leaveInfo.endDate && (
            <span className="ml-3"><span className="font-medium">To:</span> {formatDate(leaveInfo.endDate)}</span>
          )}
        </div>
        {leaveInfo.reason && <div><span className="font-medium">Reason:</span> {leaveInfo.reason}</div>}
      </div>
    </div>
  );
}