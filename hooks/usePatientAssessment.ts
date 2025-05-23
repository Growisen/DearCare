import React from 'react';
import { v4 as uuidv4 } from 'uuid';
import { FamilyMember } from '@/types/client.types';

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

  recorderInfo: {
    recorderId: string;
    recorderName: string;
    recorderRole: string;
    familyRelationship: string;
    recorderTimestamp: string;
    nurseRegistrationNumber: string;
  };
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

  recorderInfo: {
    recorderId: '',
    recorderName: '',
    recorderRole: '',
    familyRelationship: '',
    recorderTimestamp: '',
    nurseRegistrationNumber: ''
  }
});

// The actual hook
const usePatientAssessmentForm = (initialData = getDefaultFormData(), isEditable = true) => {
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

export { usePatientAssessmentForm };