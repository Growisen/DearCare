import React from 'react';
import InputField from '@/components/open-form/InputField';
import { FormData } from '@/types/client.types';

interface OrganizationInfoFormProps {
  formData: FormData;
  formErrors: {
    [key: string]: string;
  };
  handleBlur: (id: string) => void;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
}

export const OrganizationInfoForm = ({ formData, handleInputChange, formErrors, handleBlur }: OrganizationInfoFormProps) => {
  return (
    <div className="mb-8 border-b border-gray-200 pb-6">
      <h2 className="text-lg font-medium text-gray-900 mb-4">Organization Details</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InputField 
          label="Organization Name" 
          placeholder="Enter organization name" 
          id="organizationName" 
          value={formData.organizationName} 
          onChange={handleInputChange}
          onBlur={() => handleBlur('organizationName')}
          error={formErrors.organizationName}
          required
        />
        <InputField 
          label="Contact Person Name" 
          placeholder="Enter contact person name" 
          id="contactPersonName" 
          value={formData.contactPersonName} 
          onChange={handleInputChange}
          onBlur={() => handleBlur('contactPersonName')}
          error={formErrors.contactPersonName}
          required
        />
        <InputField 
          label="Contact Person Role" 
          placeholder="Enter role/designation" 
          id="contactPersonRole" 
          value={formData.contactPersonRole} 
          onChange={handleInputChange}
          onBlur={() => handleBlur('contactPersonRole')}
          error={formErrors.contactPersonRole}
        />
        <InputField 
          label="Contact Phone" 
          type="tel"
          placeholder="Enter contact phone" 
          id="contactPhone" 
          value={formData.contactPhone} 
          onChange={handleInputChange}
          onBlur={() => handleBlur('contactPhone')}
          error={formErrors.contactPhone}
          required
        />
        <InputField 
          label="Contact Email" 
          type="email"
          placeholder="Enter contact email" 
          id="contactEmail" 
          value={formData.contactEmail} 
          onChange={handleInputChange}
          onBlur={() => handleBlur('contactEmail')}
          error={formErrors.contactEmail}
          required
        />
        <div className="md:col-span-2">
          <InputField 
            label="Organization Address" 
            placeholder="Enter complete address" 
            id="organizationAddress" 
            value={formData.organizationAddress} 
            onChange={handleInputChange}
            onBlur={() => handleBlur('organizationAddress')}
            error={formErrors.organizationAddress}
            required
          />
        </div>
      </div>
    </div>
  );
};