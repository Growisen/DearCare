import React from 'react';
import { v4 as uuidv4 } from 'uuid';
import { FamilyMember } from '@/types/client.types';
import { BedSoreData, BedSoreStage } from '@/types/reassessment.types';

export interface PatientAssessmentFormData {
  guardianOccupation: string;
  maritalStatus: string;
  height: string;
  weight: string;
  pincode: string;
  district: string;
  cityTown: string;

  currentStatus: string;
  chronicIllness: string;
  medicalHistory: string;
  surgicalHistory: string;
  medicationHistory: string;
  
  alertnessLevel: string;
  physicalBehavior: string;
  speechPatterns: string;
  emotionalState: string;
  
  drugsUse: string;
  alcoholUse: string;
  tobaccoUse: string;
  otherSocialHistory: string;
  
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
  
  finalDiagnosis: string;
  foodsToInclude: string;
  foodsToAvoid: string;
  patientPosition: string;
  feedingMethod: string;

  isClean: boolean;
  isVentilated: boolean;
  isDry: boolean;
  hasNatureView: boolean;
  hasSocialInteraction: boolean;
  hasSupportiveEnv: boolean;
  
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
  
  familyMembers: FamilyMember[];

  recorderInfo: {
    recorderId: string;
    recorderName: string;
    recorderRole: string;
    familyRelationship: string;
    recorderTimestamp: string;
    nurseRegistrationNumber: string;
  };
  bedSore: BedSoreData;
}


export const getDefaultFormData = (): PatientAssessmentFormData => ({
  guardianOccupation: '',
  maritalStatus: '',
  height: '',
  weight: '',
  pincode: '',
  district: '',
  cityTown: '',
  
  currentStatus: '',
  chronicIllness: '',
  medicalHistory: '',
  surgicalHistory: '',
  medicationHistory: '',
  
  alertnessLevel: '',
  physicalBehavior: '',
  speechPatterns: '',
  emotionalState: '',
  
  drugsUse: '',
  alcoholUse: '',
  tobaccoUse: '',
  otherSocialHistory: '',
  
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
  
  finalDiagnosis: '',
  foodsToInclude: '',
  foodsToAvoid: '',
  patientPosition: '',
  feedingMethod: '',
  
  isClean: false,
  isVentilated: false,
  isDry: false,
  hasNatureView: false,
  hasSocialInteraction: false,
  hasSupportiveEnv: false,

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
  },

  bedSore: {
    stage: '',
    shape: '',
    size: '',
    site: ''
  }
});

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

  const handleBedSoreChange = React.useCallback((field: keyof BedSoreData, value: string) => {
    if (!isEditable) return;
    
    setFormData(prev => ({
      ...prev,
      bedSore: {
        ...prev.bedSore,
        [field]: value
      } as BedSoreData
    }));
  }, [isEditable]);

  const handleBedSoreStageChange = (stage: BedSoreStage) => {
    setFormData(prev => ({
      ...prev,
      bedSore: {
        stage,
        shape: prev.bedSore?.shape ?? '',
        size: prev.bedSore?.size ?? '',
        site: prev.bedSore?.site ?? ''
      }
    }));
  };

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
    handleFamilyMemberChange,
    handleBedSoreChange,
    handleBedSoreStageChange
  };
};

export { usePatientAssessmentForm };