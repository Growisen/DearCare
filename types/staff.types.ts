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
    salaryPerHour: number; // Remove optional marker
    hiringDate?: string;
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
  rating: number;
  contact: {
    email: string | null;
    phone: string | null;
  };
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