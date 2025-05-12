import React from 'react';
import InputField from '@/components/open-form/InputField';
import ProfileImageUpload from '@/components/open-form/ProfileImageUpload';
import { FormData } from '@/types/client.types';
import { relationOptions } from '@/utils/constants';

interface RequestorInfoFormProps {
  formData: FormData;
  formErrors: {
    [key: string]: string;
  };
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleBlur: (id: string) => void;
  handleProfileImageChange: (field: 'requestorProfilePic' | 'patientProfilePic', file: File | null) => void;
}

export const RequestorInfoForm = ({ formData, handleInputChange, handleProfileImageChange, formErrors, handleBlur }: RequestorInfoFormProps) => {
  return (
    <div className="mb-8 border-b border-gray-200 pb-6">
      <h2 className="text-lg font-medium text-gray-900 mb-4">Requestor Information</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InputField 
          label="Your Full Name" 
          placeholder="Enter your name" 
          id="requestorName" 
          value={formData.requestorName} 
          onChange={handleInputChange}
          onBlur={() => handleBlur('requestorName')}
          error={formErrors.requestorName}
          required
        />
        <InputField 
          label="Your Phone Number" 
          type="tel" 
          placeholder="Enter your phone number" 
          id="requestorPhone" 
          value={formData.requestorPhone} 
          onChange={handleInputChange}
          onBlur={() => handleBlur('requestorPhone')}
          error={formErrors.requestorPhone}
          required
        />
        <InputField 
          label="Your Email Address" 
          type="email" 
          placeholder="Enter your email address" 
          id="requestorEmail" 
          value={formData.requestorEmail} 
          onChange={handleInputChange}
          onBlur={() => handleBlur('requestorEmail')}
          error={formErrors.requestorEmail}
          required
        />
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="relationToPatient">
            Relation to Patient <span className="text-red-500">*</span>
          </label>
          <select 
            id="relationToPatient" 
            value={formData.relationToPatient} 
            onChange={handleInputChange}
            onBlur={() => handleBlur('relationToPatient')} 
            className={`w-full border ${formErrors.relationToPatient ? 'border-red-500' : 'border-gray-300'} rounded-md py-2 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
            required
          >
            {relationOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {formErrors.relationToPatient && (
            <p className="mt-1 text-sm text-red-600">{formErrors.relationToPatient}</p>
          )}
        </div>
        
        <InputField 
          label="Your Address" 
          placeholder="Enter your address" 
          id="requestorAddress" 
          value={formData.requestorAddress} 
          onChange={handleInputChange}
          onBlur={() => handleBlur('requestorAddress')}
          error={formErrors.requestorAddress}
          required
        />
        <InputField 
          label="Pincode" 
          placeholder="Enter your pincode" 
          id="requestorPincode" 
          value={formData.requestorPincode} 
          onChange={handleInputChange}
          onBlur={() => handleBlur('requestorPincode')}
          error={formErrors.requestorPincode}
          required
        />
        <InputField 
          label="City" 
          placeholder="Enter your city" 
          id="requestorCity" 
          value={formData.requestorCity} 
          onChange={handleInputChange}
          onBlur={() => handleBlur('requestorCity')}
          error={formErrors.requestorCity}
          required
        />
        <InputField 
          label="District" 
          placeholder="Enter your district" 
          id="requestorDistrict" 
          value={formData.requestorDistrict} 
          onChange={handleInputChange}
          onBlur={() => handleBlur('requestorDistrict')}
          error={formErrors.requestorDistrict}
          required
        />
        <InputField 
          label="Job Details" 
          placeholder="Enter your occupation/job details" 
          id="requestorJobDetails" 
          value={formData.requestorJobDetails} 
          onChange={handleInputChange}
          onBlur={() => handleBlur('requestorJobDetails')}
          error={formErrors.requestorJobDetails}
        />
        <InputField 
          label="Emergency Contact" 
          type="tel" 
          placeholder="Enter emergency contact number" 
          id="requestorEmergencyPhone" 
          value={formData.requestorEmergencyPhone} 
          onChange={handleInputChange}
          onBlur={() => handleBlur('requestorEmergencyPhone')}
          error={formErrors.requestorEmergencyPhone}
        />
      
        <div className="md:col-span-2">
          <ProfileImageUpload
            id="requestorProfilePic"
            label="Your Profile Picture"
            value={formData.requestorProfilePic}
            onChange={(file) => handleProfileImageChange('requestorProfilePic', file)}
          />
        </div>
      </div>
    </div>
  );
};