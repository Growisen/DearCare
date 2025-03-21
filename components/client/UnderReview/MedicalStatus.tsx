import React from 'react';
import { InputField } from './InputField';

interface MedicalStatusProps {
  formData: {
    currentStatus: string;
    chronicIllness: string;
    medicalHistory: string;
    surgicalHistory: string;
    medicationHistory: string;
  };
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
}

export default function MedicalStatus({ formData, handleInputChange }: MedicalStatusProps) {
  return (
    <div className="bg-white border border-gray-200 p-4 rounded-lg">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Current Medical Status</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Current Status
          </label>
          <select 
            id="currentStatus"
            value={formData.currentStatus}
            onChange={handleInputChange}
            className="w-full border border-gray-300 rounded-md py-2 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select status</option>
            <option value="HOSPITALIZED">Hospitalized</option>
            <option value="HOME">At Home</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Chronic Illness
          </label>
          <select 
            id="chronicIllness"
            value={formData.chronicIllness}
            onChange={handleInputChange}
            className="w-full border border-gray-300 rounded-md py-2 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select option</option>
            <option value="YES">Yes</option>
            <option value="NO">No</option>
          </select>
        </div>

        <div className="col-span-2">
          <InputField
            label="Medical History"
            type="textarea"
            placeholder="Enter detailed medical history"
            id="medicalHistory"
            value={formData.medicalHistory}
            onChange={handleInputChange}
          />
        </div>

        <div className="col-span-2">
          <InputField
            label="Surgical History"
            type="textarea"
            placeholder="Enter surgical history"
            id="surgicalHistory"
            value={formData.surgicalHistory}
            onChange={handleInputChange}
          />
        </div>

        <div className="col-span-2">
          <InputField
            label="Medication History"
            type="textarea"
            placeholder="Enter medication history"
            id="medicationHistory"
            value={formData.medicationHistory}
            onChange={handleInputChange}
          />
        </div>
      </div>
    </div>
  );
}