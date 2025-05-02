import React, { useState, useEffect } from 'react';
import PersonalDetails from './UnderReview/PersonalDetails';
import CurrentDetails from './UnderReview/CurrentHistory';
import MedicalStatus from './UnderReview/MedicalStatus';
import PsychologicalAssessment from './UnderReview/PsychologicalAssessment';
import SocialHistory from './UnderReview/SocialHistory';
import EnvironmentAndEquipment from './UnderReview/EnvironmentAndEquipment';
import DiagnosisAndCarePlan from './UnderReview/DiagnosisAndCarePlan';
import { getPatientAssessment, savePatientAssessment } from '../../app/actions/client-actions'

interface PatientAssessmentProps {
  clientId: string;
  isEditing: boolean;
  onSave: () => void;
  showSaveButton?: boolean;
  formRef?: React.RefObject<HTMLFormElement>;
}

interface LabInvestigations {
  hb?: string;
  rbc?: string;
  esr?: string;
  urine?: string;
  sodium?: string;
  other?: string;
}

interface Environment {
  is_clean?: boolean;
  is_ventilated?: boolean;
  is_dry?: boolean;
  has_nature_view?: boolean;
  has_social_interaction?: boolean;
  has_supportive_env?: boolean;
}

interface Equipment {
  hospitalBed?: boolean;
  wheelChair?: boolean;
  adultDiaper?: boolean;
  disposableUnderpad?: boolean;
  pillows?: boolean;
  bedRidden?: boolean;
}

interface AssessmentData {
  guardian_occupation?: string;
  marital_status?: string;
  height?: string;
  weight?: string;
  pincode?: string;
  district?: string;
  city_town?: string;
  current_status?: string;
  chronic_illness?: string;
  medical_history?: string;
  surgical_history?: string;
  medication_history?: string;
  present_condition?: string;
  blood_pressure?: string;
  sugar_level?: string;
  alertness_level?: string;
  physical_behavior?: string;
  speech_patterns?: string;
  emotional_state?: string;
  drugs_use?: string;
  alcohol_use?: string;
  tobacco_use?: string;
  other_social_history?: string;
  final_diagnosis?: string;
  foods_to_include?: string;
  foods_to_avoid?: string;
  patient_position?: string;
  feeding_method?: string;
  lab_investigations?: LabInvestigations;
  environment?: Environment;
  equipment?: Equipment;
}

