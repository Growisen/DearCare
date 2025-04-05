import React, { useState, useEffect } from 'react';
import CurrentDetails from './UnderReview/CurrentHistory';
import MedicalStatus from './UnderReview/MedicalStatus';
import PsychologicalAssessment from './UnderReview/PsychologicalAssessment';
import SocialHistory from './UnderReview/SocialHistory';
import EnvironmentAndEquipment from './UnderReview/EnvironmentAndEquipment';
import DiagnosisAndCarePlan from './UnderReview/DiagnosisAndCarePlan';
import { getPatientAssessment } from '../../app/actions/client-actions'

interface PatientAssessmentProps {
  clientId: string;
  isEditing: boolean;
  onSave: () => void;
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

export default function PatientAssessment({ clientId, isEditing, onSave }: PatientAssessmentProps) {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  // Combined state for all assessment sections
  const [formData, setFormData] = useState({
    // Medical Status
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
            // Medical Status
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
      // In a real app, this would be an API call to save the data
      console.log('Saving assessment data:', formData);
      
      // Call the onSave callback provided by the parent component
      onSave();
    } catch (error) {
      console.error('Error saving assessment data:', error);
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
       
      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-800">Patient Assessment</h2>
          </div>
          
          {/* Display sections using the respective components */}
          <div className={`space-y-6 ${!isEditing ? 'opacity-90 pointer-events-none' : ''}`}>
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
        </div>
      </form>
    </div>
  );
}