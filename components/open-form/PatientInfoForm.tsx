import React, { useState, useEffect } from 'react';
import InputField from '@/components/open-form/InputField';
import ProfileImageUpload from '@/components/open-form/ProfileImageUpload';
import { FormData } from '@/types/client.types';

interface PatientInfoFormProps {
  formData: FormData;
  formErrors: {
    [key: string]: string;
  };
  isSameAddress: boolean;
  isBabyCare?: boolean;
  handleBlur: (id: string) => void;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleProfileImageChange: (field: 'requestorProfilePic' | 'patientProfilePic', file: File | null) => void;
  handleSameAddressToggle: (checked: boolean) => void;
  clearError?: (fieldName: string) => void;
}

export const PatientInfoForm = ({ 
  formData, 
  handleInputChange, 
  handleProfileImageChange, 
  formErrors, 
  handleBlur, 
  handleSameAddressToggle, 
  isSameAddress, 
  isBabyCare = false,
  clearError
}: PatientInfoFormProps) => {
  const [isLessThanOneYear, setIsLessThanOneYear] = useState(false);
  
  useEffect(() => {
    if (!isBabyCare) {
      setIsLessThanOneYear(false);
    }
  }, [isBabyCare]);

  const handleAgeChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (isLessThanOneYear && e.target.id === 'patientAge') {
      const monthValue = parseInt(e.target.value);
      if (!isNaN(monthValue)) {
        const formattedEvent = {
          target: {
            id: 'patientAge',
            value: `${monthValue} ${monthValue === 1 ? 'month' : 'months'}`
          }
        } as React.ChangeEvent<HTMLSelectElement>;
        handleInputChange(formattedEvent);
      } else {
        handleInputChange(e);
      }
    } else {
      handleInputChange(e);
    }
  };

  const handleLessThanOneYear = () => {
    setIsLessThanOneYear(true);
    if (clearError && formErrors.patientAge) {
      clearError('patientAge');
    }
    const resetEvent = {
      target: {
        id: 'patientAge',
        value: ''
      }
    } as React.ChangeEvent<HTMLSelectElement>;
    handleInputChange(resetEvent);
  };

  const handleOneYearOrOlder = () => {
    setIsLessThanOneYear(false);
    if (clearError && formErrors.patientAge) {
      clearError('patientAge');
    }
    const resetEvent = {
      target: {
        id: 'patientAge',
        value: ''
      }
    } as React.ChangeEvent<HTMLInputElement>;
    handleInputChange(resetEvent);
  };

  const getSelectedMonth = () => {
    if (formData.patientAge && typeof formData.patientAge === 'string') {
      const match = formData.patientAge.match(/^(\d+)/);
      if (match) {
        return match[1];
      }
    }
    return formData.patientAge || '';
  };

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
      <h2 className="text-base font-semibold text-gray-800 mb-6">Patient Information</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-12 gap-x-6 gap-y-5">
        <div className="md:col-span-12">
          <InputField 
            label="Patient's Full Name" 
            placeholder="Enter patient's name" 
            id="patientName" 
            value={formData.patientName} 
            onChange={handleInputChange}
            onBlur={() => handleBlur('patientName')}
            error={formErrors.patientName}
          />
        </div>

        <div className="md:col-span-8 grid grid-cols-12 gap-4">
          <div className="col-span-8 sm:col-span-9">
            <label className={labelStyles} htmlFor="patientDob">
              Date of Birth
            </label>
            <input
              type="date"
              id="patientDOB"
              value={formData.patientDOB || ''}
              onChange={handleInputChange}
              onBlur={() => handleBlur('patientDOB')}
              className={`${baseInputStyles} ${formErrors.patientDob ? errorInputStyles : ''}`}
            />
            {formErrors.patientDob && (
              <p className={errorTextStyles}>{formErrors.patientDob}</p>
            )}
          </div>
          
          <div className="col-span-4 sm:col-span-3">
            <label className={labelStyles} htmlFor="patientAgeDisplay">
              Age
            </label>
            <div
              id="patientAgeDisplay"
              className="w-full border border-gray-100 bg-gray-50 rounded-sm py-2 px-2 text-sm text-gray-600 text-center select-none truncate"
            >
              {calculateAge(formData.patientDOB) || '-'} <span className="text-xs">yrs</span>
            </div>
          </div>
        </div>

        <div className="md:col-span-4">
          <label className={labelStyles} htmlFor="patientGender">
            Gender
          </label>
          <select 
            id="patientGender" 
            value={formData.patientGender} 
            onChange={handleInputChange} 
            onBlur={() => handleBlur('patientGender')}
            className={`${baseInputStyles} ${formErrors.patientGender ? errorInputStyles : ''} appearance-none`}
            style={{ backgroundImage: 'none' }}
          >
            <option value="">Select...</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
          {formErrors.patientGender && (
            <p className={errorTextStyles}>{formErrors.patientGender}</p>
          )}
        </div>

        {isBabyCare && (
          <div className="md:col-span-12 bg-gray-50 p-4 rounded-sm border border-gray-100">
            <label className={labelStyles}>
              Baby&apos;s Age Group
            </label>
            <div className="flex gap-6 mb-4">
              <label className="inline-flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="ageGroup"
                  checked={isLessThanOneYear}
                  onChange={handleLessThanOneYear}
                  className="h-4 w-4 text-gray-700 border-gray-300 focus:ring-0 focus:ring-offset-0"
                />
                <span className="ml-2 text-sm text-gray-700">Less than 1 year</span>
              </label>
              <label className="inline-flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="ageGroup"
                  checked={!isLessThanOneYear}
                  onChange={handleOneYearOrOlder}
                  className="h-4 w-4 text-gray-700 border-gray-300 focus:ring-0 focus:ring-offset-0"
                />
                <span className="ml-2 text-sm text-gray-700">1 year or older</span>
              </label>
            </div>
            
            {isLessThanOneYear ? (
              <div className="max-w-xs">
                <label className={labelStyles} htmlFor="patientAge">
                  Baby&apos;s Age (Months)
                </label>
                <select
                  id="patientAge"
                  value={getSelectedMonth()}
                  onChange={handleAgeChange}
                  onBlur={() => handleBlur('patientAge')}
                  className={`${baseInputStyles} ${formErrors.patientAge ? errorInputStyles : ''}`}
                >
                  <option value="">Select month...</option>
                  {[...Array(12)].map((_, i) => (
                    <option key={i} value={i + 1}>
                      {i + 1} {i === 0 ? 'month' : 'months'}
                    </option>
                  ))}
                </select>
                {formErrors.patientAge && (
                  <p className={errorTextStyles}>{formErrors.patientAge}</p>
                )}
              </div>
            ) : (
              <div className="max-w-xs">
                <InputField 
                  label="Baby's Age (Years)" 
                  type="number" 
                  placeholder="Age" 
                  id="patientAge" 
                  value={formData.patientAge ?? ''} 
                  min={1}
                  onChange={handleInputChange}
                  onBlur={() => handleBlur('patientAge')}
                  error={formErrors.patientAge}
                />
              </div>
            )}
          </div>
        )}

        <div className="md:col-span-6">
          <InputField 
            label="Phone Number" 
            type="tel" 
            placeholder="Enter phone number" 
            id="patientPhone" 
            value={formData.patientPhone} 
            onChange={handleInputChange}
            onBlur={() => handleBlur('patientPhone')}
            error={formErrors.patientPhone}
          />
        </div>

        <div className="md:col-span-12 pt-2">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="sameAsRequestor"
              checked={isSameAddress}
              onChange={(e) => handleSameAddressToggle(e.target.checked)}
              className="h-3.5 w-3.5 rounded border-gray-300 text-gray-700 focus:ring-0 focus:ring-offset-0 cursor-pointer"
            />
            <label htmlFor="sameAsRequestor" className="ml-2 block text-sm text-gray-600 cursor-pointer select-none">
              Patient address is same as requestor&apos;s address
            </label>
          </div>
        </div>

        <div className="md:col-span-12">
          <InputField 
            label="Address Line"
            placeholder="House/Flat No, Street" 
            id="patientAddress" 
            value={formData.patientAddress} 
            onChange={handleInputChange}
            onBlur={() => handleBlur('patientAddress')}
            error={formErrors.patientAddress}
          />
        </div>

        <div className="md:col-span-3">
          <InputField 
            label="State" 
            placeholder="State" 
            id="patientState" 
            value={formData.patientState} 
            onChange={handleInputChange}
            onBlur={() => handleBlur('patientState')}
            error={formErrors.patientState}
          />
        </div>
        
        <div className="md:col-span-3">
          <InputField 
            label="District" 
            placeholder="District" 
            id="patientDistrict" 
            value={formData.patientDistrict} 
            onChange={handleInputChange}
            onBlur={() => handleBlur('patientDistrict')}
            error={formErrors.patientDistrict}
          />
        </div>

        <div className="md:col-span-3">
          <InputField 
            label="City" 
            placeholder="City" 
            id="patientCity" 
            value={formData.patientCity} 
            onChange={handleInputChange}
            onBlur={() => handleBlur('patientCity')}
            error={formErrors.patientCity}
          />
        </div>

        <div className="md:col-span-3">
          <InputField 
            label="Pincode" 
            placeholder="Pincode" 
            id="patientPincode" 
            value={formData.patientPincode} 
            onChange={handleInputChange}
            onBlur={() => handleBlur('patientPincode')}
            error={formErrors.patientPincode}
          />
        </div>
        
        <div className="md:col-span-12 mt-2">
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