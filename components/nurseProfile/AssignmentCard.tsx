import React, { useState } from 'react';
import NotesModal from '@/components/ui/NotesModal';
import { Plus, Calendar, User, Building2, FileText, Clock } from 'lucide-react';
import { NurseAssignmentWithClient } from '@/app/actions/staff-management/add-nurse';
import { format12HourTime, formatDate, getServiceLabel, formatName } from '@/utils/formatters';
import { serviceOptions } from '@/utils/constants';
import { getAssignmentPeriodStatus, calculatePeriodSalary } from '@/utils/nurseAssignmentUtils';
import { updateNurseClientNotes } from '@/app/actions/clients/assessment';

interface AssignmentCardProps {
  assignment: NurseAssignmentWithClient;
}

const AssignmentCard: React.FC<AssignmentCardProps> = ({ assignment }) => {
  const getStatusConfig = () => {
    const startDate = new Date(assignment.assignment.start_date);
    const endDate = assignment.assignment.end_date ? new Date(assignment.assignment.end_date) : null;
    const now = new Date();

    if (startDate > now) {
      return { label: 'Upcoming', color: 'bg-blue-100 text-blue-800 border-blue-200' };
    }
    if (!endDate) {
      return { label: 'Ongoing', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' };
    }
    if (endDate < now) {
      return { label: 'Completed', color: 'bg-green-100 text-green-800 border-green-200' };
    }
    return { label: 'Ongoing', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' };
  };

  const status = getStatusConfig();
  const { daysCompleted, daysRemaining, totalDays } = getAssignmentPeriodStatus(
    assignment.assignment.start_date,
    assignment.assignment.end_date || new Date().toISOString()
  );

  const [notesModalOpen, setNotesModalOpen] = useState(false);
  const [notes, setNotes] = useState(assignment.assignment.notes || '');
  const [notesLoading, setNotesLoading] = useState(false);
  const [notesError, setNotesError] = useState<string | null>(null);

  const handleSaveNotes = async (newNotes: string) => {
    setNotesLoading(true);
    setNotesError(null);
    try {
      const result = await updateNurseClientNotes(assignment.assignment.id.toString(), newNotes);
      if (result.success) {
        setNotes(newNotes);
      } else {
        setNotesError(result.error || 'Could not save');
      }
    } catch (err) {
      setNotesError(err instanceof Error ? err.message : 'Could not save');
    } finally {
      setNotesLoading(false);
    }
  };

  const isIndividual = assignment.client.type === 'individual';
  const clientDetails = assignment.client.details;

  const DetailRow = ({
    label,
    value,
    subValue,
    valueClassName = "text-gray-900"
  }: {
    label: string;
    value: React.ReactNode;
    subValue?: React.ReactNode;
    valueClassName?: string;
  }) => (
    value ? (
      <div className="grid grid-cols-[120px_1fr] items-start py-2 border-b border-gray-50 last:border-0">
        <span className="text-[13px] font-bold text-gray-500 pt-1">{label}</span>
        <div className="text-sm leading-tight">
          <div className={`font-medium ${valueClassName}`}>{value}</div>
          {subValue && <div className="text-xs text-gray-500 mt-1">{subValue}</div>}
        </div>
      </div>
    ) : null
  );

  const getSalaryPerHour = () => {
    const { salary_per_day, shift_start_time, shift_end_time } = assignment.assignment;
    if (!salary_per_day || !shift_start_time || !shift_end_time) return null;
    const [startHour, startMin] = shift_start_time.split(':').map(Number);
    const [endHour, endMin] = shift_end_time.split(':').map(Number);
    const start = new Date();
    start.setHours(startHour, startMin, 0, 0);
    const end = new Date();
    end.setHours(endHour, endMin, 0, 0);
    let diffMs = end.getTime() - start.getTime();
    if (diffMs < 0) diffMs += 24 * 60 * 60 * 1000;
    const hours = diffMs / (1000 * 60 * 60);
    if (hours <= 0) return null;
    return Math.round((salary_per_day / hours) * 100) / 100;
  };

  const salaryPerHour = getSalaryPerHour();

  const periodSalaryEstimate = assignment.assignment.salary_per_day
    ? calculatePeriodSalary(
        assignment.assignment.start_date,
        assignment.assignment.end_date ?? undefined,
        assignment.assignment.salary_per_day
      )
    : null;

  return (
    <div className="group bg-white border border-gray-200 rounded-md transition-all hover:border-gray-300 hover:shadow-sm">
      <div className="px-5 py-3 flex flex-wrap justify-between items-center gap-4 border-b border-gray-100 bg-white">
        <div>
          <div className="flex items-center gap-3">
            <h3 className="text-base font-bold text-gray-900">
              {isIndividual
                ? formatName(clientDetails.individual?.patient_name || '')
                : formatName(clientDetails.organization?.organization_name || '')}
            </h3>
            <span className={`px-2.5 py-0.5 text-[13px] font-bold rounded border ${status.color}`}>
              {status.label}
            </span>
          </div>
          <p className="text-xs text-gray-500 flex items-center gap-1.5 mt-1">
            {isIndividual ? <User className="w-3 h-3" /> : <Building2 className="w-3 h-3" />}
            {isIndividual ? 'Personal Care' : 'Staffing'}
          </p>
        </div>
        <button
          onClick={() => setNotesModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-50 border border-gray-200 rounded hover:bg-white hover:text-blue-600 hover:border-blue-200 transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          {notes ? 'Edit Note' : 'Add Note'}
        </button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-gray-100">
        <div className="p-5">
          <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-100">
            <Calendar className="w-3.5 h-3.5 text-blue-600" />
            <h4 className="text-[15px] font-bold text-gray-900">Details</h4>
          </div>
          <div className="space-y-0.5">
            <DetailRow
              label="Dates"
              value={
                <span className="flex items-center gap-1">
                  {assignment.assignment.start_date && formatDate(assignment.assignment.start_date)}
                  {assignment.assignment.start_date && <span className="text-gray-400">-</span>}
                  {assignment.assignment.end_date ? formatDate(assignment.assignment.end_date) : assignment.assignment.start_date ? 'Ongoing' : null}
                </span>
              }
              subValue={
                <span className="block mt-0.5">
                  <span className="text-emerald-700 font-medium">{daysCompleted} days completed</span>
                  <span className="mx-1 text-gray-300">|</span>
                  <span className={daysRemaining > 0 ? "text-blue-600" : "text-red-600 font-semibold"}>
                    {daysRemaining > 0 ? `${daysRemaining} left` : 'Ended'}
                  </span>
                  <span className="mx-1 text-gray-300">|</span>
                  <span className="text-gray-900 font-semibold">{totalDays} days total</span>
                </span>
              }
            />
            {assignment.assignment.shift_start_time && assignment.assignment.shift_end_time && (
              <DetailRow
                label="Shift"
                value={
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3 h-3 text-gray-400" />
                    {format12HourTime(assignment.assignment.shift_start_time)} - {format12HourTime(assignment.assignment.shift_end_time)}
                  </div>
                }
              />
            )}
            {assignment.assignment.salary_per_day && (
              <DetailRow
                label="Salary"
                value={
                  salaryPerHour
                    ? `₹${salaryPerHour} per hour`
                    : 'N/A'
                }
                subValue={
                  <>
                    {assignment.assignment.salary_per_day && (
                      <span className="text-sm">Per day: ₹{assignment.assignment.salary_per_day}</span>
                    )}
                    {periodSalaryEstimate && (
                      <span className="block mt-1 text-blue-700 font-semibold text-sm">
                        Estimate For period: ₹{periodSalaryEstimate}
                      </span>
                    )}
                  </>
                }
              />
            )}
            {(notes || assignment.assignment.end_notes) && (
              <div className="mt-3 pt-2 border-t border-gray-50 bg-gray-50/50 p-2 rounded">
                <div className="flex items-start gap-2">
                  <FileText className="w-3.5 h-3.5 text-gray-400 mt-0.5 shrink-0" />
                  <div className="text-xs text-gray-600 italic leading-relaxed">
                    <span className="font-semibold text-gray-500 text-[13px] block mb-0.5">Note:</span>
                    &quot;{notes || assignment.assignment.end_notes}&quot;
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="p-5">
          <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-100">
            {isIndividual ? <User className="w-3.5 h-3.5 text-purple-600" /> : <Building2 className="w-3.5 h-3.5 text-purple-600" />}
            <h4 className="text-[15px] font-bold text-gray-900">About Client</h4>
          </div>
          <div className="space-y-0.5">
            {isIndividual ? (
              <>
                {clientDetails.individual?.patient_name && (
                  <DetailRow
                    label="Name"
                    value={formatName(clientDetails.individual.patient_name)}
                  />
                )}
                {(clientDetails.individual?.patient_age ?? 0) > 0 && (
                  <DetailRow
                    label="Age"
                    value={`${clientDetails.individual?.patient_age} years`}
                    subValue={clientDetails.individual?.patient_gender ? `Gender: ${clientDetails.individual.patient_gender}` : undefined}
                  />
                )}
                {clientDetails.individual?.service_required && (
                  <DetailRow
                    label="Service"
                    value={getServiceLabel(serviceOptions, clientDetails.individual.service_required)}
                  />
                )}
                {clientDetails.individual?.requestor_name && (
                  <DetailRow
                    label="Contact"
                    value={formatName(clientDetails.individual.requestor_name)}
                    subValue={clientDetails.individual.relation_to_patient ? `Relation: ${clientDetails.individual.relation_to_patient}` : undefined}
                  />
                )}
              </>
            ) : (
              <>
                {clientDetails.organization?.organization_name && (
                  <DetailRow
                    label="Name"
                    value={clientDetails.organization.organization_name}
                    subValue={clientDetails.organization.organization_type ? `Type: ${clientDetails.organization.organization_type}` : undefined}
                  />
                )}
                {clientDetails.organization?.organization_address && (
                  <DetailRow
                    label="Address"
                    value={clientDetails.organization.organization_address}
                  />
                )}
                {clientDetails.organization?.contact_person_name && (
                  <DetailRow
                    label="Contact"
                    value={clientDetails.organization.contact_person_name}
                    subValue={
                      (clientDetails.organization.contact_person_role || clientDetails.organization.contact_phone) ? (
                        <span>
                          {clientDetails.organization.contact_person_role && `Role: ${clientDetails.organization.contact_person_role}`}<br />
                          {clientDetails.organization.contact_phone && `Phone: ${clientDetails.organization.contact_phone}`}
                        </span>
                      ) : undefined
                    }
                  />
                )}
              </>
            )}
          </div>
        </div>
      </div>
      <NotesModal
        open={notesModalOpen}
        initialNotes={notes}
        onSave={handleSaveNotes}
        onClose={() => setNotesModalOpen(false)}
        title="Note"
        isSaving={notesLoading}
      />
      {notesError && (
        <div className="bg-red-50 px-5 py-2 text-xs text-red-600 border-t border-red-100 font-medium">
          {notesError}
        </div>
      )}
    </div>
  );
}

export default AssignmentCard;