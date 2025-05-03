import React from 'react';
import { InputField } from './InputField';

interface PatientInfoFormProps {
  formData: {
    patientName: string;
    patientAge: string;
    patientGender: string;
    patientPhone: string;
    completeAddress: string;
  };
  formErrors: {
    [key: string]: string;
  };
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleBlur: (id: string) => void;
}

export const PatientInfoForm = ({ 
  formData, 
  formErrors, 
  handleInputChange, 
  handleBlur 
}: PatientInfoFormProps) => {
  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-3">Patient Information</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <InputField 
          label="Patient's Full Name" 
          placeholder="Enter patient's name" 
          id="patientName" 
          value={formData.patientName} 
          onChange={handleInputChange} 
          onBlur={() => handleBlur("patientName")}
          error={formErrors.patientName}
          required={true}
        />
        <InputField 
          label="Patient's Age" 
          type="number" 
          placeholder="Enter patient's age" 
          id="patientAge" 
          value={formData.patientAge} 
          onChange={handleInputChange} 
          onBlur={() => handleBlur("patientAge")}
          error={formErrors.patientAge}
          required={true}
        />
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Patient&apos;s Gender<span className="text-red-500 ml-1">*</span>
          </label>
          <select 
            id="patientGender" 
            value={formData.patientGender} 
            onChange={handleInputChange}
            onBlur={() => handleBlur("patientGender")}
            className={`w-full rounded-lg border ${formErrors.patientGender ? 'border-red-500' : 'border-gray-200'} py-2 px-3 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
          >
            <option value="">Select gender...</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
          {formErrors.patientGender && (
            <p className="mt-1 text-sm text-red-600">{formErrors.patientGender}</p>
          )}
        </div>
        <InputField 
          label="Patient's Phone Number" 
          type="tel" 
          placeholder="Enter patient's phone number" 
          id="patientPhone" 
          value={formData.patientPhone} 
          onChange={handleInputChange} 
          onBlur={() => handleBlur("patientPhone")}
          error={formErrors.patientPhone}
          required={false}
        />
        <div className="sm:col-span-2">
          <InputField 
            label="Complete Address" 
            placeholder="Enter patient's complete address" 
            id="completeAddress" 
            value={formData.completeAddress} 
            onChange={handleInputChange} 
            onBlur={() => handleBlur("completeAddress")}
            error={formErrors.completeAddress}
            required={true}
          />
        </div>
      </div>
    </div>
  );
};