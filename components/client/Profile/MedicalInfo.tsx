import React, { useState } from 'react';
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
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const toggleSection = (sectionName: string) => {
    if (expandedSection === sectionName) {
      setExpandedSection(null);
    } else {
      setExpandedSection(sectionName);
    }
  };

  const medicalSections = [
    {
      id: 'medical-status',
      title: 'Medical Status',
      content: (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
          <InfoField label="Chronic Illness" value={assessment?.chronicIllness} />
          <InfoField label="Medical History" value={assessment?.medicalHistory} />
          <InfoField label="Surgical History" value={assessment?.surgicalHistory} />
          <InfoField label="Medication History" value={assessment?.medicationHistory} />
        </div>
      ),
      alwaysExpanded: true
    },
    {
      id: 'current-status',
      title: 'Current Status',
      content: (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <InfoField label="Present Condition" value={assessment?.presentCondition} />
          <InfoField label="Blood Pressure" value={assessment?.bloodPressure} />
          <InfoField label="Sugar Level" value={assessment?.sugarLevel} />
          <InfoField label="Current Status" value={assessment?.currentStatus} />
        </div>
      ),
      alwaysExpanded: true
    },
    {
      id: 'lab-investigations',
      title: 'Lab Investigations',
      content: (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(assessment?.lab_investigations || {}).length > 0 ? (
            Object.entries(assessment?.lab_investigations || {}).map(([key, value]) => (
              <div key={key}>
                <p className="text-xs text-gray-500 font-medium">{key.toUpperCase()}</p>
                <p className="text-sm text-gray-700">{value}</p>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500 col-span-full">No lab investigations recorded</p>
          )}
        </div>
      )
    },
    {
      id: 'care-plan',
      title: 'Care Plan',
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InfoField label="Final Diagnosis" value={assessment?.finalDiagnosis} />
          <InfoField label="Patient Position" value={assessment?.patientPosition} />
          <InfoField label="Foods to Include" value={assessment?.foodsToInclude} />
          <InfoField label="Foods to Avoid" value={assessment?.foodsToAvoid} />
          <InfoField label="Feeding Method" value={assessment?.feedingMethod} fallback="Not specified" />
        </div>
      )
    },
    {
      id: 'behavioral-assessment',
      title: 'Behavioral Assessment',
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InfoField label="Alertness Level" value={assessment?.alertnessLevel} fallback="Not assessed" />
          <InfoField label="Physical Behavior" value={assessment?.physicalBehavior} fallback="Not assessed" />
          <InfoField label="Speech Patterns" value={assessment?.speechPatterns} fallback="Not assessed" />
          <InfoField label="Emotional State" value={assessment?.emotionalState} fallback="Not assessed" />
        </div>
      )
    },
    {
      id: 'social-history',
      title: 'Social History',
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InfoField label="Alcohol Use" value={assessment?.alcoholUse} />
          <InfoField label="Tobacco Use" value={assessment?.tobaccoUse} />
          <InfoField label="Drugs Use" value={assessment?.drugsUse} />
          <InfoField label="Other Social History" value={assessment?.otherSocialHistory} />
        </div>
      )
    },
    {
      id: 'environment-equipment',
      title: 'Environment and Equipment',
      content: (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <div>
            <h3 className="text-sm font-medium mb-2 text-gray-800">Environment Checklist</h3>
            <div className="grid grid-cols-1 xs:grid-cols-2 gap-2">
              {Object.keys(assessment?.environment || {}).length > 0 ? (
                Object.entries(assessment?.environment || {}).map(([key, value]) => (
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
                ))
              ) : (
                <p className="text-sm text-gray-500">No environment details recorded</p>
              )}
            </div>
          </div>
          <div>
            <h3 className="text-sm font-medium mb-2 text-gray-800">Equipment Needed</h3>
            <div className="space-y-2">
              {Object.keys(assessment?.equipment || {}).length > 0 ? (
                Object.entries(assessment?.equipment || {}).map(([key, value]) => (
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
                ))
              ) : (
                <p className="text-sm text-gray-500">No equipment details recorded</p>
              )}
            </div>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-4">
      {medicalSections.map((section) => (
        <div key={section.id} className="bg-white p-4 rounded border border-gray-200">
          <button 
            className="w-full flex justify-between items-center focus:outline-none"
            onClick={() => !section.alwaysExpanded && toggleSection(section.id)}
            disabled={section.alwaysExpanded}
          >
            <h2 className="text-base font-semibold text-gray-800">
              {section.title}
            </h2>
            {!section.alwaysExpanded && (
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className={`h-5 w-5 transition-transform ${expandedSection === section.id ? 'transform rotate-180' : ''}`}
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            )}
          </button>
          
          {(section.alwaysExpanded || expandedSection === section.id) && (
            <div className="pt-4 mt-2 border-t border-gray-200">
              {section.content}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default MedicalInfo;