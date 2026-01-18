import React, { useState } from 'react';
import Modal from '../ui/Modal';
import NotesModal from '../ui/NotesModal';
import Link from 'next/link';
import {
  formatDate,
  calculateDaysBetween,
  format12HourTime,
  calculatePeriodSalary,
  getAssignmentPeriodStatus
} from '@/utils/nurseAssignmentUtils';
import { Plus, ExternalLink } from 'lucide-react';
import { updateNurseClientNotes } from '@/app/actions/clients/assessment';

interface NurseAssignment {
  id?: number;
  nurseId: number | string;
  startDate: string;
  endDate?: string;
  shiftStart?: string;
  shiftEnd?: string;
  status: 'active' | 'completed' | 'cancelled';
  shiftType?: 'day' | 'night' | '24h';
  nurse_first_name?: string;
  nurse_last_name?: string;
  salaryPerDay?: number;
  salaryPerMonth?: number;
  nurseRegNo?: string;
  endNotes?: string;
  notes?: string;
}

interface Nurse {
  _id: string;
  firstName: string;
  lastName: string;
}

interface NurseAssignmentsListProps {
  assignments: NurseAssignment[];
  nurses?: Nurse[];
  onEditAssignment: (assignment: NurseAssignment) => void;
  onEndAssignment: (assignment: NurseAssignment) => void;
  onDeleteAssignment: (assignmentId: number | string) => void;
  onAddNotes?: (assignment: NurseAssignment) => void;
  refetchAssignments?: () => void;
}

