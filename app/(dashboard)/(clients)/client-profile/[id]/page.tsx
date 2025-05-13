"use client"

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Loader from '@/components/Loader';
import { getClientDetails, getPatientAssessment, updateClientCategory, getClientStatus, deleteClient } from '@/app/actions/client-actions';
import NurseListModal from '@/components/client/ApprovedContent/NurseListModal';
import ConfirmationModal from '@/components/client/ApprovedContent/ConfirmationModal';
import { Nurse } from '@/types/staff.types';
import NurseAssignmentsList from '@/components/client/NurseAssignmentsList';
import { listNurses } from '@/app/actions/add-nurse';
import { getNurseAssignments } from '@/app/actions/shift-schedule-actions';
import toast from 'react-hot-toast';
import EditAssignmentModal from '@/components/client/EditAssignmentModal';
import { updateNurseAssignment, deleteNurseAssignment } from '@/app/actions/shift-schedule-actions';
import ProfileHeader from '@/components/client/Profile/ProfileHeader';
import PatientInfo from '@/components/client/Profile/PatientInfo';
import MedicalInfo from '@/components/client/Profile/MedicalInfo';
import EditPatientModal from '@/components/client/Profile/EditPatientModal';
import ServiceDetailsSection from '@/components/client/Profile/ServiceDetailsSection';
import { getServiceLabel } from '@/utils/formatters';
import { serviceOptions } from '@/utils/constants';

