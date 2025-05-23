import React from 'react';
import { relationOptions } from '@/utils/constants'
import { RecorderInfo } from '@/types/client.types';

interface RecorderInfoFormProps {
  recorderInfo: RecorderInfo;
  handleRecorderInfoChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
}

const RecorderInfoForm: React.FC<RecorderInfoFormProps> = ({
  recorderInfo,
  handleRecorderInfoChange
}) => {
  return (
    <div className="bg-blue-50 p-5 rounded-lg border border-blue-200 mb-6">
      <h3 className="text-lg font-semibold text-blue-800 mb-3">Person Completing this Form</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="recorderName" className="block text-sm font-medium text-gray-700 mb-1">
            Your Full Name*
          </label>
          <input
            type="text"
            id="recorderName"
            name="recorderName"
            value={recorderInfo.recorderName}
            onChange={handleRecorderInfoChange}
            required
            className="w-full p-2 border border-gray-300 rounded-md"
            placeholder="Enter your full name"
          />
        </div>
        <div>
          <label htmlFor="recorderRole" className="block text-sm font-medium text-gray-700 mb-1">
            Your Relationship to Patient*
          </label>
          <select
            id="recorderRole"
            name="recorderRole"
            value={recorderInfo.recorderRole}
            onChange={handleRecorderInfoChange}
            required
            className="w-full p-2 border border-gray-300 rounded-md text-gray-700 font-medium"
          >
            <option value="" disabled className="text-gray-500">Select relationship...</option>
            <option value="Family Member" className="text-gray-800">Family Member</option>
            <option value="Nurse" className="text-gray-800">Nurse</option>
            <option value="Patient" className="text-gray-800">Self (Patient)</option>
            <option value="Other" className="text-gray-800">Other</option>
          </select>
        </div>
        
        {/* Show nurse registration field if "Nurse" is selected */}
        {recorderInfo.recorderRole === "Nurse" && (
          <div className="mt-2 col-span-2">
            <label htmlFor="nurseRegistrationNumber" className="block text-sm font-medium text-gray-700 mb-1">
              Nurse Registration Number*
            </label>
            <input
              type="text"
              id="nurseRegistrationNumber"
              name="nurseRegistrationNumber"
              value={recorderInfo.nurseRegistrationNumber || ""}
              onChange={handleRecorderInfoChange}
              required
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="Enter your registration number"
            />
          </div>
        )}
        
        {/* Show additional field if "Other" is selected */}
        {recorderInfo.recorderRole === "Other" && (
          <div className="mt-2 col-span-2">
            <label htmlFor="otherRoleSpecify" className="block text-sm font-medium text-gray-700 mb-1">
              Please specify*
            </label>
            <input
              type="text"
              id="otherRoleSpecify"
              name="otherRoleSpecify"
              onChange={(e) => {
                const fakeEvent = {
                  target: {
                    name: "recorderRole",
                    value: `Other: ${e.target.value}`
                  }
                } as React.ChangeEvent<HTMLInputElement>;
                handleRecorderInfoChange(fakeEvent);
              }}
              defaultValue=""
              required
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="Please specify your relationship to the patient"
            />
          </div>
        )}
        
        {recorderInfo.recorderRole === "Family Member" && (
          <div className="mt-2 col-span-2">
            <label htmlFor="familyRelationship" className="block text-sm font-medium text-gray-700 mb-1">
              Family Relationship*
            </label>
            <select
              id="familyRelationship"
              name="familyRelationship"
              value={recorderInfo.familyRelationship}
              onChange={handleRecorderInfoChange}
              required
              className="w-full p-2 border border-gray-300 rounded-md text-gray-800"
            >
              {relationOptions.map(option => (
                <option key={option.value} value={option.value}>
                    {option.label}
                </option>
                ))}
            </select>
          </div>
        )}
      </div>
      <p className="text-xs text-gray-500 mt-2">
        This information helps us identify who completed this assessment. Whether you&apos;re a healthcare professional or family member, your input is valuable.
      </p>
    </div>
  );
};

export default RecorderInfoForm;