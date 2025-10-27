import { UserIcon, BuildingOffice2Icon, CalendarIcon, ClockIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { format } from 'date-fns';
import { FormattedAssignmentDetails } from '@/hooks/useAssignment';
import { formatName } from '@/utils/formatters';
import useOrgStore from '@/app/stores/UseOrgStore';
import { generateAssignmentPDF } from '@/utils/generateAssignmentPDF';

export function AssignmentInfo({ assignmentDetails }: { assignmentDetails: FormattedAssignmentDetails }) {
  const { organization } = useOrgStore();

  const handleDownloadPDF = async () => {
    await generateAssignmentPDF(assignmentDetails, organization);
  };

  return (
    <>
      <button
        onClick={handleDownloadPDF}
        className="mt-4 mb-1 px-4 py-2 bg-gray-50 border border-slate-300 text-slate-700 
        text-sm rounded-sm shadow-sm hover:bg-slate-100"
      >
        Download PDF
      </button>
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6">
        <div className="border border-slate-200 rounded-lg p-4 shadow-sm">
          <h2 className="text-base font-semibold text-slate-800 mb-3 flex items-center">
            <UserIcon className="h-5 w-5 mr-2 text-blue-600" />
            Nurse Information
          </h2>
          <div className="space-y-3 ml-7 grid grid-cols-2">
            <div>
              <p className="text-sm font-medium text-slate-500">Name</p>
              <Link
                target='_blank'
                href={`/nurses/${assignmentDetails.nurseDetails.id}`}
                className="text-blue-600 hover:text-blue-800 hover:underline"
              >
                {formatName(assignmentDetails.nurseDetails.name)}
              </Link>
            </div>
            {/* <div>
              <p className="text-sm font-medium text-slate-500">Nurse ID</p>
              <p className="text-slate-800 text-sm">{assignmentDetails.nurseDetails.id}</p>
            </div> */}
            <div>
              <p className="text-sm font-medium text-slate-500">Registration No.</p>
              <p className="text-slate-800 text-sm">{assignmentDetails.nurseDetails.nurseRegNo || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Organization</p>
              <p className="text-slate-800 uppercase text-sm">{assignmentDetails.nurseDetails.admittedType || 'N/A'}</p>
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
                {formatName(assignmentDetails.clientDetails.name)}
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
            <div>
              <p className="text-sm font-medium text-slate-500">Salary per Day</p>
              <p className="text-slate-800">
                {assignmentDetails.shiftDetails.salaryPerDay
                  ? `₹${assignmentDetails.shiftDetails.salaryPerDay}`
                  : 'N/A'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}