import { ClientResponse, Patient, NurseAssignment, ClientCategory } from '@/types/client.types';

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
  
  const [activeTab, setActiveTab] = useState<'profile' | 'medical' | 'assignments'>(() => {
    if (typeof window !== 'undefined') {
      const savedTab = localStorage.getItem(`patient-${id}-activeTab`);
      if (savedTab === 'profile' || savedTab === 'medical' || savedTab === 'assignments') {
        return savedTab;
      }
    }
    return 'profile';
  });

  const [editingAssignment, setEditingAssignment] = useState<NurseAssignment | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

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
              serviceRequired: getServiceLabel(serviceOptions, clientData.details?.service_required || '') ,
              address: {
                fullAddress: clientData.details?.patient_address || '',
                city: clientData.details?.patient_city || '',
                district: clientData.details?.patient_district || '',
                pincode: clientData.details?.patient_pincode || '',
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
                familyMembers: assessmentData.family_members || [],
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
          serviceRequired: clientData.details?.service_required || '',
          address: {
            fullAddress: clientData.details?.patient_address || '',
            city: clientData.details?.patient_city || '',
            district: clientData.details?.patient_district || '',
            pincode: clientData.details?.patient_pincode || '',
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
            familyMembers: assessmentData.family_members || [],
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

  const handleTabChange = (tab: 'profile' | 'medical' | 'assignments') => {
    setActiveTab(tab);
    localStorage.setItem(`patient-${id}-activeTab`, tab);
  };

  const handleCancel = () => {
    setIsEditing(false);
    // TODO: Reset any edited data to original state
  };

  const handleCategoryChange = async (newCategory: ClientCategory) => {
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

  const handleEditAssignment = (assignment: NurseAssignment) => {
    setEditingAssignment(assignment);
    setShowEditModal(true);
  };

  const handleUpdateAssignment = async (updatedAssignment: NurseAssignment) => {
    if (!updatedAssignment.id) {
      toast.error('Cannot update assignment without ID');
      return;
    }
    
    try {
      // Format the data for the server action
      const updates = {
        start_date: updatedAssignment.startDate,
        end_date: updatedAssignment.endDate,
        shift_start_time: updatedAssignment.shiftStart,
        shift_end_time: updatedAssignment.shiftEnd,
      };
      
      // Call the server action
      const result = await updateNurseAssignment(updatedAssignment.id, updates);
      
      if (result.success) {
        // Update the local state
        setNurseAssignments(prevAssignments => 
          prevAssignments.map(assignment => 
            assignment.id === updatedAssignment.id ? updatedAssignment : assignment
          )
        );
        toast.success('Assignment updated successfully');
      } else {
        toast.error(`Failed to update assignment: ${result.message}`);
      }
    } catch (error) {
      console.error('Error updating assignment:', error);
      toast.error('An error occurred while updating the assignment');
    } finally {
      setShowEditModal(false);
      setEditingAssignment(null);
    }
  };


  const handleDeleteAssignment = async (assignmentId: number | string) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this assignment?');
    if (!confirmDelete) {
      return;
    }
    
    const numericId = typeof assignmentId === 'string' ? parseInt(assignmentId, 10) : assignmentId;
    
    try {
      const result = await deleteNurseAssignment(numericId);
      
      if (result.success) {
        setNurseAssignments(prevAssignments => 
          prevAssignments.filter(assignment => assignment.id !== numericId)
        );
        toast.success('Assignment deleted successfully');
      } else {
        toast.error(`Failed to delete assignment: ${result.message}`);
      }
    } catch (error) {
      console.error('Error deleting assignment:', error);
      toast.error('An error occurred while deleting the assignment');
    }
  };

  const handleDeleteClient = async () => {
    try {
      const result = await deleteClient(id as string);
      if (result.success) {
        toast.success('Client deleted successfully');
        
        window.location.href = '/clients';
      } else {
        toast.error(`Failed to delete client: ${result.error}`);
        setShowDeleteConfirmation(false); 
      }
    } catch (error) {
      console.error('Error deleting client:', error);
      toast.error('An error occurred while deleting the client');
      setShowDeleteConfirmation(false);
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
            <Link href="/" className="inline-block text-indigo-600 hover:underline mt-4">
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
      <div className="w-full max-w-[98%] sm:max-w-[95%] lg:max-w-[1200px] mx-auto py-2 sm:py-4">
        {/* Profile Header */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-3 sm:mb-4">
          <ProfileHeader
            patient={patient}
            status={status}
            isEditing={isEditing}
            handleEdit={handleEdit}
            handleSave={handleSave}
            handleCancel={handleCancel}
            handleCategoryChange={handleCategoryChange}
            setShowNurseList={setShowNurseList}
            onDelete={() => setShowDeleteConfirmation(true)}
          />

          {/* Tabs Navigation */}
          <div className="border-b border-gray-200 px-3 sm:px-6">
            <div className="overflow-x-auto pb-1">
              <nav className="-mb-px flex space-x-2 sm:space-x-8">
                <button
                  onClick={() => handleTabChange('profile')}
                  className={`py-2 sm:py-4 px-1 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap ${
                    activeTab === 'profile'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Profile Details
                </button>
                <button
                  onClick={() => handleTabChange('medical')}
                  className={`py-2 sm:py-4 px-1 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap ${
                    activeTab === 'medical'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Medical Info
                </button>
                {status === 'approved' && (
                  <button
                    onClick={() => handleTabChange('assignments')}
                    className={`py-2 sm:py-4 px-1 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap ${
                      activeTab === 'assignments'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Nurse Assignments
                  </button>
                )}
              </nav>
            </div>
          </div>
          {/* Main Content */}
          <div className="p-3 sm:p-4 md:p-6">
            <EditPatientModal
              isEditing={isEditing}
              clientId={id as string}
              handleSave={handleSave}
              handleCancel={handleCancel}
            />
            
            {/* Profile Details Tab */}
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <ServiceDetailsSection 
                  serviceRequired={patient.serviceRequired}
                  status={status}
                  serviceLocation={patient.location}
                  // Add more service details as available
                />
                <PatientInfo patient={patient} />
              </div>
            )}
            
            {/* Medical Information Tab */}
            {activeTab === 'medical' && (
              <div className="space-y-6">
                <MedicalInfo assessment={latestAssessment} />
              </div>
            )}
            
            {/* Nurse Assignments Tab */}
            {activeTab === 'assignments' && status === 'approved' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold text-gray-800">Nurse Assignments</h2>
                  <button
                    onClick={() => setShowNurseList(true)}
                    className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
                  >
                    Assign New Nurse
                  </button>
                </div>
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                  <NurseAssignmentsList
                    assignments={nurseAssignments}
                    nurses={nurses}
                    onEditAssignment={handleEditAssignment}
                    onEndAssignment={(assignmentId) => {
                      console.log('End assignment:', assignmentId);
                    }}
                    onDeleteAssignment={handleDeleteAssignment}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* All modals remain the same */}
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
        onConfirm={() => {
          if (selectedNurse) {
            return handleAssignNurse(selectedNurse._id);
          }
          return Promise.resolve();
        }}
        onCancel={() => setShowConfirmation(false)}
        confirmText="Confirm Assignment"
      />

      <EditAssignmentModal
        isOpen={showEditModal}
        assignment={editingAssignment}
        nurse={editingAssignment ? nurses.find(n => n._id === editingAssignment.nurseId) : null}
        onClose={() => {
          setShowEditModal(false);
          setEditingAssignment(null);
        }}
        onSave={handleUpdateAssignment}
      />

      <ConfirmationModal
        isOpen={showDeleteConfirmation}
        title="Delete Client"
        message={
          <div className="text-center">
            <p className="text-red-600 font-semibold mb-2">Warning: This action cannot be undone!</p>
            <p>Are you sure you want to delete this client?</p>
            <p className="mt-2 text-sm text-gray-600">
              All associated data including assessments and nurse assignments will be permanently removed.
            </p>
          </div>
        }
        onConfirm={handleDeleteClient}
        onCancel={() => setShowDeleteConfirmation(false)}
        confirmText="Delete Client"
        confirmButtonClassName="bg-red-600 hover:bg-red-700"
      />
    </div>
  );
};

export default PatientProfilePage;