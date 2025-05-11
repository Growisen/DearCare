export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type ClientType = 'individual' | 'organization' | 'hospital' | 'carehome';

export interface Client {
  registrationNumber?: string;
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
  rejection_reason?: string
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
  clientType: 'individual' | 'organization' | 'hospital' | 'carehome';
  clientCategory: 'DearCare' | 'TataLife';
  generalNotes: string;
  dutyPeriod: string;
  dutyPeriodReason: string;
}

export interface IndividualFormData extends BaseFormData {
  requestorName: string;
  requestorPhone: string;
  requestorEmail: string;
  requestorAddress: string;
  requestorJobDetails: string;
  requestorEmergencyPhone: string;
  requestorPincode: string;
  requestorDistrict: string;
  requestorCity: string;
  relationToPatient: "" | "other" | "self" | "spouse" | "child" | "parent" | "sibling";
  patientName: string;
  patientAge: string;
  patientGender: "" | "male" | "female" | "other";
  patientPhone: string;
  patientAddress: string,  
  patientPincode: string, 
  patientDistrict: string, 
  patientCity: string, 
  serviceRequired: string;
  careDuration: string;
  startDate: string;
  preferredCaregiverGender: string;

  requestorProfilePic?: File | null;
  patientProfilePic?: File | null;
}

export interface OrganizationFormData extends BaseFormData {
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
  client_type: 'individual';
  client_category?: 'DearCare' | 'TataLife';
  duty_period?: string;
  duty_period_reason?: string;
  details?: {
    client_id?: string;
    patient_name?: string;
    patient_age?: string | number;
    patient_gender?: string;
    patient_phone?: string;
    patient_address?: string;
    patient_city?: string;
    patient_district?: string;
    patient_pincode?: string;
    requestor_emergency_phone?: string;
    requestor_job_details?: string;
    requestor_address?: string;
    requestor_city?: string;
    requestor_district?: string;
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
  };
  general_notes?: string;
  created_at?: string;
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
    organization_state?: string;
    organization_district?: string;
    organization_city?: string;
    organization_pincode?: string;
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

export type FamilyMember = {
  id: string;
  name: string;
  age: string;
  job: string;
  relation: string;
  medicalRecords: string;
};

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
  [key: string]: string | undefined | Json | LabInvestigations | FamilyMember[];
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
  clientCategory: 'DearCare' | 'TataLife';
  profileImage?: string | null;
  serviceRequired?: string;
  address: {
    fullAddress: string;
    city: string;
    district: string;
    pincode: string;
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
      city: string;
      district: string;
      pincode: string;
    };
  }
  emergencyContact: {
    name: string;
    relation: string;
    phone: string;
  };
  assessments: PatientAssessmentDataForApprovedClients[];
  nurseAssignments?: NurseAssignment[];
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
}