import React from 'react';
import InputField from '@/components/open-form/InputField';
import { DutyPeriodSelector } from '@/components/add-client-overlay/DutyPeriodSelector';
import { FormData } from '@/types/client.types';

interface IndividualCareRequirementsProps {
  formData: FormData;
  formErrors: {
    [key: string]: string;
  };
  handleBlur: (id: string) => void;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
}

export const IndividualCareRequirements = ({ formData, handleInputChange, formErrors, handleBlur }: IndividualCareRequirementsProps) => {
  const serviceOptions = [
    { value: '', label: 'Select service required' },
    { value: 'elderly_care', label: 'Elderly Care Service (M/F) 24/7' },
    { value: 'nursing_care', label: 'Nursing Care By Professional\'s With Critical Care' },
    { value: 'tracheostomy_care', label: 'Tracheostomy Care' },
    { value: 'home_nursing', label: 'Home Nursing Attendant' },
    { value: 'post_surgical', label: 'Post-Surgical Care' },
    { value: 'physiotherapy', label: 'Physiotherapy Care' },
    { value: 'palliative_care', label: 'Palliative Care' },
    { value: 'delivery_care', label: 'Delivery Care (New Born Care)' },
    { value: 'icu_setup', label: 'ICU Setup @ Home' },
    { value: 'hospital_bystander', label: 'Hospital Bystander Support' },
    { value: 'stay_home', label: 'Stay @Home 24 Hour' },
    { value: 'accident_support', label: 'Accidental Support' },
    { value: 'nursing_assistance', label: 'Nursing Assistance At Home' },
    { value: 'medical_equipment', label: 'Medical Equipment (Rent/Sale)' },
    { value: 'stroke_care', label: 'Stroke Care' },
    { value: 'orthopedic_care', label: 'Orthopedic Care' },
    { value: 'on_call_doctor_nurse', label: 'On Call Doctor/Nurse At-Home' },
  ];

  return (
    <div className="mb-8 border-b border-gray-200 pb-6">
      <h2 className="text-lg font-medium text-gray-900 mb-4">Care Requirements</h2>
      
      <div className="mb-6">
        <DutyPeriodSelector
          dutyPeriod={formData.dutyPeriod}
          dutyPeriodReason={formData.dutyPeriodReason}
          formErrors={{}}
          handleInputChange={handleInputChange}
          handleBlur={() => {}} 
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="serviceRequired">
            Service Required <span className="text-red-500">*</span>
          </label>
          <select 
            id="serviceRequired" 
            value={formData.serviceRequired} 
            onChange={handleInputChange} 
            className="w-full border border-gray-300 rounded-md py-2 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          >
            {serviceOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="careDuration">
            Care Duration <span className="text-red-500">*</span>
          </label>
          <select 
            id="careDuration" 
            value={formData.careDuration} 
            onChange={handleInputChange} 
            className="w-full border border-gray-300 rounded-md py-2 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
        <InputField 
          label="Start Date"
          type="date" 
          placeholder="Select start date" 
          id="startDate" 
          value={formData.startDate} 
          onChange={handleInputChange}
          min={new Date().toISOString().split('T')[0]}
          onBlur={() => handleBlur('startDate')}
          error={formErrors.startDate}
          required
        />
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="preferredCaregiverGender">
            Preferred Caregiver Gender
          </label>
          <select 
            id="preferredCaregiverGender" 
            value={formData.preferredCaregiverGender} 
            onChange={handleInputChange} 
            className="w-full border border-gray-300 rounded-md py-2 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select preference...</option>
            <option value="female">Female</option>
            <option value="male">Male</option>
            <option value="any">No Preference</option>
          </select>
        </div>
      </div>
      
      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="generalNotes">
          Additional Requirements
        </label>
        <textarea 
          id="generalNotes" 
          value={formData.generalNotes} 
          onChange={handleInputChange} 
          className="w-full border border-gray-300 rounded-md py-2 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent h-24"
          placeholder="Any special care instructions or requirements"
        ></textarea>
      </div>
    </div>
  );
};