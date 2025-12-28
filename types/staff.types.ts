// Base nurse type without system-specific fields
export type BaseNurseFields = {
    firstName: string;
    lastName: string;
    email: string;
    location: string;
    phoneNumber: string;
    gender: string;
    dob: string;
    experience: number;
    preferredLocations: string[];
    image?: File | null;
}

export interface stp1BaseNurseFields {
  first_name: string;
  last_name: string;
  gender: string;
  date_of_birth: string;
  marital_status: string;
  religion: string;
  mother_tongue: string;
}

// Full Nurse type extending base fields
export interface Nurse extends BaseNurseFields {
    _id: string;
    salaryCap: number;
    salaryPerHour: number;
    salaryPerMonth?: number;
    hiringDate?: string;
    joiningDate?: string | null;
    admittedType?: 'Tata_Homenursing' | 'Dearcare_Llp';
    status: "assigned" | "leave" | "unassigned" | "pending" | "under_review" | "rejected";
    rating?: number;
    reviews?: Array<{
        id: string;
        text: string;
        date: string;
        rating: number;
        reviewer: string;
    }>;
}

// Simplified props interfaces using composition
export interface AddNurseProps {
    onClose: () => void;
    onAdd: (nurse: BaseNurseFields) => void;
}

export interface DropdownProps {
    label: string;
    options: string[];
    selectedOptions: string[];
    toggleOption: (option: string) => void;
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    dropdownRef: React.RefObject<HTMLDivElement>;
}

export type NurseDetailsProps = {
    nurse: Nurse;
    onClose: () => void;
}

export interface NurseFormData {
  email: string | number | readonly string[] | undefined;
  first_name: string;
  last_name: string;
  gender: string;
  date_of_birth: string;
  age: number | ''; 
  address: string;
  city: string;
  taluk: string;
  state: string;
  pin_code: string;
  phone_number: string;
  languages: string[];
  noc_status: string;
  service_type: string;
  shift_pattern: string;
  category: string;
  experience: string;
  marital_status: string;
  religion: string;
  mother_tongue: string;
  nurse_reg_no: string;
  admitted_type: 'Tata_Homenursing' | 'Dearcare_Llp';
  nurse_prev_reg_no: string;
  joining_date: string;
  salary_per_month: number | string;
}


export interface NurseExcelRecord {
 
  'Nurse ID': number;
  'First Name': string;
  'Last Name': string;
  'Email': string;
  'Phone Number': string;
  'Gender': string;
  'Date of Birth': string;
  'Age': string;
  'Address': string;
  'City': string;
  'Taluk': string;
  'State': string;
  'PIN Code': string | number;
  'Languages': string;
  'Experience (Years)': number;
  'Service Type': string;
  'Shift Pattern': string;
  'Category': string;
  'Status': string;
  'Marital Status': string;
  'Religion': string;
  'Mother Tongue': string;
  'NOC Status': string;
  'Created Date': string;
  
  // Health Information
  'Health Status': string;
  'Disability': string;
  'Source of Information': string;
  
  // Reference Information
  'Reference Name': string;
  'Reference Phone': string;
  'Reference Relation': string;
  'Recommendation Details': string;
  
  // Family References
  'Family References': string;
}

export interface StaffReference {
  name: string;
  relation: string;
  phone: string;
  recommendation_details: string;
}

export interface NurseReferenceData {
  reference_name: string;
  reference_phone: string;
  reference_relation: string;
  reference_address: string;
  recommendation_details: string;
  family_references: Array<{
    name: string;
    relation: string;
    phone: string;
  }>;
  staff_reference?: StaffReference;
}

export interface NurseHealthData {
  health_status: string;
  disability: string;
  source: string;
}

export interface StaffAttendanceProps {
  currentTime: string;
}

export interface NurseDocuments {
  adhar: File | null
  educational: File | null
  experience: File | null
  profile_image: File | null
  noc: File | null
  ration: File | null
}


 export interface NurseBasicDetails {
  nurse_id: number;
  name: {
    first: string;
    last: string;
  };
  status: 'assigned' | 'unassigned' | 'leave';
  experience: number | null;
  regno: string | null;
  previous_regno?: string | null;
  rating: number;
  contact: {
    email: string | null;
    phone: string | null;
  };
  taluk?: string;
  city?: string;
  address?: string;
}


export interface NurseBasicInfo {
  nurse_id: number;
  first_name: string | null;
  last_name: string | null;
  status: string;
  email: string | null;
  phone_number: string | null;
  experience: number | null;
  rating?: number;
  reviews?: Array<{
    id: string;
    text: string;
    date: string;
    rating: number;
    reviewer: string;
  }>;
  hiringDate?: string;
  photo?: string;
  regNumber?: string;
  registrationDate?: string;
  address?: string;
  city?: string;
  gender?: 'MALE' | 'FEMALE';
  serviceType?: 'HOME NURSE' | 'DELIVERY CARE' | 'BABY CARE' | 'HM';
  shiftPattern?: '24HOUR' | '12HOUR' | '8HOUR' | 'HOURLY';
  hourlyDetails?: string;
  category?: 'PERMANENT' | 'TRAINEE' | 'TEMPORARY';
  assignedClients?: Array<{
    id: string;
    name: string;
    address: string;
    startDate: string;
    status: string;
  }>;
}