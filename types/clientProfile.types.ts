export interface BaseUser {
  _id: string;
  firstName: string;
  lastName: string;
}

export interface Nurse extends BaseUser {
  email: string;
}

export interface Assessment {
  id: string;
  date: string;
  type: string;
}

export interface ServiceDetails {
  level: string;
  schedule: string;
}

export interface Patient extends BaseUser {
  id: string;
  assessments: Assessment[];
  totalAssessments: Assessment[];
  serviceDetails: ServiceDetails;
}

export interface Assignment {
  _id: string;
  nurseId: string;
  patientId: string;
  startDate: string;
  endDate?: string;
}

export interface FilterState {
  search: string;
  status: string;
}

export type TabType = 'profile' | 'medical' | 'files' | 'assignments' | 'paymentDetails' | 'servicePeriods';