import React from 'react';
import { InputField } from './InputField';

interface IndividualCareRequirementsProps {
  formData: {
    serviceRequired: string;
    careDuration: string;
    startDate: string;
    preferredCaregiverGender: string;
  };
  formErrors: {
    [key: string]: string;
  };
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleBlur: (id: string) => void;
}

export const IndividualCareRequirements = ({ 
  formData, 
  formErrors, 
  handleInputChange, 
  handleBlur 
}: IndividualCareRequirementsProps) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Service Required</label>
        <select 
          id="serviceRequired" 
          value={formData.serviceRequired} 
          onChange={handleInputChange}
          onBlur={() => handleBlur("serviceRequired")}
          className={`w-full rounded-lg border ${formErrors.serviceRequired ? 'border-red-500' : 'border-gray-200'} py-2 px-3 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
        >
          <option value="">Select service...</option>
          <option value="home_care">Home Care</option>
          <option value="elder_care">Elder Care</option>
          <option value="post_surgery">Post-Surgery Care</option>
          <option value="physiotherapy">Physiotherapy</option>
          <option value="palliative">Palliative Care</option>
          <option value="disability">Disability Care</option>
        </select>
        {formErrors.serviceRequired && (
          <p className="mt-1 text-sm text-red-600">{formErrors.serviceRequired}</p>
        )}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Care Duration</label>
        <select 
          id="careDuration" 
          value={formData.careDuration} 
          onChange={handleInputChange}
          onBlur={() => handleBlur("careDuration")}
          className={`w-full rounded-lg border ${formErrors.careDuration ? 'border-red-500' : 'border-gray-200'} py-2 px-3 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
        >
          <option value="">Select duration...</option>
          <option value="24_7">24/7 Care</option>
          <option value="12_hours">12 Hour Shift</option>
          <option value="day">Day Care</option>
          <option value="night">Night Care</option>
          <option value="weekly">Weekly Visits</option>
        </select>
        {formErrors.careDuration && (
          <p className="mt-1 text-sm text-red-600">{formErrors.careDuration}</p>
        )}
      </div>
      <InputField 
        label="Start Date" 
        type="date" 
        placeholder="Select start date" 
        id="startDate" 
        value={formData.startDate} 
        onChange={handleInputChange} 
        onBlur={() => handleBlur("startDate")}
        error={formErrors.startDate}
        required={true}
      />
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Caregiver Gender</label>
        <select 
          id="preferredCaregiverGender" 
          value={formData.preferredCaregiverGender} 
          onChange={handleInputChange}
          onBlur={() => handleBlur("preferredCaregiverGender")}
          className={`w-full rounded-lg border ${formErrors.preferredCaregiverGender ? 'border-red-500' : 'border-gray-200'} py-2 px-3 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
        >
          <option value="">Select preference...</option>
          <option value="female">Female</option>
          <option value="male">Male</option>
          <option value="any">No Preference</option>
        </select>
        {formErrors.preferredCaregiverGender && (
          <p className="mt-1 text-sm text-red-600">{formErrors.preferredCaregiverGender}</p>
        )}
      </div>
    </div>
  );
};