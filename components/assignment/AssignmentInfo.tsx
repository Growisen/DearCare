import { UserIcon, BuildingOffice2Icon, CalendarIcon, ClockIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { format } from 'date-fns';
import { FormattedAssignmentDetails } from '@/hooks/useAssignment';

export function AssignmentInfo({ assignmentDetails }: { assignmentDetails: FormattedAssignmentDetails }) {
  return (
    <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6">
      <div className="border border-slate-200 rounded-lg p-4 shadow-sm">
        <h2 className="text-base font-semibold text-slate-800 mb-3 flex items-center">
          <UserIcon className="h-5 w-5 mr-2 text-blue-600" />
          Nurse Information
        </h2>
        <div className="space-y-3 ml-7">
          <div>
            <p className="text-sm font-medium text-slate-500">Name</p>
            <Link
              target='_blank'
              href={`/nurses/${assignmentDetails.nurseDetails.id}`}
              className="text-blue-600 hover:text-blue-800 hover:underline"
            >
              {assignmentDetails.nurseDetails.name}
            </Link>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Nurse ID</p>
            <p className="text-slate-800">{assignmentDetails.nurseDetails.id}</p>
          </div>
        </div>
      </div>
      <div className="border border-slate-200 rounded-lg p-4 shadow-sm">
        <h2 className="text-base font-semibold text-slate-800 mb-3 flex items-center">
          <BuildingOffice2Icon className="h-5 w-5 mr-2 text-blue-600" />
          Client Information
        </h2>
        <div className="space-y-3 ml-7">
          <div>
            <p className="text-sm font-medium text-slate-500">Name</p>
            <Link
              target='_blank'
              href={assignmentDetails.clientDetails.clientProfileUrl || ""}
              className="text-blue-600 hover:text-blue-800 hover:underline"
            >
              {assignmentDetails.clientDetails.name}
            </Link>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Type</p>
            <p className="text-slate-800">{assignmentDetails.clientDetails.type}</p>
          </div>
        </div>
      </div>
      <div className="border border-slate-200 rounded-lg p-4 shadow-sm">
        <h2 className="text-base font-semibold text-slate-800 mb-3 flex items-center">
          <CalendarIcon className="h-5 w-5 mr-2 text-blue-600" />
          Assignment Period
        </h2>
        <div className="space-y-3 ml-7">
          <div>
            <p className="text-sm font-medium text-slate-500">Start Date</p>
            <p className="text-slate-800">
              {format(new Date(assignmentDetails.assignmentPeriod.startDate), 'MMMM d, yyyy')}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">End Date</p>
            <p className="text-slate-800">
              {format(new Date(assignmentDetails.assignmentPeriod.endDate), 'MMMM d, yyyy')}
            </p>
          </div>
        </div>
      </div>
      <div className="border border-slate-200 rounded-lg p-4 shadow-sm">
        <h2 className="text-base font-semibold text-slate-800 mb-3 flex items-center">
          <ClockIcon className="h-5 w-5 mr-2 text-blue-600" />
          Shift Details
        </h2>
        <div className="space-y-3 ml-7">
          <div>
            <p className="text-sm font-medium text-slate-500">Hours</p>
            <p className="text-slate-800">
              {assignmentDetails.shiftDetails.startTime} - {assignmentDetails.shiftDetails.endTime}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}