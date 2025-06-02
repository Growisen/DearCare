import React, { memo } from "react"
import { CalendarIcon, ClockIcon, UserIcon } from "@heroicons/react/24/outline"
import { CheckCircle, Clock, AlertCircle, Building } from "lucide-react"
import { format } from "date-fns"
import Link from "next/link"
import { NurseAssignmentData } from "@/app/actions/shift-schedule-actions"

type AssignmentTableProps = {
  assignments: NurseAssignmentData[]
}

const AssignmentTableRow = memo(({ assignment, statusColors, statusIcons }: {
  assignment: NurseAssignmentData,
  statusColors: Record<string, string>,
  statusIcons: Record<string, React.FC<{ className?: string }>>
}) => {
  const status = assignment.status || 'unknown';
  const StatusIcon = statusIcons[status] || statusIcons.default;
  
  function formatTime(timeString: string) {
    try {
      const [hours, minutes] = timeString.split(':').map(Number)
      const period = hours >= 12 ? 'PM' : 'AM'
      const displayHours = hours % 12 || 12
      return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`
    } catch {
      return timeString
    }
  }
  
  // Format nurse name and ID
  const fullName = assignment.nurses?.first_name && assignment.nurses?.last_name 
    ? `${assignment.nurses.first_name} ${assignment.nurses.last_name}`
    : "Unknown Nurse";
  
  // Client info
  const clientName = assignment.client_name || "Unknown Client";
  const clientType = assignment.client_type;
  const clientProfileUrl = assignment.client_profile_url || `/${assignment.client_id}`;

  return (
    <tr className="hover:bg-gray-50">
      <td className="py-4 px-6 text-gray-800 font-medium">
        <div className="flex items-center">
          <UserIcon className="h-5 w-5 text-gray-400 mr-2" />
          <div>
            <span className="font-medium">{fullName}</span>
            <p className="text-xs text-gray-500">ID: {assignment.nurse_id}</p>
          </div>
        </div>
      </td>
      <td className="py-4 px-6">
        <div className="space-y-1">
          <div className="font-medium text-gray-800">{clientName}</div>
          {clientType && (
            <div className="text-xs text-gray-500">{clientType}</div>
          )}
          <Link 
            href={clientProfileUrl} 
            className="inline-block text-blue-600 hover:text-blue-800 text-sm font-medium"
            target="_blank"
            rel="noopener noreferrer"
          >
            View Profile
          </Link>
        </div>
      </td>
      <td className="py-4 px-6">
        <div className="space-y-2">
          <div className="flex items-center">
            <CalendarIcon className="h-5 w-5 text-gray-400 mr-2" />
            <div className="text-gray-600">
              {format(new Date(assignment.start_date), 'MMM dd, yyyy')} - 
              {format(new Date(assignment.end_date), 'MMM dd, yyyy')}
            </div>
          </div>
          <div className="flex items-center">
            <ClockIcon className="h-5 w-5 text-gray-400 mr-2" />
            <div className="text-gray-600">
              {formatTime(assignment.shift_start_time)} - {formatTime(assignment.shift_end_time)}
            </div>
          </div>
        </div>
      </td>
      <td className="py-4 px-6">
        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${statusColors[status]}`}>
          <StatusIcon className="w-3.5 h-3.5" />
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
      </td>
    </tr>
  );
});
AssignmentTableRow.displayName = 'AssignmentTableRow';

