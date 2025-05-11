import React from 'react';
import { v4 as uuidv4 } from 'uuid';
import PersonalInfo from './UnderReview/PersonalInfo';
import MedicalStatus from './UnderReview/MedicalStatus';
import PsychologicalAssessment from './UnderReview/PsychologicalAssessment';
import SocialHistory from './UnderReview/SocialHistory';
import CurrentDetails from './UnderReview/CurrentHistory';
import DiagnosisAndCarePlan from './UnderReview/DiagnosisAndCarePlan';
import EnvironmentAndEquipment from './UnderReview/EnvironmentAndEquipment';
import ReviewChecklist from './UnderReview/ReviewChecklist';
import FamilyMembers from './UnderReview/FamilyMembers';
import { FamilyMember } from '@/types/client.types';

// Create a type for the form data to be shared across components
export interface PatientAssessmentFormData {
  // Personal Details
  guardianOccupation: string;
  maritalStatus: string;
  height: string;
  weight: string;
  pincode: string;
  district: string;
  cityTown: string;
  
  // Medical Status
  currentStatus: string;
  chronicIllness: string;
  medicalHistory: string;
  surgicalHistory: string;
  medicationHistory: string;
  
  // Psychological Assessment
  alertnessLevel: string;
  physicalBehavior: string;
  speechPatterns: string;
  emotionalState: string;
  
  // Social History
  drugsUse: string;
  alcoholUse: string;
  tobaccoUse: string;
  otherSocialHistory: string;
  
  // Current Details
  presentCondition: string;
  bloodPressure: string;
  sugarLevel: string;
  hb: string;
  rbc: string;
  esr: string;
  urine: string;
  sodium: string;
  otherLabInvestigations: string;
  customLabTests: Array<{ id: string; name: string; value: string }>;
  
  // Diagnosis and Care Plan
  finalDiagnosis: string;
  foodsToInclude: string;
  foodsToAvoid: string;
  patientPosition: string;
  feedingMethod: string;
  
  // Environment Assessment
  isClean: boolean;
  isVentilated: boolean;
  isDry: boolean;
  hasNatureView: boolean;
  hasSocialInteraction: boolean;
  hasSupportiveEnv: boolean;
  
  // Equipment
  equipment: {
    hospitalBed: boolean;
    wheelChair: boolean;
    adultDiaper: boolean;
    disposableUnderpad: boolean;
    pillows: boolean;
    bedRidden: boolean;
    semiBedridden: boolean;
    bedWedges: boolean;
    bedsideCommode: boolean;
    patientLift: boolean;
    bedsideHandRail: boolean;
    examinationGloves: boolean;
    noRinseCleanser: boolean;
    bathingWipes: boolean;
    bpMeasuringApparatus: boolean;
    electricBackLifter: boolean;
    o2Concentrator: boolean;
    overBedTable: boolean;
    suctionMachine: boolean;
    ivStand: boolean;
    bedPan: boolean;
    decubitusMatress: boolean;
    airMatress: boolean;
    bpMonitor: boolean;
    bedLift: boolean;
    bedRail: boolean;
    cane: boolean;
    walkers: boolean;
    crutches: boolean;
  };
  
  // Family Members
  familyMembers: FamilyMember[];
}

