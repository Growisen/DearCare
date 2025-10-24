import { UserIcon, BuildingOffice2Icon, CalendarIcon, ClockIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { format } from 'date-fns';
import { FormattedAssignmentDetails } from '@/hooks/useAssignment';
import { formatName } from '@/utils/formatters';
import jsPDF from 'jspdf';

export function AssignmentInfo({ assignmentDetails }: { assignmentDetails: FormattedAssignmentDetails }) {
  console.log('Rendering AssignmentInfo with details:', assignmentDetails);

  const handleDownloadPDF = () => {
    const doc = new jsPDF();

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;

    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.5);
    doc.rect(margin - 5, margin - 5, pageWidth - 2 * (margin - 5), pageHeight - 2 * (margin - 5));
    
    let yPosition = margin + 10;
    
    // Add logo (if you have a logo URL or base64 string)
    // Replace 'logoDataURL' with your actual logo data
    // doc.addImage(logoDataURL, 'PNG', pageWidth / 2 - 25, yPosition, 50, 20);
    // yPosition += 30;

    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    const title = 'ASSIGNMENT INFORMATION';
    const titleWidth = doc.getTextWidth(title);
    doc.text(title, (pageWidth - titleWidth) / 2, yPosition);
    yPosition += 15;

    doc.setDrawColor(100, 100, 100);
    doc.setLineWidth(0.3);
    doc.line(margin + 10, yPosition, pageWidth - margin - 10, yPosition);
    yPosition += 15;

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    const nurseHeader = 'Nurse Details';
    const nurseHeaderWidth = doc.getTextWidth(nurseHeader);
    doc.text(nurseHeader, (pageWidth - nurseHeaderWidth) / 2, yPosition);
    yPosition += 10;
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    
    const nurseNameText = `Name: ${formatName(assignmentDetails.nurseDetails.name)}`;
    const nurseNameWidth = doc.getTextWidth(nurseNameText);
    doc.text(nurseNameText, (pageWidth - nurseNameWidth) / 2, yPosition);
    yPosition += 7;
    
    const nurseIdText = `Reg No: ${assignmentDetails.nurseDetails.nurseRegNo || 'N/A'}`;
    const nurseIdWidth = doc.getTextWidth(nurseIdText);
    doc.text(nurseIdText, (pageWidth - nurseIdWidth) / 2, yPosition);
    yPosition += 7;
    
    const nurseOrg = assignmentDetails.nurseDetails.admittedType
      ? assignmentDetails.nurseDetails.admittedType.toUpperCase()
      : 'N/A';
    const nurseOrgText = `Organization: ${nurseOrg}`;
    const nurseOrgWidth = doc.getTextWidth(nurseOrgText);
    doc.text(nurseOrgText, (pageWidth - nurseOrgWidth) / 2, yPosition);
    yPosition += 15;

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    const clientHeader = 'Client Details';
    const clientHeaderWidth = doc.getTextWidth(clientHeader);
    doc.text(clientHeader, (pageWidth - clientHeaderWidth) / 2, yPosition);
    yPosition += 10;
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    
    const clientNameText = `Name: ${formatName(assignmentDetails.clientDetails.name)}`;
    const clientNameWidth = doc.getTextWidth(clientNameText);
    doc.text(clientNameText, (pageWidth - clientNameWidth) / 2, yPosition);
    yPosition += 7;
    
    const clientTypeText = `Type: ${assignmentDetails.clientDetails.type}`;
    const clientTypeWidth = doc.getTextWidth(clientTypeText);
    doc.text(clientTypeText, (pageWidth - clientTypeWidth) / 2, yPosition);
    yPosition += 15;

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    const periodHeader = 'Assignment Period';
    const periodHeaderWidth = doc.getTextWidth(periodHeader);
    doc.text(periodHeader, (pageWidth - periodHeaderWidth) / 2, yPosition);
    yPosition += 10;
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    
    const periodText = `${format(new Date(assignmentDetails.assignmentPeriod.startDate), 'MMMM d, yyyy')} - ${format(new Date(assignmentDetails.assignmentPeriod.endDate), 'MMMM d, yyyy')}`;
    const periodWidth = doc.getTextWidth(periodText);
    doc.text(periodText, (pageWidth - periodWidth) / 2, yPosition);
    yPosition += 15;

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    const shiftHeader = 'Shift Details';
    const shiftHeaderWidth = doc.getTextWidth(shiftHeader);
    doc.text(shiftHeader, (pageWidth - shiftHeaderWidth) / 2, yPosition);
    yPosition += 10;
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    
    const shiftHoursText = `Hours: ${assignmentDetails.shiftDetails.startTime} - ${assignmentDetails.shiftDetails.endTime}`;
    const shiftHoursWidth = doc.getTextWidth(shiftHoursText);
    doc.text(shiftHoursText, (pageWidth - shiftHoursWidth) / 2, yPosition);
    yPosition += 7;
    
    const salaryText = `Salary per Day: ${assignmentDetails.shiftDetails.salaryPerDay ? `INR ${assignmentDetails.shiftDetails.salaryPerDay}` : 'N/A'}`;
    const salaryWidth = doc.getTextWidth(salaryText);
    doc.text(salaryText, (pageWidth - salaryWidth) / 2, yPosition);
    yPosition += 15;

    doc.setFontSize(9);
    doc.setTextColor(128, 128, 128);
    const footerText = `Generated on ${format(new Date(), 'MMMM d, yyyy HH:mm')}`;
    const footerWidth = doc.getTextWidth(footerText);
    doc.text(footerText, (pageWidth - footerWidth) / 2, pageHeight - margin);
    
    doc.save('assignment-info.pdf');
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