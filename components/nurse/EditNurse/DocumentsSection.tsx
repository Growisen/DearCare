"use client"
import React from 'react';
import { DocumentUploader } from './DocumentUploader';
import { SimplifiedNurseDetails, TempFile } from './types';

type Props = {
  formData: SimplifiedNurseDetails | null;
  tempFiles: Record<string, TempFile[]>;
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>, type: string) => void;
  handleRemoveDocument: (type: string) => void;
  handleRemoveTempFile: (docType: string, index: number) => void;
};

export const DocumentsSection: React.FC<Props> = ({
  formData, tempFiles, handleFileUpload, handleRemoveDocument, handleRemoveTempFile
}) => {
  return (
    <section className="bg-gray-50 rounded-sm p-5">
      <div className="flex items-center justify-between mb-4 border-b border-slate-200 pb-2">
        <h2 className="text-lg font-semibold text-gray-800">Documents</h2>
        <div className="text-xs text-gray-500">All documents must be in PDF, JPG, or PNG format</div>
      </div>
      
      <div className="space-y-6">
        <div>
          <div className="flex items-center mb-3">
            <svg className="w-5 h-5 text-gray-700 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
            </svg>
            <h3 className="text-sm font-medium text-gray-700">Identity Documents</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <DocumentUploader 
              document={{
                fieldName: 'adhar',
                label: 'Aadhar Card',
                currentValue: formData?.documents.adhar || undefined
              }}
              onFileUpload={handleFileUpload}
              onRemove={handleRemoveDocument}
              tempFiles={tempFiles['adhar']}
              onRemoveTempFile={(index) => handleRemoveTempFile('adhar', index)}
            />
            
            <DocumentUploader 
              document={{
                fieldName: 'ration',
                label: 'Ration Card',
                currentValue: formData?.documents.ration || undefined
              }}
              onFileUpload={handleFileUpload}
              onRemove={handleRemoveDocument}
              tempFiles={tempFiles['ration']}
              onRemoveTempFile={(index) => handleRemoveTempFile('ration', index)}
            />
          </div>
        </div>
        
        <div>
          <div className="flex items-center mb-3">
            <svg className="w-5 h-5 text-gray-700 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <h3 className="text-sm font-medium text-gray-700">Professional Documents</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <DocumentUploader 
              document={{
                fieldName: 'educational',
                label: 'Educational Qualifications',
                currentValue: formData?.documents.educational || undefined,
                allowMultiple: true
              }}
              onFileUpload={handleFileUpload}
              onRemove={handleRemoveDocument}
              tempFiles={tempFiles['educational']}
              onRemoveTempFile={(index) => handleRemoveTempFile('educational', index)}
            />
            
            <DocumentUploader 
              document={{
                fieldName: 'experience',
                label: 'Work Experience',
                currentValue: formData?.documents.experience || undefined,
                allowMultiple: true
              }}
              onFileUpload={handleFileUpload}
              onRemove={handleRemoveDocument}
              tempFiles={tempFiles['experience']}
              onRemoveTempFile={(index) => handleRemoveTempFile('experience', index)}
            />
          </div>
        </div>
        
        <div>
          <div className="flex items-center mb-3">
            <svg className="w-5 h-5 text-gray-700 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
            <h3 className="text-sm font-medium text-gray-700">Certificates</h3>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            <DocumentUploader 
              document={{
                fieldName: 'noc',
                label: 'NOC Certificate',
                currentValue: formData?.documents.noc || undefined
              }}
              onFileUpload={handleFileUpload}
              onRemove={handleRemoveDocument}
              tempFiles={tempFiles['noc']}
              onRemoveTempFile={(index) => handleRemoveTempFile('noc', index)}
            />
          </div>
        </div>
      </div>
    </section>
  );
};