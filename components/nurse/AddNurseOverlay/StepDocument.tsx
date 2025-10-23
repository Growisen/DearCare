import React, { useState } from 'react';
import { NurseDocuments, NurseFormData } from '@/types/staff.types';
import { Fields, FormField } from './FormComponents';
import { FORM_CONFIG } from './Config';

interface StepDocumentProps {
  setDocuments: React.Dispatch<React.SetStateAction<NurseDocuments>>;
  nurseData: NurseFormData;
  setNurseData: React.Dispatch<React.SetStateAction<NurseFormData>>;
}

export const StepDocument: React.FC<StepDocumentProps> = ({ setDocuments, nurseData, setNurseData }) => {
  const [nocStatus, setNocStatus] = useState<string>(nurseData.noc_status);

  return (
    <div className="space-y-6">
      <Fields.File
        label="Profile Image"
        docType="profile_image"
        onFileSelect={(file) => setDocuments(prev => ({ ...prev, profile_image: file }))}
        required={false}
      />
      <Fields.File
        label="Aadhar Card"
        docType="adhar"
        onFileSelect={(file) => setDocuments(prev => ({ ...prev, adhar: file }))}
        required={false}
      />
      <Fields.File
        label="Educational Certificates"
        docType="educational"
        onFileSelect={(file) => setDocuments(prev => ({ ...prev, educational: file }))}
        required={false}
      />
      <Fields.File
        label="Experience Certificates"
        docType="experience"
        onFileSelect={(file) => setDocuments(prev => ({ ...prev, experience: file }))}
        required={false}
      />
      <Fields.File
        label="Ration Card"
        docType="ration"
        onFileSelect={(file) => setDocuments(prev => ({ ...prev, ration: file }))}
        required={false}
      />
      <div className="space-y-4">
        <FormField label="NOC Certificate Status" required={false}>
          <select
            className={FORM_CONFIG.styles.input}
            value={nocStatus}
            onChange={(e) => {
              setNocStatus(e.target.value);
              setNurseData({ ...nurseData, noc_status: e.target.value });
            }}
          >
            <option value="">Select NOC status</option>
            {FORM_CONFIG.options.nocOptions.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </FormField>

        {nocStatus === 'Yes' && (
          <Fields.File
            label="NOC Certificate"
            docType="noc"
            onFileSelect={(file) => setDocuments(prev => ({ ...prev, noc: file }))}
            required={false}
          />
        )}
      </div>
    </div>
  )
};