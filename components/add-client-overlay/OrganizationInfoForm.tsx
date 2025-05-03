import React from 'react';
import { InputField } from './InputField';

interface OrganizationInfoFormProps {
  formData: {
    organizationName: string;
    organizationType: string;
    contactPersonName: string;
    contactPersonRole: string;
    contactPhone: string;
    contactEmail: string;
    organizationAddress: string;
  };
  formErrors: {
    [key: string]: string;
  };
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleBlur: (id: string) => void;
}

export const OrganizationInfoForm = ({ 
  formData, 
  formErrors, 
  handleInputChange, 
  handleBlur 
}: OrganizationInfoFormProps) => {
  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-3">Organization Details</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <InputField 
          label="Organization Name" 
          placeholder="Enter organization name" 
          id="organizationName" 
          value={formData.organizationName} 
          onChange={handleInputChange} 
          onBlur={() => handleBlur("organizationName")}
          error={formErrors.organizationName}
          required={true}
        />
        <InputField 
          label="Contact Person Name" 
          placeholder="Enter contact person name" 
          id="contactPersonName" 
          value={formData.contactPersonName} 
          onChange={handleInputChange} 
          onBlur={() => handleBlur("contactPersonName")}
          error={formErrors.contactPersonName}
          required={true}
        />
        <InputField 
          label="Contact Person Role" 
          placeholder="Enter role/designation" 
          id="contactPersonRole" 
          value={formData.contactPersonRole} 
          onChange={handleInputChange} 
          onBlur={() => handleBlur("contactPersonRole")}
          error={formErrors.contactPersonRole}
          required={true}
        />
        <InputField 
          label="Contact Phone" 
          type="tel"
          placeholder="Enter contact phone" 
          id="contactPhone" 
          value={formData.contactPhone} 
          onChange={handleInputChange} 
          onBlur={() => handleBlur("contactPhone")}
          error={formErrors.contactPhone}
          required={true}
        />
        <InputField 
          label="Contact Email" 
          type="email"
          placeholder="Enter contact email" 
          id="contactEmail" 
          value={formData.contactEmail} 
          onChange={handleInputChange} 
          onBlur={() => handleBlur("contactEmail")}
          error={formErrors.contactEmail}
          required={true}
        />
        <div className="sm:col-span-2">
          <InputField 
            label="Organization Address" 
            placeholder="Enter complete address" 
            id="organizationAddress" 
            value={formData.organizationAddress} 
            onChange={handleInputChange} 
            onBlur={() => handleBlur("organizationAddress")}
            error={formErrors.organizationAddress}
            required={true}
          />
        </div>
      </div>
    </div>
  );
};