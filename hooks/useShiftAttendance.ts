/**
 * Shift Attendance React Hook
 * 
 * Custom hook for managing shift-based attendance operations using React Query.
 * Provides mutations for starting/ending shifts and queries for attendance data.
 * 
 * @module useShiftAttendance
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import React from 'react';
import {
  startShift,
  endShift,
  getActiveShift,
  getShiftHistory,
  getShiftAttendanceStats,
  getShiftByAssignmentId,
} from '@/app/actions/attendance/shift-attendance-actions';
import {
  calculateShiftDays,
  type ShiftAttendanceRecord,
  type ActiveShift,
  type ShiftAttendanceStats,
  type StartShiftRequest,
  type EndShiftRequest,
  type ShiftHistoryFilter,
} from '@/types/shift-attendance.types';

// ============================================================================
// Query Keys
// ============================================================================

export const shiftAttendanceKeys = {
  all: ['shift-attendance'] as const,
  active: (nurseId: number) => [...shiftAttendanceKeys.all, 'active', nurseId] as const,
  history: (filter: ShiftHistoryFilter) => [...shiftAttendanceKeys.all, 'history', filter] as const,
  stats: (nurseId: number, startDate?: string, endDate?: string) => 
    [...shiftAttendanceKeys.all, 'stats', nurseId, startDate, endDate] as const,
  assignment: (assignmentId: number) => 
    [...shiftAttendanceKeys.all, 'assignment', assignmentId] as const,
};

// ============================================================================
// Hook: Get Active Shift
// ============================================================================

/**
 * Hook to get the active shift for a nurse
 * 
 * @param nurseId - Nurse ID to check for active shifts
 * @param options - React Query options
 * @returns Query result with active shift data
 */
export function useActiveShift(
  nurseId: number,
  options?: {
    enabled?: boolean;
    refetchInterval?: number;
  }
) {
  return useQuery<ActiveShift>({
    queryKey: shiftAttendanceKeys.active(nurseId),
    queryFn: () => getActiveShift(nurseId),
    enabled: options?.enabled ?? !!nurseId,
    refetchInterval: options?.refetchInterval ?? 30000, // Auto-refresh every 30 seconds
    staleTime: 10000, // Consider data stale after 10 seconds
  });
}

// ============================================================================
// Hook: Get Shift History
// ============================================================================

/**
 * Hook to get paginated shift history with filtering
 * 
 * @param filter - Filter options for querying shifts
 * @param options - React Query options
 * @returns Query result with shift history
 */
export function useShiftHistory(
  filter: ShiftHistoryFilter = {},
  options?: {
    enabled?: boolean;
  }
) {
  return useQuery({
    queryKey: shiftAttendanceKeys.history(filter),
    queryFn: () => getShiftHistory(filter),
    enabled: options?.enabled ?? true,
    staleTime: 30000, // Consider data stale after 30 seconds
  });
}

// ============================================================================
// Hook: Get Shift Statistics
// ============================================================================

/**
 * Hook to get attendance statistics for a nurse
 * 
 * @param nurseId - Nurse ID to get statistics for
 * @param startDate - Optional start date for filtering
 * @param endDate - Optional end date for filtering
 * @param options - React Query options
 * @returns Query result with attendance statistics
 */
export function useShiftAttendanceStats(
  nurseId: number,
  startDate?: string,
  endDate?: string,
  options?: {
    enabled?: boolean;
  }
) {
  return useQuery<ShiftAttendanceStats>({
    queryKey: shiftAttendanceKeys.stats(nurseId, startDate, endDate),
    queryFn: () => getShiftAttendanceStats(nurseId, startDate, endDate),
    enabled: options?.enabled ?? !!nurseId,
    staleTime: 60000, // Consider data stale after 1 minute
  });
}

// ============================================================================
// Hook: Get Shift by Assignment ID
// ============================================================================

/**
 * Hook to get shift details for a specific assignment
 * 
 * @param assignmentId - Assignment ID to fetch
 * @param options - React Query options
 * @returns Query result with shift details
 */
export function useShiftByAssignment(
  assignmentId: number,
  options?: {
    enabled?: boolean;
  }
) {
  return useQuery<ShiftAttendanceRecord | null>({
    queryKey: shiftAttendanceKeys.assignment(assignmentId),
    queryFn: () => getShiftByAssignmentId(assignmentId),
    enabled: options?.enabled ?? !!assignmentId,
    staleTime: 30000,
  });
}

// ============================================================================
// Hook: Start Shift Mutation
// ============================================================================

/**
 * Hook to start a shift for an assignment
 * 
 * @param options - Mutation options with callbacks
 * @returns Mutation object for starting shifts
 */
export function useStartShift(options?: {
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: StartShiftRequest) => startShift(request),
    onMutate: async (variables) => {
      // Show loading toast
      toast.loading('Starting shift...');
    },
    onSuccess: (data, variables) => {
      // Dismiss all toasts
      toast.dismiss();

      if (data.success && data.data) {
        // Show success message
        const startTime = new Date(data.data.shiftStartDatetime).toLocaleString();
        toast.success(`Shift started successfully at ${startTime}`);

        // Invalidate relevant queries
        queryClient.invalidateQueries({ 
          queryKey: shiftAttendanceKeys.active(data.data.nurseId) 
        });
        queryClient.invalidateQueries({ 
          queryKey: shiftAttendanceKeys.all 
        });

        // Call custom success callback
        options?.onSuccess?.(data);
      } else {
        // Show error message
        toast.error(data.error || 'Failed to start shift');
        options?.onError?.(data.error);
      }
    },
    onError: (error: any) => {
      // Dismiss loading toast
      toast.dismiss();

      // Show error message
      toast.error(error.message || 'Failed to start shift');

      options?.onError?.(error);
    },
  });
}

