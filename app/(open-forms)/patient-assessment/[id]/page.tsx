'use client';

import React, { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { savePatientAssessment } from '@/app/actions/client-actions';
import { toast } from 'react-hot-toast';
import Image from 'next/image';
import PersonalInfo from '@/components/client/UnderReview/PersonalInfo';
import MedicalStatus from '@/components/client/UnderReview/MedicalStatus';
import PsychologicalAssessment from '@/components/client/UnderReview/PsychologicalAssessment';
import SocialHistory from '@/components/client/UnderReview/SocialHistory';
import CurrentDetails from '@/components/client/UnderReview/CurrentHistory';
import DiagnosisAndCarePlan from '@/components/client/UnderReview/DiagnosisAndCarePlan';
import EnvironmentAndEquipment from '@/components/client/UnderReview/EnvironmentAndEquipment';
import ReviewChecklist from '@/components/client/UnderReview/ReviewChecklist';

export default function PatientAssessmentPage() {
  const params = useParams();
  const id = params.id;
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);

      const formattedData = {
        ...formData,
      };

      const assessmentResult = await savePatientAssessment({
        clientId: id as string,
        assessmentData: formattedData
      });

      if (!assessmentResult.success) {
        throw new Error(assessmentResult.error || 'Failed to save assessment data');
      }

      toast.success('Assessment saved successfully!');
      router.push('/dashboard'); // or wherever you want to redirect after success

    } catch (error) {
      console.error('Error saving assessment:', error);
      toast.error(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className='min-h-screen bg-gradient-to-b from-slate-100 to-slate-200'>
        <div className="max-w-5xl mx-auto py-12 px-6">
            <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
                {/* Header Section */}
                <div className="bg-white rounded-t-lg shadow-lg p-6 mb-2 border-b-4 border-dCblue flex items-center justify-between">
                    <div className="flex items-center">
                        <div className="flex items-center justify-center rounded-full p-3 mr-3 shadow-md bg-white border-2 border-dCblue">
                            <div className="relative w-12 h-12">
                                <Image
                                    src="/DearCare.png"
                                    alt="DearCare Logo"
                                    fill
                                    className="object-contain"
                                />
                            </div>
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold">
                                <div className="flex items-center whitespace-nowrap">
                                    <span className='text-dCblue'>Dear</span>
                                    <span className='text-amber-500'>C</span>
                                    <span className='text-dCblue'>are</span>
                                </div>
                            </h1>
                            <p className="text-sm text-gray-500">Healthcare & Caregiving Services</p>
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
                </div>

                {/* Form Section */}
                <div className="p-8">
                    <form onSubmit={handleSubmit} className="space-y-8">
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
                                disabled={isSubmitting}
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
        </div>
    </div>
  );
}