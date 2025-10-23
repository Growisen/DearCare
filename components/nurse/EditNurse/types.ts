import { SimplifiedNurseDetails as PrismaNurseDetails } from '@/app/actions/staff-management/add-nurse';

export type SimplifiedNurseDetails = PrismaNurseDetails;

export interface TempFile { 
  file: File; 
  preview: string; 
}

export interface DocumentDisplay { 
  fieldName: string; 
  label: string; 
  currentValue?: string; 
  allowMultiple?: boolean; 
}

export interface FormFieldProps {
  label: string; 
  name: string; 
  value?: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  error?: string;
}