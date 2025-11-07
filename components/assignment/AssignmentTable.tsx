import React, { memo, useState, useMemo } from "react"
import { CalendarIcon, ClockIcon, UserIcon } from "@heroicons/react/24/outline"
import { Building, Eye } from "lucide-react"
import { format } from "date-fns"
import Link from "next/link"
import { NurseAssignmentData } from "@/app/actions/scheduling/shift-schedule-actions";
import { AssignmentDetailsOverlay } from "./AssignmentDetailsOverlay"
import { formatName } from "@/utils/formatters"

type AssignmentTableProps = {
  assignments: NurseAssignmentData[]
}

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

const usePreparedAssignmentData = (assignment: NurseAssignmentData) => {
  return useMemo(() => {
    const fullName = assignment.nurse_first_name
      ? `${assignment.nurse_first_name} ${assignment.nurse_last_name}`
      : "Unknown Nurse";
    
    const clientName = assignment.client_name || "Unknown Client";
    const clientType = assignment.client_type;
    const clientProfileUrl = assignment.client_profile_url || `/${assignment.client_id}`;

    const formattedStartTime = formatTime(assignment.shift_start_time);
    const formattedEndTime = formatTime(assignment.shift_end_time);

    return {
      fullName,
      clientName,
      clientType,
      clientProfileUrl,
      formattedStartTime,
      formattedEndTime
    }
  }, [assignment])
}

const AssignmentTableRow = memo(({ assignment, onViewDetails }: {
  assignment: NurseAssignmentData,
  onViewDetails: (assignment: NurseAssignmentData) => void
}) => {
  const {
    fullName,
    clientName,
    clientType,
    clientProfileUrl,
    formattedStartTime,
    formattedEndTime
  } = usePreparedAssignmentData(assignment);

  return (
    <tr className="hover:bg-gray-50">
      <td className="py-4 px-6 text-gray-800 font-medium">
        <div className="flex items-center">
          <UserIcon className="h-5 w-5 text-gray-400 mr-2" />
          <div>
            <span className="font-medium">{formatName(fullName)}</span>
            <p className="text-xs text-gray-500">ID: {assignment.nurse_reg_no}</p>
            <p className="text-xs text-gray-500">Salary Per Day: ₹{assignment.salary_per_day ?? "N/A"}</p>
            <p className="text-xs text-gray-500">Salary Per Month: ₹{assignment.salary_per_month ?? "N/A"}</p>
          </div>
        </div>
      </td>
      <td className="py-4 px-6">
        <div className="space-y-1">
          <div className="font-medium text-gray-800">{formatName(clientName)}</div>
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
              {formattedStartTime} - {formattedEndTime}
            </div>
          </div>
        </div>
      </td>
      <td className="py-4 px-6">
        <button
          onClick={() => onViewDetails(assignment)}
          className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 transition-colors"
        >
          <Eye className="w-3.5 h-3.5" />
          View Details
        </button>
      </td>
    </tr>
  );
});
AssignmentTableRow.displayName = 'AssignmentTableRow';

const AssignmentMobileCard = memo(({ assignment, onViewDetails }: {
  assignment: NurseAssignmentData,
  onViewDetails: (assignment: NurseAssignmentData) => void
}) => {
  const {
    fullName,
    clientName,
    clientType,
    clientProfileUrl,
    formattedStartTime,
    formattedEndTime
  } = usePreparedAssignmentData(assignment);

  return (
    <div className="p-5 space-y-4 hover:bg-gray-50 transition-colors border-b border-gray-200 last:border-0">
      <div className="flex justify-between items-start">
        <div className="flex items-center">
          <UserIcon className="h-5 w-5 text-gray-400 mr-2" />
          <div>
            <span className="font-medium text-gray-800">{formatName(fullName)}</span>
            <p className="text-xs text-gray-500">ID: {assignment.nurse_reg_no}</p>
            <p className="text-xs text-gray-500">Salary Per Day: ₹{assignment.salary_per_day ?? "N/A"}</p>
            <p className="text-xs text-gray-500">Salary Per Month: ₹{assignment.salary_per_month ?? "N/A"}</p>
          </div>
        </div>
        <button
          onClick={() => onViewDetails(assignment)}
          className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 transition-colors"
        >
          <Eye className="w-3.5 h-3.5" />
          Details
        </button>
      </div>
      
      <div className="space-y-3 text-sm bg-white border border-gray-200 p-3 rounded-lg">
        <div>
          <div className="flex items-start">
            <Building className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
            <div>
              <p className="text-gray-500">Client:</p>
              <div className="font-medium text-gray-800">{formatName(clientName)}</div>
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
            <p className="text-gray-800">{formattedStartTime} - {formattedEndTime}</p>
          </div>
        </div>
      </div>
    </div>
  );
});
AssignmentMobileCard.displayName = 'AssignmentMobileCard';

export const AssignmentTable = memo(function AssignmentTable({ assignments }: AssignmentTableProps) {
  const [selectedAssignment, setSelectedAssignment] = useState<NurseAssignmentData | null>(null);
  
  const handleViewDetails = (assignment: NurseAssignmentData) => {
    setSelectedAssignment(assignment);
  };

  return (
    <>
      <div className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-100 border-b border-gray-200">
              <tr className="text-left">
                <th className="py-4 px-6 font-medium text-gray-700">Nurse</th>
                <th className="py-4 px-6 font-medium text-gray-700">Client</th>
                <th className="py-4 px-6 font-medium text-gray-700">Schedule</th>
                <th className="py-4 px-6 font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {assignments.length > 0 ? (
                assignments.map((assignment) => (
                  <AssignmentTableRow
                    key={assignment.id}
                    assignment={assignment}
                    onViewDetails={handleViewDetails}
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

        <div className="sm:hidden bg-white">
          {assignments.length > 0 ? (
            assignments.map((assignment) => (
              <AssignmentMobileCard
                key={assignment.id}
                assignment={assignment}
                onViewDetails={handleViewDetails}
              />
            ))
          ) : (
            <div className="p-8 text-center text-gray-500">
              No assignments found
            </div>
          )}
        </div>
      </div>

      {selectedAssignment && (
        <AssignmentDetailsOverlay
          assignment={selectedAssignment}
          onClose={() => setSelectedAssignment(null)}
        />
      )}
    </>
  )
});