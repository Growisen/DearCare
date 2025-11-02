export interface FormData {
  name: string;
  state: string;
  city: string;
  district: string;
  type: string;
  patientDiagnosis?: string;
  clientRequirement?: string;

  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  salaryPerMonth?: string;
  salaryPerDay?: string;
  jobRoleOfStaff?: string;

  feedingMethod?: string;
  sleepPattern?: string;
  eliminationUrine?: string;
  eliminationUrineOthers?: string;
  eliminationBowel?: string;
  eliminationBowelOthers?: string;
  activity?: string;
  bedSoreStage?: string;
  bedSoreShape?: string;
  bedSoreSize?: string;
  bedSoreSite?: string;
  specialCare?: string;
  generalCondition?: string;

  agreedToTerms: boolean;
  agreedToPrivacy: boolean;
}

export interface FormStepProps {
  formData: FormData;
  onFormChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onNext?: () => void;
  onBack?: () => void;
  onSubmit?: () => void;
}

export interface AgreementSectionProps {
  title: string;
  content: string;
  checkboxName: keyof FormData;
  checkboxLabel: string;
  isChecked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export type FormPage = 1 | 2 | 3 | 4;