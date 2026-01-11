import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { AddNurseProps, NurseFormData, NurseReferenceData, NurseHealthData, NurseDocuments } from '@/types/staff.types';
import { createNurse } from '@/app/actions/staff-management/add-nurse';
import { toast } from 'sonner';
import useOrgStore from '@/app/stores/UseOrgStore';
import { getTodayDDMMYYYY } from '@/utils/dateUtils';
import { FORM_CONFIG } from './AddNurseOverlay/Config';
import { validateStep } from './AddNurseOverlay/AddNurseValidation';

import { StepPersonal } from './AddNurseOverlay/StepPersonal';
import { StepContact } from './AddNurseOverlay/StepContact';
import { StepReference } from './AddNurseOverlay/StepReference';
import { StepWork } from './AddNurseOverlay/StepWork';
import { StepHealth } from './AddNurseOverlay/StepHealth';
import { StepDocument } from './AddNurseOverlay/StepDocument';

export function AddNurseOverlay({ onClose }: AddNurseProps) {
  const { organization } = useOrgStore();
  const [currentStep, setCurrentStep] = useState(0);

  const orgToAdmittedType: Record<string, 'Tata_Homenursing' | 'Dearcare_Llp'> = {
    TataHomeNursing: 'Tata_Homenursing',
    DearCare: 'Dearcare_Llp',
  };
  const admittedTypeValue = organization ? orgToAdmittedType[organization] : 'Tata_Homenursing';

  const [documents, setDocuments] = useState<NurseDocuments>({
    adhar: null,
    educational: null,
    experience: null,
    profile_image: null,
    noc: null,
    ration: null
  });

  const [nurseData, setNurseData] = useState<NurseFormData>({
    first_name: '',
    last_name: '',
    gender: '',
    date_of_birth: '',
    address: '',
    city: '',
    taluk: '',
    state: '',
    pin_code: '',
    phone_number: '',
    email: '',
    languages: [],
    noc_status: '',
    service_type: '',
    shift_pattern: '',
    category: '',
    experience: '',
    marital_status: '',
    religion: '',
    mother_tongue: '',
    age: '',
    nurse_reg_no: '',
    admitted_type: admittedTypeValue,
    nurse_prev_reg_no: '',
    joining_date: getTodayDDMMYYYY(),
    salary_per_month: ''
  });

const [referenceData, setReferenceData] = useState<NurseReferenceData>({
    reference_name: '',
    reference_phone: '',
    reference_relation: '',
    reference_address: '',
    recommendation_details: '',
    family_references: [{
      name: '',
      relation: '',
      phone: ''
    }, {
      name: '',
      relation: '',
      phone: ''
    }],
    staff_reference: {
      name: '',
      relation: '',
      phone: '',
      recommendation_details: ''
    }
  });

  const [healthData, setHealthData] = useState<NurseHealthData>({
    health_status: '',
    disability: '',
    source: ''
  });

  useEffect(() => {
    if (admittedTypeValue && nurseData.admitted_type !== admittedTypeValue) {
      setNurseData(prev => ({ ...prev, admitted_type: admittedTypeValue }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [admittedTypeValue]);

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <StepPersonal formData={nurseData} setFormData={setNurseData} />;
      case 1:
        return <StepContact formData={nurseData} setFormData={setNurseData} />;
      case 2:
        return <StepReference data={referenceData} setData={setReferenceData} />;
      case 3:
        return <StepWork formData={nurseData} setFormData={setNurseData} />;
      case 4:
        return <StepHealth data={healthData} setData={setHealthData} />;
      case 5:
        return <StepDocument setDocuments={setDocuments} nurseData={nurseData} setNurseData={setNurseData} />;
      default:
        return null;
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return validateStep(0, nurseData);
      case 1:
        return validateStep(1, nurseData);
      case 2:
        return validateStep(2, referenceData);
      case 3:
        return validateStep(3, nurseData);
      case 4:
        return validateStep(4, healthData);
      case 5:
        return validateStep(5, {
          ...documents,
          noc_status: nurseData.noc_status
        });
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (canProceed()) {
      setCurrentStep(currentStep + 1);
    } else {
      toast.error('Please fill in all required fields before proceeding');
    }
  };


  const handleSubmit = async () => {
    if (!canProceed()) {
      toast.error('Please fill in all required fields before submitting');
      return;
    }

    try {
      const result = await createNurse(
        nurseData,
        referenceData,
        healthData,
        documents
      );
      if (!result.success) {
        toast.error(result.error || 'Failed to add nurse');
        return;
      }

      if (result.success) {
        toast.success('Nurse added successfully!');
        onClose();
      } else {
        toast.error(result.error || 'Failed to add nurse');
      }
    } catch (error) {
      console.error('Error submitting nurse data:', error);
      toast.error('An error occurred while adding the nurse');
    }
  };

return (
  <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-50 flex items-center justify-center animate-in fade-in duration-200">
    <div className="bg-white rounded-sm w-full max-w-3xl flex flex-col max-h-[90vh] overflow-hidden shadow-xl">

      <div className="shrink-0 border-b border-slate-200 px-6 py-5 flex items-center justify-between bg-gray-50">
        <h2 className="text-lg font-semibold text-gray-900">Add New Nurse</h2>
        <button 
          onClick={onClose} 
          className="p-1.5 hover:bg-gray-200 rounded transition-colors"
          aria-label="Close"
        >
          <X className="h-5 w-5 text-gray-600" />
        </button>
      </div>

      <div className="shrink-0 px-4 sm:px-6 py-4 sm:py-5 bg-white border-b border-slate-200">
        <div className="flex items-center justify-between relative">
          <div className="absolute top-3 sm:top-4 left-0 right-0 h-0.5 bg-gray-200 hidden sm:block">
            <div 
              className="h-full bg-blue-400 transition-all duration-300"
              style={{ width: `${(currentStep / (FORM_CONFIG.steps.length - 1)) * 100}%` }}
            />
          </div>

          {FORM_CONFIG.steps.map((step, index) => (
            <div key={index} className="flex flex-col items-center relative z-10">
              <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-medium text-xs sm:text-sm transition-colors ${
                index < currentStep 
                  ? 'bg-blue-600 text-white' 
                  : index === currentStep
                  ? 'bg-blue-700 text-white ring-2 sm:ring-4 ring-blue-200'
                  : 'bg-white text-gray-400 border-2 border-slate-200'
              }`}>
                {index < currentStep ? '✓' : index + 1}
              </div>
              
              <span className={`hidden sm:block text-xs mt-2 font-medium whitespace-nowrap ${
                index === currentStep ? 'text-gray-900' : 'text-gray-500'
              }`}>
                {step}
              </span>
              
              {index === currentStep && (
                <span className="sm:hidden text-xs mt-1.5 font-medium text-gray-900 whitespace-nowrap">
                  {step}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6">
        {renderStep()}
      </div>
      
      <div className="shrink-0 border-t border-slate-200 px-6 py-4 bg-gray-50 flex justify-between items-center gap-4">
        <button
          onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
          disabled={currentStep === 0}
          className="px-5 py-1.5 text-sm font-medium border border-slate-200 rounded-sm text-gray-700 hover:bg-gray-100
           disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Previous
        </button>
        
        <span className="text-sm text-gray-600">
          Step {currentStep + 1} of {FORM_CONFIG.steps.length}
        </span>
        
        <button
          onClick={() => currentStep === FORM_CONFIG.steps.length - 1 ? handleSubmit() : handleNext()}
          disabled={!canProceed()}
          className="px-5 py-1.5 text-sm font-medium bg-blue-700 text-white rounded-sm hover:bg-blue-800
           disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {currentStep === FORM_CONFIG.steps.length - 1 ? 'Submit' : 'Next'}
        </button>
      </div>
    </div>
  </div>
);
}