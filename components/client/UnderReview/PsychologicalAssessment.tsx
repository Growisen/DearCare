import React from 'react';
import { InputField } from './InputField';

interface PsychologicalAssessmentProps {
  formData: {
    alertnessLevel: string;
    physicalBehavior: string;
    speechPatterns: string;
    emotionalState: string;
  };
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
}

export default function PsychologicalAssessment({ formData, handleInputChange }: PsychologicalAssessmentProps) {
  return (
    <div className="bg-white border border-gray-200 p-4 rounded-lg">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Psychological Assessment</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <InputField
            label="Alertness Level"
            placeholder="Whether the patient is alert ,comatose or somewhere in between"
            id="alertnessLevel"
            value={formData.alertnessLevel}
            onChange={handleInputChange}
          />
        </div>

        <InputField
          label="Physical Behavior"
          placeholder="Describe physical behavior"
          id="physicalBehavior"
          value={formData.physicalBehavior}
          onChange={handleInputChange}
        />

        <InputField
          label="Speech Patterns"
          placeholder="Describe speech patterns"
          id="speechPatterns"
          value={formData.speechPatterns}
          onChange={handleInputChange}
        />

        <InputField
          label="Emotional State"
          placeholder="Describe emotional state"
          id="emotionalState"
          value={formData.emotionalState}
          onChange={handleInputChange}
        />
      </div>
    </div>
  );
}