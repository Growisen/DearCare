import React from 'react';
import { InputField } from '../UnderReview';

interface DiagnosisAndCarePlanProps {
  formData: {
    finalDiagnosis: string;
    foodsToInclude: string;
    foodsToAvoid: string;
    patientPosition: string;
    feedingMethod: string;
  };
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
}

export default function DiagnosisAndCarePlan({ formData, handleInputChange }: DiagnosisAndCarePlanProps) {
  return (
    <div className="bg-white border border-gray-200 p-4 rounded-lg">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Diagnosis & Care Plan</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="col-span-2">
          <InputField
            label="Final Diagnosis"
            type="textarea"
            placeholder="Enter the final diagnosis"
            id="finalDiagnosis"
            value={formData.finalDiagnosis}
            onChange={handleInputChange}
          />
        </div>

        <div className="col-span-2">
          <InputField
            label="Foods to Include"
            type="textarea"
            placeholder="List foods to include in diet"
            id="foodsToInclude"
            value={formData.foodsToInclude}
            onChange={handleInputChange}
          />
        </div>

        <div className="col-span-2">
          <InputField
            label="Foods to Avoid"
            type="textarea"
            placeholder="List foods to avoid in diet"
            id="foodsToAvoid"
            value={formData.foodsToAvoid}
            onChange={handleInputChange}
          />
        </div>

        <div>
          <InputField
            label="Patient Position"
            type="text"
            placeholder="Use pillows/ Raise the head of the bed/normal"
            id="patientPosition"
            value={formData.patientPosition}
            onChange={handleInputChange}
          />
        </div>

        <div>
          <InputField
            label="Feeding Method"
            type="text"
            placeholder="Tube /Oral etc.."
            id="feedingMethod"
            value={formData.feedingMethod}
            onChange={handleInputChange}
          />
        </div>
      </div>
    </div>
  );
}