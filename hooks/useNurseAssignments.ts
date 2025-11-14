import { useState, useEffect } from 'react';
import { getNurseAssignments, updateNurseAssignment, deleteNurseAssignment } from '@/app/actions/scheduling/shift-schedule-actions';
import { listNursesWithAssignments } from '@/app/actions/staff-management/add-nurse';
import { NurseAssignment } from '@/types/client.types';
import { Nurse } from '@/types/staff.types';
import toast from 'react-hot-toast';
import { useDashboardData } from './useDashboardData';
import useOrgStore from '@/app/stores/UseOrgStore';

export const useNurseAssignments = (clientId: string, activeTab?: string) => {
  const { invalidateDashboardCache } = useDashboardData();
  const { organization } = useOrgStore(); 
  const [nurseAssignments, setNurseAssignments] = useState<NurseAssignment[]>([]);
  const [nurses, setNurses] = useState<Nurse[]>([]);
  const [isLoadingNurses, setIsLoadingNurses] = useState(false);
  const [isLoadingAssignments, setIsLoadingAssignments] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<NurseAssignment | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showNurseList, setShowNurseList] = useState(false);
  const [selectedNurse, setSelectedNurse] = useState<Nurse | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showEndModal, setShowEndModal] = useState(false);
  const [assignmentToEnd, setAssignmentToEnd] = useState<NurseAssignment | null>(null);
  const [endDate, setEndDate] = useState<string>(new Date().toISOString().slice(0, 10));
  
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [totalPages, setTotalPages] = useState(1);
  const [totalNurses, setTotalNurses] = useState(0);
  const [filters, setFilters] = useState<{
    status?: string;
    city?: string;
    serviceType?: string;
    admittedType?: string;
    searchTerm?: string;
  }>({admittedType: organization});

  const determineShiftType = (startTime?: string, endTime?: string): 'day' | 'night' | '24h' => {
    
    if (!startTime || !endTime) {
      return 'day';
    }
    
    const timeRegex = /^([01]?[0-9]|2[0-3]):([0-5][0-9])(?::([0-5][0-9]))?$/;
    if (!timeRegex.test(startTime) || !timeRegex.test(endTime)) {
      return 'day';
    }
    
    const startTimeParts = startTime.split(':');
    const endTimeParts = endTime.split(':');
    
    const startHourStr = startTimeParts[0];
    const startMinStr = startTimeParts[1];
    const endHourStr = endTimeParts[0];
    const endMinStr = endTimeParts[1];
    
    const startHour = parseInt(startHourStr, 10);
    const startMin = parseInt(startMinStr, 10);
    const endHour = parseInt(endHourStr, 10);
    const endMin = parseInt(endMinStr, 10);
    
    if (isNaN(startHour) || isNaN(startMin) || isNaN(endHour) || isNaN(endMin)) {
      console.warn(`❌ Failed to parse time values: start=${startTime}, end=${endTime}`);
      return 'day';
    }
    
    const startTotalMinutes = startHour * 60 + startMin;
    let endTotalMinutes = endHour * 60 + endMin;
    
    if (endTotalMinutes === 0) {
      endTotalMinutes = 24 * 60;
    }
    
    let durationMinutes;
    if (endTotalMinutes > startTotalMinutes) {
      durationMinutes = endTotalMinutes - startTotalMinutes;
    } else if (endTotalMinutes === startTotalMinutes) {
      durationMinutes = 24 * 60;
    } else {
      durationMinutes = (24 * 60 - startTotalMinutes) + endTotalMinutes;
    }
    
    const durationHours = durationMinutes / 60;
    console.log(`⏳ DURATION: ${durationMinutes} minutes (${durationHours} hours)`);
    
    if (durationMinutes >= 22 * 60) {
      return '24h';
    }
    
    if (durationMinutes >= 12 * 60) {
      const result = (startHour >= 6 && startHour < 18) ? 'day' : 'night';
      return result;
    }
    
    const result = (startHour >= 6 && startHour < 18) ? 'day' : 'night';
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
    setIsLoadingAssignments(true);
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
          nurse_last_name: assignment.nurses?.last_name,
          salaryPerDay: assignment.salary_per_day,
          nurseRegNo: assignment.nurses?.nurse_reg_no,
        }));
        
        setNurseAssignments(transformedAssignments);
      }
    } catch (error) {
      console.error('Error fetching nurse assignments:', error);
      toast.error('Failed to load nurse assignments');
    } finally {
      setIsLoadingAssignments(false);
    }
  };

  const refetch = async () => {
    try {
      await fetchAssignments();
    } catch (error) {
      console.error('Error refetching nurse assignments data:', error);
      toast.error('Failed to refresh nurse assignments data');
    }
  };

  const handleOpenNurseList = async () => {
    setIsLoadingNurses(true);
    setShowNurseList(true);
  };

  const changePage = (page: number) => {
    setCurrentPage(page);
  };

  const updateFilters = (newFilters: typeof filters) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters
    }));
    setCurrentPage(1);
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
        salary_per_day: updatedAssignment.salaryPerDay,
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
        await refetch();
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
    if (activeTab === 'assignments') {
      fetchAssignments();
    }
  }, [clientId, activeTab]); 
  
  useEffect(() => {
    if (showNurseList) {
      fetchNurses();
    }
  }, [currentPage, pageSize, filters, showNurseList]);

  return {
    nurseAssignments,
    nurses,
    isLoadingNurses,
    isLoadingAssignments,
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
    currentPage,
    totalPages,
    totalNurses,
    pageSize,
    filters,
    setShowNurseList,
    setSelectedNurse,
    setShowConfirmation,
    handleAssignNurse,
    handleEditAssignment,
    handleUpdateAssignment,
    handleDeleteAssignment,
    setShowEditModal,
    setEditingAssignment,
    changePage,
    updateFilters,
    setPageSize,
    refetch,
    handleOpenNurseList
  };
};