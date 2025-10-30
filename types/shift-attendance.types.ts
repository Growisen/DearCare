/**
 * Shift-Based Attendance Type Definitions
 * 
 * This module defines types for the shift-based attendance system used by Tata Home Nursing employees.
 * Shift-based attendance allows nurses to start and end a single shift for an entire assignment period,
 * with automatic calculation of attendance days based on shift duration.
 */

/**
 * Attendance tracking mode for assignments
 * 
 * @property daily - Traditional daily check-in/check-out (used by DearCare LLP)
 * @property shift_based - Single shift start/end with auto-calculation (used by Tata Home Nursing)
 */
export type AttendanceMode = 'daily' | 'shift_based';

/**
 * Current status of a shift-based attendance record
 * 
 * @property not_started - Shift has not been initiated yet
 * @property in_progress - Shift has started but not ended
 * @property completed - Shift has been completed (both start and end recorded)
 */
export type ShiftStatus = 'not_started' | 'in_progress' | 'completed';

/**
 * Geographic location information for shift tracking
 */
export interface ShiftLocation {
  /** Latitude coordinate */
  latitude: number;
  /** Longitude coordinate */
  longitude: number;
  /** Human-readable address (optional) */
  address?: string;
  /** Timestamp when location was captured */
  timestamp?: string;
}

/**
 * Extended nurse_client assignment with shift-based attendance fields
 * 
 * This interface extends the base nurse_client table to include shift attendance tracking.
 * For assignments with attendance_mode = 'shift_based', these fields track the single
 * shift start/end that covers the entire assignment period.
 */
export interface NurseClientWithShiftAttendance {
  /** Assignment ID */
  id: number;
  /** Nurse ID reference */
  nurse_id: number;
  /** Client ID reference */
  client_id: string;
  /** Assignment start date */
  start_date: string;
  /** Assignment end date */
  end_date: string;
  /** Shift start time (for daily tracking) */
  shift_start_time: string | null;
  /** Shift end time (for daily tracking) */
  shift_end_time: string | null;
  /** Hourly salary rate */
  salary_hour: number | null;
  /** Daily salary rate */
  salary_per_day: number | null;
  /** Assignment type */
  assigned_type: string | null;
  
  // ========== Shift-Based Attendance Fields ==========
  /** Attendance tracking mode */
  attendance_mode: AttendanceMode;
  /** Timestamp when shift started (for shift-based attendance) */
  shift_start_datetime: string | null;
  /** Timestamp when shift ended (for shift-based attendance) */
  shift_end_datetime: string | null;
  /** Auto-calculated attendance days based on shift duration */
  calculated_attendance_days: number;
  /** Location where shift was started (JSON string) */
  shift_start_location: string | null;
  /** Location where shift was ended (JSON string) */
  shift_end_location: string | null;
  
  /** Record creation timestamp */
  created_at?: string;
}

/**
 * Complete shift attendance record with nurse and client details
 * 
 * This interface combines shift attendance data with related nurse and client information
 * for display and reporting purposes.
 */
export interface ShiftAttendanceRecord {
  /** Assignment ID */
  assignmentId: number;
  /** Nurse ID */
  nurseId: number;
  /** Nurse first name */
  nurseFirstName: string;
  /** Nurse last name */
  nurseLastName: string;
  /** Nurse registration number */
  nurseRegNo: string | null;
  /** Organization type (Tata_Homenursing or Dearcare_Llp) */
  organizationType: string;
  /** Client ID */
  clientId: string;
  /** Client name */
  clientName: string;
  /** Shift start datetime */
  shiftStartDatetime: string;
  /** Shift end datetime (null if in progress) */
  shiftEndDatetime: string | null;
  /** Calculated attendance days */
  calculatedAttendanceDays: number;
  /** Current shift status */
  status: ShiftStatus;
  /** Shift duration in hours (calculated) */
  durationHours: number;
  /** Start location */
  startLocation: ShiftLocation | null;
  /** End location */
  endLocation: ShiftLocation | null;
  /** Daily salary rate */
  salaryPerDay: number | null;
  /** Calculated total salary */
  calculatedSalary: number | null;
}

/**
 * Request payload for starting a shift
 */
export interface StartShiftRequest {
  /** Assignment ID from nurse_client table */
  assignmentId: number;
  /** Geographic location where shift is starting */
  location: ShiftLocation;
  /** Optional note about shift start */
  note?: string;
}

/**
 * Response from starting a shift
 */
