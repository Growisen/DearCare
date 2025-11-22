'use client';

import React, { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { savePatientAssessment } from '@/app/actions/clients/client-actions';
import { toast } from 'sonner';
import Image from 'next/image';
import PatientAssessmentForm from '@/components/client/PatientAssessmentForm';
import RecorderInfoForm from '@/components/client/RecorderInfoForm';
import { usePatientAssessmentForm } from '@/hooks/usePatientAssessment';
import { getClientNames } from '@/app/actions/clients/assessment';

export default function PatientAssessmentPage() {
  const params = useParams();
  const id = params.id;
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [recorderInfo, setRecorderInfo] = useState({
    recorderId: '', 
    recorderName: '',
    recorderRole: '',
    familyRelationship: '',
    nurseRegistrationNumber: '',
    otherRoleSpecify: '',
    recorderTimestamp: new Date().toISOString()
  });

  const [clientNames, setClientNames] = useState<{ patientName?: string; requestorName?: string, clientCategory?: string } | null>(null);
  const [nameLoading, setNameLoading] = useState(true);

  const {
    formData,
    handleInputChange,
    handleCheckboxChange,
    handleEquipmentChange,
    handleCustomLabChange,
    handleAddCustomLab,
    handleRemoveCustomLab,
    handleAddFamilyMember,
    handleRemoveFamilyMember,
    handleFamilyMemberChange
  } = usePatientAssessmentForm();

  const handleRecorderInfoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setRecorderInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);

      let finalRecorderRole = recorderInfo.recorderRole;
      
      if (recorderInfo.recorderRole === "Family Member" && recorderInfo.familyRelationship) {
        finalRecorderRole = `Family Member: ${recorderInfo.familyRelationship}`;
      } else if (recorderInfo.recorderRole === "Nurse" && recorderInfo.nurseRegistrationNumber) {
        finalRecorderRole = `Nurse: ${recorderInfo.nurseRegistrationNumber}`;
      }

      const updatedRecorderInfo = {
        ...recorderInfo,
        recorderRole: finalRecorderRole,
        recorderTimestamp: new Date().toISOString()
      };

      const assessmentResult = await savePatientAssessment({
        clientId: id as string,
        assessmentData: {
          ...formData,
          recorderInfo: updatedRecorderInfo
        }
      });

      if (!assessmentResult.success) {
        throw new Error(assessmentResult.error || 'Failed to save assessment data');
      }

      toast.success('Assessment saved successfully!');
      router.push('/dashboard');

    } catch (error) {
      console.error('Error saving assessment:', error);
      toast.error(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  React.useEffect(() => {
    async function fetchName() {
      setNameLoading(true);
      const result = await getClientNames(id as string);
      if (result.success) {
        setClientNames({
          patientName: result.patientName,
          requestorName: result.requestorName,
          clientCategory: result.clientCategory
        });
      } else {
        setClientNames(null);
      }
      setNameLoading(false);
    }
    if (id) fetchName();
  }, [id]);

  return (
    <div className='min-h-screen bg-gradient-to-b from-slate-100 to-slate-200'>
      <div className="max-w-7xl mx-auto py-12 px-6">
        {nameLoading ? (
          <div className="flex flex-col items-center justify-center h-96">
            <svg className="animate-spin h-10 w-10 text-dCblue mb-4" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
            </svg>
            <span className="text-gray-600 text-lg font-medium">Loading user data...</span>
          </div>
        ) : (
          <div className="bg-white rounded-xl overflow-hidden border border-gray-300">
            <div className="bg-white rounded-t-lg shadow-lg p-6 mb-2 border-b-4 border-dCblue flex items-center justify-between">
              <div className="flex items-center">
                <div className={`flex items-center justify-center rounded-full p-3 mr-3 shadow-md bg-white border-2 ${clientNames?.clientCategory === 'DearCare LLP' ? 'border-dCblue' : 'border-amber-600'}`}>
                  <div className="relative w-12 h-12">
                    <Image
                      src={clientNames?.clientCategory === 'DearCare LLP' ? "/DearCare.png" : "/TATA.png"}
                      alt={clientNames?.clientCategory === 'DearCare LLP' ? "DearCare Logo" : "Tata Home Nursing Logo"}
                      fill
                      className="object-contain"
                    />
                  </div>
                </div>
                <div>
                  <h1 className="text-2xl font-bold">
                    <div className="flex items-center whitespace-nowrap">
                      {clientNames?.clientCategory === 'DearCare LLP' ? (
                        <>
                          <span className='text-dCblue'>Dear</span>
                          <span className='text-amber-500'>C</span>
                          <span className='text-dCblue'>are</span>
                        </>
                      ) : (
                        <span className='text-amber-600'>Tata Home Nursing</span>
                      )}
                    </div>
                  </h1>
                  <p className="text-sm text-gray-500">
                    Healthcare & Caregiving Services
                  </p>
                </div>
              </div>
              <div className="hidden sm:block">
                <p className="text-sm text-gray-600 font-medium">Client Support: <span className="text-blue-600">+1 (800) 123-4567</span></p>
                <p className="text-sm text-gray-600 mt-1">care@dearcare.com</p>
              </div>
            </div>

            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-800">Patient Assessment Form</h2>
              <p className="text-gray-600">Please fill out all required information accurately</p>
              <div className="mt-4">
                {nameLoading ? (
                  <span className="text-gray-500">Loading patient name...</span>
                ) : clientNames ? (
                  <div>
                    {clientNames.patientName && clientNames.requestorName ? (
                      <div>
                        <span className="font-semibold text-lg text-dCblue">
                          Patient Name: {clientNames.patientName}
                        </span>
                        <br />
                        <span className="font-semibold text-lg text-dCblue">
                          Requestor Name: {clientNames.requestorName}
                        </span>
                        <div className="mt-2 text-red-600 font-medium">
                          If this is <span className="underline">{clientNames.patientName}</span> or <span className="underline">{clientNames.requestorName}</span>, please proceed.<br />
                          <span className="font-bold">If this is NOT your name, do NOT fill the form.</span>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <span className="font-semibold text-lg text-dCblue">
                          {clientNames.patientName ? `Patient Name: ${clientNames.patientName}` : `Requestor Name: ${clientNames.requestorName}`}
                        </span>
                        <div className="mt-2 text-red-600 font-medium">
                          If this is <span className="underline">{clientNames.patientName || clientNames.requestorName}</span>, please proceed.<br />
                          <span className="font-bold">If this is NOT your name, do NOT fill the form.</span>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <span className="text-red-600 font-bold">Patient name could not be verified. Please contact support.</span>
                )}
              </div>
            </div>

            <div className="p-8">
              <form onSubmit={handleSubmit} className="space-y-8">
                <RecorderInfoForm 
                  recorderInfo={recorderInfo}
                  handleRecorderInfoChange={handleRecorderInfoChange}
                />

                <PatientAssessmentForm
                  formData={formData}
                  isEditable={true}
                  handleInputChange={handleInputChange}
                  handleCheckboxChange={handleCheckboxChange}
                  handleEquipmentChange={handleEquipmentChange}
                  handleCustomLabChange={handleCustomLabChange}
                  handleAddCustomLab={handleAddCustomLab}
                  handleRemoveCustomLab={handleRemoveCustomLab}
                  handleAddFamilyMember={handleAddFamilyMember}
                  handleRemoveFamilyMember={handleRemoveFamilyMember}
                  handleFamilyMemberChange={handleFamilyMemberChange}
                  showReviewChecklist={true}
                />

                <div className="flex justify-end space-x-4 pt-6 mt-8 border-t border-gray-200">
                  <button
                    type="button"
                    className="px-6 py-2.5 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 font-medium"
                    onClick={() => router.back()}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-dCblue text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition-colors duration-200 font-medium shadow-md"
                    disabled={isSubmitting || !recorderInfo.recorderName || !recorderInfo.recorderRole}
                  >
                    {isSubmitting ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                        </svg>
                        Saving...
                      </span>
                    ) : 'Save Assessment'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}