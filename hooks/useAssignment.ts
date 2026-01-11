'use client';

import { useState, useCallback } from 'react';
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getAssignmentById } from '@/app/actions//scheduling/shift-schedule-actions';
import { getAttendanceRecords, markAttendance, unmarkAttendance } from '@/app/actions/attendance/attendance-actions';
import { differenceInMonths, parseISO } from 'date-fns';
import { format12HourTime, formatOrganizationName } from '@/utils/formatters';
import { getProfileUrl } from '@/app/actions/complaints-management/complaints-actions';
import toast from 'react-hot-toast';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  count?: number;
}

interface RawAssignmentData {
  id: number;
  nurse_id: number;
  nurse_full_name: string;
  nurse_phone: string;
  nurse_email: string;
  nurse_reg_no: string;
  admitted_type: string;
  client_id: string;
  client_name: string;
  client_type: string;
  client_address: string;
  client_contact: string;
  start_date: string;
  end_date: string;
  shift_start_time: string;
  shift_end_time: string;
  status: 'active' | 'upcoming' | 'completed';
  salary_per_day?: number;
}

export interface FormattedAssignmentDetails {
  id: number;
  nurseDetails: {
    id: number;
    name: string;
    phone: string;
    email: string;
    nurseRegNo: string;
    admittedType: string;
  };
  clientDetails: {
    clientId: string;
    name: string;
    type: string;
    address: string;
    contact: string;
    clientProfileUrl: string | null;
  };
  assignmentPeriod: {
    startDate: string;
    endDate: string;
    duration: string;
  };
  shiftDetails: {
    startTime: string;
    endTime: string;
    daysOfWeek: string;
    weeklyHours: string;
    salaryPerDay?: number; 
  };
  status: 'active' | 'upcoming' | 'completed';
}

export interface AttendanceRecord {
  id?:number;
  date: string;
  checkIn: string | null;
  checkOut: string | null;
  totalHours: string | number;
  status: string;
  notes?: string;
  location?: string | null;
  isAdminAction?:boolean;
  salaryPerDay?: number;
}

const calculateDuration = (startDate: string, endDate: string): string => {
  try {
    const start = parseISO(startDate);
    const end = parseISO(endDate);
    const months = differenceInMonths(end, start);
    
    return months <= 0 ? 'Less than a month' : 
           months === 1 ? '1 month' : 
           `${months} months`;
  } catch (error) {
    console.error('Error calculating duration:', error);
    return 'Unknown duration';
  }
};

const calculateWeeklyHours = (startTime: string, endTime: string): string => {
  try {
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);
    
    let hoursPerDay = endHour - startHour;
    let minutesPerDay = endMinute - startMinute;
    
    if (minutesPerDay < 0) {
      hoursPerDay--;
      minutesPerDay += 60;
    }
    
    const dailyHours = hoursPerDay + (minutesPerDay / 60);
    const weeklyHours = dailyHours * 5;
    
    return `${weeklyHours.toFixed(1)} hours`;
  } catch {
    return '40 hours';
  }
};

