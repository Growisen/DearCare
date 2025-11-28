import React from 'react';
import InputField from '@/components/open-form/InputField';
import { DutyPeriodSelector } from '@/components/add-client-overlay/DutyPeriodSelector';
import { FormData } from '@/types/client.types';
import { serviceOptions } from '@/utils/constants';

interface IndividualCareRequirementsProps {
  formData: FormData;
  formErrors: {
    [key: string]: string;
  };
  handleBlur: (id: string) => void;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
}

export const IndividualCareRequirements = ({ formData, handleInputChange, formErrors, handleBlur }: IndividualCareRequirementsProps) => {
  const baseInputStyles = `
    w-full border border-gray-200 bg-white rounded-sm py-2 px-3 text-sm text-gray-800 
    placeholder:text-gray-400
    focus:border-gray-400 focus:outline-none focus:ring-0 
    transition-colors duration-200
  `;
  
  const labelStyles = "block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5";

  return (
    <div className="mb-8 border-b border-gray-100 pb-8">
      <h2 className="text-base font-semibold text-gray-800 mb-6">Care Requirements</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-12 gap-x-6 gap-y-5">

        <div className="md:col-span-12">
          <DutyPeriodSelector
            dutyPeriod={formData.dutyPeriod}
            dutyPeriodReason={formData.dutyPeriodReason}
            formErrors={{}}
            handleInputChange={handleInputChange}
            handleBlur={() => {}} 
          />
        </div>

        <div className="md:col-span-6">
          <label className={labelStyles} htmlFor="serviceRequired">
            Service Required <span className="text-red-500">*</span>
          </label>
          <select 
            id="serviceRequired" 
            value={formData.serviceRequired} 
            onChange={handleInputChange} 
            className={`${baseInputStyles} appearance-none`}
            style={{ backgroundImage: 'none' }}
            required
          >
            {serviceOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="md:col-span-3">
          <InputField 
            label="Expected Start Date"
            type="date" 
            placeholder="Select start date" 
            id="startDate" 
            value={formData.startDate} 
            onChange={handleInputChange}
            min={new Date(Date.now() - 86400000).toISOString().split('T')[0]}
            onBlur={() => handleBlur('startDate')}
            error={formErrors.startDate}
            required
          />
        </div>

        <div className="md:col-span-3">
          <label className={labelStyles} htmlFor="preferredCaregiverGender">
            Caregiver Gender
          </label>
          <select 
            id="preferredCaregiverGender" 
            value={formData.preferredCaregiverGender} 
            onChange={handleInputChange} 
            className={`${baseInputStyles} appearance-none`}
            style={{ backgroundImage: 'none' }}
          >
            <option value="">No Preference</option>
            <option value="female">Female</option>
            <option value="male">Male</option>
            <option value="any">Any</option>
          </select>
        </div>

        {/* Commented out Care Duration preserved as requested */}
        {/* <div className="md:col-span-6">
          <label className={labelStyles} htmlFor="careDuration">
            Care Duration <span className="text-red-500">*</span>
          </label>
          <select 
            id="careDuration" 
            value={formData.careDuration} 
            onChange={handleInputChange} 
            className={baseInputStyles}
            required
          >
            <option value="">Select duration...</option>
            <option value="24_7">24/7 Care</option>
            <option value="12_hours">12 Hour Shift</option>
            <option value="day">Day Care</option>
            <option value="night">Night Care</option>
            <option value="weekly">Weekly Visits</option>
          </select>
        </div> 
        */}

      </div>
    </div>
  );
};