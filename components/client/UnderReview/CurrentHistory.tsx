import React from 'react';
import { InputField } from './InputField';

interface CurrentDetailsProps {
  formData: {
    presentCondition: string;
    bloodPressure: string;
    sugarLevel: string;
    hb: string;
    rbc: string;
    esr: string;
    urine: string;
    sodium: string;
    otherLabInvestigations: string;
    customLabTests: Array<{ id: string; name: string; value: string }>;
  };
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleCustomLabChange?: (id: string, field: 'name' | 'value', value: string) => void;
  handleAddCustomLab?: () => void;
  handleRemoveCustomLab?: (id: string) => void;
}

export default function CurrentDetails({ formData, handleInputChange, handleCustomLabChange, handleAddCustomLab, handleRemoveCustomLab }: CurrentDetailsProps) {
  return (
    <div className="bg-white border border-gray-200 p-2 sm:p-4 rounded-lg w-full max-w-7xl mx-auto">
      <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2 sm:mb-4">Current Details & Lab Investigations</h3>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-6">
        <div className="col-span-1 lg:col-span-2">
          <InputField
            label="Present Condition"
            type="textarea"
            placeholder="Describe patient's present condition"
            id="presentCondition"
            value={formData.presentCondition}
            onChange={handleInputChange}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3 sm:gap-4">
          <InputField
            label="Blood Pressure (mmHg)"
            placeholder="e.g. 120/80"
            id="bloodPressure"
            value={formData.bloodPressure}
            onChange={handleInputChange}
          />

          <InputField
            label="Sugar Level (mg/dL)"
            placeholder="e.g. 100"
            id="sugarLevel"
            value={formData.sugarLevel}
            onChange={handleInputChange}
          />
        </div>

        <h4 className="col-span-1 lg:col-span-2 text-sm sm:text-md font-medium text-gray-800 mt-2">Lab Test Results</h4>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 col-span-1 lg:col-span-2">
          <InputField
            label="Hemoglobin (Hb)"
            placeholder="Enter value"
            id="hb"
            value={formData.hb}
            onChange={handleInputChange}
          />

          <InputField
            label="Red Blood Cells (RBC)"
            placeholder="Enter value"
            id="rbc"
            value={formData.rbc}
            onChange={handleInputChange}
          />

          <InputField
            label="ESR"
            placeholder="Enter value"
            id="esr"
            value={formData.esr}
            onChange={handleInputChange}
          />

          <InputField
            label="Urine Analysis"
            placeholder="Enter details"
            id="urine"
            value={formData.urine}
            onChange={handleInputChange}
          />

          <InputField
            label="Sodium Levels"
            placeholder="Enter value"
            id="sodium"
            value={formData.sodium}
            onChange={handleInputChange}
          />
        </div>

        <div className="col-span-1 lg:col-span-2">
          <div className="mb-2 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <h4 className="text-sm sm:text-md font-medium text-gray-800">Other Lab Tests</h4>
            <button
              type="button"
              onClick={handleAddCustomLab}
              className="w-full sm:w-auto px-3 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors text-sm flex items-center justify-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Add Lab Test
            </button>
          </div>
          
          {formData.customLabTests && formData.customLabTests.length > 0 ? (
            <div className="space-y-3 sm:space-y-4 mb-4">
              {formData.customLabTests.map((test) => (
                <div key={test.id} className="flex flex-col sm:flex-row items-start gap-2 sm:gap-3 p-2 sm:p-4 border border-gray-200 rounded-md bg-gray-50">
                  <div className="w-full sm:flex-1">
                    <label htmlFor={`test-name-${test.id}`} className="block text-xs font-medium text-gray-700 mb-1">
                      Test Name
                    </label>
                    <input
                      id={`test-name-${test.id}`}
                      type="text"
                      placeholder="Test name"
                      className="w-full p-2 border border-gray-300 rounded-md text-sm text-gray-800"
                      value={test.name}
                      onChange={(e) => handleCustomLabChange && handleCustomLabChange(test.id, 'name', e.target.value)}
                    />
                  </div>
                  <div className="w-full sm:flex-1">
                    <label htmlFor={`test-value-${test.id}`} className="block text-xs font-medium text-gray-700 mb-1">
                      Test Value
                    </label>
                    <input
                      id={`test-value-${test.id}`}
                      type="text"
                      placeholder="Test value"
                      className="w-full p-2 border border-gray-300 rounded-md text-sm text-gray-800"
                      value={test.value}
                      onChange={(e) => handleCustomLabChange && handleCustomLabChange(test.id, 'value', e.target.value)}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveCustomLab && handleRemoveCustomLab(test.id)}
                    className="text-red-500 hover:text-red-700 p-1 rounded-md hover:bg-red-50 mt-2 sm:mt-6"
                    aria-label="Remove test"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 italic mb-4">No custom lab tests added yet.</p>
          )}
        </div>

        <div className="col-span-1 lg:col-span-2">
          <InputField
            label="Other Lab Investigations"
            type="textarea"
            placeholder="Enter any other lab test results"
            id="otherLabInvestigations"
            value={formData.otherLabInvestigations}
            onChange={handleInputChange}
          />
        </div>
      </div>
    </div>
  );
}