// ============================================================================
// Hook: End Shift Mutation
// ============================================================================

/**
 * Hook to end a shift for an assignment
 * 
 * @param options - Mutation options with callbacks
 * @returns Mutation object for ending shifts
 */
export function useEndShift(options?: {
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: EndShiftRequest) => endShift(request),
    onMutate: async (variables) => {
      // Show loading toast
      toast.loading('Ending shift...');
    },
    onSuccess: (data, variables) => {
      // Dismiss loading toast
      toast.dismiss();

      if (data.success && data.data) {
        // Show success message with calculated days
        toast.success(
          `Shift ended! Attendance: ${data.data.calculatedAttendanceDays} days (${data.data.durationHours} hours)`,
          { duration: 5000 }
        );

        // Invalidate relevant queries
        queryClient.invalidateQueries({ 
          queryKey: shiftAttendanceKeys.active(data.data.nurseId) 
        });
        queryClient.invalidateQueries({ 
          queryKey: shiftAttendanceKeys.all 
        });
        queryClient.invalidateQueries({ 
          queryKey: shiftAttendanceKeys.stats(data.data.nurseId) 
        });

        // Call custom success callback
        options?.onSuccess?.(data);
      } else {
        // Show error message
        toast.error(data.error || 'Failed to end shift');
        options?.onError?.(data.error);
      }
    },
    onError: (error: any) => {
      // Dismiss loading toast
      toast.dismiss();

      // Show error message
      toast.error(error.message || 'Failed to end shift');

      options?.onError?.(error);
    },
  });
}

// ============================================================================
// Composite Hook: Complete Shift Management
// ============================================================================

/**
 * Comprehensive hook that provides all shift attendance functionality
 * 
 * @param nurseId - Nurse ID for queries
 * @param options - Configuration options
 * @returns Object with all shift operations and queries
 */
export function useShiftAttendance(
  nurseId: number,
  options?: {
    enableActiveShift?: boolean;
    enableStats?: boolean;
    autoRefresh?: boolean;
    historyFilter?: ShiftHistoryFilter;
  }
) {
  const {
    enableActiveShift = true,
    enableStats = true,
    autoRefresh = true,
    historyFilter,
  } = options || {};

  // Queries
  const activeShiftQuery = useActiveShift(nurseId, {
    enabled: enableActiveShift,
    refetchInterval: autoRefresh ? 30000 : undefined,
  });

  const historyQuery = useShiftHistory(
    historyFilter || { nurseId },
    { enabled: !!nurseId }
  );

  const statsQuery = useShiftAttendanceStats(nurseId, undefined, undefined, {
    enabled: enableStats,
  });

  // Mutations
  const startShiftMutation = useStartShift();
  const endShiftMutation = useEndShift();

  // Computed values
  const hasActiveShift = activeShiftQuery.data?.hasActiveShift ?? false;
  const activeShift = activeShiftQuery.data?.shift ?? null;
  const isLoading = activeShiftQuery.isLoading || historyQuery.isLoading || statsQuery.isLoading;
  const isStarting = startShiftMutation.isPending;
  const isEnding = endShiftMutation.isPending;

  return {
    // Queries
    activeShift: activeShiftQuery,
    history: historyQuery,
    stats: statsQuery,

    // Mutations
    startShift: startShiftMutation,
    endShift: endShiftMutation,

    // Computed values
    hasActiveShift,
    activeShiftData: activeShift,
    isLoading,
    isStarting,
    isEnding,
    canStartShift: !hasActiveShift && !isStarting,
    canEndShift: hasActiveShift && !isEnding,

    // Helper functions
    refreshActiveShift: () => activeShiftQuery.refetch(),
    refreshHistory: () => historyQuery.refetch(),
    refreshStats: () => statsQuery.refetch(),
    refreshAll: () => {
      activeShiftQuery.refetch();
      historyQuery.refetch();
      statsQuery.refetch();
    },
  };
}

// ============================================================================
// Hook: Shift Duration Timer
// ============================================================================

/**
 * Hook to calculate and update shift duration in real-time
 * 
 * @param shiftStartDatetime - Shift start timestamp
 * @param shiftEndDatetime - Shift end timestamp (null for ongoing shifts)
 * @returns Current duration information
 */
export function useShiftDuration(
  shiftStartDatetime: string | null,
  shiftEndDatetime: string | null
) {
  const [duration, setDuration] = React.useState({
    hours: 0,
    minutes: 0,
    days: 0,
    totalHours: 0,
  });

  React.useEffect(() => {
    if (!shiftStartDatetime) {
      setDuration({ hours: 0, minutes: 0, days: 0, totalHours: 0 });
      return;
    }

    const calculateDuration = () => {
      const start = new Date(shiftStartDatetime);
      const end = shiftEndDatetime ? new Date(shiftEndDatetime) : new Date();
      
      const durationMs = end.getTime() - start.getTime();
      const totalHours = durationMs / (1000 * 60 * 60);
      const days = Math.floor(totalHours / 24);
      const hours = Math.floor(totalHours % 24);
      const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));

      setDuration({
        hours,
        minutes,
        days,
        totalHours: Math.round(totalHours * 100) / 100,
      });
    };

    // Calculate immediately
    calculateDuration();

    // Update every minute for ongoing shifts
    if (!shiftEndDatetime) {
      const interval = setInterval(calculateDuration, 60000);
      return () => clearInterval(interval);
    }
  }, [shiftStartDatetime, shiftEndDatetime]);

  return duration;
}
