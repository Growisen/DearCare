export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Client {
  id: string;
  name: string;
  requestDate: string;
  status: 'pending' | 'under_review' | 'approved' | 'rejected' | 'assigned';
  service?: string;
  email?: string;
  phone?: string;
  location?: string;
  shift?: string;
  description?: string;
  condition?: string;
  assignedNurse?: string;
  medications?: string[];
  specialInstructions?: string;
  nurseLocation?: { lat: number; lng: number };
  clientLocation?: { lat: number; lng: number };
}

export interface Review {
  id: string;
  text: string;
  date: string;
  rating: number;
  reviewer: string;
}

export interface FilterDropdownProps {
  label: string;
  options: string[];
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

export interface FilterInputProps {
  label: string;
  type: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export interface ApprovedContentProps {
  client: Client;
}

export interface StaffRequirement {
  staffType: string;
  count: number;
  shiftType: string;
}

export interface BaseFormData {
  clientType: 'individual' | 'organization' | 'hospital' | 'carehome';
  clientCategory: 'DearCare' | 'TataLife';
  generalNotes: string;
}

export interface IndividualFormData extends BaseFormData {
  requestorName: string;
  requestorPhone: string;
  requestorEmail: string;
  relationToPatient: string;
  patientName: string;
  patientAge: string;
  patientGender: string;
  patientPhone: string;
  completeAddress: string;
  serviceRequired: string;
  careDuration: string;
  startDate: string;
  preferredCaregiverGender: string;
}

export interface OrganizationFormData extends BaseFormData {
  organizationName: string;
  organizationType: string;
  contactPersonName: string;
  contactPersonRole: string;
  contactPhone: string;
  contactEmail: string;
  organizationAddress: string;
  staffRequirements: StaffRequirement[];
  duration: string;
}

export type FormData = IndividualFormData & OrganizationFormData;

export interface AddClientProps {
  onClose: () => void;
  onAdd: (data: Partial<Client>) => void;
}

export interface ClientDetailsProps {
  client: Client;
  onClose: () => void;
}

export interface ClientInformationProps {
  client: {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    service?: string;
    requestDate: string;
    //condition?: string;
    location?: string;
  };
}




export interface DetailedClientIndividual {
  client_type: 'individual';
  details?: {
    patient_name?: string;
    patient_age?: string | number;
    patient_gender?: string;
    patient_phone?: string;
    requestor_name?: string;
    relation_to_patient?: string;
    requestor_email?: string;
    requestor_phone?: string;
    service_required?: string;
    care_duration?: string;
    start_date?: string;
    complete_address?: string;
    preferred_caregiver_gender?: string;
  };
  general_notes?: string;
}

export interface DetailedClientOrganization {
  client_type: 'organization' | 'hospital' | 'carehome';
  details?: {
    organization_name?: string;
    organization_type?: string;
    contact_person_name?: string;
    contact_person_role?: string;
    contact_email?: string;
    contact_phone?: string;
    organization_address?: string;
    contract_duration?: string;
  };
  staffRequirements?: StaffRequirement[];
  general_notes?: string;
}


export interface EquipmentData {
  hospitalBed: boolean;
  wheelChair: boolean;
  adultDiaper: boolean;
  disposableUnderpad: boolean;
  pillows: boolean;
  bedRidden: boolean;
  [key: string]: boolean | string | number | null | JSON;
}

export interface PatientAssessmentData {
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
  hb: string;
  rbc: string;
  esr: string;
  urine: string;
  sodium: string;
  otherLabInvestigations: string;
  finalDiagnosis: string;
  foodsToInclude: string;
  foodsToAvoid: string;
  patientPosition: string;
  feedingMethod: string;
  isClean: boolean;
  isVentilated: boolean;
  isDry: boolean;
  hasNatureView: boolean;
  hasSocialInteraction: boolean;
  hasSupportiveEnv: boolean;
  equipment: Json;
  environment: Json;
  lab_investigations: Json;
}

export interface SavePatientAssessmentParams {
  clientId: string;
  assessmentData: PatientAssessmentData;
}

export interface SavePatientAssessmentResult {
  success: boolean;
  id?: string;
  error?: string;
}