const NurseAssignmentsList: React.FC<NurseAssignmentsListProps> = ({
  assignments,
  nurses = [],
  onEditAssignment,
  onEndAssignment,
  onDeleteAssignment,
  onAddNotes,
  refetchAssignments,
}) => {
  const [deleteId, setDeleteId] = useState<number | string | null>(null);
  const [notesModalOpen, setNotesModalOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<NurseAssignment | null>(null);

  const getDisplayStatus = (assignment: NurseAssignment) => {
    if (assignment.status === 'cancelled') return 'cancelled';
    if (assignment.endDate) {
      const endDate = new Date(assignment.endDate);
      const currentDate = new Date();
      if (endDate < currentDate) return 'completed';
    }
    return 'active';
  };

  const handleDeleteClick = (id: number | string) => {
    setDeleteId(id);
  };

  const confirmDelete = () => {
    if (deleteId !== null) {
      onDeleteAssignment(deleteId);
      setDeleteId(null);
    }
  };

  const handleAddNotes = (assignment: NurseAssignment) => {
    setSelectedAssignment(assignment);
    setNotesModalOpen(true);
  };

  const handleSaveNotes = async (notes: string) => {
    if (selectedAssignment && selectedAssignment.id) {
      await updateNurseClientNotes(selectedAssignment.id.toString(), notes);
      setNotesModalOpen(false);
      if (refetchAssignments) {
        refetchAssignments();
      }
    }
  };

  return (
    <div className="space-y-3">
      {assignments.map((assignment) => {
        let firstName = assignment.nurse_first_name;
        let lastName = assignment.nurse_last_name;

        if (!firstName && !lastName && nurses.length > 0) {
          const nurse = nurses.find(
            (n) => n._id === assignment.nurseId || n._id === assignment.nurseId.toString()
          );
          if (nurse) {
            firstName = nurse.firstName;
            lastName = nurse.lastName;
          }
        }

        if (!firstName && !lastName) return null;

        const displayStatus = getDisplayStatus(assignment);
        const statusColors = {
          active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          completed: 'bg-gray-50 text-gray-600 border-slate-200',
          cancelled: 'bg-red-50 text-red-700 border-red-200',
        };

        return (
          <div
            key={assignment.id ?? `${assignment.nurseId}-${assignment.startDate}`}
            className="bg-white rounded-sm border border-slate-200 hover:border-slate-200 transition-colors"
          >
            <div className="px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div>
                  <h3 className="font-medium text-gray-900">
                    <Link
                      href={`/nurses/${assignment.nurseId}`}
                      prefetch={false}
                      title="View profile"
                      className="hover:text-blue-600 flex items-center gap-1 text-blue-700"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {firstName} {lastName}
                      <ExternalLink className="w-4 h-4 text-blue-400 ml-1" aria-label="External link" />
                    </Link>
                  </h3>
                  {assignment.nurseRegNo && (
                    <p className="text-xs text-gray-500">{assignment.nurseRegNo}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  href={`/assignments/${assignment.id}`}
                  prefetch={false}
                  className="ml-2 px-2 py-1 text-xs font-medium rounded border border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 flex items-center gap-1"
                  target="_blank"
                  rel="noopener noreferrer"
                  title="View Assignment Details"
                >
                  Assignment Details
                  <ExternalLink className="w-3 h-3 text-indigo-400 ml-1" aria-label="External link" />
                </Link>
                <span className={`px-2.5 py-1 text-xs font-medium rounded-sm border ${statusColors[displayStatus]}`}>
                  {displayStatus.charAt(0).toUpperCase() + displayStatus.slice(1)}
                </span>
                <button
                  onClick={() => onAddNotes ? onAddNotes(assignment) : handleAddNotes(assignment)}
                  className="ml-2 px-2 py-1 text-xs font-medium rounded-sm border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 transition"
                  title="Add Notes"
                >
                  <Plus className="w-3.5 h-3.5 inline-block mr-1" />
                  Add Notes
                </button>
              </div>
            </div>

            <div className="px-4 pb-3 border-t border-slate-200">
              <div className="grid grid-cols-2 gap-x-6 gap-y-2 pt-3 text-sm">
                <div>
                  <span className="text-gray-500">Duration:</span>
                  <span className="ml-2 text-gray-900">
                    {formatDate(assignment.startDate)}
                    {assignment.endDate && ` - ${formatDate(assignment.endDate)}`}
                    {assignment.endDate && (() => {
                      const { daysCompleted, daysRemaining, totalDays } =
                        getAssignmentPeriodStatus(
                          assignment.startDate,
                          assignment.endDate
                        );
                      return (
                        <span className="block mt-0.5">
                          <span className="text-emerald-700 font-medium">{daysCompleted} days completed</span>
                          <span className="mx-1 text-gray-300">|</span>
                          <span className={daysRemaining > 0 ? "text-blue-600" : "text-red-600 font-semibold"}>
                            {daysRemaining > 0 ? `${daysRemaining} left` : 'Ended'}
                          </span>
                          <span className="mx-1 text-gray-300">|</span>
                          <span className="text-gray-900 font-semibold">{totalDays} days total</span>
                        </span>
                      );
                    })()}
                    {!assignment.endDate && (
                      <span className="ml-2 text-xs text-gray-500">
                        (
                          {calculateDaysBetween(assignment.startDate, assignment.endDate)} day
                          {calculateDaysBetween(assignment.startDate, assignment.endDate) > 1 ? 's' : ''}
                        )
                      </span>
                    )}
                  </span>
                </div>
                
                {(assignment.shiftStart || assignment.shiftEnd) && (
                  <div>
                    <span className="text-gray-500">Shift:</span>
                    <span className="ml-2 text-gray-900">
                      {format12HourTime(assignment.shiftStart || null)}
                      {assignment.shiftEnd && ` - ${format12HourTime(assignment.shiftEnd)}`}
                      {assignment.shiftType && ` (${assignment.shiftType})`}
                    </span>
                  </div>
                )}

                {assignment.salaryPerDay !== undefined && (
                  <div>
                    <span className="text-gray-500">Salary Per Day:</span>
                    <span className="ml-2 text-gray-900">₹{assignment.salaryPerDay || 0}</span>
                  </div>
                )}

                {assignment.salaryPerMonth !== undefined && (
                  <div>
                    <span className="text-gray-500">Salary Per Month:</span>
                    <span className="ml-2 text-gray-900">₹{assignment.salaryPerMonth || 0}</span>
                  </div>
                )}

                {assignment.salaryPerDay !== undefined && (
                  <div>
                    <span className="text-gray-500">Estimated Salary for Period:</span>
                    <span className="ml-2 text-gray-900">
                      ₹{calculatePeriodSalary(assignment.startDate, assignment.endDate, assignment.salaryPerDay) || 0}
                    </span>
                    <span className="block text-xs text-gray-400">
                      (Only if Staff completes the shift on all assigned days)
                    </span>
                  </div>
                )}

                {assignment.notes && (
                  <div className="col-span-2">
                    <span className="text-gray-500">Info:</span>
                    <span className="ml-2 text-gray-900">{assignment.notes}</span>
                  </div>
                )}

                {assignment.endNotes && (
                  <div className="col-span-2">
                    <span className="text-gray-500">End Notes:</span>
                    <span className="ml-2 text-gray-900">{assignment.endNotes}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3 mt-3 pt-3 border-t border-slate-200">
                {displayStatus === 'active' && (
                  <>
                    <button
                      onClick={() => onEditAssignment(assignment)}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onEndAssignment(assignment)}
                      className="text-sm text-orange-600 hover:text-orange-700 font-medium"
                    >
                      End
                    </button>
                  </>
                )}
                <button
                  onClick={() => handleDeleteClick(assignment.id || assignment.nurseId)}
                  className="text-sm text-gray-500 hover:text-red-600 font-medium ml-auto"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        );
      })}

      {assignments.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No nurse assignments found
        </div>
      )}

      <Modal
        open={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={confirmDelete}
        variant="delete"
        title="Delete Assignment?"
        description="This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
      />

      <NotesModal
        open={notesModalOpen}
        initialNotes={selectedAssignment?.notes || ''}
        onSave={handleSaveNotes}
        onClose={() => setNotesModalOpen(false)}
      />
    </div>
  );
};

export default NurseAssignmentsList;