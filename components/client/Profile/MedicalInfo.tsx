import React, { useState } from 'react';
import InfoField from './InfoField';
import { Json, FamilyMember, LabInvestigations, RecorderInfo } from '@/types/client.types';
import { equipmentCategories } from '@/utils/constants';
import { formatDate } from '@/utils/formatters';
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/ui/Select';

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
    updatedAt?: string;
    lab_investigations?: LabInvestigations;
    equipment?: Json | Record<string, boolean>;
    environment?: Json | Record<string, boolean>;
    familyMembers: Array<FamilyMember>;
    recorderInfo: RecorderInfo;
    [key: string]: string | boolean | Json | Record<string, string | boolean> | undefined | LabInvestigations | RecorderInfo;
  };
  totalAssessments: Array<{ id: string; created_at: string }>;
  onSelectAssessment?: (id: string) => void;
  selectedAssessmentId?: string;
}

const MedicalInfo: React.FC<MedicalInfoProps> = ({ assessment, totalAssessments, onSelectAssessment, selectedAssessmentId }) => {
  const ALL_SECTIONS = [
    'medical-status', 
    'current-status', 
    'family-members',
    'lab-investigations', 
    'care-plan', 
    'behavioral-assessment',
    'social-history', 
    'environment-equipment', 
    'recorder-info'
  ];

  const [expandedSections, setExpandedSections] = useState<string[]>(ALL_SECTIONS);

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) => {
      if (prev.includes(sectionId)) {
        return prev.filter((id) => id !== sectionId);
      } else {
        return [...prev, sectionId];
      }
    });
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
    },
    {
      id: 'family-members',
      title: 'Family Members',
      content: (
        <div className="space-y-4">
          {assessment?.familyMembers && assessment.familyMembers.length > 0 ? (
            assessment.familyMembers.map((member) => (
              <div key={member.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-3">
                  <h3 className="font-medium text-gray-900">
                    {member.name}
                  </h3>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {member.relation}
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3">
                  <div>
                    <span className="text-xs text-gray-500 font-medium">Age</span>
                    <p className="text-sm text-gray-800">{member.age || "Not provided"}</p>
                  </div>
                  
                  <div>
                    <span className="text-xs text-gray-500 font-medium">Occupation</span>
                    <p className="text-sm text-gray-800">{member.job || "Not provided"}</p>
                  </div>
                  
                  {member.medicalRecords && (
                    <div className="md:col-span-2">
                      <span className="text-xs text-gray-500 font-medium">Medical Records</span>
                      <p className="text-sm text-gray-800 p-2 bg-white rounded border border-gray-200 mt-1">
                        {member.medicalRecords}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <p className="mt-2 text-gray-500">No family members information available</p>
            </div>
          )}
        </div>
      ),
    },
    {
      id: 'lab-investigations',
      title: 'Lab Investigations',
      content: (
        <div className="space-y-4">
          {assessment?.lab_investigations && Object.keys(assessment.lab_investigations).length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(assessment.lab_investigations).map(([key, value]) => {
                if (key === 'custom_tests') return null;
                
                return (
                  <div key={key} className="bg-gray-50 p-3 rounded-md">
                    <p className="text-xs text-gray-500 font-medium">{key.toUpperCase()}</p>
                    <p className="text-sm text-gray-700">{value || "Not recorded"}</p>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No standard lab investigations recorded</p>
          )}
    
          {assessment?.lab_investigations?.custom_tests && 
          Array.isArray(assessment.lab_investigations.custom_tests) && 
          assessment.lab_investigations.custom_tests.length > 0 ? (
            <div className="mt-4">
              <h4 className="text-sm font-medium mb-3 text-gray-700">Custom Tests</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {assessment.lab_investigations.custom_tests.map((test, index) => (
                  <div key={index} className="bg-gray-50 p-3 rounded-md border border-gray-100">
                    <p className="text-xs text-gray-500 font-medium">{test.name.toUpperCase()}</p>
                    <p className="text-sm text-gray-700">{test.value || "Not recorded"}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
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
            {Object.keys(assessment?.environment || {}).length > 0 ? (
              <div className="space-y-5">
                <div className="space-y-2">
                  <h4 className="text-xs font-medium text-gray-600 pb-1 border-b border-gray-100">Environment Features</h4>
                  <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2">
                    {Object.entries(assessment?.environment || {}).map(([key, value]) => (
                      <div key={key} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={Boolean(value)}
                          readOnly
                          className="h-4 w-4 text-blue-600 border-gray-300 rounded flex-shrink-0"
                        />
                        <label className={`ml-2 text-sm truncate ${Boolean(value) ? 'text-gray-700' : 'text-gray-400'}`}>
                          {key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-500">No environment details recorded</p>
            )}
          </div>
          <div>
            <h3 className="text-sm font-medium mb-2 text-gray-800">Equipment Needed</h3>
            {Object.keys(assessment?.equipment || {}).length > 0 ? (
              <div className="space-y-5">
                <div className="space-y-2">
                  <h4 className="text-xs font-medium text-gray-600 pb-1 border-b border-gray-100">Bed-related Equipment</h4>
                  <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2">
                    {equipmentCategories.bedriddenEquipment.map(item => {
                      const equipment = assessment?.equipment as Record<string, boolean> || {};
                      const isChecked = typeof equipment === 'object' && item.id in equipment ? equipment[item.id] : false;
                      return (
                        <div key={item.id} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            readOnly
                            className="h-4 w-4 text-blue-600 border-gray-300 rounded flex-shrink-0"
                          />
                          <label className={`ml-2 text-sm truncate ${isChecked ? 'text-gray-700' : 'text-gray-400'}`}>
                            {item.label}
                          </label>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-medium text-gray-600 pb-1 border-b border-gray-100">Mobility Equipment</h4>
                  <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2">
                    {equipmentCategories.mobilityEquipment.map(item => {
                      const equipment = assessment?.equipment as Record<string, boolean> || {};
                      const isChecked = typeof equipment === 'object' && item.id in equipment ? equipment[item.id] : false;
                      return (
                        <div key={item.id} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            readOnly
                            className="h-4 w-4 text-blue-600 border-gray-300 rounded flex-shrink-0"
                          />
                          <label className={`ml-2 text-sm truncate ${isChecked ? 'text-gray-700' : 'text-gray-400'}`}>
                            {item.label}
                          </label>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-medium text-gray-600 pb-1 border-b border-gray-100">Medical Equipment</h4>
                  <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2">
                    {equipmentCategories.medicalEquipment.map(item => {
                      const equipment = assessment?.equipment as Record<string, boolean> || {};
                      const isChecked = typeof equipment === 'object' && item.id in equipment ? equipment[item.id] : false;
                      return (
                        <div key={item.id} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            readOnly
                            className="h-4 w-4 text-blue-600 border-gray-300 rounded flex-shrink-0"
                          />
                          <label className={`ml-2 text-sm truncate ${isChecked ? 'text-gray-700' : 'text-gray-400'}`}>
                            {item.label}
                          </label>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-500">No equipment details recorded</p>
            )}
          </div>
        </div>
      )
    },
    {
      id: 'recorder-info',
      title: 'Recorded By',
      content: (
        <div className="p-3 bg-gray-50 rounded-md border border-gray-100">
          {assessment?.recorderInfo ? (
            <div className="flex flex-col space-y-2">
              <div className="flex items-center">
                <span className="text-sm font-medium text-gray-600 w-20">Name:</span>
                <span className="text-sm text-gray-800">{assessment.recorderInfo.recorderName || "Not provided"}</span>
              </div>
              <div className="flex items-center">
                <span className="text-sm font-medium text-gray-600 w-20">Role:</span>
                <span className="text-sm text-gray-800">{assessment.recorderInfo.recorderRole || "Not provided"}</span>
              </div>
              <div className="flex items-center">
                <span className="text-sm font-medium text-gray-600 w-20">Updated:</span>
                <span className="text-sm text-gray-800">
                  {assessment.updatedAt ? formatDate(assessment.updatedAt) : "Not available"}
                </span>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-500">No recorder information available</p>
          )}
        </div>
      )
    }
  ];
  

 return (
    <div className="space-y-4">
      {totalAssessments && totalAssessments.length > 0 && (
        <div className="mb-4">
          <label htmlFor="assessment-selector" className="block text-sm font-medium text-gray-700 mb-1">
            Select Assessment:
          </label>
          <Select
            value={selectedAssessmentId ?? totalAssessments[0]?.id}
            onValueChange={onSelectAssessment}
          >
            <SelectTrigger className="max-w-xs w-full text-gray-800 bg-white border border-gray-300 rounded-md">
              <SelectValue placeholder="Choose assessment..." />
            </SelectTrigger>
            <SelectContent className="text-gray-800 bg-white border border-gray-300">
              {totalAssessments.map(a => (
                <SelectItem key={a.id} value={a.id}>
                  {formatDate(a.created_at, true)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
      {medicalSections.map((section) => {
        const isExpanded = expandedSections.includes(section.id);

        return (
          <div key={section.id} className="bg-white p-4 rounded border border-gray-200">
            <button 
              className="w-full flex justify-between items-center focus:outline-none"
              onClick={() => toggleSection(section.id)}
            >
              <h2 className="text-base font-semibold text-gray-800">
                {section.title}
              </h2>
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className={`h-5 w-5 transition-transform ${isExpanded ? 'transform rotate-180' : ''}`}
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {isExpanded && (
              <div className="pt-4 mt-2 border-t border-gray-200">
                {section.content}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default MedicalInfo;