export type StaffRole = string;

export type StaffOrganization = 'DearCare LLP' | 'Tata HomeNursing'; 

export interface Staff {
  id: string;
  registrationNumber?: string;
  name: string;
  email: string;
  phone: string;
  organization: StaffOrganization
  role: StaffRole;
  joinDate: string;
  profileImage?: string;
  address?: {
    line1: string;
    line2?: string;
    city: string;
    district: string;
    state: string;
    pincode: string;
  };
}