// Create empty default form data
export const getDefaultFormData = (): PatientAssessmentFormData => ({
  // Personal Details
  guardianOccupation: '',
  maritalStatus: '',
  height: '',
  weight: '',
  pincode: '',
  district: '',
  cityTown: '',
  
  // Medical Status
  currentStatus: '',
  chronicIllness: '',
  medicalHistory: '',
  surgicalHistory: '',
  medicationHistory: '',
  
  // Psychological Assessment
  alertnessLevel: '',
  physicalBehavior: '',
  speechPatterns: '',
  emotionalState: '',
  
  // Social History
  drugsUse: '',
  alcoholUse: '',
  tobaccoUse: '',
  otherSocialHistory: '',
  
  // Current Details
  presentCondition: '',
  bloodPressure: '',
  sugarLevel: '',
  hb: '',
  rbc: '',
  esr: '',
  urine: '',
  sodium: '',
  otherLabInvestigations: '',
  customLabTests: [],
  
  // Diagnosis and Care Plan
  finalDiagnosis: '',
  foodsToInclude: '',
  foodsToAvoid: '',
  patientPosition: '',
  feedingMethod: '',
  
  // Environment Assessment
  isClean: false,
  isVentilated: false,
  isDry: false,
  hasNatureView: false,
  hasSocialInteraction: false,
  hasSupportiveEnv: false,
  
  // Equipment
  equipment: {
    hospitalBed: false,
    wheelChair: false,
    adultDiaper: false,
    disposableUnderpad: false,
    pillows: false,
    bedRidden: false,
    semiBedridden: false,
    bedWedges: false,
    bedsideCommode: false,
    patientLift: false,
    bedsideHandRail: false,
    examinationGloves: false,
    noRinseCleanser: false,
    bathingWipes: false,
    bpMeasuringApparatus: false,
    electricBackLifter: false,
    o2Concentrator: false,
    overBedTable: false,
    suctionMachine: false,
    ivStand: false,
    bedPan: false,
    decubitusMatress: false,
    airMatress: false,
    bpMonitor: false,
    bedLift: false,
    bedRail: false,
    cane: false,
    walkers: false,
    crutches: false,
  },
  
  familyMembers: [],
});

export interface PatientAssessmentFormProps {
  formData: PatientAssessmentFormData;
  isEditable?: boolean;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleCheckboxChange: (id: string, checked: boolean) => void;
  handleEquipmentChange: (equipmentId: string, checked: boolean) => void;
  handleCustomLabChange: (id: string, field: 'name' | 'value', value: string) => void;
  handleAddCustomLab: () => void;
  handleRemoveCustomLab: (id: string) => void;
  handleAddFamilyMember: () => void;
  handleRemoveFamilyMember: (id: string) => void;
  handleFamilyMemberChange: (id: string, field: keyof FamilyMember, value: string) => void;
  showReviewChecklist?: boolean;
}

const PatientAssessmentForm: React.FC<PatientAssessmentFormProps> = ({
  formData,
  isEditable = true,
  handleInputChange,
  handleCheckboxChange,
  handleEquipmentChange,
  handleCustomLabChange,
  handleAddCustomLab,
  handleRemoveCustomLab,
  handleAddFamilyMember,
  handleRemoveFamilyMember,
  handleFamilyMemberChange,
  showReviewChecklist = false
}) => {
  return (
    <div className={`space-y-6 ${!isEditable ? 'opacity-90 pointer-events-none' : ''}`}>
      <PersonalInfo formData={formData} handleInputChange={handleInputChange} />
      
      <MedicalStatus formData={formData} handleInputChange={handleInputChange} />
      
      <PsychologicalAssessment formData={formData} handleInputChange={handleInputChange} />
      
      <SocialHistory formData={formData} handleInputChange={handleInputChange} />
      
      <CurrentDetails 
        formData={{
          presentCondition: formData.presentCondition,
          bloodPressure: formData.bloodPressure,
          sugarLevel: formData.sugarLevel,
          hb: formData.hb,
          rbc: formData.rbc,
          esr: formData.esr,
          urine: formData.urine,
          sodium: formData.sodium,
          otherLabInvestigations: formData.otherLabInvestigations,
          customLabTests: formData.customLabTests,
        }}
        handleInputChange={handleInputChange}
        handleCustomLabChange={handleCustomLabChange}
        handleAddCustomLab={handleAddCustomLab}
        handleRemoveCustomLab={handleRemoveCustomLab}
      />
      
      <DiagnosisAndCarePlan formData={formData} handleInputChange={handleInputChange} />
      
      <FamilyMembers 
        familyMembers={formData.familyMembers}
        onAddFamilyMember={handleAddFamilyMember}
        onRemoveFamilyMember={handleRemoveFamilyMember}
        onFamilyMemberChange={handleFamilyMemberChange}
      />
      
      <EnvironmentAndEquipment 
        formData={{
          isClean: formData.isClean,
          isVentilated: formData.isVentilated,
          isDry: formData.isDry,
          hasNatureView: formData.hasNatureView,
          hasSocialInteraction: formData.hasSocialInteraction,
          hasSupportiveEnv: formData.hasSupportiveEnv,
          equipment: formData.equipment,
        }}
        handleCheckboxChange={handleCheckboxChange}
        handleEquipmentChange={handleEquipmentChange}
      />
      
      {showReviewChecklist && <ReviewChecklist />}
    </div>
  );
};

