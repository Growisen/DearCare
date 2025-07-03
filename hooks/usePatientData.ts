import { useState, useEffect } from 'react';
import { getClientDetails, getPatientAssessment, getClientStatus, updateClientCategory, deleteClient } from '@/app/actions/clients/client-actions';
import { Patient, ClientResponse, ClientCategory } from '@/types/client.types';
import toast from 'react-hot-toast';
import { getServiceLabel } from '@/utils/formatters';
import { serviceOptions } from '@/utils/constants';

export const usePatientData = (id: string) => {
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  const fetchPatientData = async () => {
    if (!id) return;
    
    setLoading(true);
    try {
      const statusResult = await getClientStatus(id);
      if (statusResult.success) {
        setStatus(statusResult.status);
      }
      
      const clientResponse = await getClientDetails(id) as ClientResponse;
      const assessmentResponse = await getPatientAssessment(id);

      if (clientResponse.success && clientResponse.client) {
        const clientData = clientResponse.client;
        const assessmentData = assessmentResponse.success ? assessmentResponse.assessment : null;

        const transformedPatient: Patient = {
            _id: clientData.details?.client_id,
            registrationNumber: clientData.registration_number || '',
            firstName: clientData.details?.patient_name?.split(' ')[0] || '',
            lastName: clientData.details?.patient_name?.split(' ').slice(1).join(' ') || '',
            age: clientData.details?.patient_age || 0,
            gender: clientData.details?.patient_gender || '',
            bloodGroup: '',
            location: clientData.details?.complete_address || '',
            email: '', // Patient's email if available
            phoneNumber: clientData.details?.patient_phone || '',
            clientCategory: clientData.client_category || 'DearCare LLP',
            profileImage: clientData.details?.patient_profile_pic_url || '',
            serviceDetails: {
              serviceRequired: getServiceLabel(serviceOptions, clientData.details?.service_required || ''),
              preferredCaregiverGender: clientData.details?.preferred_caregiver_gender || '',
              startDate: clientData.details?.start_date,
              status: statusResult.status,
            },
            address: {
            fullAddress: clientData.details?.patient_address || '',
            city: clientData.details?.patient_city || '',
            district: clientData.details?.patient_district || '',
            pincode: clientData.details?.patient_pincode || '',
            state: clientData.details?.patient_state || '',
            },
            requestor: {
            name: clientData.details?.requestor_name || '',
            relation: clientData.details?.relation_to_patient || '',
            phone: clientData.details?.requestor_phone || '',
            email: clientData.details?.requestor_email || '',
            profileImage: clientData.details?.requestor_profile_pic_url || '',
            emergencyPhone: clientData.details?.requestor_emergency_phone || '',
            jobDetails: clientData.details?.requestor_job_details || '',
            
            address: {
                fullAddress: clientData.details?.requestor_address || '',
                city: clientData.details?.requestor_city || '',
                district: clientData.details?.requestor_district || '',
                pincode: clientData.details?.requestor_pincode || '',
                state: clientData.details?.requestor_state || '',
            }
            },
            emergencyContact: {
            name: clientData.details?.requestor_name || '',
            relation: clientData.details?.relation_to_patient || '',
            phone: clientData.details?.requestor_phone || ''
            },
            assessments: assessmentData ? [{
            guardianOccupation: assessmentData.guardian_occupation || '',
            maritalStatus: assessmentData.marital_status || '',
            height: assessmentData.height || '',
            weight: assessmentData.weight || '',
            pincode: assessmentData.pincode || '',
            district: assessmentData.district || '',
            cityTown: assessmentData.city_town || '',
            currentStatus: assessmentData.current_status || '',
            chronicIllness: assessmentData.chronic_illness || '',
            medicalHistory: assessmentData.medical_history || '',
            surgicalHistory: assessmentData.surgical_history || '',
            medicationHistory: assessmentData.medication_history || '',
            alertnessLevel: assessmentData.alertness_level || '',
            physicalBehavior: assessmentData.physical_behavior || '',
            speechPatterns: assessmentData.speech_patterns || '',
            emotionalState: assessmentData.emotional_state || '',
            drugsUse: assessmentData.drugs_use || '',
            alcoholUse: assessmentData.alcohol_use || '',
            tobaccoUse: assessmentData.tobacco_use || '',
            otherSocialHistory: assessmentData.other_social_history || '',
            presentCondition: assessmentData.present_condition || '',
            bloodPressure: assessmentData.blood_pressure || '',
            sugarLevel: assessmentData.sugar_level || '',
            finalDiagnosis: assessmentData.final_diagnosis || '',
            foodsToInclude: assessmentData.foods_to_include || '',
            foodsToAvoid: assessmentData.foods_to_avoid || '',
            patientPosition: assessmentData.patient_position || '',
            feedingMethod: assessmentData.feeding_method || '',
            updatedAt: assessmentData.updated_at || '',
            familyMembers: assessmentData.family_members || [],
            equipment: assessmentData.equipment || {},
            environment: assessmentData.environment || {},
            lab_investigations: assessmentData?.lab_investigations || {},
            recorderInfo: assessmentData.recorder_info || {
                recorderId: '',
                recorderName: '',
                recorderRole: '',
                familyRelationship: '',
                recorderTimestamp: ''
            }
            }] : []
        };

        setPatient(transformedPatient);
      }
    } catch (error) {
      console.error('Error fetching patient data:', error);
      setError('Failed to load patient data');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => setIsEditing(true);
  
  const handleSave = async () => {
    setIsEditing(false);
    await fetchPatientData();
    toast.success('Patient details updated successfully');
  };
  
  const handleCancel = () => setIsEditing(false);

  const handleCategoryChange = async (newCategory: ClientCategory) => {
    try {
      setPatient(currentPatient => 
        currentPatient ? { ...currentPatient, clientCategory: newCategory } : null
      );
      
      const result = await updateClientCategory(id, newCategory);
      
      if (!result.success) {
        setPatient(currentPatient => 
          currentPatient ? { ...currentPatient, clientCategory: currentPatient.clientCategory } : null
        );
        console.error('Failed to update category:', result.error);
      }
    } catch (error) {
      console.error('Failed to update category:', error);
      setPatient(currentPatient => 
        currentPatient ? { ...currentPatient, clientCategory: currentPatient.clientCategory } : null
      );
    }
  };

  const handleDeleteClient = async () => {
    try {
      const result = await deleteClient(id);
      if (result.success) {
        toast.success('Client deleted successfully');
        return true;
      } else {
        toast.error(`Failed to delete client: ${result.error}`);
        return false;
      }
    } catch (error) {
      console.error('Error deleting client:', error);
      toast.error('An error occurred while deleting the client');
      return false;
    }
  };

  const handleEditProfile = () => {
    setIsEditingProfile(true);
  };

  const handleCloseProfileEdit = () => {
    setIsEditingProfile(false);
  };

  useEffect(() => {
    fetchPatientData();
  }, [id]);

  return {
    patient,
    loading,
    error,
    status,
    isEditing,
    isEditingProfile,
    handleEdit,
    handleSave,
    handleCancel,
    handleCategoryChange,
    handleEditProfile,
    handleCloseProfileEdit,
    handleDeleteClient,
  };
};