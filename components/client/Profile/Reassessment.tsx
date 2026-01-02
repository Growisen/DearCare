"use client"

import React, { useState, useMemo } from 'react';
import InfoField from './InfoField';
import { formatDate } from '@/utils/formatters';
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/ui/Select';
import { ReassessmentData } from '@/types/reassessment.types';
import { VitalsData, BedSoreData, DynamicField } from '@/types/reassessment.types';

interface ReassessmentInfoProps {
  reassessments: ReassessmentData[];
  onSelectReassessment?: (id: string) => void;
  selectedReassessmentId?: string;
  setSelectedReassessmentId?: (id: string) => void;
	totalReassessments: { id: string; createdAt: string }[];
}

const ReassessmentInfo: React.FC<ReassessmentInfoProps> = ({ 
  reassessments, 
  selectedReassessmentId,
	setSelectedReassessmentId,
  totalReassessments,
}) => {
  
  const activeAssessment = useMemo(() => {
    if (!reassessments || reassessments.length === 0) return null;
    return reassessments.find(r => r.id === selectedReassessmentId) || reassessments[0];
  }, [reassessments, selectedReassessmentId]);

  const ALL_SECTIONS = [
    'clinical-diagnosis',
    'vitals-physical',
    'mental-behavioral',
    'staff-assignment',
    'evaluation-dynamic'
  ];

  const [expandedSections, setExpandedSections] = useState<string[]>(ALL_SECTIONS);

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) => 
      prev.includes(sectionId) 
        ? prev.filter((id) => id !== sectionId) 
        : [...prev, sectionId]
    );
  };

  function formatTo12Hour(timeStr: string): string {
    if (!timeStr) return "-";
    const [hourStr, minStr, secStr] = timeStr.split(":");
    let hour = parseInt(hourStr, 10);
    if (isNaN(hour)) return timeStr;
    const ampm = hour >= 12 ? "PM" : "AM";
    hour = hour % 12 || 12;
    return `${hour}:${minStr}${secStr ? `:${secStr}` : ""} ${ampm}`;
  }

  const formatDynamicValue = (value: DynamicField, key?: string): React.ReactNode => {
    if (value === null || value === undefined) return "-";
    
    if (key === "time" && typeof value === "string") {
      return formatTo12Hour(value);
    }

    if (typeof value !== 'object') return String(value);

    if (Array.isArray(value)) {
      if (value.length === 0) return "-";
      if (typeof value[0] === 'object') {
         return value.map((v, i) => (
             <div key={i} className="text-xs border-b border-slate-200 last:border-0 py-1">
               {formatDynamicValue(v)}
             </div>
         ));
      }
      return value.join(", ");
    }

    return (
      <ul className="list-disc list-inside text-xs space-y-1">
        {Object.entries(value).map(([subKey, subValue]) => (
          <li key={subKey}>
            <span className="font-medium text-gray-600">{subKey}: </span>
            {typeof subValue === 'object' ? JSON.stringify(subValue) : formatDynamicValue(subValue, subKey)}
          </li>
        ))}
      </ul>
    );
  };

  const renderJsonFields = (
    data: VitalsData | BedSoreData | DynamicField[] | Record<string, unknown> | string | null | undefined,
    fallbackText: string = "No data recorded",
    sectionKey?: string
  ) => {
    if (!data) return <p className="text-sm text-gray-500 italic">{fallbackText}</p>;

    if (typeof data === 'string') return <p className="text-sm text-gray-800">{data}</p>;

    const entries = Object.entries(data).filter(([value]) => {
      if (Array.isArray(value)) return value.length > 0;
      if (typeof value === 'object' && value !== null) return Object.keys(value).length > 0;
      return value !== null && value !== undefined && value !== '';
    });

    if (entries.length === 0) return <p className="text-sm text-gray-500 italic">{fallbackText}</p>;

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {entries.map(([key, value]) => (
          <div key={key} className="bg-gray-50 p-3 rounded-sm border border-slate-200 overflow-hidden break-words">
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">
              {key.replace(/_/g, ' ')}
            </p>
            <div className="text-sm text-gray-800 font-medium">
              {sectionKey === "vitals" && key === "time"
                ? formatTo12Hour(value as string)
                : formatDynamicValue(value, key)
              }
            </div>
          </div>
        ))}
      </div>
    );
  };

  if (!activeAssessment) {
    return (
      <div className="p-8 text-center bg-gray-50 rounded-sm border border-slate-200 border-dashed">
        <p className="text-gray-500">No reassessment records found for this client.</p>
      </div>
    );
  }

  const sections = [
    {
      id: 'clinical-diagnosis',
      title: 'Clinical Diagnosis',
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InfoField label="Diagnosis" value={activeAssessment.diagnosis} />
          <InfoField label="Nursing Diagnosis" value={activeAssessment.nursingDiagnosis} />
          <div className="md:col-span-2">
            <InfoField label="Present Condition" value={activeAssessment.presentCondition} />
          </div>
        </div>
      )
    },
    {
      id: 'vitals-physical',
      title: 'Vitals & Physical Status',
      content: (
        <div className="space-y-6">
          <div>
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Vital Signs</h4>
            {renderJsonFields(activeAssessment.vitals, "No vitals recorded", "vitals")}
          </div>
          <div className="h-px bg-gray-100 w-full" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <InfoField label="General Status" value={activeAssessment.generalStatus} />
            <InfoField label="Hygiene" value={activeAssessment.hygiene} />
            <div className="md:col-span-1">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Bed Sore Details</h4>
              {renderJsonFields(activeAssessment.bedSore, "No bed sore details recorded")}
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'mental-behavioral',
      title: 'Mental & Behavioral',
      content: (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <InfoField label="Mental Status" value={activeAssessment.mentalStatus} />
          <InfoField label="Care Status" value={activeAssessment.careStatus} />
          <InfoField label="Outdoor Hours" value={activeAssessment.outdoorHours} />
        </div>
      )
    },
    {
      id: 'staff-assignment',
      title: 'Staff & Assignment',
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InfoField label="Allotted Staff" value={activeAssessment.allottedStaffName} />
          <InfoField label="Assignment Done By" value={activeAssessment.assignmentDoneBy} />
          <InfoField label="Assigning Period" value={activeAssessment.assigningPeriod} />
          <InfoField 
            label="Previous Visit Date" 
            value={activeAssessment.previousVisitedDate ? formatDate(activeAssessment.previousVisitedDate) : undefined} 
          />
        </div>
      )
    },
    {
      id: 'evaluation-dynamic',
      title: 'Evaluation & Other',
      content: (
        <div className="space-y-4">
          <InfoField label="Follow-up Evaluation" value={activeAssessment.followUpEvaluation} />
          
          {activeAssessment.dynamicFields && Object.keys(activeAssessment.dynamicFields).length > 0 && (
            <div className="mt-4 pt-4 border-t border-slate-200">
              <h4 className="text-sm font-medium text-gray-800 mb-3">Additional Observations</h4>
              {renderJsonFields(activeAssessment.dynamicFields)}
            </div>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-4">
      {reassessments.length > 0 && (
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gray-50 p-4 rounded-sm border border-slate-200">
          <div>
            <h3 className="text-sm font-medium text-gray-900">Reassessment History</h3>
            <p className="text-xs text-gray-500 mt-1">Select a date to view past reports</p>
          </div>
          
          <div className="w-full sm:w-64">
          <Select
            value={activeAssessment.id}
            onValueChange={setSelectedReassessmentId}
          >
            <SelectTrigger className="w-full bg-white border-slate-200 text-gray-800">
              <SelectValue placeholder="Select date..." />
            </SelectTrigger>
            <SelectContent className='text-gray-800 bg-white'>
              {totalReassessments.map((r) => (
                <SelectItem key={r.id} value={r.id}>
                  {formatDate(r.createdAt, true)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          </div>
        </div>
      )}

      {sections.map((section) => {
        const isExpanded = expandedSections.includes(section.id);
        return (
          <div key={section.id} className="bg-white p-4 rounded border border-slate-200 shadow-none">
            <button 
              className="w-full flex justify-between items-center focus:outline-none group"
              onClick={() => toggleSection(section.id)}
            >
              <div className="flex items-center gap-3">
                <h2 className="text-base font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
                  {section.title}
                </h2>
                {!isExpanded && (
                  <span className="text-xs text-gray-400 bg-gray-50 px-2 py-0.5 rounded border border-slate-200">
                    Collapsed
                  </span>
                )}
              </div>
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${isExpanded ? 'transform rotate-180' : ''}`}
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {isExpanded && (
              <div className="pt-5 mt-2 animate-in fade-in slide-in-from-top-1 duration-200">
                {section.content}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default ReassessmentInfo;