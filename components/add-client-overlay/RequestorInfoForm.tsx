import React from 'react';
import { InputField } from './InputField';

interface RequestorInfoFormProps {
  formData: {
    requestorName: string;
    requestorPhone: string;
    requestorEmail: string;
    relationToPatient: string;
  };
  formErrors: {
    [key: string]: string;
  };
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleBlur: (id: string) => void;
}

export const RequestorInfoForm = ({ 
  formData, 
  formErrors, 
  handleInputChange, 
  handleBlur 
}: RequestorInfoFormProps) => {
  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-3">Requestor Information</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <InputField 
          label="Your Full Name" 
          placeholder="Enter your name" 
          id="requestorName" 
          value={formData.requestorName} 
          onChange={handleInputChange}
          onBlur={() => handleBlur("requestorName")}
          error={formErrors.requestorName}
          required={true}
        />
        <InputField 
          label="Your Phone Number" 
          type="tel" 
          placeholder="Enter your phone number" 
          id="requestorPhone" 
          value={formData.requestorPhone} 
          onChange={handleInputChange} 
          onBlur={() => handleBlur("requestorPhone")}
          error={formErrors.requestorPhone}
          required={true}
        />
        <InputField 
          label="Your Email Address" 
          type="email" 
          placeholder="Enter your email address" 
          id="requestorEmail" 
          value={formData.requestorEmail} 
          onChange={handleInputChange} 
          onBlur={() => handleBlur("requestorEmail")}
          error={formErrors.requestorEmail}
          required={true}
        />
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Relation to Patient<span className="text-red-500 ml-1">*</span>
          </label>
          <select 
            id="relationToPatient" 
            value={formData.relationToPatient} 
            onChange={handleInputChange}
            onBlur={() => handleBlur("relationToPatient")}
            className={`w-full rounded-lg border ${formErrors.relationToPatient ? 'border-red-500' : 'border-gray-200'} py-2 px-3 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
          >
            <option value="">Select relation...</option>
            <option value="self">Self</option>
            <option value="spouse">Spouse</option>
            <option value="child">Son/Daughter</option>
            <option value="parent">Parent</option>
            <option value="sibling">Sibling</option>
            <option value="other">Other</option>
          </select>
          {formErrors.relationToPatient && (
            <p className="mt-1 text-sm text-red-600">{formErrors.relationToPatient}</p>
          )}
        </div>
      </div>
    </div>
  );
};