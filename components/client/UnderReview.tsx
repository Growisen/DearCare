import React, { useState } from 'react';
import { updateClientStatus, savePatientAssessment } from '@/app/actions/client-actions';
import { toast } from 'react-hot-toast';
import PersonalInfo from './UnderReview/PersonalInfo';
import MedicalStatus from './UnderReview/MedicalStatus';
import PsychologicalAssessment from './UnderReview/PsychologicalAssessment';
import SocialHistory from './UnderReview/SocialHistory';
import CurrentDetails from './UnderReview/CurrentHistory';
import DiagnosisAndCarePlan from './UnderReview/DiagnosisAndCarePlan';
import EnvironmentAndEquipment from './UnderReview/EnvironmentAndEquipment';
import ReviewChecklist from './UnderReview/ReviewChecklist';

interface InputFieldProps {
  label: string;
  type?: string;
  placeholder: string;
  id: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  required?: boolean;
}

interface UnderReviewContentProps {
  clientId: string;
  onClose?: () => void;
}

export const InputField = ({ label, type = 'text', placeholder, id, value, onChange, required = false }: InputFieldProps) => (
  <div className="mb-4">
    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor={id}>
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {type === 'textarea' ? (
      <textarea
        id={id}
        className="w-full border border-gray-300 rounded-md py-2 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        rows={4}
      />
    ) : (
      <input
        type={type}
        id={id}
        className="w-full border border-gray-300 rounded-md py-2 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
      />
    )}
  </div>
);

export function UnderReviewContent({ clientId, onClose }: UnderReviewContentProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    // All form fields remain unchanged
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
    },
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handleCheckboxChange = (id: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      [id]: checked
    }));
  };

  const handleEquipmentChange = (equipmentId: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      equipment: {
        ...prev.equipment,
        [equipmentId]: checked
      }
    }));
  };

  const handleApprove = async () => {
    try {
      setIsSubmitting(true);

      const formattedData = {
        ...formData,
        lab_investigations: {
          hb: formData.hb,
          rbc: formData.rbc,
          esr: formData.esr,
          urine: formData.urine,
          sodium: formData.sodium,
          other: formData.otherLabInvestigations
        },
        environment: {
          isClean: formData.isClean,
          isVentilated: formData.isVentilated,
          isDry: formData.isDry,
          hasNatureView: formData.hasNatureView,
          hasSocialInteraction: formData.hasSocialInteraction,
          hasSupportiveEnv: formData.hasSupportiveEnv
        }
      };
      
      // 1. Save the assessment data first
      const assessmentResult = await savePatientAssessment({
        clientId,
        assessmentData: formattedData
      });
      
      if (!assessmentResult.success) {
        throw new Error(assessmentResult.error || 'Failed to save assessment data');
      }
      
      // 2. Update client status to 'approved'
      const statusResult = await updateClientStatus(clientId, 'approved');
      
      if (!statusResult.success) {
        throw new Error(statusResult.error || 'Failed to update client status');
      }
      
      toast.success('Client approved successfully!');

      if (onClose) {
        onClose();
      }
      
    } catch (error) {
      console.error('Error approving client:', error);
      toast.error(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PersonalInfo formData={formData} handleInputChange={handleInputChange} />
      <MedicalStatus formData={formData} handleInputChange={handleInputChange} />
      <PsychologicalAssessment formData={formData} handleInputChange={handleInputChange} />
      <SocialHistory formData={formData} handleInputChange={handleInputChange} />
      <CurrentDetails formData={formData} handleInputChange={handleInputChange} />
      <DiagnosisAndCarePlan formData={formData} handleInputChange={handleInputChange} />
      <EnvironmentAndEquipment 
        formData={formData} 
        handleCheckboxChange={handleCheckboxChange}
        handleEquipmentChange={handleEquipmentChange}
      />
      <ReviewChecklist />
      
      <div className="flex gap-3">
        <button 
          className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-green-400"
          onClick={handleApprove}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Processing...' : 'Approve & Assign'}
        </button>
        <button className="px-4 py-2 text-red-600 border border-red-200 rounded-lg hover:bg-red-50">
          Reject
        </button>
      </div>
    </div>
  );
}