// Helper functions for form data handling
export const usePatientAssessmentForm = (initialData = getDefaultFormData(), isEditable = true) => {
  const [formData, setFormData] = React.useState<PatientAssessmentFormData>(initialData);

  const handleInputChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    if (!isEditable) return;
    
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
  }, [isEditable]);

  const handleCheckboxChange = React.useCallback((id: string, checked: boolean) => {
    if (!isEditable) return;
    
    setFormData(prev => ({
      ...prev,
      [id]: checked
    }));
  }, [isEditable]);

  const handleEquipmentChange = React.useCallback((equipmentId: string, checked: boolean) => {
    if (!isEditable) return;
    
    setFormData(prev => ({
      ...prev,
      equipment: {
        ...prev.equipment,
        [equipmentId]: checked
      }
    }));
  }, [isEditable]);

  const handleCustomLabChange = React.useCallback((id: string, field: 'name' | 'value', value: string) => {
    if (!isEditable) return;
    
    setFormData(prev => ({
      ...prev,
      customLabTests: prev.customLabTests.map(test => 
        test.id === id ? { ...test, [field]: value } : test
      )
    }));
  }, [isEditable]);

  const handleAddCustomLab = React.useCallback(() => {
    if (!isEditable) return;
    
    setFormData(prev => ({
      ...prev,
      customLabTests: [
        ...prev.customLabTests,
        { id: uuidv4(), name: '', value: '' }
      ]
    }));
  }, [isEditable]);

  const handleRemoveCustomLab = React.useCallback((id: string) => {
    if (!isEditable) return;
    
    setFormData(prev => ({
      ...prev,
      customLabTests: prev.customLabTests.filter(test => test.id !== id)
    }));
  }, [isEditable]);

  const handleAddFamilyMember = React.useCallback(() => {
    if (!isEditable) return;
    
    setFormData(prev => ({
      ...prev,
      familyMembers: [
        ...prev.familyMembers,
        {
          id: uuidv4(),
          name: '',
          age: '',
          job: '',
          relation: '',
          medicalRecords: ''
        }
      ]
    }));
  }, [isEditable]);

  const handleRemoveFamilyMember = React.useCallback((id: string) => {
    if (!isEditable) return;
    
    setFormData(prev => ({
      ...prev,
      familyMembers: prev.familyMembers.filter(member => member.id !== id)
    }));
  }, [isEditable]);

  const handleFamilyMemberChange = React.useCallback((id: string, field: keyof FamilyMember, value: string) => {
    if (!isEditable) return;
    
    setFormData(prev => ({
      ...prev,
      familyMembers: prev.familyMembers.map(member => 
        member.id === id ? { ...member, [field]: value } : member
      )
    }));
  }, [isEditable]);

  return {
    formData,
    setFormData,
    handleInputChange,
    handleCheckboxChange,
    handleEquipmentChange,
    handleCustomLabChange,
    handleAddCustomLab,
    handleRemoveCustomLab,
    handleAddFamilyMember,
    handleRemoveFamilyMember,
    handleFamilyMemberChange
  };
};

export default PatientAssessmentForm;