import React from 'react';
import { InputField } from './InputField';

interface FormData {
  guardianOccupation: string;
  maritalStatus: string;
  height: number | string;
  weight: number | string;
  pincode: string;
  district: string;
  cityTown: string;
}

interface PersonalInfoProps {
  formData: FormData;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
}

export default function PersonalInfo({ formData, handleInputChange }: PersonalInfoProps) {
  return (
    <div className="bg-white border border-slate-200 p-4 rounded-sm">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Patient Assessment</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Guardian&apos;s Occupation
          </label>
          <select 
            id="guardianOccupation"
            value={formData.guardianOccupation}
            onChange={handleInputChange}
            className="w-full border border-slate-200 rounded-sm py-2 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select occupation</option>
            <option value="GOVT">Government Service</option>
            <option value="BUSINESS">Business</option>
            <option value="PRIVATE">Private Sector</option>
            <option value="ABROAD">Working Abroad</option>
            <option value="OTHER">Other</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Marital Status
          </label>
          <select 
            id="maritalStatus"
            value={formData.maritalStatus}
            onChange={handleInputChange}
            className="w-full border border-slate-200 rounded-sm py-2 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select status</option>
            <option value="SINGLE">Single</option>
            <option value="MARRIED">Married</option>
            <option value="DIVORCED">Divorced</option>
            <option value="SEPARATED">Separated</option>
            <option value="WIDOWED">Widowed</option>
          </select>
        </div>

        <InputField
          label="Height (cm)"
          type="number"
          placeholder="Enter height"
          id="height"
          value={formData.height}
          onChange={handleInputChange}
        />

        <InputField
          label="Weight (kg)"
          type="number"
          placeholder="Enter weight"
          id="weight"
          value={formData.weight}
          onChange={handleInputChange}
        />

        <InputField
          label="Pincode"
          type="text"
          placeholder="Enter 6-digit pincode"
          id="pincode"
          value={formData.pincode}
          onChange={handleInputChange}
        />

        <InputField
          label="District"
          placeholder="Enter district"
          id="district"
          value={formData.district}
          onChange={handleInputChange}
        />

        <InputField
          label="City/Town"
          placeholder="Enter city/town"
          id="cityTown"
          value={formData.cityTown}
          onChange={handleInputChange}
        />
      </div>
    </div>
  );
}