import React, { useState, useEffect } from 'react';
import { getPatientAssessment, savePatientAssessment } from '@/app/actions/clients/client-actions';
import { AssessmentData } from '@/types/client.types';
import PatientAssessmentForm from '@/components/client/PatientAssessmentForm';
import { usePatientAssessmentForm, getDefaultFormData } from '@/hooks/usePatientAssessment';
import { useUserData } from "@/hooks/useUserData";


interface PatientAssessmentProps {
  clientId: string;
  isEditing: boolean;
  onSave: () => void;
  showSaveButton?: boolean;
  formRef?: React.RefObject<HTMLFormElement>;
}

export default function PatientAssessment({ clientId, isEditing, onSave, formRef }: PatientAssessmentProps) {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { userData } = useUserData();

  console.log("userData", userData);

  const {
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
  } = usePatientAssessmentForm(getDefaultFormData(), isEditing);

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
            customLabTests: labInvestigations.custom_tests || [],
            
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
              ...(assessmentData.equipment || {})
            },
            
            // Diagnosis and Care Plan
            finalDiagnosis: assessmentData.final_diagnosis || '',
            foodsToInclude: assessmentData.foods_to_include || '',
            foodsToAvoid: assessmentData.foods_to_avoid || '',
            patientPosition: assessmentData.patient_position || '',
            feedingMethod: assessmentData.feeding_method || '',

            familyMembers: assessmentData.family_members || [],

            recorderInfo: assessmentData.recorder_info ? {
              recorderId: assessmentData.recorder_info.recorderId || '',
              recorderName: assessmentData.recorder_info.recorderName || '',
              recorderRole: assessmentData.recorder_info.recorderRole || '',
              familyRelationship: assessmentData.recorder_info.familyRelationship || '',
              recorderTimestamp: assessmentData.recorder_info.recorderTimestamp || '',
              nurseRegistrationNumber: assessmentData.recorder_info.nurseRegistrationNumber || ''
            } : {
              recorderId: '',
              recorderName: '',
              recorderRole: '',
              familyRelationship: '',
              recorderTimestamp: '',
              nurseRegistrationNumber: ''
            }
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
  }, [clientId, setFormData]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {

      const assessmentDataWithRecorder = {
        ...formData,
        recorderInfo: {
          recorderId: userData?.id || '',
          recorderName: userData.name,
          recorderRole: userData.role,
          familyRelationship: '',
          recorderTimestamp: new Date().toISOString(),
        }
      };

      const response = await savePatientAssessment({
        clientId,
        assessmentData: assessmentDataWithRecorder
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
          
          <PatientAssessmentForm
            formData={formData}
            isEditable={isEditing}
            handleInputChange={handleInputChange}
            handleCheckboxChange={handleCheckboxChange}
            handleEquipmentChange={handleEquipmentChange}
            handleCustomLabChange={handleCustomLabChange}
            handleAddCustomLab={handleAddCustomLab}
            handleRemoveCustomLab={handleRemoveCustomLab}
            handleAddFamilyMember={handleAddFamilyMember}
            handleRemoveFamilyMember={handleRemoveFamilyMember}
            handleFamilyMemberChange={handleFamilyMemberChange}
          />
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