import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { AddNurseProps, NurseFormData, NurseReferenceData, NurseHealthData, NurseDocuments } from '@/types/staff.types';
import { createNurse } from '@/app/actions/staff-management/add-nurse';
import { toast } from 'react-hot-toast';
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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-md w-full max-w-3xl flex flex-col max-h-[90vh] overflow-hidden">

        <div className="shrink-0 border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Add New Nurse</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-50 rounded-full">
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>


        <div className="shrink-0 px-6 pt-4">
          <div className="flex justify-between mb-4">
            {FORM_CONFIG.steps.map((step, index) => (
              <div key={index} className="flex flex-col items-center">
                <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-gray-700 ${index <= currentStep ? 'bg-blue-600 text-white' : 'bg-gray-200'
                  }`}>
                  {index + 1}
                </div>
                <span className="hidden sm:block text-xs mt-1 text-gray-700">{step}</span>

                {currentStep === index && (
                  <span className="sm:hidden text-xs mt-1 font-medium text-blue-600">{step}</span>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4 text-gray-700">
          {renderStep()}
        </div>

        <div className="shrink-0 border-t px-6 py-4 bg-white mt-auto flex justify-between items-center rounded-b-2xl">
          <button
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0}
            className="px-4 py-2 text-sm bg-gray-100 rounded-lg text-gray-700 hover:text-gray-900 disabled:text-gray-400 disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-sm text-blue-600 font-medium">Step {currentStep + 1} of {FORM_CONFIG.steps.length}</span>
          <button
            onClick={() => currentStep === FORM_CONFIG.steps.length - 1 ? handleSubmit() : handleNext()}
            disabled={!canProceed()}
            className="px-4 py-2 text-sm bg-blue-600 text-white hover:text-white rounded-lg disabled:opacity-50 disabled:text-gray-100"
          >
            {currentStep === FORM_CONFIG.steps.length - 1 ? 'Submit' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
}