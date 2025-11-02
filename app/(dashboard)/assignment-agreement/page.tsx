"use client";

import React, { useState } from 'react';
import { FormData, FormPage } from '@/types/agreement.types';
import { FormContainer } from '@/components/assignmentAgreement/FormContainer';
import { ClientInfoStep } from '@/components/assignmentAgreement/PersonalInfoStep';
import { AgreementsStep } from '@/components/assignmentAgreement/AgreementsStep';
import { AssignmentDetailsStep } from '@/components/assignmentAgreement/AssignmentDetailsStep';
import { DietaryHabitsStep } from '@/components/assignmentAgreement/DietaryHabitsStep'; 
import { FORM_STEPS, TOTAL_STEPS, INITIAL_FORM_DATA } from '@/utils/constants';
import { generateFormPDF } from '@/utils/generateAssignmentAgreementPdf';
import { toast } from "sonner"

export default function Page() {
  const [page, setPage] = useState<FormPage>(1);
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM_DATA);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleNext = () => {
    if (formData.name && formData.district && formData.city && formData.state && formData.type) {
      setPage(prev => (prev < TOTAL_STEPS ? (prev + 1) as FormPage : prev));
    } else {
      toast.warning('Please fill in all required fields');
    }
  };

  const handleBack = () => {
    setPage(prev => (prev > 1 ? (prev - 1) as FormPage : prev));
  };

  const handleSubmit = async () => {
    if (formData) {
      try {
        await generateFormPDF(formData);
        toast.success('Form submitted and PDF downloaded!');
      } catch {
        toast.error('PDF generation failed');
      }
    } else {
      toast.error('Please agree to all terms and policies');
    }
  };

  const renderFormStep = () => {
    switch (page) {
      case 1:
        return (
          <ClientInfoStep
            formData={formData}
            onFormChange={handleChange}
            onNext={handleNext}
          />
        );
      case 2:
        return (
          <AssignmentDetailsStep
            formData={formData}
            onFormChange={handleChange}
            onBack={handleBack}
            onNext={handleNext}
          />
        );
      case 3:
        return (
          <DietaryHabitsStep
            formData={formData}
            onFormChange={handleChange}
            onBack={handleBack}
            onNext={handleNext}
          />
        );
      case 4:
        return (
          <AgreementsStep
            formData={formData}
            onFormChange={handleChange}
            onBack={handleBack}
            onSubmit={handleSubmit}
            onNext={handleNext}
          />
        );
      case 3:
        return (
          <AgreementsStep
            formData={formData}
            onFormChange={handleChange}
            onBack={handleBack}
            onSubmit={handleSubmit}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-gradient-to-br from-slate-50 to-slate-100 flex gap-3 justify-center items-center">
      <div className="w-full max-w-2xl">
        <FormContainer
          title={FORM_STEPS[page].title}
          description={FORM_STEPS[page].description}
          currentStep={page}
          totalSteps={TOTAL_STEPS}
        >
          {renderFormStep()}
        </FormContainer>
      </div>
    </div>
  );
}