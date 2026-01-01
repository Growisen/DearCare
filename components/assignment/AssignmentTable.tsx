import React, { memo, useState, useMemo } from "react"
import { CalendarIcon, ClockIcon, UserIcon } from "@heroicons/react/24/outline"
import { Building, Eye, Info } from "lucide-react"
import { format } from "date-fns"
import Link from "next/link"
import { NurseAssignmentData } from "@/app/actions/scheduling/shift-schedule-actions";
import { AssignmentDetailsOverlay } from "./AssignmentDetailsOverlay"
import { formatName } from "@/utils/formatters"
import {
  calculatePeriodSalary,
  getAssignmentPeriodStatus,
} from '@/utils/nurseAssignmentUtils';


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

  const periodSalary = calculatePeriodSalary(assignment.start_date, assignment.end_date, assignment.salary_per_day);

  const { daysCompleted, daysRemaining, totalDays } = getAssignmentPeriodStatus(assignment.start_date, assignment.end_date);

  const rowBgClass = daysRemaining > 0 
    ? "bg-gray-50 hover:bg-gray-100" 
    : "bg-red-50 hover:bg-red-100";

  const serviceStats = assignment.current_service_start && assignment.current_service_end
    ? getAssignmentPeriodStatus(assignment.current_service_start, assignment.current_service_end)
    : null;

  return (
    <tr className={`transition-colors border-b border-slate-200 last:border-0 ${rowBgClass}`}>
      <td className="py-4 px-6 text-gray-800 font-medium">
        <div className="flex items-center">
          <UserIcon className="h-5 w-5 text-gray-400 mr-2" />
          <div>
            <span className="font-medium">{formatName(fullName)}</span>
            <p className="text-xs text-gray-500">ID: {assignment.nurse_reg_no}</p>
          </div>
        </div>
      </td>
      <td className="py-4 px-6">
        <div>
          <p className="text-xs text-gray-800">Per Day: ₹{assignment.salary_per_day ?? "N/A"}</p>
          <p className="text-xs text-gray-800">Per Month: ₹{assignment.salary_per_month ?? "N/A"}</p>
          <p className="text-xs text-gray-800 flex items-center gap-1">
            Est. Period Salary:
            <span className="relative group inline-flex">
              <Info className="w-3.5 h-3.5 text-gray-400 cursor-help hover:text-gray-600 transition-colors" />
              <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 w-56 p-2 text-center text-xs text-white bg-gray-900 rounded-sm shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                Estimated total salary for this assignment period, assuming full attendance.
                <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900"></span>
              </span>
            </span>
            ₹{periodSalary !== null ? periodSalary : "N/A"}
          </p>
        </div>
      </td>
      <td className="py-4 px-0">
        <div className="space-y-2">
          <div className="flex items-center">
            <CalendarIcon className="h-5 w-5 text-gray-400 mr-2" />
            <div className="text-gray-600">
              <div>
                {format(new Date(assignment.start_date), 'MMM dd, yyyy')} - 
                {format(new Date(assignment.end_date), 'MMM dd, yyyy')}
              </div>
            </div>
          </div>
          <div className="flex items-center">
            <ClockIcon className="h-5 w-5 text-gray-400 mr-2" />
            <div className="text-gray-600">
              {formattedStartTime} - {formattedEndTime}
            </div>
          </div>
          <div className="ml-7 text-xs text-gray-500">
            (
              {daysCompleted} completed
              {daysRemaining > 0 && `, ${daysRemaining} remaining`}
              , {totalDays} total
            )
          </div>
        </div>
      </td>

      <td className="py-4 px-6">
        <div className="space-y-1">
          <div className="font-medium text-gray-800">{formatName(clientName)}</div>
          {clientType && (
            <div className="text-xs text-gray-500">{clientType}</div>
          )}

          {(assignment.current_service_start || assignment.current_service_end) && (
            <div className="text-xs text-gray-500">
              Active: 
              {assignment.current_service_start && (
                <> {format(new Date(assignment.current_service_start), 'MMM dd, yyyy')}</>
              )}
              {" - "}
              {assignment.current_service_end && (
                <>{format(new Date(assignment.current_service_end), 'MMM dd, yyyy')}</>
              )}
            </div>
          )}
          {serviceStats && (
            <div className="text-xs text-gray-500">
                {serviceStats.daysCompleted} completed
                {serviceStats.daysRemaining > 0 && `, ${serviceStats.daysRemaining} remaining`}
                , {serviceStats.totalDays} total
            </div>
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
        <button
          onClick={() => onViewDetails(assignment)}
          className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-sm text-sm font-medium bg-white text-blue-700 hover:bg-blue-50 border border-blue-200 shadow-none transition-colors"
        >
          <Eye className="w-3.5 h-3.5" />
          View
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

  const periodSalary = calculatePeriodSalary(assignment.start_date, assignment.end_date, assignment.salary_per_day);
  
  const { daysCompleted, daysRemaining, totalDays } = getAssignmentPeriodStatus(assignment.start_date, assignment.end_date);

  const cardBgClass = daysRemaining > 0 
    ? "bg-gray-50 border-slate-200" 
    : "bg-red-50 border-red-100";

  const serviceStats = assignment.current_service_start && assignment.current_service_end
    ? getAssignmentPeriodStatus(assignment.current_service_start, assignment.current_service_end)
    : null;

  return (
    <div className={`p-5 space-y-4 transition-colors border-b last:border-0 ${cardBgClass}`}>
      <div className="flex justify-between items-start">
        <div className="flex items-center">
          <UserIcon className="h-5 w-5 text-gray-400 mr-2" />
          <div>
            <span className="font-medium text-gray-800">{formatName(fullName)}</span>
            <p className="text-xs text-gray-500">ID: {assignment.nurse_reg_no}</p>
          </div>
        </div>
        <button
          onClick={() => onViewDetails(assignment)}
          className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-sm text-sm font-medium bg-white text-blue-700 hover:bg-gray-50 border border-blue-200 shadow-none transition-colors"
        >
          <Eye className="w-3.5 h-3.5" />
          Details
        </button>
      </div>
      
      <div className="space-y-3 text-sm bg-white/50 border border-slate-200/50 p-3 rounded-sm backdrop-blur-sm">
        <div>
          <p className="text-gray-500">Salary:</p>
          <p className="text-gray-800">Per Day: ₹{assignment.salary_per_day ?? "N/A"}</p>
          <p className="text-gray-800">Per Month: ₹{assignment.salary_per_month ?? "N/A"}</p>
          <p className="text-gray-800 flex items-center gap-1">
            Est. Period Salary :
            <span className="relative group inline-flex">
              <Info className="w-3.5 h-3.5 text-gray-400 cursor-help hover:text-gray-600 transition-colors" />
              <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 w-56 p-2 text-center text-xs text-white bg-gray-900 rounded-sm shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                Estimated total salary for this assignment period, assuming full attendance.
                <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900"></span>
              </span>
            </span>
            ₹{periodSalary !== null ? periodSalary : "N/A"}
          </p>
        </div>
        <div>
          <div className="flex items-start">
            <Building className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
            <div>
              <p className="text-gray-500">Client:</p>
              <div className="font-medium text-gray-800">{formatName(clientName)}</div>
              {clientType && (
                <div className="text-xs text-gray-500">{clientType}</div>
              )}

              {(assignment.current_service_start || assignment.current_service_end) && (
                <div className="text-xs text-gray-500">
                  Service: 
                  {assignment.current_service_start && (
                    <> {format(new Date(assignment.current_service_start), 'MMM dd, yyyy')}</>
                  )}
                  {" - "}
                  {assignment.current_service_end && (
                    <>{format(new Date(assignment.current_service_end), 'MMM dd, yyyy')}</>
                  )}
                </div>
              )}
              {serviceStats && (
                <div className="text-xs text-gray-500">
                  (
                    {serviceStats.daysCompleted} completed
                    {serviceStats.daysRemaining > 0 && `, ${serviceStats.daysRemaining} remaining`}
                    , {serviceStats.totalDays} total
                  )
                </div>
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
            <p className="ml-0 text-xs text-gray-500">
              (
                {daysCompleted} completed
                {daysRemaining > 0 && `, ${daysRemaining} remaining`}
                , {totalDays} total
              )
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
      <div className="bg-gray-200 rounded-sm border border-slate-200 overflow-hidden shadow-none">
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full table-fixed border-collapse">
            <thead className="bg-gray-100 border-b border-slate-200">
              <tr className="text-left">
                <th className="py-4 px-6 font-medium text-gray-700 w-1/5">Nurse</th>
                <th className="py-4 px-6 font-medium text-gray-700 w-1/4">Salary</th>
                <th className="py-4 px-6 font-medium text-gray-700 w-1/4">Schedule</th>
                <th className="py-4 px-6 font-medium text-gray-700 w-1/5">Client</th> 
                <th className="py-4 px-6 font-medium text-gray-700 w-24 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
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