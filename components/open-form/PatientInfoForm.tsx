import React from 'react';
import InputField from '@/components/open-form/InputField';
import ProfileImageUpload from '@/components/open-form/ProfileImageUpload';
import { FormData } from '@/types/client.types';

interface PatientInfoFormProps {
  formData: FormData;
  formErrors: {
    [key: string]: string;
  };
  isSameAddress: boolean;
  handleBlur: (id: string) => void;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleProfileImageChange: (field: 'requestorProfilePic' | 'patientProfilePic', file: File | null) => void;
  handleSameAddressToggle: (checked: boolean) => void;
}

export const PatientInfoForm = ({ formData, handleInputChange, handleProfileImageChange, formErrors, handleBlur, handleSameAddressToggle, isSameAddress }: PatientInfoFormProps) => {
  return (
    <div className="mb-8 border-b border-gray-200 pb-6">
      <h2 className="text-lg font-medium text-gray-900 mb-4">Patient Information</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InputField 
          label="Patient's Full Name" 
          placeholder="Enter patient's name" 
          id="patientName" 
          value={formData.patientName} 
          onChange={handleInputChange}
          onBlur={() => handleBlur('patientName')}
          error={formErrors.patientName}
        />
        <InputField 
          label="Patient's Age" 
          type="number" 
          placeholder="Enter patient's age" 
          id="patientAge" 
          value={formData.patientAge} 
          onChange={handleInputChange}
          onBlur={() => handleBlur('patientAge')}
          error={formErrors.patientAge}
        />
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="patientGender">
            Patient&apos;s Gender
          </label>
          <select 
            id="patientGender" 
            value={formData.patientGender} 
            onChange={handleInputChange} 
            onBlur={() => handleBlur('patientGender')}
            className={`w-full border ${formErrors.patientGender ? 'border-red-500' : 'border-gray-300'} rounded-md py-2 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
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
          onBlur={() => handleBlur('patientPhone')}
          error={formErrors.patientPhone}
        />

        <div className="md:col-span-2 mb-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="sameAsRequestor"
              checked={isSameAddress}
              onChange={(e) => handleSameAddressToggle(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="sameAsRequestor" className="ml-2 block text-sm text-gray-700">
              Patient address is same as requestor&apos;s address
            </label>
          </div>
        </div>

        <InputField 
          label="Patient's Address"
          placeholder="Enter patient's address" 
          id="patientAddress" 
          value={formData.patientAddress} 
          onChange={handleInputChange}
          onBlur={() => handleBlur('patientAddress')}
          error={formErrors.patientAddress}
        />
        
        <InputField 
          label="Pincode" 
          placeholder="Enter patient's pincode" 
          id="patientPincode" 
          value={formData.patientPincode} 
          onChange={handleInputChange}
          onBlur={() => handleBlur('patientPincode')}
          error={formErrors.patientPincode}
        />
        <InputField 
          label="City" 
          placeholder="Enter patient's city" 
          id="patientCity" 
          value={formData.patientCity} 
          onChange={handleInputChange}
          onBlur={() => handleBlur('patientCity')}
          error={formErrors.patientCity}
        />
        <InputField 
          label="District" 
          placeholder="Enter patient's district" 
          id="patientDistrict" 
          value={formData.patientDistrict} 
          onChange={handleInputChange}
          onBlur={() => handleBlur('patientDistrict')}
          error={formErrors.patientDistrict}
        />
        
        <div className="md:col-span-2">
          <ProfileImageUpload
            id="patientProfilePic"
            label="Patient's Profile Picture"
            value={formData.patientProfilePic}
            onChange={(file) => handleProfileImageChange('patientProfilePic', file)}
          />
        </div>
      </div>
    </div>
  );
};