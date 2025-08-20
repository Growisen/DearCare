import { useState, useEffect } from 'react';
import { getNurseAssignments, updateNurseAssignment, deleteNurseAssignment } from '@/app/actions/scheduling/shift-schedule-actions';
import { listNursesWithAssignments } from '@/app/actions/staff-management/add-nurse';
import { NurseAssignment } from '@/types/client.types';
import { Nurse } from '@/types/staff.types';
import toast from 'react-hot-toast';
import { useDashboardData } from './useDashboardData';

export const useNurseAssignments = (clientId: string) => {
  const { invalidateDashboardCache } = useDashboardData();
  const [nurseAssignments, setNurseAssignments] = useState<NurseAssignment[]>([]);
  const [nurses, setNurses] = useState<Nurse[]>([]);
  const [isLoadingNurses, setIsLoadingNurses] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<NurseAssignment | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showNurseList, setShowNurseList] = useState(false);
  const [selectedNurse, setSelectedNurse] = useState<Nurse | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showEndModal, setShowEndModal] = useState(false);
  const [assignmentToEnd, setAssignmentToEnd] = useState<NurseAssignment | null>(null);
  const [endDate, setEndDate] = useState<string>(new Date().toISOString().slice(0, 10)); // Default to today
  
  // New pagination and filtering state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [totalPages, setTotalPages] = useState(1);
  const [totalNurses, setTotalNurses] = useState(0);
  const [filters, setFilters] = useState<{
    status?: string;
    city?: string;
    serviceType?: string;
  }>({});

  const determineShiftType = (startTime?: string, endTime?: string): 'day' | 'night' | '24h' => {
    console.log(`🔍 INPUT: startTime="${startTime}", endTime="${endTime}"`);
    
    if (!startTime || !endTime) {
      console.log('❌ Missing time inputs, returning default "day"');
      return 'day';
    }
    
    const timeRegex = /^([01]?[0-9]|2[0-3]):([0-5][0-9])(?::([0-5][0-9]))?$/;
    if (!timeRegex.test(startTime) || !timeRegex.test(endTime)) {
      console.warn(`❌ Invalid time format: start=${startTime}, end=${endTime}`);
      return 'day';
    }
    
    const startTimeParts = startTime.split(':');
    const endTimeParts = endTime.split(':');
    
    const startHourStr = startTimeParts[0];
    const startMinStr = startTimeParts[1];
    const endHourStr = endTimeParts[0];
    const endMinStr = endTimeParts[1];
    
    console.log(`📊 PARSED: start="${startHourStr}:${startMinStr}", end="${endHourStr}:${endMinStr}"`);
    
    const startHour = parseInt(startHourStr, 10);
    const startMin = parseInt(startMinStr, 10);
    const endHour = parseInt(endHourStr, 10);
    const endMin = parseInt(endMinStr, 10);
    
    console.log(`🔢 NUMBERS: startHour=${startHour}, startMin=${startMin}, endHour=${endHour}, endMin=${endMin}`);
    
    if (isNaN(startHour) || isNaN(startMin) || isNaN(endHour) || isNaN(endMin)) {
      console.warn(`❌ Failed to parse time values: start=${startTime}, end=${endTime}`);
      return 'day';
    }
    
    const startTotalMinutes = startHour * 60 + startMin;
    let endTotalMinutes = endHour * 60 + endMin;
    
    console.log(`⏰ MINUTES: start=${startTotalMinutes}, end=${endTotalMinutes} (before midnight adjustment)`);
    
    if (endTotalMinutes === 0) {
      endTotalMinutes = 24 * 60;
      console.log(`🌙 Midnight adjustment: endTotalMinutes now = ${endTotalMinutes}`);
    }
    
    let durationMinutes;
    if (endTotalMinutes > startTotalMinutes) {
      durationMinutes = endTotalMinutes - startTotalMinutes;
      console.log(`📅 Same day shift: ${durationMinutes} minutes`);
    } else if (endTotalMinutes === startTotalMinutes) {
      durationMinutes = 24 * 60;
      console.log(`🔄 24-hour shift detected: ${durationMinutes} minutes`);
    } else {
      durationMinutes = (24 * 60 - startTotalMinutes) + endTotalMinutes;
      console.log(`🌃 Overnight shift: ${durationMinutes} minutes`);
    }
    
    const durationHours = durationMinutes / 60;
    console.log(`⏳ DURATION: ${durationMinutes} minutes (${durationHours} hours)`);
    
    if (durationMinutes >= 22 * 60) {
      console.log(`✅ RESULT: "24h" (duration >= 22 hours)`);
      return '24h';
    }
    
    if (durationMinutes >= 12 * 60) {
      const result = (startHour >= 6 && startHour < 18) ? 'day' : 'night';
      console.log(`✅ RESULT: "${result}" (long shift, start hour = ${startHour})`);
      return result;
    }
    
    const result = (startHour >= 6 && startHour < 18) ? 'day' : 'night';
    console.log(`✅ RESULT: "${result}" (regular shift, start hour = ${startHour})`);
    return result;
  };




  const fetchNurses = async () => {
    setIsLoadingNurses(true);
    try {
      const response = await listNursesWithAssignments(
        { page: currentPage, pageSize },
        filters
      );
      
      if (response.data) {
        setNurses(response.data);
        setTotalPages(response.totalPages || 1);
        setTotalNurses(response.totalCount || 0);
        return response.data;
      } else {
        toast.error(response.error || 'Failed to fetch nurses');
        return [];
      }
    } catch (error) {
      console.error('Error fetching nurses:', error);
      toast.error('Error loading nurses');
      return [];
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
          shiftType: determineShiftType(assignment.shift_start_time, assignment.shift_end_time),
          nurse_first_name: assignment.nurses?.first_name,
          nurse_last_name: assignment.nurses?.last_name
        }));
        
        setNurseAssignments(transformedAssignments);
      }
    } catch (error) {
      console.error('Error fetching nurse assignments:', error);
    }
  };

  // Modified to only fetch assignments on initial load
  const refetch = async () => {
    try {
      await fetchAssignments();
    } catch (error) {
      console.error('Error refetching nurse assignments data:', error);
      toast.error('Failed to refresh nurse assignments data');
    }
  };

  // New handler for opening the nurse list modal
  const handleOpenNurseList = async () => {
    setIsLoadingNurses(true);
    setShowNurseList(true);
  };

  // New method to change page
  const changePage = (page: number) => {
    setCurrentPage(page);
  };

  // New method to update filters
  const updateFilters = (newFilters: typeof filters) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters
    }));
    setCurrentPage(1); // Reset to first page when filters change
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
        invalidateDashboardCache()
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
        invalidateDashboardCache();
        await refetch(); // <-- Add this line to reload assignments from the server
        toast.success('Assignment deleted successfully');
      } else {
        toast.error(`Failed to delete assignment: ${result.message}`);
      }
    } catch (error) {
      console.error('Error deleting assignment:', error);
      toast.error('An error occurred while deleting the assignment');
    }
  };

  const handleEndAssignment = (assignment: NurseAssignment) => {
    setAssignmentToEnd(assignment);
    setEndDate(new Date().toISOString().slice(0, 10));
    setShowEndModal(true);
  };

  const confirmEndAssignment = async () => {
    if (!assignmentToEnd || assignmentToEnd.id === undefined) return;
    try {
      const updates = {
        end_date: endDate,
      };
      const result = await updateNurseAssignment(assignmentToEnd.id, updates);
      if (result.success) {
        invalidateDashboardCache();
        await refetch();
        toast.success('Assignment ended successfully');
      } else {
        toast.error(`Failed to end assignment`);
      }
    } catch {
      toast.error('An error occurred while ending the assignment');
    } finally {
      setShowEndModal(false);
      setAssignmentToEnd(null);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, [clientId]); 
  
  useEffect(() => {
    if (showNurseList) {
      fetchNurses();
    }
  }, [currentPage, pageSize, filters, showNurseList]);

  return {
    nurseAssignments,
    nurses,
    isLoadingNurses,
    editingAssignment,
    showEditModal,
    showNurseList,
    selectedNurse,
    showConfirmation,
    showEndModal,
    setShowEndModal,
    assignmentToEnd,
    handleEndAssignment,
    confirmEndAssignment,
    endDate,
    setEndDate,
    // New pagination properties
    currentPage,
    totalPages,
    totalNurses,
    pageSize,
    // New filter properties
    filters,
    // Existing methods
    setShowNurseList,
    setSelectedNurse,
    setShowConfirmation,
    handleAssignNurse,
    handleEditAssignment,
    handleUpdateAssignment,
    handleDeleteAssignment,
    setShowEditModal,
    setEditingAssignment,
    // New methods
    changePage,
    updateFilters,
    setPageSize,
    refetch,
    handleOpenNurseList
  };
};