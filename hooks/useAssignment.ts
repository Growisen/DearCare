'use client';

import { useState, useEffect } from 'react';
import { getAssignmentById } from '../app/actions/shift-schedule-actions';
import { getAttendanceRecords } from '../app/actions/attendance-actions';
import { differenceInMonths, parseISO } from 'date-fns';
import { format12HourTime } from '@/utils/formatters';
import { getProfileUrl } from '@/app/actions/complaints-actions';

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
}

export interface FormattedAssignmentDetails {
  id: number;
  nurseDetails: {
    id: number;
    name: string;
    phone: string;
    email: string;
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
  };
  status: 'active' | 'upcoming' | 'completed';
}

export interface AttendanceRecord {
  date: string;
  checkIn: string | null;
  checkOut: string | null;
  totalHours: string | number;
  status: string;
  notes?: string;
  location?: string | null;
  isAdminAction?:boolean;
}

export function useAssignment(id: string) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [assignmentDetails, setAssignmentDetails] = useState<FormattedAssignmentDetails | null>(null);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [recordsCount, setRecordsCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [tableLoading, setTableLoading] = useState(false);
  const pageSize = 10;

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

  const fetchAssignmentDetails = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const assignmentId = parseInt(id, 10);
      
      if (isNaN(assignmentId)) {
        throw new Error('Invalid assignment ID');
      }
      
      const response = await getAssignmentById(assignmentId) as ApiResponse<RawAssignmentData>;
      
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to fetch assignment');
      }
      
      const data = response.data;

      console.log("dddsd", data)
      
      const formatted: FormattedAssignmentDetails = {
        id: data.id,
        nurseDetails: {
          id: data.nurse_id,
          name: data.nurse_full_name,
          phone: data.nurse_phone,
          email: data.nurse_email
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
          weeklyHours: calculateWeeklyHours(data.shift_start_time, data.shift_end_time)
        },
        status: data.status
      };
      
      const profileUrlResponse = await getProfileUrl(data.client_id, data.client_type);
      if (profileUrlResponse.success && profileUrlResponse.url) {
        formatted.clientDetails.clientProfileUrl = profileUrlResponse.url;
      }
      
      setAssignmentDetails(formatted);

      console.log("jkj", formatted)
      
      await fetchAttendanceRecords(assignmentId, 1);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendanceRecords = async (assignmentId: number, page: number) => {
    setTableLoading(true);
    
    try {
      const response: ApiResponse<AttendanceRecord[]> = await getAttendanceRecords(assignmentId, page, pageSize);
      
      if (response.success && response.data) {
        setAttendanceRecords(response.data);
        if (response.count !== undefined) setRecordsCount(response.count);
        setCurrentPage(page);
      } else {
        console.error('Error fetching attendance records:', response.error);
      }
    } catch (error) {
      console.error('Failed to fetch attendance records:', error);
    } finally {
      setTableLoading(false);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      const newPage = currentPage - 1;
      const assignmentId = parseInt(id, 10);
      fetchAttendanceRecords(assignmentId, newPage);
    }
  };

  const handleNextPage = () => {
    if (currentPage * pageSize < recordsCount) {
      const newPage = currentPage + 1;
      const assignmentId = parseInt(id, 10);
      fetchAttendanceRecords(assignmentId, newPage);
    }
  };

  useEffect(() => {
    fetchAssignmentDetails();
  }, [id]);

  return {
    loading,
    error,
    assignmentDetails,
    attendanceRecords,
    recordsCount,
    currentPage,
    pageSize,
    handlePreviousPage,
    handleNextPage,
    tableLoading
  };
}