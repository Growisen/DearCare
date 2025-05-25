import { useState, useEffect } from 'react';
import { getNurseAssignments, updateNurseAssignment, deleteNurseAssignment } from '@/app/actions/shift-schedule-actions';
import { listNurses } from '@/app/actions/add-nurse';
import { NurseAssignment } from '@/types/client.types';
import { Nurse } from '@/types/staff.types';
import toast from 'react-hot-toast';

export const useNurseAssignments = (clientId: string) => {
  const [nurseAssignments, setNurseAssignments] = useState<NurseAssignment[]>([]);
  const [nurses, setNurses] = useState<Nurse[]>([]);
  const [isLoadingNurses, setIsLoadingNurses] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<NurseAssignment | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showNurseList, setShowNurseList] = useState(false);
  const [selectedNurse, setSelectedNurse] = useState<Nurse | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const determineShiftType = (startTime?: string, endTime?: string): 'day' | 'night' | '24h' => {
    if (!startTime || !endTime) return 'day';
    
    const startHour = parseInt(startTime.split(':')[0]);
    const endHour = parseInt(endTime.split(':')[0]);
    
    if (endHour - startHour >= 12 || (startHour > endHour && startHour - endHour <= 12)) {
      return '24h';
    } else if (startHour >= 6 && startHour < 18) {
      return 'day';
    } else {
      return 'night';
    }
  };

  const fetchNurses = async () => {
    setIsLoadingNurses(true);
    try {
      const response = await listNurses();
      if (response.data) {
        setNurses(response.data);
      } else {
        toast.error(response.error || 'Failed to fetch nurses');
      }
    } catch (error) {
      console.error('Error fetching nurses:', error);
      toast.error('Error loading nurses');
    } finally {
      setIsLoadingNurses(false);
    }
  };

  const fetchAssignments = async () => {
    try {
      const assignmentsResponse = await getNurseAssignments(clientId);

      if (assignmentsResponse.success && assignmentsResponse.data) {
        const transformedAssignments: NurseAssignment[] = assignmentsResponse.data.map(assignment => ({
          id: assignment.id,
          nurseId: assignment.nurse_id,
          startDate: assignment.start_date,
          endDate: assignment.end_date,
          shiftStart: assignment.shift_start_time,
          shiftEnd: assignment.shift_end_time,
          status: assignment.status || 'active',
          shiftType: determineShiftType(assignment.shift_start_time, assignment.shift_end_time)
        }));
        
        setNurseAssignments(transformedAssignments);
      }
    } catch (error) {
      console.error('Error fetching nurse assignments:', error);
    }
  };

  const handleAssignNurse = async (nurseId: string) => {
    setShowNurseList(false);
    setShowConfirmation(false);
    
    const newAssignment: NurseAssignment = {
      nurseId,
      startDate: new Date().toISOString(),
      shiftType: 'day',
      status: 'active'
    };
    
    setNurseAssignments(prev => [...prev, newAssignment]);
    // TODO: Make API call to save assignment
  };

  const handleEditAssignment = (assignment: NurseAssignment) => {
    setEditingAssignment(assignment);
    setShowEditModal(true);
  };

  const handleUpdateAssignment = async (updatedAssignment: NurseAssignment) => {
    if (!updatedAssignment.id) {
      toast.error('Cannot update assignment without ID');
      return;
    }
    
    try {
      const updates = {
        start_date: updatedAssignment.startDate,
        end_date: updatedAssignment.endDate,
        shift_start_time: updatedAssignment.shiftStart,
        shift_end_time: updatedAssignment.shiftEnd,
      };
      
      const result = await updateNurseAssignment(updatedAssignment.id, updates);
      
      if (result.success) {
        setNurseAssignments(prevAssignments => 
          prevAssignments.map(assignment => 
            assignment.id === updatedAssignment.id ? updatedAssignment : assignment
          )
        );
        toast.success('Assignment updated successfully');
      } else {
        toast.error(`Failed to update assignment: ${result.message}`);
      }
    } catch (error) {
      console.error('Error updating assignment:', error);
      toast.error('An error occurred while updating the assignment');
    } finally {
      setShowEditModal(false);
      setEditingAssignment(null);
    }
  };

  const handleDeleteAssignment = async (assignmentId: number | string) => {
    const numericId = typeof assignmentId === 'string' ? parseInt(assignmentId, 10) : assignmentId;
    
    try {
      const result = await deleteNurseAssignment(numericId);
      
      if (result.success) {
        setNurseAssignments(prevAssignments => 
          prevAssignments.filter(assignment => assignment.id !== numericId)
        );
        toast.success('Assignment deleted successfully');
      } else {
        toast.error(`Failed to delete assignment: ${result.message}`);
      }
    } catch (error) {
      console.error('Error deleting assignment:', error);
      toast.error('An error occurred while deleting the assignment');
    }
  };

  useEffect(() => {
    fetchNurses();
    fetchAssignments();
  }, [clientId]);

  return {
    nurseAssignments,
    nurses,
    isLoadingNurses,
    editingAssignment,
    showEditModal,
    showNurseList,
    selectedNurse,
    showConfirmation,
    setShowNurseList,
    setSelectedNurse,
    setShowConfirmation,
    handleAssignNurse,
    handleEditAssignment,
    handleUpdateAssignment,
    handleDeleteAssignment,
    setShowEditModal,
    setEditingAssignment
  };
};