import {
  NurseFormData,
  NurseReferenceData,
  NurseHealthData,
  NurseDocuments,
  BaseNurseFields,
  stp1BaseNurseFields
} from '@/types/staff.types';

// This union type represents all possible data shapes the validator might receive
type StepData = NurseFormData | stp1BaseNurseFields | BaseNurseFields | NurseReferenceData | NurseHealthData | (NurseDocuments & { noc_status?: string });

export const validateStep = (step: number, data: StepData): boolean => {
  switch (step) {
    case 0: // Personal Details
      return !!(
        (data as NurseFormData).first_name &&
        (data as NurseFormData).last_name &&
        (data as NurseFormData).gender &&
        (data as NurseFormData).date_of_birth &&
        (data as NurseFormData).marital_status &&
        (data as NurseFormData).religion &&
        (data as NurseFormData).mother_tongue
      );

    case 1: // Contact Information
      return !!(
        (data as NurseFormData).phone_number &&
        (data as NurseFormData).email &&
        (data as NurseFormData).languages.length > 0
      );

    case 2: // References
      // All fields are optional, so it's always valid
      return true;

    case 3: // Work Details
      return !!(
        (data as NurseFormData).service_type &&
        (data as NurseFormData).shift_pattern &&
        (data as NurseFormData).category &&
        (data as NurseFormData).experience
      );

    case 4: // Health & Additional Info
      return !!(
        (data as NurseHealthData).source
      );

    case 5: // Document Upload
      // All file uploads are optional, but NOC logic is conditional
      const docData = data as NurseDocuments & { noc_status?: string };
      // If NOC status is Yes, require the NOC file. Otherwise, it's valid.
      return (docData.noc_status !== 'Yes' || !!docData.noc);

    default:
      return false;
  }
};