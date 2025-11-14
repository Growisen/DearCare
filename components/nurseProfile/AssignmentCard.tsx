import React from 'react';
import { NurseAssignmentWithClient } from '@/app/actions/staff-management/add-nurse';
import { format12HourTime, formatDate, getServiceLabel, formatName } from '@/utils/formatters';
import { serviceOptions } from '@/utils/constants';
import { getAssignmentPeriodStatus } from '@/utils/nurseAssignmentUtils';

interface AssignmentCardProps {
  assignment: NurseAssignmentWithClient;
}

const AssignmentCard: React.FC<AssignmentCardProps> = ({ assignment }) => {
  const getStatusConfig = () => {
    const startDate = new Date(assignment.assignment.start_date);
    const endDate = assignment.assignment.end_date ? new Date(assignment.assignment.end_date) : null;
    const now = new Date();

    if (startDate > now) {
      return { label: 'Upcoming', color: 'bg-blue-50 text-blue-700 border-blue-200' };
    }
    if (!endDate) {
      return { label: 'Active', color: 'bg-green-50 text-green-700 border-green-200' };
    }
    if (endDate > now) {
      return { label: 'Ending Soon', color: 'bg-amber-50 text-amber-700 border-amber-200' };
    }
    return { label: 'Completed', color: 'bg-gray-50 text-gray-700 border-gray-200' };
  };

  const status = getStatusConfig();

  // Get assignment period status
  const { daysCompleted, daysRemaining, totalDays } = getAssignmentPeriodStatus(
    assignment.assignment.start_date,
    assignment.assignment.end_date || new Date().toISOString()
  );

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-200">
      <div className="bg-gradient-to-r from-slate-50 to-gray-50 px-4 py-2.5 border-b border-gray-200">
        <div className="flex flex-wrap justify-between items-center gap-2">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-gray-900 truncate">
              {assignment.client.type === 'individual' 
                ? formatName(assignment.client.details.individual?.patient_name || '')
                : formatName(assignment.client.details.organization?.organization_name || '')}
            </h3>
            <span className={`px-2 py-0.5 text-xs font-medium rounded border ${
              assignment.client.type === 'individual' 
                ? 'bg-indigo-50 text-indigo-700 border-indigo-200' 
                : 'bg-emerald-50 text-emerald-700 border-emerald-200'
            }`}>
              {assignment.client.type === 'individual' ? 'Individual' : 'Organization'}
            </span>
          </div>
          <span className={`px-2.5 py-1 text-xs font-semibold rounded border ${status.color}`}>
            {status.label}
          </span>
        </div>
      </div>

      <div className="p-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div>
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 pb-1.5 border-b-2 border-gray-300">
              Assignment Details
            </h4>
            <div className="space-y-2">
              <div className="flex items-start">
                <span className="text-xs font-medium text-gray-500 w-28 flex-shrink-0 pt-0.5">Start Date</span>
                <span className="text-sm text-gray-900 font-medium">
                  {formatDate(assignment.assignment.start_date)}
                </span>
              </div>
              
              {assignment.assignment.end_date && (
                <div className="flex items-start">
                  <span className="text-xs font-medium text-gray-500 w-28 flex-shrink-0 pt-0.5">End Date</span>
                  <span className="text-sm text-gray-900 font-medium">
                    {formatDate(assignment.assignment.end_date)}
                  </span>
                </div>
              )}
              
              {assignment.assignment.shift_start_time && (
                <div className="flex items-start">
                  <span className="text-xs font-medium text-gray-500 w-28 flex-shrink-0 pt-0.5">Shift Time</span>
                  <span className="text-sm text-gray-900">
                    {format12HourTime(assignment.assignment.shift_start_time)} - {format12HourTime(assignment.assignment.shift_end_time)}
                  </span>
                </div>
              )}
              
              {assignment.assignment.salary_hour && (
                <div className="flex items-start">
                  <span className="text-xs font-medium text-gray-500 w-28 flex-shrink-0 pt-0.5">Hourly Rate</span>
                  <span className="text-sm text-gray-900 font-semibold">₹{assignment.assignment.salary_hour}</span>
                </div>
              )}

              <div className="flex items-start">
                <span className="text-xs font-medium text-gray-500 w-28 flex-shrink-0 pt-0.5">Salary Per Day</span>
                <span className="text-sm text-gray-900 font-semibold">{assignment.assignment.salary_per_day ? `₹${assignment.assignment.salary_per_day}` : 'N/A'}</span>
              </div>

              <div className="flex items-start">
                <span className="text-xs font-medium text-gray-500 w-28 flex-shrink-0 pt-0.5">Assignment Period: </span>
                <span className="text-sm text-gray-900 font-medium">
                  <p className="ml-0 text-sm text-gray-700">
                    {daysCompleted} completed
                      {daysRemaining > 0 && `, ${daysRemaining} remaining`}
                      , {totalDays} total
                  </p>
                </span>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 pb-1.5 border-b-2 border-gray-300">
              {assignment.client.type === 'individual' ? 'Patient Details' : 'Organization Details'}
            </h4>
            
            {assignment.client.type === 'individual' ? (
              <div className="space-y-2">
                <div className="flex items-start">
                  <span className="text-xs font-medium text-gray-500 w-28 flex-shrink-0 pt-0.5">Patient</span>
                  <span className="text-sm text-gray-900">
                    {assignment.client.details.individual?.patient_name || 'N/A'}
                    {assignment.client.details.individual?.patient_age != null &&
                      `, ${assignment.client.details.individual.patient_age} yrs`}
                  </span>
                </div>
                
                <div className="flex items-start">
                  <span className="text-xs font-medium text-gray-500 w-28 flex-shrink-0 pt-0.5">Gender</span>
                  <span className="text-sm text-gray-900 capitalize">
                    {assignment.client.details.individual?.patient_gender || 'N/A'}
                  </span>
                </div>
                
                <div className="flex items-start">
                  <span className="text-xs font-medium text-gray-500 w-28 flex-shrink-0 pt-0.5">Service</span>
                  <span className="text-sm text-gray-900">
                    {getServiceLabel(serviceOptions, assignment.client.details.individual?.service_required || 'N/A')}
                  </span>
                </div>
                
                <div className="flex items-start">
                  <span className="text-xs font-medium text-gray-500 w-28 flex-shrink-0 pt-0.5">Contact</span>
                  <span className="text-sm text-gray-900">
                    {assignment.client.details.individual?.requestor_name}
                    {assignment.client.details.individual?.relation_to_patient && 
                      <span className="text-gray-600"> ({assignment.client.details.individual.relation_to_patient})</span>}
                  </span>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-start">
                  <span className="text-xs font-medium text-gray-500 w-28 flex-shrink-0 pt-0.5">Organization</span>
                  <span className="text-sm text-gray-900">
                    {assignment.client.details.organization?.organization_name}
                    {assignment.client.details.organization?.organization_type && 
                      <span className="text-gray-600"> ({assignment.client.details.organization.organization_type})</span>}
                  </span>
                </div>
                
                <div className="flex items-start">
                  <span className="text-xs font-medium text-gray-500 w-28 flex-shrink-0 pt-0.5">Address</span>
                  <span className="text-sm text-gray-900">
                    {assignment.client.details.organization?.organization_address}
                  </span>
                </div>
                
                <div className="flex items-start">
                  <span className="text-xs font-medium text-gray-500 w-28 flex-shrink-0 pt-0.5">Contact Person</span>
                  <span className="text-sm text-gray-900">
                    {assignment.client.details.organization?.contact_person_name}
                    {assignment.client.details.organization?.contact_person_role && 
                      <span className="text-gray-600"> ({assignment.client.details.organization.contact_person_role})</span>}
                  </span>
                </div>
                
                <div className="flex items-start">
                  <span className="text-xs font-medium text-gray-500 w-28 flex-shrink-0 pt-0.5">Phone</span>
                  <span className="text-sm text-gray-900">
                    {assignment.client.details.organization?.contact_phone}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssignmentCard;