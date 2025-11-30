
export type DeliveryCareType = 'post_delivery' | 'pre_delivery' | 'on_delivery';

export interface DeliveryCareFormData {
  carePreferred: DeliveryCareType;
  deliveryDate: string;
  deliveryType: string;
  motherAllergies: string;
  motherMedications: string;
  numberOfBabies: string;
  feedingMethod: string;
  babyAllergies: string;
  preferredSchedule: string;
  duties: {
    babyCare: boolean;
    motherCare: boolean;
  };

  expectedDueDate: string;
  backupContactName: string;
  backupContactNumber: string;
  hospitalName: string;
  doctorName: string;
  medicalHistory: string;

  birthDateTime: string;
  roomDetails: string;
  babyGender: string;
  babyWeight: string;
}