import React, { useState } from 'react';

export default function ReviewChecklist() {
  const [checklist, setChecklist] = useState({
    reviewedPersonalInfo: false,
    reviewedMedicalStatus: false,
    reviewedPsychologicalAssessment: false,
    reviewedSocialHistory: false,
    reviewedCurrentDetails: false,
    reviewedDiagnosis: false,
    reviewedEnvironment: false
  });

  const handleChecklistChange = (id: string, checked: boolean) => {
    setChecklist(prev => ({
      ...prev,
      [id]: checked
    }));
  };

  const allChecked = Object.values(checklist).every(item => item === true);

  return (
    <div className="bg-white border border-slate-200 p-4 rounded-sm">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Review Checklist</h3>
      <p className="mb-4 text-sm text-gray-600">Please confirm that you have reviewed all sections before approving:</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="flex items-center">
          <input
            type="checkbox"
            id="reviewedPersonalInfo"
            checked={checklist.reviewedPersonalInfo}
            onChange={(e) => handleChecklistChange('reviewedPersonalInfo', e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-200 rounded"
          />
          <label htmlFor="reviewedPersonalInfo" className="ml-2 block text-sm text-gray-700">
            Personal Information
          </label>
        </div>
        
        <div className="flex items-center">
          <input
            type="checkbox"
            id="reviewedMedicalStatus"
            checked={checklist.reviewedMedicalStatus}
            onChange={(e) => handleChecklistChange('reviewedMedicalStatus', e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-200 rounded"
          />
          <label htmlFor="reviewedMedicalStatus" className="ml-2 block text-sm text-gray-700">
            Medical Status
          </label>
        </div>
        
        <div className="flex items-center">
          <input
            type="checkbox"
            id="reviewedPsychologicalAssessment"
            checked={checklist.reviewedPsychologicalAssessment}
            onChange={(e) => handleChecklistChange('reviewedPsychologicalAssessment', e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-200 rounded"
          />
          <label htmlFor="reviewedPsychologicalAssessment" className="ml-2 block text-sm text-gray-700">
            Psychological Assessment
          </label>
        </div>
        
        <div className="flex items-center">
          <input
            type="checkbox"
            id="reviewedSocialHistory"
            checked={checklist.reviewedSocialHistory}
            onChange={(e) => handleChecklistChange('reviewedSocialHistory', e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-200 rounded"
          />
          <label htmlFor="reviewedSocialHistory" className="ml-2 block text-sm text-gray-700">
            Social History
          </label>
        </div>
        
        <div className="flex items-center">
          <input
            type="checkbox"
            id="reviewedCurrentDetails"
            checked={checklist.reviewedCurrentDetails}
            onChange={(e) => handleChecklistChange('reviewedCurrentDetails', e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-200 rounded"
          />
          <label htmlFor="reviewedCurrentDetails" className="ml-2 block text-sm text-gray-700">
            Current Details
          </label>
        </div>
        
        <div className="flex items-center">
          <input
            type="checkbox"
            id="reviewedDiagnosis"
            checked={checklist.reviewedDiagnosis}
            onChange={(e) => handleChecklistChange('reviewedDiagnosis', e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-200 rounded"
          />
          <label htmlFor="reviewedDiagnosis" className="ml-2 block text-sm text-gray-700">
            Diagnosis & Care Plan
          </label>
        </div>
        
        <div className="flex items-center">
          <input
            type="checkbox"
            id="reviewedEnvironment"
            checked={checklist.reviewedEnvironment}
            onChange={(e) => handleChecklistChange('reviewedEnvironment', e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-200 rounded"
          />
          <label htmlFor="reviewedEnvironment" className="ml-2 block text-sm text-gray-700">
            Environment & Equipment
          </label>
        </div>
      </div>
      
      {!allChecked && (
        <div className="text-amber-600 text-sm font-medium">
          Please review all sections before approving the patient&apos;s assessment.
        </div>
      )}
      
      {allChecked && (
        <div className="text-green-600 text-sm font-medium">
          ✓ All sections have been reviewed and are ready for approval.
        </div>
      )}
    </div>
  );
}