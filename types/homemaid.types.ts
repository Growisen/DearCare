export interface Duties {
  kitchen: boolean;
  bathroom: boolean;
  floors: boolean;
  dusting: boolean;
  tidying: boolean;
  mealPrep: boolean;
  laundry: boolean;
  ironing: boolean;
  errands: boolean;
  childcare: boolean;
}

export interface FormData {
  serviceType: 'live-in' | 'part-time' | 'other';
  serviceTypeOther: string;
  frequency: 'daily' | 'weekly' | 'bi-weekly' | 'monthly' | 'one-time' | '';
  preferredSchedule: string;

  homeType: 'apartment' | 'house' | 'townhouse' | '';
  bedrooms: number;
  bathrooms: number;
  householdSize: number;
  hasPets: 'yes' | 'no' | undefined;
  petDetails: string;

  duties: Duties;
  mealPrepDetails: string;
  childcareDetails: string;

  allergies: string;
  restrictedAreas: string;
  specialInstructions: string;
}