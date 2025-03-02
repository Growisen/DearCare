export interface Client {
  id: string;
  name: string
  shift?: string;
  description?: string;
  location?: string;
  condition?: string;
  assignedNurse?: string;
  medications?: string[];
  specialInstructions?: string;
  nurseLocation?: { lat: number; lng: number };
  clientLocation?: { lat: number; lng: number };
  requestDate: string
  service: string
  status: 'pending' | 'under_review' | 'approved' | 'rejected' | 'assigned'
  email: string
  phone: string
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

// ...existing code...

export interface AddClientProps {
  onClose: () => void;
  onAdd: (client: {
    fullName: string;
    phoneNumber: string;
    emailAddress: string;
    serviceRequired: string;
    medicalCondition: string;
    careDescription: string;
  }) => void;
}

export interface ClientDetailsProps {
  client: Client;
  onClose: () => void;
}


export interface ClientInformationProps {
  client: {
    id: string;
    name: string;
    email: string;
    phone: string;
    service: string;
    requestDate: string;
    //condition?: string;
    location?: string;
  };
}