import { ClientCategory, Json } from './client.types';
import { DetailedClientIndividual } from './client.types';

export interface PatientAssessmentDataForApprovedClients {
  guardianOccupation: string;
  maritalStatus: string;
  height: string;
  weight: string;
  pincode: string;
  district: string;
  cityTown: string;
  currentStatus: string;
  chronicIllness: string;
  medicalHistory: string;
  surgicalHistory: string;
  medicationHistory: string;
  alertnessLevel: string;
  physicalBehavior: string;
  speechPatterns: string;
  emotionalState: string;
  drugsUse: string;
  alcoholUse: string;
  tobaccoUse: string;
  otherSocialHistory: string;
  presentCondition: string;
  bloodPressure: string;
  sugarLevel: string;
  finalDiagnosis: string;
  foodsToInclude: string;
  foodsToAvoid: string;
  patientPosition: string;
  feedingMethod: string;
  equipment: Json;
  environment: Json;
  lab_investigations: Json;
}

export interface NurseAssignment {
  nurseId: string;
  startDate: string;
  endDate?: string;
  status: 'active' | 'completed' | 'cancelled';
  shiftType: 'day' | 'night' | '24h';
}

export interface Patient {
  _id?: string;
  firstName: string;
  lastName: string;
  age: number | string;
  gender: string;
  bloodGroup: string;
  location: string;
  email: string;
  phoneNumber: string;
  clientCategory: ClientCategory;
  requestor: {
    name: string;
    relation: string;
    phone: string;
    email: string;
  };
  emergencyContact: {
    name: string;
    relation: string;
    phone: string;
  };
  primaryDoctor: {
    name: string;
    specialization: string;
    contact: string;
  };
  insuranceDetails: {
    provider: string;
    policyNumber: string;
    validUntil: string;
  };
  assessments: PatientAssessmentDataForApprovedClients[];
  profileImage?: string;
  nurseAssignments?: NurseAssignment[];
}

export interface ClientResponse {
  success: boolean;
  client: DetailedClientIndividual;
}