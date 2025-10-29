export type LeaveRequestStatus = 'pending' | 'approved' | 'rejected';

export interface LeaveRequest {
  id: string;
  nurseId: string;
  nurseName: string;
  admittedType: string;
  registrationNumber?: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  days: number;
  leaveMode: string;
  reason: string;
  status: LeaveRequestStatus;
  appliedOn: string;
  rejectionReason?: string;
}