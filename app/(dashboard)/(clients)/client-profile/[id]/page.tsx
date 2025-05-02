"use client"

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Loader from '@/components/loader';
import { Json, DetailedClientIndividual } from '@/types/client.types';
import { getClientDetails, getPatientAssessment, updateClientCategory, getClientStatus } from '@/app/actions/client-actions';
import NurseListModal from '@/components/client/ApprovedContent/NurseListModal';
import ConfirmationModal from '@/components/client/ApprovedContent/ConfirmationModal';
import { Nurse } from '@/types/staff.types';
import NurseAssignmentsList from '@/components/client/NurseAssignmentsList';
import { listNurses } from '@/app/actions/add-nurse';
import { getNurseAssignments } from '@/app/actions/shift-schedule-actions';
import toast from 'react-hot-toast';

// Component imports
import ProfileHeader from '@/components/client/Profile/ProfileHeader';
import PatientInfo from '@/components/client/Profile/PatientInfo';
import MedicalInfo from '@/components/client/Profile/MedicalInfo';
import EditPatientModal from '@/components/client/Profile/EditPatientModal';
import InfoSection from '@/components/client/Profile/InfoSection';

interface PatientAssessmentDataForApprovedClients {
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
  finalDiagnosis: string;
  foodsToInclude: string;
  foodsToAvoid: string;
  patientPosition: string;
  feedingMethod: string;
  equipment: Json;
  environment: Json;
  lab_investigations: Json;
  [key: string]: string | undefined | Json;
}

interface NurseAssignment {
  id?: number;
  nurseId: number | string;
  startDate: string;
  endDate?: string;
  shiftStart?: string;
  shiftEnd?: string;
  status: 'active' | 'completed' | 'cancelled';
  shiftType?: 'day' | 'night' | '24h';
}


interface Patient {
  _id?: string;
  firstName: string;
  lastName: string;
  age: number | string;
  gender: string;
  bloodGroup: string;
  location: string;
  email: string;
  phoneNumber: string;
  clientCategory: 'DearCare' | 'TataLife';
  requestor: { 
    name: string;
    relation: string;
    phone: string;
    email: string;
  };
  emergencyContact: {
    name: string;
    relation: string;
    phone: string;
  };
  assessments: PatientAssessmentDataForApprovedClients[];
  profileImage?: string;
  nurseAssignments?: NurseAssignment[];
}

export interface ClientResponse {
  success: boolean;
  client: DetailedClientIndividual;
}

