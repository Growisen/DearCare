import { BedSoreData } from "./reassessment.types";

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type ClientCategory = 'DearCare LLP' | 'Tata HomeNursing';
export type ClientStatus = 'pending' | 'under_review' | 'approved' | 'rejected' | 'assigned';
export type ClientFilters = 'pending' | 'under_review' | 'approved' | 'rejected' | 'assigned' | 'all';
export type ClientType = 'individual' | 'organization' | 'hospital' | 'carehome';
export type RelationToPatient = "" | "other" | "self" | "spouse" | "child" | "parent" | "sibling" | "son/daughter" 
                                   | "son_in_law" | "daughter_in_law";
export type Gender = "" | "male" | "female" | "other"

export interface Client {
  registrationNumber?: string;
  id: string;
  name: string;
  requestDate: string;
  status: ClientStatus;
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
  rejection_reason?: string
  createdAt?: string;
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
  shift_type?: string;
  staff_type?:string
}

export interface BaseFormData {
  clientType: ClientType;
  clientCategory: ClientCategory;
  generalNotes: string;
  dutyPeriod: string;
  dutyPeriodReason: string;
}

export interface IndividualFormData extends BaseFormData {
  prevRegisterNumber: string;
  requestorName: string;
  requestorPhone: string;
  requestorEmail: string;
  requestorAddress: string;
  requestorJobDetails: string;
  requestorEmergencyPhone: string;
  requestorPincode: string;
  requestorDistrict: string;
  requestorState: string;
  requestorCity: string;
  relationToPatient: RelationToPatient;
  patientName: string;
  patientAge: string;
  patientGender: Gender;
  patientPhone: string;
  patientAddress: string,  
  patientPincode: string, 
  patientDistrict: string, 
  patientState: string;
  patientCity: string, 
  serviceRequired: string;
  careDuration: string;
  startDate: string;
  preferredCaregiverGender: string;

  requestorProfilePic?: File | null;
  patientProfilePic?: File | null;
}

export interface OrganizationFormData extends BaseFormData {
  prevRegisterNumber: string;
  organizationName: string;
  organizationType: string;
  contactPersonName: string;
  contactPersonRole: string;
  contactPhone: string;
  contactEmail: string;
  organizationState: string;
  organizationDistrict: string;
  organizationCity: string;
  organizationAddress: string;
  organizationPincode: string;
  staffRequirements: StaffRequirement[];
  staffReqStartDate: string
}

export type FormData = IndividualFormData & OrganizationFormData;

export interface AddClientProps {
  onClose: () => void;
  onAdd?: () => void;
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
  registration_number?: string;
  prev_registration_number?: string;
  client_type: 'individual';
  client_category?: ClientCategory;
  duty_period?: string;
  duty_period_reason?: string;
  details?: {
    client_id?: string;
    patient_name?: string;
    patient_age?: string | number;
    patient_gender?: string;
    patient_phone?: string;
    patient_address?: string;
    patient_state?: string;
    patient_city?: string;
    patient_district?: string;
    patient_pincode?: string;
    requestor_emergency_phone?: string;
    requestor_job_details?: string;
    requestor_address?: string;
    requestor_city?: string;
    requestor_district?: string;
    requestor_state?: string;
    requestor_pincode?: string;
    requestor_name?: string;
    relation_to_patient?: string;
    requestor_email?: string;
    requestor_phone?: string;
    service_required?: string;
    care_duration?: string;
    start_date?: string;
    complete_address?: string;
    preferred_caregiver_gender?: string;
    requestor_profile_pic_url?: string | null;
    requestor_profile_pic?: string | null;
    patient_profile_pic?: string | null;
    patient_profile_pic_url?: string | null;
    patient_location_link?: string;
    requestor_location_link?: string;
  };
  general_notes?: string;
  created_at?: string;
  service_start_date?: string;
  service_end_date?: string;
}

export interface DetailedClientOrganization {
  registration_number?: string;
  prev_registration_number?: string;
  client_type: 'organization' | 'hospital' | 'carehome';
  client_category?: ClientCategory;
  details?: {
    client_id?: string;
    organization_name?: string;
    organization_type?: string;
    contact_person_name?: string;
    contact_person_role?: string;
    contact_email?: string;
    contact_phone?: string;
    organization_state?: string;
    organization_district?: string;
    organization_city?: string;
    organization_pincode?: string;
    organization_address?: string;
    contract_duration?: string;
    start_date?: string;
  };
  staffRequirements?: StaffRequirement[];
  general_notes?: string;
}

export type FamilyMember = {
  id: string;
  name: string;
  age: string;
  job: string;
  relation: string;
  medicalRecords: string;
};

export interface RecorderInfo {
  recorderId: string;
  recorderName: string;
  recorderRole: string;
  familyRelationship: string;
  recorderTimestamp: string;
  nurseRegistrationNumber?: string;
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
  familyMembers: FamilyMember[],
  customLabTests: Array<{ id: string; name: string; value: string }>;
  recorderInfo: RecorderInfo;
  bedSore: BedSoreData;
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
  lab_investigations: LabInvestigations;
  familyMembers: FamilyMember[];
  recorderInfo: RecorderInfo;
  [key: string]: string | undefined | Json | LabInvestigations | FamilyMember[] | RecorderInfo;
}

