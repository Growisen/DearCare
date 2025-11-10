export interface Nurse {
  _id: string;
  firstName: string;
  lastName: string;
  experience: number;
  rating?: number;
  profileImage?: string;
  specialty?: string;
}

export interface ShiftData {
  nurseId: string;
  startDate: string;
  endDate: string;
  shiftStart: string;
  shiftEnd: string;
  salaryPerDay: string;
}