import React from 'react';
import InfoSection from './InfoSection';
import InfoField from './InfoField';
import { Json } from '@/types/client.types';

interface MedicalInfoProps {
  assessment: {
    chronicIllness?: string;
    medicalHistory?: string;
    surgicalHistory?: string;
    medicationHistory?: string;
    presentCondition?: string;
    bloodPressure?: string;
    sugarLevel?: string;
    finalDiagnosis?: string;
    patientPosition?: string;
    foodsToInclude?: string;
    foodsToAvoid?: string;
    alertnessLevel?: string;
    physicalBehavior?: string;
    speechPatterns?: string;
    emotionalState?: string;
    alcoholUse?: string;
    tobaccoUse?: string;
    drugsUse?: string;
    otherSocialHistory?: string;
    feedingMethod?: string;
    currentStatus?: string;
    lab_investigations?: Json;
    equipment?: Json | Record<string, boolean>;
    environment?: Json | Record<string, boolean>;
    [key: string]: string | boolean | Json | Record<string, string | boolean> | undefined;
  };
}

const MedicalInfo: React.FC<MedicalInfoProps> = ({ assessment }) => {
  return (
    <div className="space-y-4">
      <InfoSection title="Medical Status">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InfoField label="Chronic Illness" value={assessment?.chronicIllness} />
          <InfoField label="Medical History" value={assessment?.medicalHistory} />
          <InfoField label="Surgical History" value={assessment?.surgicalHistory} />
          <InfoField label="Medication History" value={assessment?.medicationHistory} />
        </div>
      </InfoSection>

      <InfoSection title="Current Status">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <InfoField label="Present Condition" value={assessment?.presentCondition} />
          <InfoField label="Blood Pressure" value={assessment?.bloodPressure} />
          <InfoField label="Sugar Level" value={assessment?.sugarLevel} />
        </div>
      </InfoSection>

      <InfoSection title="Lab Investigations">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(assessment?.lab_investigations || {}).map(([key, value]) => (
            <div key={key}>
              <p className="text-xs text-gray-500 font-medium">{key.toUpperCase()}</p>
              <p className="text-sm text-gray-700">{value}</p>
            </div>
          ))}
        </div>
      </InfoSection>

      <InfoSection title="Care Plan">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InfoField label="Final Diagnosis" value={assessment?.finalDiagnosis} />
          <InfoField label="Patient Position" value={assessment?.patientPosition} />
          <InfoField label="Foods to Include" value={assessment?.foodsToInclude} />
          <InfoField label="Foods to Avoid" value={assessment?.foodsToAvoid} />
        </div>
      </InfoSection>

      <InfoSection title="Behavioral Assessment">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InfoField label="Alertness Level" value={assessment?.alertnessLevel} fallback="Not assessed" />
          <InfoField label="Physical Behavior" value={assessment?.physicalBehavior} fallback="Not assessed" />
          <InfoField label="Speech Patterns" value={assessment?.speechPatterns} fallback="Not assessed" />
          <InfoField label="Emotional State" value={assessment?.emotionalState} fallback="Not assessed" />
        </div>
      </InfoSection>
      
      <InfoSection title="Social History">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InfoField label="Alcohol Use" value={assessment?.alcoholUse} />
          <InfoField label="Tobacco Use" value={assessment?.tobaccoUse} />
          <InfoField label="Drugs Use" value={assessment?.drugsUse} />
          <InfoField label="Other Social History" value={assessment?.otherSocialHistory} />
        </div>
      </InfoSection>

      <InfoSection title="Feeding Information">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InfoField label="Feeding Method" value={assessment?.feedingMethod} fallback="Not specified" />
          <InfoField label="Current Status" value={assessment?.currentStatus} />
        </div>
      </InfoSection>

      <InfoSection title="Environment and Equipment">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-medium mb-2 text-gray-800">Environment Checklist</h3>
            <div className="space-y-2">
              {Object.entries(assessment?.environment || {}).map(([key, value]) => (
                <div key={key} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={value}
                    readOnly
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                  />
                  <label className="ml-2 text-sm text-gray-700">
                    {key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                  </label>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-sm font-medium mb-2 text-gray-800">Equipment Needed</h3>
            <div className="space-y-2">
              {Object.entries(assessment?.equipment || {}).map(([key, value]) => (
                <div key={key} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={value}
                    readOnly
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                  />
                  <label className="ml-2 text-sm text-gray-700">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>
      </InfoSection>
    </div>
  );
};

export default MedicalInfo;