export interface NurseAssignment {
  id?: number;
  nurseId: number | string;
  startDate: string;
  endDate?: string;
  shiftStart?: string;
  shiftEnd?: string;
  status: 'active' | 'completed' | 'cancelled';
  shiftType?: 'day' | 'night' | '24h';
  nurse_first_name?: string;
  nurse_last_name?: string;
  salary_per_day?: number;
  salaryPerDay?: number;
  salaryPerMonth?: number;
  salary_per_month?: number;
  nurseRegNo?: string;
  end_notes?: string;
  endNotes?: string;
}


export interface Patient {
  _id?: string;
  registrationNumber?: string;
  firstName: string;
  lastName: string;
  age: number | string;
  gender: string;
  bloodGroup: string;
  location: string;
  email: string;
  phoneNumber: string;
  clientCategory: ClientCategory;
  profileImage?: string | null;
  address: {
    fullAddress: string;
    city: string;
    state?: string;
    district: string;
    pincode: string;
    patientLocationLink: string;
  };
  requestor: { 
    name: string;
    relation: string;
    phone: string;
    email: string;
    profileImage?: string | null;
    emergencyPhone?: string;
    jobDetails?: string;
    address?: {
      fullAddress: string;
      state?: string;
      city: string;
      district: string;
      pincode: string;
      requestorLocationLink: string;
    };
  }
  emergencyContact: {
    name: string;
    relation: string;
    phone: string;
  };
  assessments: PatientAssessmentDataForApprovedClients[];
  nurseAssignments?: NurseAssignment[];

  serviceDetails: {
    serviceRequired?: string;
    status?: string | null;
    startDate?: string;
    serviceLocation?: string;
    serviceFrequency?: string;
    serviceHours?: string;
    specialRequirements?: string;
    preferredCaregiverGender?: string;
  };
  createdAt?: string;
  serviceStartDate?: string;
  serviceEndDate?: string;
  totalAssessments?: Array<{ id: string; created_at: string; }>;
}

export interface ClientResponse {
  success: boolean;
  client: DetailedClientIndividual;
}


export interface LabInvestigations {
  hb?: string;
  rbc?: string;
  esr?: string;
  urine?: string;
  sodium?: string;
  other?: string;
  custom_tests?: Array<{ id: string; name: string; value: string }>;
}

export interface Environment {
  is_clean?: boolean;
  is_ventilated?: boolean;
  is_dry?: boolean;
  has_nature_view?: boolean;
  has_social_interaction?: boolean;
  has_supportive_env?: boolean;
}

export interface Equipment {
  hospitalBed?: boolean;
  wheelChair?: boolean;
  adultDiaper?: boolean;
  disposableUnderpad?: boolean;
  pillows?: boolean;
  bedRidden?: boolean;
  semiBedridden?: boolean;
  bedWedges?: boolean;
  bedsideCommode?: boolean;
  patientLift?: boolean;
  bedsideHandRail?: boolean;
  examinationGloves?: boolean;
  noRinseCleanser?: boolean;
  bathingWipes?: boolean;
  bpMeasuringApparatus?: boolean;
  electricBackLifter?: boolean;
  o2Concentrator?: boolean;
  overBedTable?: boolean;
  suctionMachine?: boolean;
  ivStand?: boolean;
  bedPan?: boolean;
  decubitusMatress?: boolean;
  airMatress?: boolean;
  bpMonitor?: boolean;
  bedLift?: boolean;
  bedRail?: boolean;
  cane?: boolean;
  walkers?: boolean;
  crutches?: boolean;
}

export interface AssessmentData {
  guardian_occupation?: string;
  marital_status?: string;
  height?: string;
  weight?: string;
  pincode?: string;
  district?: string;
  city_town?: string;
  current_status?: string;
  chronic_illness?: string;
  medical_history?: string;
  surgical_history?: string;
  medication_history?: string;
  present_condition?: string;
  blood_pressure?: string;
  sugar_level?: string;
  alertness_level?: string;
  physical_behavior?: string;
  speech_patterns?: string;
  emotional_state?: string;
  drugs_use?: string;
  alcohol_use?: string;
  tobacco_use?: string;
  other_social_history?: string;
  final_diagnosis?: string;
  foods_to_include?: string;
  foods_to_avoid?: string;
  patient_position?: string;
  feeding_method?: string;
  lab_investigations?: LabInvestigations;
  environment?: Environment;
  equipment?: Equipment;
  family_members: FamilyMember[];
  recorder_info: RecorderInfo;
  bed_sore?: BedSoreData;
}


export interface ClientFile {
  id: string;
  client_id: string;
  name: string;
  type: string;
  storage_path: string;
  url: string;
  uploaded_at: string;
  tag?: string
}