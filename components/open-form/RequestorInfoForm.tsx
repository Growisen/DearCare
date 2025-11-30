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
  serviceType?: string; 
}

export const RequestorInfoForm = ({ 
  formData, 
  handleInputChange, 
  handleProfileImageChange, 
  formErrors, 
  handleBlur,
  serviceType 
}: RequestorInfoFormProps) => {

  const calculateAge = (dob?: string) => {
    if (!dob) return '';
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age >= 0 ? age : '';
  };

  const baseInputStyles = `
    w-full border border-gray-200 bg-white rounded-sm py-2 px-3 text-sm text-gray-800 
    placeholder:text-gray-400
    focus:border-gray-400 focus:outline-none focus:ring-0 
    transition-colors duration-200
  `;
  
  const errorInputStyles = "border-red-400 bg-red-50 text-red-900 focus:border-red-500";
  const labelStyles = "block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5";
  const errorTextStyles = "mt-1 text-xs text-red-500";

  return (
    <div className="mb-8 border-b border-gray-100 pb-8">
      <h2 className="text-base font-semibold text-gray-800 mb-6">Requestor Information</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-12 gap-x-6 gap-y-5">

        <div className="md:col-span-12">
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
        </div>

        <div className="md:col-span-6 grid grid-cols-12 gap-4">
          <div className="col-span-8 sm:col-span-9">
            <label className={labelStyles} htmlFor="requestorDOB">
              Date of Birth
            </label>
            <input
              type="date"
              id="requestorDOB"
              value={formData.requestorDOB || ''}
              onChange={handleInputChange}
              onBlur={() => handleBlur('requestorDOB')}
              className={`${baseInputStyles} ${formErrors.requestorDOB ? errorInputStyles : ''}`}
            />
            {formErrors.requestorDOB && (
              <p className={errorTextStyles}>{formErrors.requestorDOB}</p>
            )}
          </div>
          
          <div className="col-span-4 sm:col-span-3">
            <label className={labelStyles} htmlFor="requestorAgeDisplay">
              Age
            </label>
            <div
              id="requestorAgeDisplay"
              className="w-full border border-gray-100 bg-gray-50 rounded-sm py-2 px-2 text-sm text-gray-600 text-center select-none truncate"
            >
              {calculateAge(formData.requestorDOB) || '-'} <span className="text-xs">yrs</span>
            </div>
          </div>
        </div>

        <div className="md:col-span-6">
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
        </div>

        <div className="md:col-span-12">
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
        </div>
        
        {serviceType !== 'home_maid' && (
          <div className="md:col-span-12">
            <label className={labelStyles} htmlFor="relationToPatient">
              Relation
            </label>
            <select 
              id="relationToPatient" 
              value={formData.relationToPatient} 
              onChange={handleInputChange}
              onBlur={() => handleBlur('relationToPatient')} 
              className={`${baseInputStyles} ${formErrors.relationToPatient ? errorInputStyles : ''} appearance-none`}
              style={{ backgroundImage: 'none' }}
            >
              {relationOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {formErrors.relationToPatient && (
              <p className={errorTextStyles}>{formErrors.relationToPatient}</p>
            )}
          </div>
        )}

        <div className="md:col-span-12">
          <InputField 
            label="Your Address" 
            placeholder="House/Flat No, Street" 
            id="requestorAddress" 
            value={formData.requestorAddress} 
            onChange={handleInputChange}
            onBlur={() => handleBlur('requestorAddress')}
            error={formErrors.requestorAddress}
            required
          />
        </div>

        <div className="md:col-span-3">
          <InputField 
            label="State" 
            placeholder="State" 
            id="requestorState" 
            value={formData.requestorState} 
            onChange={handleInputChange}
            onBlur={() => handleBlur('requestorState')}
            error={formErrors.requestorState}
            required
          />
        </div>

        <div className="md:col-span-3">
          <InputField 
            label="District" 
            placeholder="District" 
            id="requestorDistrict" 
            value={formData.requestorDistrict} 
            onChange={handleInputChange}
            onBlur={() => handleBlur('requestorDistrict')}
            error={formErrors.requestorDistrict}
            required
          />
        </div>

        <div className="md:col-span-3">
          <InputField 
            label="City" 
            placeholder="City" 
            id="requestorCity" 
            value={formData.requestorCity} 
            onChange={handleInputChange}
            onBlur={() => handleBlur('requestorCity')}
            error={formErrors.requestorCity}
            required
          />
        </div>

        <div className="md:col-span-3">
          <InputField 
            label="Pincode" 
            placeholder="Pincode" 
            id="requestorPincode" 
            value={formData.requestorPincode} 
            onChange={handleInputChange}
            onBlur={() => handleBlur('requestorPincode')}
            error={formErrors.requestorPincode}
            required
          />
        </div>

        <div className="md:col-span-6">
          <InputField 
            label="Job Details" 
            placeholder="Occupation / Job" 
            id="requestorJobDetails" 
            value={formData.requestorJobDetails} 
            onChange={handleInputChange}
            onBlur={() => handleBlur('requestorJobDetails')}
            error={formErrors.requestorJobDetails}
          />
        </div>

        <div className="md:col-span-6">
          <InputField 
            label="Emergency Contact" 
            type="tel" 
            placeholder="Phone number" 
            id="requestorEmergencyPhone" 
            value={formData.requestorEmergencyPhone} 
            onChange={handleInputChange}
            onBlur={() => handleBlur('requestorEmergencyPhone')}
            error={formErrors.requestorEmergencyPhone}
          />
        </div>
      
        <div className="md:col-span-12 mt-2">
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