import React from 'react';

interface PersonalDetailsProps {
  formData: {
    guardianOccupation: string;
    maritalStatus: string;
    height: string;
    weight: string;
    pincode: string;
    district: string;
    cityTown: string;
  };
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
}

export default function PersonalDetails({ formData, handleInputChange }: PersonalDetailsProps) {
  return (
    <div className="bg-white p-6 rounded-sm border border-slate-200 shadow-none">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Personal Details</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          <label htmlFor="maritalStatus" className="block text-sm font-medium text-gray-700 mb-1">
            Marital Status
          </label>
          <select
            id="maritalStatus"
            className="w-full p-2 border border-slate-200 rounded-sm text-gray-700"
            value={formData.maritalStatus}
            onChange={handleInputChange}
          >
            <option value="">Select Status</option>
            <option value="SINGLE">Single</option>
            <option value="MARRIED">Married</option>
            <option value="DIVORCED">Divorced</option>
            <option value="WIDOWED">Widowed</option>
            <option value="SEPERATED">Separated</option>
          </select>
        </div>
        <div>
          <label htmlFor="height" className="block text-sm font-medium text-gray-700 mb-1">
            Height (cm)
          </label>
          <input
            type="text"
            id="height"
            className="w-full p-2 border border-slate-200 rounded-sm text-gray-700"
            value={formData.height}
            onChange={handleInputChange}
          />
        </div>
        <div>
          <label htmlFor="weight" className="block text-sm font-medium text-gray-700 mb-1">
            Weight (kg)
          </label>
          <input
            type="text"
            id="weight"
            className="w-full p-2 border border-slate-200 rounded-sm text-gray-700"
            value={formData.weight}
            onChange={handleInputChange}
          />
        </div>
        <div>
          <label htmlFor="pincode" className="block text-sm font-medium text-gray-700 mb-1">
            Pincode
          </label>
          <input
            type="text"
            id="pincode"
            className="w-full p-2 border border-slate-200 rounded-sm text-gray-700"
            value={formData.pincode}
            onChange={handleInputChange}
          />
        </div>
        <div>
          <label htmlFor="district" className="block text-sm font-medium text-gray-700 mb-1">
            District
          </label>
          <input
            type="text"
            id="district"
            className="w-full p-2 border border-slate-200 rounded-sm text-gray-700"
            value={formData.district}
            onChange={handleInputChange}
          />
        </div>
        <div>
          <label htmlFor="cityTown" className="block text-sm font-medium text-gray-700 mb-1">
            City/Town
          </label>
          <input
            type="text"
            id="cityTown"
            className="w-full p-2 border border-slate-200 rounded-sm text-gray-700"
            value={formData.cityTown}
            onChange={handleInputChange}
          />
        </div>
      </div>
    </div>
  );
}