export interface StartShiftResponse {
  /** Whether operation was successful */
  success: boolean;
  /** Error message if failed */
  error?: string;
  /** Updated assignment data if successful */
  data?: {
    assignmentId: number;
    shiftStartDatetime: string;
    nurseId: number;
    clientId: string;
  };
}

/**
 * Request payload for ending a shift
 */
export interface EndShiftRequest {
  /** Assignment ID from nurse_client table */
  assignmentId: number;
  /** Geographic location where shift is ending */
  location: ShiftLocation;
  /** Optional note about shift end */
  note?: string;
}

/**
 * Response from ending a shift
 */
export interface EndShiftResponse {
  /** Whether operation was successful */
  success: boolean;
  /** Error message if failed */
  error?: string;
  /** Updated assignment data if successful */
  data?: {
    assignmentId: number;
    shiftStartDatetime: string;
    shiftEndDatetime: string;
    calculatedAttendanceDays: number;
    durationHours: number;
    nurseId: number;
    clientId: string;
  };
}

/**
 * Filter options for querying shift history
 */
export interface ShiftHistoryFilter {
  /** Filter by nurse ID */
  nurseId?: number;
  /** Filter by client ID */
  clientId?: string;
  /** Filter by organization type */
  organizationType?: 'Tata_Homenursing' | 'Dearcare_Llp';
  /** Filter by shift status */
  status?: ShiftStatus;
  /** Start date for date range filter (ISO string) */
  startDate?: string;
  /** End date for date range filter (ISO string) */
  endDate?: string;
  /** Pagination: page number (1-indexed) */
  page?: number;
  /** Pagination: items per page */
  pageSize?: number;
}

/**
 * Paginated shift history response
 */
export interface ShiftHistoryResponse {
  /** Array of shift attendance records */
  records: ShiftAttendanceRecord[];
  /** Total number of records matching filter */
  totalCount: number;
  /** Current page number */
  currentPage: number;
  /** Total number of pages */
  totalPages: number;
  /** Items per page */
  pageSize: number;
}

/**
 * Active shift information for a nurse
 */
export interface ActiveShift {
  /** Whether nurse has an active shift */
  hasActiveShift: boolean;
  /** Active shift details (null if no active shift) */
  shift: ShiftAttendanceRecord | null;
}

/**
 * Shift attendance statistics for reporting
 */
export interface ShiftAttendanceStats {
  /** Total number of completed shifts */
  totalShifts: number;
  /** Total attendance days accumulated */
  totalAttendanceDays: number;
  /** Total hours worked */
  totalHours: number;
  /** Average shift duration in hours */
  averageShiftDuration: number;
  /** Number of currently active shifts */
  activeShifts: number;
  /** Total calculated salary from shifts */
  totalCalculatedSalary: number;
}

/**
 * Validation result for shift operations
 */
export interface ShiftValidationResult {
  /** Whether operation is valid */
  isValid: boolean;
  /** Error message if not valid */
  error?: string;
  /** Warning message (operation can proceed but with caution) */
  warning?: string;
}

/**
 * Shift calculation utility result
 */
export interface ShiftCalculation {
  /** Shift start datetime */
  startDatetime: string;
  /** Shift end datetime */
  endDatetime: string;
  /** Duration in milliseconds */
  durationMs: number;
  /** Duration in hours */
  durationHours: number;
  /** Duration in days (hours / 24) */
  durationDays: number;
  /** Calculated attendance days (rounded to 2 decimals) */
  attendanceDays: number;
}

/**
 * Calculate shift attendance days from start and end datetimes
 * 
 * This is a client-side utility function for calculating shift duration.
 * 
 * @param startDatetime - Shift start timestamp (ISO string)
 * @param endDatetime - Shift end timestamp (ISO string)
 * @returns Calculation details including attendance days
 */
export function calculateShiftDays(
  startDatetime: string,
  endDatetime: string
): ShiftCalculation {
  const start = new Date(startDatetime);
  const end = new Date(endDatetime);
  
  const durationMs = end.getTime() - start.getTime();
  const durationHours = durationMs / (1000 * 60 * 60);
  const durationDays = durationHours / 24;
  
  // Round to 2 decimal places
  const attendanceDays = Math.round(durationDays * 100) / 100;
  
  return {
    startDatetime,
    endDatetime,
    durationMs,
    durationHours: Math.round(durationHours * 100) / 100,
    durationDays: Math.round(durationDays * 100) / 100,
    attendanceDays: Math.max(0.01, attendanceDays), // Minimum 0.01 days
  };
}
