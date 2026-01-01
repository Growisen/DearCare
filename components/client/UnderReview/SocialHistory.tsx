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
  return (
    <div className="bg-white border border-slate-200 p-3 sm:p-4 rounded-sm">
      <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-3 sm:mb-4">
        Social History
      </h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        <div className="w-full">
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
            Drugs Use
          </label>
          <select 
            id="drugsUse"
            value={formData.drugsUse}
            onChange={handleInputChange}
            className="w-full min-h-[38px] border border-slate-200 rounded-sm py-1.5 
            sm:py-2 px-2 sm:px-3 text-sm sm:text-base text-gray-700 focus:outline-none"
          >
            <option value="">Select option</option>
            <option value="YES">Yes</option>
            <option value="NO">No</option>
            <option value="FORMER">Former User</option>
          </select>
        </div>

        <div className="w-full">
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
            Alcohol Use
          </label>
          <select 
            id="alcoholUse"
            value={formData.alcoholUse}
            onChange={handleInputChange}
            className="w-full min-h-[38px] border border-slate-200 rounded-sm py-1.5 sm:py-2 px-2 
            sm:px-3 text-sm sm:text-base text-gray-700 focus:outline-none"
          >
            <option value="">Select option</option>
            <option value="YES">Yes</option>
            <option value="NO">No</option>
            <option value="FORMER">Former User</option>
          </select>
        </div>

        <div className="w-full">
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
            Tobacco Use
          </label>
          <select 
            id="tobaccoUse"
            value={formData.tobaccoUse}
            onChange={handleInputChange}
            className="w-full min-h-[38px] border border-slate-200 rounded-sm py-1.5 sm:py-2 px-2 
            sm:px-3 text-sm sm:text-base text-gray-700 focus:outline-none"
          >
            <option value="">Select option</option>
            <option value="YES">Yes</option>
            <option value="NO">No</option>
            <option value="FORMER">Former User</option>
          </select>
        </div>

        <div className="col-span-1 sm:col-span-2">
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