export function useAssignment(id: string) {
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<AttendanceRecord | null>(null);
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [attendanceError, setAttendanceError] = useState<string | null>(null);

  const { 
    data: assignmentData, 
    isLoading: assignmentLoading, 
    error: assignmentError,
    refetch: refetchAssignment
  } = useQuery({
    queryKey: ['assignment', id],
    queryFn: async () => {
      const assignmentId = parseInt(id, 10);
      
      if (isNaN(assignmentId)) {
        throw new Error('Invalid assignment ID');
      }
      
      const response = await getAssignmentById(assignmentId) as ApiResponse<RawAssignmentData>;
      
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to fetch assignment');
      }
      
      const data = response.data;
      
      const formatted: FormattedAssignmentDetails = {
        id: data.id,
        nurseDetails: {
          id: data.nurse_id,
          name: data.nurse_full_name,
          phone: data.nurse_phone,
          email: data.nurse_email,
          nurseRegNo: data.nurse_reg_no,
          admittedType: formatOrganizationName(data.admitted_type)
        },
        clientDetails: {
          clientId: data.client_id,
          name: data.client_name,
          type: data.client_type === 'individual' ? 'Individual Client' : 
                data.client_type === 'organization' ? 'Organization' : 
                'Unknown',
          address: data.client_address,
          contact: data.client_contact,
          clientProfileUrl: null
        },
        assignmentPeriod: {
          startDate: data.start_date,
          endDate: data.end_date,
          duration: calculateDuration(data.start_date, data.end_date)
        },
        shiftDetails: {
          startTime: format12HourTime(data.shift_start_time),
          endTime: format12HourTime(data.shift_end_time),
          daysOfWeek: "Monday to Friday",
          weeklyHours: calculateWeeklyHours(data.shift_start_time, data.shift_end_time),
          salaryPerDay: data.salary_per_day
        },
        status: data.status
      };
      
      const profileUrlResponse = await getProfileUrl(data.client_id, data.client_type);
      if (profileUrlResponse.success && profileUrlResponse.url) {
        formatted.clientDetails.clientProfileUrl = profileUrlResponse.url;
      }
      
      return formatted;
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
    refetchOnWindowFocus: true,
    refetchInterval: 1000 * 60 * 15, // 15 minutes
  });

  const { 
    data: attendanceData,
    isLoading: tableLoading,
    refetch: refetchAttendance
  } = useQuery({
    queryKey: ['attendance', id, currentPage, pageSize],
    queryFn: async () => {
      const assignmentId = parseInt(id, 10);
      if (isNaN(assignmentId)) {
        throw new Error('Invalid assignment ID');
      }
      
      const response = await getAttendanceRecords(assignmentId, currentPage, pageSize);
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch attendance records');
      }
      
      return response;
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
    refetchOnWindowFocus: true,
    refetchInterval: 1000 * 60 * 10, // 10 minutes
    enabled: !!assignmentData, // Only fetch attendance after assignment details are loaded
  });

  const assignmentDetails = assignmentData;
  const attendanceRecords = attendanceData?.data || [];
  const recordsCount = attendanceData?.count || 0;

  const invalidateAssignmentCache = () => {
    queryClient.invalidateQueries({ queryKey: ['assignment', id] });
    queryClient.invalidateQueries({ queryKey: ['attendance', id] });
  };

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize)
    setCurrentPage(1)
  }

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage * pageSize < recordsCount) {
      setCurrentPage(currentPage + 1);
    }
  };

  const refreshData = useCallback(() => {
    refetchAssignment();
    refetchAttendance();
  }, [refetchAssignment, refetchAttendance]);


  const openModal = useCallback((record: AttendanceRecord) => {
    setSelectedRecord(record);
    setCheckIn('');
    setCheckOut('');
    setModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setModalOpen(false);
    setSelectedRecord(null);
    setCheckIn('');
    setCheckOut('');
    setAttendanceError(null);
  }, []);

  const handleMarkAttendance = useCallback(async () => {
    if (!selectedRecord) return;
    setAttendanceLoading(true);
    setAttendanceError(null);
    try {
      if (assignmentDetails) {
        const res = await markAttendance({
          assignmentId: assignmentDetails.id,
          date: selectedRecord.date,
          checkIn,
          checkOut,
          isAdminAction: true,
        });

        if (!res.success) {
          setAttendanceError(res.message);
          setAttendanceLoading(false);
          return;
        }
        closeModal();
        toast.success('Attendance marked successfully!');
      }
      
      refreshData();
    } catch {
      setAttendanceError('Failed to mark attendance');
    } finally {
      setAttendanceLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRecord, checkIn, checkOut, assignmentDetails?.id, closeModal, refreshData]);


  const handleUnmarkAttendance = useCallback(async (id: number) => {
    if (!assignmentDetails) return;
    
    setAttendanceLoading(true);
    try {
      const res = await unmarkAttendance({ id });

      if (!res.success) {
        toast.error(res.message || 'Failed to delete attendance record');
        setAttendanceLoading(false);
        return;
      }
      
      toast.success('Attendance record deleted successfully');
      refreshData();
    } catch (error) {
      toast.error('Failed to delete attendance record');
      console.error('Error removing attendance:', error);
    } finally {
      setAttendanceLoading(false);
    }
  }, [assignmentDetails, refreshData]);

  return {
    loading: assignmentLoading,
    error: assignmentError ? (assignmentError instanceof Error ? assignmentError.message : 'An unknown error occurred') : null,
    assignmentDetails,
    attendanceRecords,
    recordsCount,
    currentPage,
    pageSize,
    handlePageSizeChange,
    handlePreviousPage,
    handleNextPage,
    tableLoading,
    refreshData,
    invalidateAssignmentCache,
    modalOpen,
    openModal,
    closeModal,
    selectedRecord,
    checkIn,
    setCheckIn,
    checkOut,
    setCheckOut,
    attendanceLoading,
    attendanceError,
    handleMarkAttendance,
    handleUnmarkAttendance
  };
}