const PatientProfilePage = () => {
  const params = useParams();
  const id = params.id;
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const [error] = useState<string | null>(null);
  const [showNurseList, setShowNurseList] = useState(false);
  const [selectedNurse, setSelectedNurse] = useState<Nurse | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [nurseAssignments, setNurseAssignments] = useState<NurseAssignment[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [nurses, setNurses] = useState<Nurse[]>([]);
  const [status, setStatus] = useState<string | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isLoadingNurses, setIsLoadingNurses] = useState(false);

  useEffect(() => {

    const loadData = async () => {
      await fetchNurses();
    };

    async function fetchPatientData() {
      if (id) {
        setLoading(true);
        try {
          const statusResult = await getClientStatus(id as string);
          console.log("status", statusResult)
          if (statusResult.success) {
            setStatus(statusResult.status);
          }
          const clientResponse = await getClientDetails(id as string) as ClientResponse;
          console.log(clientResponse)
          const assessmentResponse = await getPatientAssessment(id as string);

          const assignmentsResponse = await getNurseAssignments(id as string);

          if (assignmentsResponse.success && assignmentsResponse.data) {
            // Transform the assignment data to match our interface
            const transformedAssignments: NurseAssignment[] = assignmentsResponse.data.map(assignment => ({
              id: assignment.id,
              nurseId: assignment.nurse_id,
              startDate: assignment.start_date,
              endDate: assignment.end_date,
              shiftStart: assignment.shift_start_time,
              shiftEnd: assignment.shift_end_time,
              status: assignment.status || 'active',
              shiftType: determineShiftType(assignment.shift_start_time, assignment.shift_end_time)
            }));
            
            setNurseAssignments(transformedAssignments);
          }

          if (clientResponse.success && clientResponse.client) {
            const clientData = clientResponse.client;
            const assessmentData = assessmentResponse.success ? assessmentResponse.assessment : null;

            // Transform the data to match the Patient interface
            const transformedPatient: Patient = {
                _id: clientData.details?.client_id,
                firstName: clientData.details?.patient_name?.split(' ')[0] || '',
                lastName: clientData.details?.patient_name?.split(' ').slice(1).join(' ') || '',
                age: clientData.details?.patient_age || 0,
                gender: clientData.details?.patient_gender || '',
                bloodGroup: '',
                location: clientData.details?.complete_address || '',
                email: '', // Patient's email if available
                phoneNumber: clientData.details?.patient_phone || '',
                clientCategory: clientData.client_category || 'DearCare',
                requestor: {
                  name: clientData.details?.requestor_name || '',
                  relation: clientData.details?.relation_to_patient || '',
                  phone: clientData.details?.requestor_phone || '',
                  email: clientData.details?.requestor_email || ''
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
                equipment: assessmentData.equipment || {},
                environment: assessmentData.environment || {},
                lab_investigations: assessmentData.lab_investigations || {}
              }] : []
            };

            setPatient(transformedPatient);
          }
        } catch (error) {
          console.error('Error fetching patient data:', error);
        } finally {
          setLoading(false);
        }
      }
    }

    loadData();

    fetchPatientData();
  }, [id]);

  const determineShiftType = (startTime?: string, endTime?: string): 'day' | 'night' | '24h' => {
    if (!startTime || !endTime) return 'day';
    
    const startHour = parseInt(startTime.split(':')[0]);
    const endHour = parseInt(endTime.split(':')[0]);
    
    if (endHour - startHour >= 12 || (startHour > endHour && startHour - endHour <= 12)) {
      return '24h';
    } else if (startHour >= 6 && startHour < 18) {
      return 'day';
    } else {
      return 'night';
    }
  };


  const fetchNurses = async () => {
    setIsLoadingNurses(true);
    try {
      const response = await listNurses();
      if (response.data) {
        setNurses(response.data);
      } else {
        toast.error(response.error || 'Failed to fetch nurses');
      }
    } catch (error) {
      console.error('Error fetching nurses:', error);
      toast.error('Error loading nurses');
    } finally {
      setIsLoadingNurses(false);
    }
  };

  const handleAssignNurse = async (nurseId: string) => {
    setShowNurseList(false);
    setShowConfirmation(false);
    
    const newAssignment: NurseAssignment = {
      nurseId,
      startDate: new Date().toISOString(),
      shiftType: 'day',
      status: 'active'
    };
    
    setNurseAssignments(prev => [...prev, newAssignment]);
    // TODO: Make API call to save assignment
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    setIsEditing(false);
    setLoading(true);
    
    // Refetch the client data to show the updated information
    try {
      const statusResult = await getClientStatus(id as string);
      if (statusResult.success) {
        setStatus(statusResult.status);
      }
      
      const clientResponse = await getClientDetails(id as string) as ClientResponse;
      const assessmentResponse = await getPatientAssessment(id as string);
      
      if (clientResponse.success && clientResponse.client) {
        const clientData = clientResponse.client;
        const assessmentData = assessmentResponse.success ? assessmentResponse.assessment : null;

        // Transform the data to match the Patient interface
        const transformedPatient: Patient = {
            _id: clientData.details?.client_id,
            firstName: clientData.details?.patient_name?.split(' ')[0] || '',
            lastName: clientData.details?.patient_name?.split(' ').slice(1).join(' ') || '',
            age: clientData.details?.patient_age || 0,
            gender: clientData.details?.patient_gender || '',
            bloodGroup: '',
            location: clientData.details?.complete_address || '',
            email: '', // Patient's email if available
            phoneNumber: clientData.details?.patient_phone || '',
            clientCategory: clientData.client_category || 'DearCare',
            requestor: {
              name: clientData.details?.requestor_name || '',
              relation: clientData.details?.relation_to_patient || '',
              phone: clientData.details?.requestor_phone || '',
              email: clientData.details?.requestor_email || ''
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
            equipment: assessmentData.equipment || {},
            environment: assessmentData.environment || {},
            lab_investigations: assessmentData.lab_investigations || {}
          }] : []
        };

        setPatient(transformedPatient);
      }
      
      toast.success('Patient details updated successfully');
    } catch (error) {
      console.error('Error refreshing patient data:', error);
      toast.error('Failed to refresh patient data');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    // TODO: Reset any edited data to original state
  };

  const handleCategoryChange = async (newCategory: 'DearCare' | 'TataLife') => {
    try {
      
      setPatient(currentPatient => {
        if (!currentPatient) return null;
        return {
          ...currentPatient,
          clientCategory: newCategory
        };
      });
      
      const result = await updateClientCategory(id as string, newCategory);
      
      if (!result.success) {
        setPatient(currentPatient => {
          if (!currentPatient) return null;
          return {
            ...currentPatient,
            clientCategory: currentPatient.clientCategory 
          };
        });
        
        console.error('Failed to update category:', result.error);
      } else {
        console.log(`Category successfully updated to ${newCategory}`);
      }
    } catch (error) {
      console.error('Failed to update category:', error);
      
      setPatient(currentPatient => {
        if (!currentPatient) return null;
        return {
          ...currentPatient,
          clientCategory: currentPatient.clientCategory
        };
      });
    }
  };


  

  if (loading) {
    return <Loader />;
  }

  if (error || !patient) {
    return (
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-6xl mx-auto bg-white p-8 rounded-md shadow">
          <div className="text-center">
            <h1 className="text-2xl font-semibold text-red-700">Error Loading Profile</h1>
            <p className="mt-2 text-gray-600">{error || "Patient profile not found"}</p>
            <Link href="/" className="mt-4 inline-block text-indigo-600 hover:underline">
              Return to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const latestAssessment = patient.assessments[0];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[95%] mx-auto py-4">
        {/* Profile Header */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-4">
          <ProfileHeader
            patient={patient}
            status={status}
            isEditing={isEditing}
            handleEdit={handleEdit}
            handleSave={handleSave}
            handleCancel={handleCancel}
            handleCategoryChange={handleCategoryChange}
            setShowNurseList={setShowNurseList}
          />

          {/* Main Content */}
          <div className="p-6">
            <EditPatientModal
              isEditing={isEditing}
              clientId={id as string}
              handleSave={handleSave}
              handleCancel={handleCancel}
            />
            
            {status === 'approved' && (
              <InfoSection title="Nurse Assignments">
                <NurseAssignmentsList
                  assignments={nurseAssignments}
                  nurses={nurses}
                  onEditAssignment={(assignment) => {
                    console.log('Edit assignment:', assignment);
                  }}
                  onEndAssignment={(assignmentId) => {
                    console.log('End assignment:', assignmentId);
                  }}
                />
              </InfoSection>
            )}
            
            {/* Patient Information */}
            <PatientInfo patient={patient} />
            
            {/* Medical Information */}
            <MedicalInfo assessment={latestAssessment} />
          </div>
        </div>
      </div>

      {/* Add the modals */}
      <NurseListModal 
        isOpen={showNurseList}
        nurses={nurses}
        clientId={id as string}
        onClose={() => setShowNurseList(false)}
        onAssignNurse={(nurseId) => {
          const nurse = nurses.find(n => n._id === nurseId);
          if (nurse) {
            setSelectedNurse(nurse);
            setShowConfirmation(true);
          }
        }}
        onViewProfile={() => {}}
      />

      <ConfirmationModal 
        isOpen={showConfirmation}
        title="Confirm Assignment"
        message={
          <p>
            Are you sure you want to assign <span className="font-medium">
              {selectedNurse?.firstName} {selectedNurse?.lastName}
            </span> to this patient?
          </p>
        }
        onConfirm={() => selectedNurse && handleAssignNurse(selectedNurse._id)}
        onCancel={() => setShowConfirmation(false)}
        confirmText="Confirm Assignment"
      />

    </div>
  );
};

export default PatientProfilePage;