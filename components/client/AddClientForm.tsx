import React from 'react';
import { FormData, StaffRequirement, ClientCategory } from '@/types/client.types';
import { ClientTypeSelector } from '@/components/open-form/ClientTypeSelector';
import { RequestorInfoForm } from '@/components/open-form/RequestorInfoForm';
import { PatientInfoForm } from '@/components/open-form/PatientInfoForm';
import { OrganizationInfoForm } from '@/components/open-form/OrganizationInfoForm';
import { IndividualCareRequirements } from '@/components/open-form/IndividualCareRequirements';
import { StaffRequirements } from '@/components/open-form/StaffRequirements';
import { DutyPeriodSelector } from '@/components/add-client-overlay/DutyPeriodSelector';
import { ClientCategorySelector } from '@/components/add-client-overlay/ClientCategorySelector';

interface FormErrors {
  [key: string]: string;
}

interface ClientFormComponentProps {
  formData: FormData;
  formErrors: FormErrors;
  clientType: 'individual' | 'organization' | 'hospital' | 'carehome';
  isSubmitting: boolean;
  isSameAddress: boolean;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleBlur: (id: string) => void;
  handleProfileImageChange: (field: 'requestorProfilePic' | 'patientProfilePic', file: File | null) => void;
  handleStaffRequirementsChange: (staffRequirements: StaffRequirement[], startDate?: string) => void;
  handleClientTypeChange: (type: 'individual' | 'organization' | 'hospital' | 'carehome') => void;
  handleClientCategoryChange?: (category: ClientCategory) => void;
  handleSameAddressToggle: (checked: boolean) => void;
  handleSubmit: (e?: React.FormEvent) => Promise<void>;
  showCategories?: boolean;
  submitButtonText?: string;
}

export const ClientFormComponent: React.FC<ClientFormComponentProps> = ({
  formData,
  formErrors,
  clientType,
  isSubmitting,
  isSameAddress,
  handleInputChange,
  handleBlur,
  handleProfileImageChange,
  handleStaffRequirementsChange,
  handleClientTypeChange,
  handleClientCategoryChange,
  handleSameAddressToggle,
  handleSubmit,
  showCategories = false,
  submitButtonText = 'Submit Registration'
}) => {
  return (
    <form onSubmit={(e) => handleSubmit(e)} className="p-6">
      {showCategories && handleClientCategoryChange && (
        <div className="mb-6">
          <ClientCategorySelector 
            selectedCategory={formData.clientCategory} 
            onCategoryChange={handleClientCategoryChange} 
          />
        </div>
      )}

      {/* Client Type Selection */}
      <ClientTypeSelector 
        clientType={clientType} 
        onClientTypeChange={handleClientTypeChange} 
      />

      {/* Conditional Form Fields */}
      {clientType === 'individual' ? (
        <>
          {/* Requestor Information */}
          <RequestorInfoForm 
            formData={formData} 
            formErrors={formErrors}
            handleInputChange={handleInputChange}
            handleBlur={handleBlur}
            handleProfileImageChange={handleProfileImageChange}
          />
          
          {/* Patient Information */}
          <PatientInfoForm 
            formData={formData}
            formErrors={formErrors} 
            handleBlur={handleBlur}
            handleInputChange={handleInputChange} 
            handleProfileImageChange={handleProfileImageChange} 
            handleSameAddressToggle={handleSameAddressToggle}
            isSameAddress={isSameAddress} 
          />
        </>
      ) : (
        <OrganizationInfoForm 
          formData={formData}
          formErrors={formErrors} 
          handleBlur={handleBlur} 
          handleInputChange={handleInputChange} 
        />
      )}

      {/* Care Requirements */}
      {clientType === 'individual' ? (
        <div className="mb-8 border-b border-gray-200 pb-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Care Requirements</h2>
          
          <IndividualCareRequirements 
            formData={formData}
            formErrors={formErrors} 
            handleBlur={handleBlur}  
            handleInputChange={handleInputChange} 
          />
        </div>
      ) : (
        <div className="mb-8 border-b border-gray-200 pb-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Staff Requirements</h2>
          
          <div className="mb-6">
            <DutyPeriodSelector
              dutyPeriod={formData.dutyPeriod}
              dutyPeriodReason={formData.dutyPeriodReason}
              formErrors={formErrors}
              handleInputChange={handleInputChange}
              handleBlur={handleBlur}
            />
          </div>
          
          <StaffRequirements 
            clientType={clientType}
            formData={{
              staffRequirements: formData.staffRequirements,
              staffReqStartDate: formData.staffReqStartDate
            }}
            onChange={handleStaffRequirementsChange}
          />
        </div>
      )}

      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="generalNotes">
          Additional Requirements
        </label>
        <textarea 
          id="generalNotes" 
          value={formData.generalNotes} 
          onChange={handleInputChange} 
          className="w-full border border-gray-300 rounded-md py-2 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent h-24"
          placeholder="Additional staffing requirements, qualifications needed, or other specifications"
        ></textarea>
      </div>

      {/* Form Actions */}
      <div className="mt-8 flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2 bg-blue-600 text-white rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 font-medium"
        >
          {isSubmitting ? 'Submitting...' : submitButtonText}
        </button>
      </div>
    </form>
  );
};