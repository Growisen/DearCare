"use client"

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import Loader from '@/components/loader';
import {Json, DetailedClientIndividual } from '@/types/client.types';
import { getClientDetails, getPatientAssessment, updateClientCategory } from '@/app/actions/client-actions';
import NurseListModal from '@/components/client/ApprovedContent/NurseListModal';
import ConfirmationModal from '@/components/client/ApprovedContent/ConfirmationModal';
import { Nurse } from '@/types/staff.types';
import NurseAssignmentsList from '@/components/client/NurseAssignmentsList';
import { nurses_test_data, dummyAssignments } from '@/test_data/dummy_data';
import PatientAssessment from '@/components/client/PatientAssessment';
import CategorySelector from '@/components/client/Profile/CategorySelector';

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
}

interface NurseAssignment {
  nurseId: string;
  startDate: string;
  endDate?: string;
  status: 'active' | 'completed' | 'cancelled';
  shiftType: 'day' | 'night' | '24h';
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
  requestor: {  // Add requestor information
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
  primaryDoctor: {
    name: string;
    specialization: string;
    contact: string;
  };
  insuranceDetails: {
    provider: string;
    policyNumber: string;
    validUntil: string;
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
  const [nurses] = useState(nurses_test_data);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [nurseAssignments, setNurseAssignments] = useState<NurseAssignment[]>([]);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    async function fetchPatientData() {
      if (id) {
        setLoading(true);
        try {
          // Fetch client details
          const clientResponse = await getClientDetails(id as string) as ClientResponse;
          console.log(clientResponse)
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
              primaryDoctor: {
                name: '',  // Add if you have this data
                specialization: '',
                contact: ''
              },
              insuranceDetails: {
                provider: '',  // Add if you have this data
                policyNumber: '',
                validUntil: ''
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

    fetchPatientData();
  }, [id]);

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
    // TODO: Add API call to save patient data
    setIsEditing(false);
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
          <div className="bg-gray-100 border-b border-gray-200 px-6 py-4">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex flex-col md:flex-row items-center md:items-start gap-4">
                <div className="flex-shrink-0 order-1 md:order-none">
                  <div className="relative h-32 w-32 rounded-full overflow-hidden border-2 border-white shadow-md">
                    {patient.profileImage ? (
                      <Image 
                        src={patient.profileImage}
                        alt={`${patient.firstName} ${patient.lastName}`}
                        fill
                        className="object-cover"
                        priority
                        sizes="(max-width: 768px) 96px, 128px"
                      />
                    ) : (
                      <div className="h-full w-full bg-gray-200 flex items-center justify-center">
                        <div className="text-center text-gray-600 font-medium text-xl">
                          <div>{patient.firstName[0]}</div>
                          <div>{patient.lastName[0]}</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="text-center md:text-left">
                  <h1 className="text-2xl font-semibold text-gray-800">
                    {patient.firstName} {patient.lastName}
                  </h1>
                  <p className="text-sm text-gray-600 mt-1">
                    {patient.age} years • {patient.gender} • {patient.bloodGroup}
                  </p>
                  
                  <div className="flex flex-wrap items-center justify-center md:justify-start mt-3 gap-2">
                    <span className="inline-flex items-center px-3 py-1 bg-gray-100 text-sm rounded text-gray-700 border border-gray-200">
                      <svg className="mr-1" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
                        <circle cx="12" cy="10" r="3"></circle>
                      </svg>
                      {patient.location}
                    </span>
                    <span className="inline-flex items-center px-3 py-1 bg-gray-100 text-sm rounded text-gray-700 border border-gray-200">
                      ID: {patient._id}
                    </span>
                    <CategorySelector 
                      currentCategory={patient.clientCategory}
                      onCategoryChange={handleCategoryChange}
                    />
                  </div>
                </div>
              </div>
              {/* Add Assign Nurse button */}
              <div className="flex items-center gap-2">
                {isEditing ? (
                  <>
                    <button 
                      onClick={handleSave}
                      className="px-4 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors duration-200 text-sm font-medium"
                    >
                      Save Changes
                    </button>
                    <button 
                      onClick={handleCancel}
                      className="px-4 py-2 text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200 text-sm font-medium"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button 
                      onClick={() => setShowNurseList(true)}
                      className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm font-medium"
                    >
                      Assign Nurse
                    </button>
                    <button 
                      onClick={handleEdit}
                      className="px-4 py-2 text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors duration-200 text-sm font-medium"
                    >
                      Edit Details
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="p-6">
            {isEditing ? (
              <div className="fixed inset-0 bg-black bg-opacity-50 z-10 flex items-center justify-center overflow-y-auto">
                <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-5xl max-h-[90vh] overflow-y-auto">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-gray-800">Edit Patient Details</h2>
                    <div className="flex gap-2">
                      <button 
                        onClick={handleSave}
                        className="px-4 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors duration-200 text-sm font-medium"
                      >
                        Save Changes
                      </button>
                      <button 
                        onClick={handleCancel}
                        className="px-4 py-2 text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200 text-sm font-medium"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                  
                  <PatientAssessment 
                    clientId={id as string} 
                    isEditing={true}
                    onSave={handleSave}
                  />
                </div>
              </div>
            ) : null}
            <div className="bg-white p-4 rounded border border-gray-200 mt-4 mb-4">
              <h2 className="text-base font-semibold text-gray-800 pb-2 border-b border-gray-200 mb-3">
                Nurse Assignments
              </h2>
              <NurseAssignmentsList
                assignments={dummyAssignments}
                nurses={nurses}
                onEditAssignment={(assignment) => {
                  console.log('Edit assignment:', assignment);
                }}
                onEndAssignment={(assignmentId) => {
                  console.log('End assignment:', assignmentId);
                }}
              />
            </div>
            {/* Personal Information */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-white p-4 rounded border border-gray-200">
                <h2 className="text-base font-semibold text-gray-800 pb-2 border-b border-gray-200 mb-3">
                  Personal Information
                </h2>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Email</p>
                    <p className="text-sm text-gray-700">{patient.email}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Phone</p>
                    <p className="text-sm text-gray-700">{patient.phoneNumber}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Emergency Contact</p>
                    <p className="text-sm text-gray-700">{patient.emergencyContact.name}</p>
                    <p className="text-xs text-gray-600">{patient.emergencyContact.relation} • {patient.emergencyContact.phone}</p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500 font-medium">Guardian Occupation</p>
                    <p className="text-sm text-gray-700">{latestAssessment?.guardianOccupation || 'Not recorded'}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 rounded border border-gray-200">
                <h2 className="text-base font-semibold text-gray-800 pb-2 border-b border-gray-200 mb-3">
                  Requestor Information
                </h2>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Name</p>
                    <p className="text-sm text-gray-700">{patient.requestor.name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Relation to Patient</p>
                    <p className="text-sm text-gray-700">{patient.requestor.relation}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Phone</p>
                    <p className="text-sm text-gray-700">{patient.requestor.phone}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Email</p>
                    <p className="text-sm text-gray-700">{patient.requestor.email || 'Not provided'}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 rounded border border-gray-200">
                <h2 className="text-base font-semibold text-gray-800 pb-2 border-b border-gray-200 mb-3">
                  Physical Attributes
                </h2>
                <div className='space-y-3'>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Height</p>
                    <p className="text-sm text-gray-700">{latestAssessment?.height || 'Not recorded'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Weight</p>
                    <p className="text-sm text-gray-700">{latestAssessment?.weight || 'Not recorded'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Marital Status</p>
                    <p className="text-sm text-gray-700">{latestAssessment?.maritalStatus || 'Not recorded'}</p>
                  </div>
                  
                </div>
              </div>

              <div className="bg-white p-4 rounded border border-gray-200">
                <h2 className="text-base font-semibold text-gray-800 pb-2 border-b border-gray-200 mb-3">
                  Location Details
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 font-medium">City/Town</p>
                    <p className="text-sm text-gray-700">{latestAssessment?.cityTown || 'Not recorded'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">District</p>
                    <p className="text-sm text-gray-700">{latestAssessment?.district || 'Not recorded'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Pincode</p>
                    <p className="text-sm text-gray-700">{latestAssessment?.pincode || 'Not recorded'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Assessment Details */}
            <div className="space-y-4">
              {/* Medical Status */}
              <div className="bg-white p-4 rounded border border-gray-200">
                <h2 className="text-base font-semibold text-gray-800 pb-2 border-b border-gray-200 mb-3">
                  Medical Status
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Chronic Illness</p>
                    <p className="text-sm text-gray-700">{latestAssessment?.chronicIllness || 'Not recorded'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Medical History</p>
                    <p className="text-sm text-gray-700">{latestAssessment?.medicalHistory || 'Not recorded'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Surgical History</p>
                    <p className="text-sm text-gray-700">{latestAssessment?.surgicalHistory || 'Not recorded'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Medication History</p>
                    <p className="text-sm text-gray-700">{latestAssessment?.medicationHistory || 'Not recorded'}</p>
                  </div>
                </div>
              </div>

              {/* Current Status */}
              <div className="bg-white p-4 rounded border border-gray-200">
                <h2 className="text-base font-semibold text-gray-800 pb-2 border-b border-gray-200 mb-3">
                  Current Status
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Present Condition</p>
                    <p className="text-sm text-gray-700">{latestAssessment?.presentCondition || 'Not recorded'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Blood Pressure</p>
                    <p className="text-sm text-gray-700">{latestAssessment?.bloodPressure || 'Not recorded'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Sugar Level</p>
                    <p className="text-sm text-gray-700">{latestAssessment?.sugarLevel || 'Not recorded'}</p>
                  </div>
                </div>
              </div>

              {/* Lab Investigations */}
              <div className="bg-white p-4 rounded border border-gray-200">
                <h2 className="text-base font-semibold text-gray-800 pb-2 border-b border-gray-200 mb-3">
                  Lab Investigations
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.entries(latestAssessment?.lab_investigations || {}).map(([key, value]) => (
                    <div key={key}>
                      <p className="text-xs text-gray-500 font-medium">{key.toUpperCase()}</p>
                      <p className="text-sm text-gray-700">{value}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Care Plan */}
              <div className="bg-white p-4 rounded border border-gray-200">
                <h2 className="text-base font-semibold text-gray-800 pb-2 border-b border-gray-200 mb-3">
                  Care Plan
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Final Diagnosis</p>
                    <p className="text-sm text-gray-700">{latestAssessment?.finalDiagnosis|| 'Not recorded'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Patient Position</p>
                    <p className="text-sm text-gray-700">{latestAssessment?.patientPosition || 'Not recorded'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Foods to Include</p>
                    <p className="text-sm text-gray-700">{latestAssessment?.foodsToInclude || 'Not recorded'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Foods to Avoid</p>
                    <p className="text-sm text-gray-700">{latestAssessment?.foodsToAvoid || 'Not recorded'}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 rounded border border-gray-200">
                <h2 className="text-base font-semibold text-gray-800 pb-2 border-b border-gray-200 mb-3">
                  Behavioral Assessment
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Alertness Level</p>
                    <p className="text-sm text-gray-700">{latestAssessment?.alertnessLevel || 'Not assessed'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Physical Behavior</p>
                    <p className="text-sm text-gray-700">{latestAssessment?.physicalBehavior || 'Not assessed'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Speech Patterns</p>
                    <p className="text-sm text-gray-700">{latestAssessment?.speechPatterns || 'Not assessed'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Emotional State</p>
                    <p className="text-sm text-gray-700">{latestAssessment?.emotionalState || 'Not assessed'}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-4 rounded border border-gray-200">
                <h2 className="text-base font-semibold text-gray-800 pb-2 border-b border-gray-200 mb-3">
                  Social History
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Alcohol Use</p>
                    <p className="text-sm text-gray-700">{latestAssessment?.alcoholUse || 'Not recorded'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Tobacco Use</p>
                    <p className="text-sm text-gray-700">{latestAssessment?.tobaccoUse || 'Not recorded'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Drugs Use</p>
                    <p className="text-sm text-gray-700">{latestAssessment?.drugsUse || 'Not recorded'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Other Social History</p>
                    <p className="text-sm text-gray-700">{latestAssessment?.otherSocialHistory || 'Not recorded'}</p>
                  </div>
                </div>
              </div>

              {/* Feeding Information */}
              <div className="bg-white p-4 rounded border border-gray-200">
                <h2 className="text-base font-semibold text-gray-800 pb-2 border-b border-gray-200 mb-3">
                  Feeding Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Feeding Method</p>
                    <p className="text-sm text-gray-700">{latestAssessment?.feedingMethod || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Current Status</p>
                    <p className="text-sm text-gray-700">{latestAssessment?.currentStatus || 'Not recorded'}</p>
                  </div>
                </div>
              </div>

              {/* Environment and Equipment */}
              <div className="bg-white p-4 rounded border border-gray-200">
                <h2 className="text-base font-semibold text-gray-800 pb-2 border-b border-gray-200 mb-3">
                  Environment and Equipment
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-medium mb-2 text-gray-800">Environment Checklist</h3>
                    <div className="space-y-2">
                      {Object.entries(latestAssessment?.environment || {}).map(([key, value]) => (
                        <div key={key} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={value}
                            readOnly
                            className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                          />
                          <label className="ml-2 text-sm text-gray-700">
                            {key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium mb-2 text-gray-800">Equipment Needed</h3>
                    <div className="space-y-2">
                      {Object.entries(latestAssessment?.equipment || {}).map(([key, value]) => (
                        <div key={key} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={value}
                            readOnly
                            className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                          />
                          <label className="ml-2 text-sm text-gray-700">
                            {key.replace(/([A-Z])/g, ' $1').trim()}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add the modals */}
      <NurseListModal 
        isOpen={showNurseList}
        nurses={nurses}
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