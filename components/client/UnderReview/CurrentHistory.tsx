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
  };
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
}

export default function CurrentDetails({ formData, handleInputChange }: CurrentDetailsProps) {
  return (
    <div className="bg-white border border-gray-200 p-4 rounded-lg">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Current Details & Lab Investigations</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="col-span-2">
          <InputField
            label="Present Condition"
            type="textarea"
            placeholder="Describe patient's present condition"
            id="presentCondition"
            value={formData.presentCondition}
            onChange={handleInputChange}
          />
        </div>

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

        <h4 className="col-span-2 text-md font-medium text-gray-800 mt-2">Lab Test Results</h4>
        
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

        <div className="col-span-2">
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