export default function PatientAssessment({ clientId, isEditing, onSave, formRef }: PatientAssessmentProps) {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  // Combined state for all assessment sections
  const [formData, setFormData] = useState({
    // Personal Details (new section)
    guardianOccupation: '',
    maritalStatus: '',
    height: '',
    weight: '',
    pincode: '',
    district: '',
    cityTown: '',
    
    // Existing fields
    currentStatus: '',
    chronicIllness: '',
    medicalHistory: '',
    surgicalHistory: '',
    medicationHistory: '',
    
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
    },
    
    // Diagnosis and Care Plan
    finalDiagnosis: '',
    foodsToInclude: '',
    foodsToAvoid: '',
    patientPosition: '',
    feedingMethod: '',
  });

  // Fetch patient assessment data when component mounts or clientId changes
  useEffect(() => {
    const fetchAssessmentData = async () => {
      try {
        setLoading(true);
        const result = await getPatientAssessment(clientId);
        
        if (result.success && result.assessment) {
          // Transform database data to match component state structure
          const assessmentData = result.assessment as AssessmentData;
          const environment = assessmentData.environment || {};
          const labInvestigations = assessmentData.lab_investigations || {};
          
          setFormData({
            // Personal Details
            guardianOccupation: assessmentData.guardian_occupation || '',
            maritalStatus: assessmentData.marital_status || '',
            height: assessmentData.height || '',
            weight: assessmentData.weight || '',
            pincode: assessmentData.pincode || '',
            district: assessmentData.district || '',
            cityTown: assessmentData.city_town || '',
            
            // Existing fields
            currentStatus: assessmentData.current_status || '',
            chronicIllness: assessmentData.chronic_illness || '',
            medicalHistory: assessmentData.medical_history || '',
            surgicalHistory: assessmentData.surgical_history || '',
            medicationHistory: assessmentData.medication_history || '',
            
            // Current Details
            presentCondition: assessmentData.present_condition || '',
            bloodPressure: assessmentData.blood_pressure || '',
            sugarLevel: assessmentData.sugar_level || '',
            hb: labInvestigations.hb || '',
            rbc: labInvestigations.rbc || '',
            esr: labInvestigations.esr || '',
            urine: labInvestigations.urine || '',
            sodium: labInvestigations.sodium || '',
            otherLabInvestigations: labInvestigations.other || '',
            
            // Psychological Assessment
            alertnessLevel: assessmentData.alertness_level || '',
            physicalBehavior: assessmentData.physical_behavior || '',
            speechPatterns: assessmentData.speech_patterns || '',
            emotionalState: assessmentData.emotional_state || '',
            
            // Social History
            drugsUse: assessmentData.drugs_use || '',
            alcoholUse: assessmentData.alcohol_use || '',
            tobaccoUse: assessmentData.tobacco_use || '',
            otherSocialHistory: assessmentData.other_social_history || '',
            
            // Environment Assessment
            isClean: environment.is_clean || false,
            isVentilated: environment.is_ventilated || false,
            isDry: environment.is_dry || false,
            hasNatureView: environment.has_nature_view || false,
            hasSocialInteraction: environment.has_social_interaction || false,
            hasSupportiveEnv: environment.has_supportive_env || false,
            
            // Equipment
            equipment: {
              hospitalBed: false,
              wheelChair: false,
              adultDiaper: false,
              disposableUnderpad: false,
              pillows: false,
              bedRidden: false,
              ...(assessmentData.equipment || {})
            },
            
            // Diagnosis and Care Plan
            finalDiagnosis: assessmentData.final_diagnosis || '',
            foodsToInclude: assessmentData.foods_to_include || '',
            foodsToAvoid: assessmentData.foods_to_avoid || '',
            patientPosition: assessmentData.patient_position || '',
            feedingMethod: assessmentData.feeding_method || '',
          });

          setLoading(false);
        } else if (!result.success) {
          setError('Failed to fetch patient assessment data');
          setLoading(false);
        }
      } catch {
        setError('An error occurred while fetching patient assessment data');
        setLoading(false);
      }
    };

    fetchAssessmentData();
  }, [clientId]);

  // Handle text and select inputs
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    if (!isEditing) return;
    
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  // Handle checkbox inputs for environment assessment
  const handleCheckboxChange = (id: string, checked: boolean) => {
    if (!isEditing) return;
    
    setFormData((prev) => ({
      ...prev,
      [id]: checked,
    }));
  };

  // Handle checkbox inputs for equipment
  const handleEquipmentChange = (equipmentId: string, checked: boolean) => {
    if (!isEditing) return;
    
    setFormData((prev) => ({
      ...prev,
      equipment: {
        ...prev.equipment,
        [equipmentId]: checked,
      },
    }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  try {
    const response = await savePatientAssessment({
      clientId,
      assessmentData: {
        // Personal Details
        guardianOccupation: formData.guardianOccupation,
        maritalStatus: formData.maritalStatus,
        height: formData.height,
        weight: formData.weight,
        pincode: formData.pincode,
        district: formData.district,
        cityTown: formData.cityTown,
        
        // Medical Status
        currentStatus: formData.currentStatus,
        chronicIllness: formData.chronicIllness,
        medicalHistory: formData.medicalHistory,
        surgicalHistory: formData.surgicalHistory,
        medicationHistory: formData.medicationHistory,
        
        // Current Details
        presentCondition: formData.presentCondition,
        bloodPressure: formData.bloodPressure,
        sugarLevel: formData.sugarLevel,

        hb: formData.hb,
        rbc: formData.rbc,
        esr: formData.esr,
        urine: formData.urine,
        sodium: formData.sodium,
        otherLabInvestigations: formData.otherLabInvestigations,
        
        // Lab investigations as a nested object
        lab_investigations: {
          hb: formData.hb,
          rbc: formData.rbc,
          esr: formData.esr,
          urine: formData.urine,
          sodium: formData.sodium,
          other: formData.otherLabInvestigations
        },
        
        // Psychological Assessment
        alertnessLevel: formData.alertnessLevel,
        physicalBehavior: formData.physicalBehavior,
        speechPatterns: formData.speechPatterns,
        emotionalState: formData.emotionalState,
        
        // Social History
        drugsUse: formData.drugsUse,
        alcoholUse: formData.alcoholUse,
        tobaccoUse: formData.tobaccoUse,
        otherSocialHistory: formData.otherSocialHistory,
        isClean: formData.isClean,
        isVentilated: formData.isVentilated,
        isDry: formData.isDry,
        hasNatureView: formData.hasNatureView,
        hasSocialInteraction: formData.hasSocialInteraction,
        hasSupportiveEnv: formData.hasSupportiveEnv,
        
        // Environment as a nested object
        environment: {
          is_clean: formData.isClean,
          is_ventilated: formData.isVentilated,
          is_dry: formData.isDry,
          has_nature_view: formData.hasNatureView,
          has_social_interaction: formData.hasSocialInteraction,
          has_supportive_env: formData.hasSupportiveEnv
        },
        
        // Equipment
        equipment: formData.equipment,
        
        // Diagnosis and Care Plan
        finalDiagnosis: formData.finalDiagnosis,
        foodsToInclude: formData.foodsToInclude,
        foodsToAvoid: formData.foodsToAvoid,
        patientPosition: formData.patientPosition,
        feedingMethod: formData.feedingMethod,
      }
    });
      
      if (response.success) {
        // Call the onSave callback provided by the parent component
        onSave();
      } else {
        setError(response.error || 'Failed to save assessment data');
      }
    } catch (error) {
      console.error('Error saving assessment data:', error);
      setError('An unexpected error occurred');
    }
  };

  if (loading) {
    return <div className="p-4 text-gray-700 text-center">Loading client details...</div>;
  }

  if (error) {
    return (
      <div className="p-4 text-red-600 bg-red-50 border border-red-200 rounded-md m-4">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="mt-6 space-y-6">
      <form onSubmit={handleSubmit} ref={formRef}>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-800">Patient Assessment</h2>
          </div>
          
          {/* Display sections using the respective components */}
          <div className={`space-y-6 ${!isEditing ? 'opacity-90 pointer-events-none' : ''}`}>
            {/* Add the new PersonalDetails component */}
            <PersonalDetails
              formData={{
                guardianOccupation: formData.guardianOccupation,
                maritalStatus: formData.maritalStatus,
                height: formData.height,
                weight: formData.weight,
                pincode: formData.pincode,
                district: formData.district,
                cityTown: formData.cityTown,
              }}
              handleInputChange={handleInputChange}
            />
            
            {/* Existing components */}
            <MedicalStatus 
              formData={{
                currentStatus: formData.currentStatus,
                chronicIllness: formData.chronicIllness,
                medicalHistory: formData.medicalHistory,
                surgicalHistory: formData.surgicalHistory,
                medicationHistory: formData.medicationHistory,
              }}
              handleInputChange={handleInputChange}
            />
            
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
              }}
              handleInputChange={handleInputChange}
            />
            
            <PsychologicalAssessment 
              formData={{
                alertnessLevel: formData.alertnessLevel,
                physicalBehavior: formData.physicalBehavior,
                speechPatterns: formData.speechPatterns,
                emotionalState: formData.emotionalState,
              }}
              handleInputChange={handleInputChange}
            />
            
            <SocialHistory 
              formData={{
                drugsUse: formData.drugsUse,
                alcoholUse: formData.alcoholUse,
                tobaccoUse: formData.tobaccoUse,
                otherSocialHistory: formData.otherSocialHistory,
              }}
              handleInputChange={handleInputChange}
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
            
            <DiagnosisAndCarePlan 
              formData={{
                finalDiagnosis: formData.finalDiagnosis,
                foodsToInclude: formData.foodsToInclude,
                foodsToAvoid: formData.foodsToAvoid,
                patientPosition: formData.patientPosition,
                feedingMethod: formData.feedingMethod,
              }}
              handleInputChange={handleInputChange}
            />
          </div>
          
          {/* Add Save button when editing */}
          {isEditing && (
            <div className="mt-6 flex justify-end">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Save Assessment
              </button>
            </div>
          )}
        </div>
      </form>
      
      {/* Show error if any */}
      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md">
          {error}
        </div>
      )}
    </div>
  );
}