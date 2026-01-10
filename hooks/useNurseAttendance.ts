'use client';

import { useQuery } from "@tanstack/react-query";
import { getNurseAttendanceRecordsByDate } from '@/app/actions/attendance/attendance-actions';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  count?: number;
  totalPages?: number;
  currentPage?: number;
}

export interface AttendanceRecord {
  date: string;
  checkIn: string | null;
  checkOut: string | null;
  totalHours: string | number;
  status: string;
  notes?: string;
  location?: string | null;
  isAdminAction?: boolean;
  nurseName?: string;
  nursePrevRegNo?: string;
  nurseRegNo?: string;
}

export function useNurseAttendance(
  nurseId: number,
  startDate: string,
  endDate: string,
  page: number = 1,
  pageSize: number = 10
) {
  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['nurseAttendance', nurseId, startDate, endDate, page, pageSize],
    queryFn: async () => {
      if (!nurseId || !startDate || !endDate) {
        throw new Error('Missing required parameters');
      }
      const response = await getNurseAttendanceRecordsByDate(
        nurseId,
        startDate,
        endDate,
        page,
        pageSize
      ) as ApiResponse<AttendanceRecord[]>;
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch attendance records');
      }
      return response;
    },
    enabled: !!nurseId && !!startDate && !!endDate,
    staleTime: 1000 * 60 * 2,
    refetchOnWindowFocus: true,
  });

  return {
    loading: isLoading,
    error: error ? (error instanceof Error ? error.message : 'An unknown error occurred') : null,
    attendanceRecords: data?.data || [],
    recordsCount: data?.count || 0,
    totalPages: data?.totalPages || 0,
    currentPage: data?.currentPage || page,
    refetch,
  };
}