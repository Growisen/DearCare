import React from 'react';
import { InputField } from './InputField';

interface SocialHistoryProps {
  formData: {
    drugsUse: string;
    alcoholUse: string;
    tobaccoUse: string;
    otherSocialHistory: string;
  };
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
}

export default function SocialHistory({ formData, handleInputChange }: SocialHistoryProps) {
  console.log(formData.drugsUse)
  return (
    <div className="bg-white border border-gray-200 p-4 rounded-lg">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Social History</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Drugs Use
          </label>
          <select 
            id="drugsUse"
            value={formData.drugsUse}
            onChange={handleInputChange}
            className="w-full border border-gray-300 rounded-md py-2 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select option</option>
            <option value="YES">Yes</option>
            <option value="NO">No</option>
            <option value="FORMER">Former User</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Alcohol Use
          </label>
          <select 
            id="alcoholUse"
            value={formData.alcoholUse}
            onChange={handleInputChange}
            className="w-full border border-gray-300 rounded-md py-2 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select option</option>
            <option value="YES">Yes</option>
            <option value="NO">No</option>
            <option value="FORMER">Former User</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tobacco Use
          </label>
          <select 
            id="tobaccoUse"
            value={formData.tobaccoUse}
            onChange={handleInputChange}
            className="w-full border border-gray-300 rounded-md py-2 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select option</option>
            <option value="YES">Yes</option>
            <option value="NO">No</option>
            <option value="FORMER">Former User</option>
          </select>
        </div>

        <div className="col-span-2">
          <InputField
            label="Other Social History"
            type="textarea"
            placeholder="Enter any other social history details"
            id="otherSocialHistory"
            value={formData.otherSocialHistory}
            onChange={handleInputChange}
          />
        </div>
      </div>
    </div>
  );
}