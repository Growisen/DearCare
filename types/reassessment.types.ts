export type BpPosition = 'Sitting' | 'Supine' | 'Standing' | '';
export type BedSoreStage = '1' | '2' | '3' | '4' | '';

export interface DynamicField {
  label: string;
  value: string;
}

export interface VitalsData {
  time: string;
  heartRate: string;
  bpSystolic: string;
  bpDiastolic: string;
  bpPosition: BpPosition;
  temperature: string;
  respiratoryRate: string;
}

export interface BedSoreData {
  stage: BedSoreStage;
  shape: string;
  size: string;
  site: string;
}

export interface FormData {
  diagnosis: string;
  presentCondition: string;
  vitals: VitalsData;
  bedSore: BedSoreData;
  mentalStatus: string;
  hygiene: string;
  generalStatus: string;
  careStatus: string;
  outdoorHours: string;
  nursingDiagnosis: string;
  followUpEvaluation: string;
  assignmentDoneBy: string;
  allottedStaffName: string;
  assigningPeriod: string;
  previousVisitedDate: string;
  dynamicFields: {
    diagnosis: DynamicField[];
    vitals: DynamicField[];
    bedSore: DynamicField[];
    assessment: DynamicField[];
    info: DynamicField[];
  };
}

export interface ReassessmentData extends FormData {
  id: string;
  createdAt: string;
}
