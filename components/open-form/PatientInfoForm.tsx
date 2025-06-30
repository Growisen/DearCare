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
  clearError?: (fieldName: string) => void; // New prop for clearing errors
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
  // State to track if baby is less than 1 year old
  const [isLessThanOneYear, setIsLessThanOneYear] = useState(false);
  
  // Reset the less than one year state when care type changes
  useEffect(() => {
    if (!isBabyCare) {
      setIsLessThanOneYear(false);
    }
  }, [isBabyCare]);

  // Custom handler for age input changes
  const handleAgeChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (isLessThanOneYear && e.target.id === 'patientAge') {
      // Create a custom event with formatted month value
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
        // If value is not a number, pass the original event
        handleInputChange(e);
      }
    } else {
      // For other cases, pass through unchanged
      handleInputChange(e);
    }
  };

  // Handlers for age group toggle with error clearing
  const handleLessThanOneYear = () => {
    setIsLessThanOneYear(true);
    // Clear any existing age validation errors when changing age group
    if (clearError && formErrors.patientAge) {
      clearError('patientAge');
    }
    // Reset the age value when switching to months
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
    // Clear any existing age validation errors when changing age group
    if (clearError && formErrors.patientAge) {
      clearError('patientAge');
    }
    // Reset the age value when switching to years
    const resetEvent = {
      target: {
        id: 'patientAge',
        value: ''
      }
    } as React.ChangeEvent<HTMLInputElement>;
    handleInputChange(resetEvent);
  };
  
  // Extract numeric month value from formatted string for dropdown selection
  const getSelectedMonth = () => {
    if (formData.patientAge && typeof formData.patientAge === 'string') {
      const match = formData.patientAge.match(/^(\d+)/);
      if (match) {
        return match[1];
      }
    }
    return formData.patientAge || '';
  };

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
        
        {/* Age input with conditional rendering based on baby care and age group */}
        {isBabyCare && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Baby&apos;s Age Group
            </label>
            <div className="flex gap-4 mb-3">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="ageGroup"
                  checked={isLessThanOneYear}
                  onChange={handleLessThanOneYear}
                  className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Less than 1 year</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="ageGroup"
                  checked={!isLessThanOneYear}
                  onChange={handleOneYearOrOlder}
                  className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">1 year or older</span>
              </label>
            </div>
            
            {isLessThanOneYear ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="patientAge">
                  Baby&apos;s Age (in months)
                </label>
                <select
                  id="patientAge"
                  value={getSelectedMonth()} // Use extracted numeric month value
                  onChange={handleAgeChange}
                  onBlur={() => handleBlur('patientAge')}
                  className={`w-full border ${formErrors.patientAge ? 'border-red-500' : 'border-gray-300'} rounded-md py-2 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                >
                  <option value="">Select month...</option>
                  {[...Array(12)].map((_, i) => (
                    <option key={i} value={i + 1}>
                      {i + 1} {i === 0 ? 'month' : 'months'}
                    </option>
                  ))}
                </select>
                {formErrors.patientAge && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.patientAge}</p>
                )}
              </div>
            ) : (
              <InputField 
                label="Patient's Age (in years)" 
                type="number" 
                placeholder="Enter patient's age in years" 
                id="patientAge" 
                value={formData.patientAge} 
                min={1}
                onChange={handleInputChange}
                onBlur={() => handleBlur('patientAge')}
                error={formErrors.patientAge}
              />
            )}
          </div>
        )}
        
        {/* Show standard age input for non-baby care scenarios */}
        {!isBabyCare && (
          <InputField 
            label="Patient's Age (in years)" 
            type="number" 
            placeholder="Enter patient's age in years" 
            id="patientAge" 
            value={formData.patientAge} 
            min={1}
            onChange={handleInputChange}
            onBlur={() => handleBlur('patientAge')}
            error={formErrors.patientAge}
          />
        )}
        
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
          label="State" 
          placeholder="Enter patient's state" 
          id="patientState" 
          value={formData.patientState} 
          onChange={handleInputChange}
          onBlur={() => handleBlur('patientState')}
          error={formErrors.patientState}
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
          label="Pincode" 
          placeholder="Enter patient's pincode" 
          id="patientPincode" 
          value={formData.patientPincode} 
          onChange={handleInputChange}
          onBlur={() => handleBlur('patientPincode')}
          error={formErrors.patientPincode}
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