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
export interface StaffAttendanceProps {
    currentTime: string;
}

export interface AddNurseProps {
    onClose: () => void;
    onAdd: (nurse: BaseNurseFields) => void;
}

export interface ApprovedContentProps {
    nurse: Pick<Nurse, '_id' | 'hiringDate' | 'rating' | 'reviews'>;
}

export interface DropdownProps {
    label: string;
    options: string[];
    selectedOptions: string[];
    toggleOption: (option: string) => void;
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    dropdownRef: React.RefObject<HTMLDivElement | null>;
}

export type NurseDetailsProps = {
    nurse: Nurse;
    onClose: () => void;
}

export interface NurseFormData {
  personalDetails: {
    firstName: string;
    lastName: string;
    gender: string;
    maritalStatus: string;
    dateOfBirth: string;
    age: number;
    religion: string;
    motherTongue: string;
  };
  contactInfo: {
    address: string;
    city: string;
    taluk: string;
    pinCode: string;
    state: string;
    phone: string;
  };
  documents: {
    aadhar: File | null;
    rationCard: File | null;
    education: File | null;
    experience: File | null;
    noc: File | null;
  };
  references: Array<{
    name: string;
    phone: string;
    relation: string;
    recommendation?: string;
  }>;
  workDetails: {
    serviceType: string;
    shiftingPattern: string;
    staffCategory: string;
  };
  healthInfo: {
    currentHealth: string;
    disability: string;
    sourceOfInformation: string;
  };
}