import React from 'react';
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
import { PatientAssessmentFormData } from '@/hooks/usePatientAssessment';
import BedSoreSection from './BedSoreSection';
import { BedSoreStage } from '@/types/reassessment.types';


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
  handleBedSoreChange: (field: keyof PatientAssessmentFormData['bedSore'], value: string) => void;
  handleBedSoreStageChange: (stage: BedSoreStage) => void;
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
  handleBedSoreChange,
  handleBedSoreStageChange,
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

      
      <BedSoreSection
        bedSore={formData.bedSore}
        isEditable={isEditable}
        handleBedSoreChange={handleBedSoreChange}
        handleBedSoreStageChange={handleBedSoreStageChange}
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

export default PatientAssessmentForm;