const AssignmentMobileCard = memo(({ assignment, statusColors, statusIcons }: {
  assignment: NurseAssignmentData,
  statusColors: Record<string, string>,
  statusIcons: Record<string, React.FC<{ className?: string }>>
}) => {
  const status = assignment.status || 'unknown';
  const StatusIcon = statusIcons[status] || statusIcons.default;
  
  function formatTime(timeString: string) {
    try {
      const [hours, minutes] = timeString.split(':').map(Number)
      const period = hours >= 12 ? 'PM' : 'AM'
      const displayHours = hours % 12 || 12
      return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`
    } catch {
      return timeString
    }
  }
  
  const fullName = assignment.nurses?.first_name && assignment.nurses?.last_name 
    ? `${assignment.nurses.first_name} ${assignment.nurses.last_name}`
    : "Unknown Nurse";
  
  const clientName = assignment.client_name || "Unknown Client";
  const clientType = assignment.client_type;
  const clientProfileUrl = assignment.client_profile_url || `/${assignment.client_id}`;

  return (
    <div className="p-5 space-y-4 hover:bg-gray-50 transition-colors border-b border-gray-200 last:border-0">
      <div className="flex justify-between items-start">
        <div className="flex items-center">
          <UserIcon className="h-5 w-5 text-gray-400 mr-2" />
          <div>
            <h3 className="font-semibold text-gray-800">{fullName}</h3>
            <p className="text-xs text-gray-500">ID: {assignment.nurse_id}</p>
          </div>
        </div>
        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${statusColors[status]}`}>
          <StatusIcon className="w-3.5 h-3.5" />
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
      </div>
      
      <div className="space-y-3 text-sm bg-white border border-gray-200 p-3 rounded-lg">
        <div>
          <div className="flex items-start">
            <Building className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
            <div>
              <p className="text-gray-500">Client:</p>
              <div className="font-medium text-gray-800">{clientName}</div>
              {clientType && (
                <div className="text-xs text-gray-500">{clientType}</div>
              )}
              <Link 
                href={clientProfileUrl} 
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                target="_blank"
                rel="noopener noreferrer"
              >
                View Profile
              </Link>
            </div>
          </div>
        </div>
        
        <div className="flex items-start">
          <CalendarIcon className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
          <div>
            <p className="text-gray-500">Date Range:</p>
            <p className="text-gray-800">
              {format(new Date(assignment.start_date), 'MMM dd, yyyy')} - {format(new Date(assignment.end_date), 'MMM dd, yyyy')}
            </p>
          </div>
        </div>
        <div className="flex items-start">
          <ClockIcon className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
          <div>
            <p className="text-gray-500">Shift Time:</p>
            <p className="text-gray-800">{formatTime(assignment.shift_start_time)} - {formatTime(assignment.shift_end_time)}</p>
          </div>
        </div>
      </div>
    </div>
  );
});
AssignmentMobileCard.displayName = 'AssignmentMobileCard';

export const AssignmentTable = memo(function AssignmentTable({ assignments }: AssignmentTableProps) {
  const statusColors: Record<string, string> = {
    active: "bg-green-50 text-green-700 border border-green-200",
    completed: "bg-gray-50 text-gray-700 border border-gray-200",
    cancelled: "bg-red-50 text-red-700 border border-red-200",
    default: "bg-gray-50 text-gray-600 border border-gray-200"
  }

  const statusIcons: Record<string, React.FC<{ className?: string }>> = {
    active: CheckCircle,
    completed: CheckCircle,
    cancelled: AlertCircle,
    default: Clock
  }

  return (
    <div className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
      {/* Desktop Table */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-100 border-b border-gray-200">
            <tr className="text-left">
              <th className="py-4 px-6 font-medium text-gray-700">Nurse ID</th>
              <th className="py-4 px-6 font-medium text-gray-700">Client</th>
              <th className="py-4 px-6 font-medium text-gray-700">Schedule</th>
              <th className="py-4 px-6 font-medium text-gray-700">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {assignments.length > 0 ? (
              assignments.map((assignment) => (
                <AssignmentTableRow
                  key={assignment.id}
                  assignment={assignment}
                  statusColors={statusColors}
                  statusIcons={statusIcons}
                />
              ))
            ) : (
              <tr>
                <td colSpan={6} className="py-8 text-center text-gray-500">
                  No assignments found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="sm:hidden bg-white">
        {assignments.length > 0 ? (
          assignments.map((assignment) => (
            <AssignmentMobileCard
              key={assignment.id}
              assignment={assignment}
              statusColors={statusColors}
              statusIcons={statusIcons}
            />
          ))
        ) : (
          <div className="p-8 text-center text-gray-500">
            No assignments found
          </div>
        )}
      </div>
    </div>
  )
});