import React from 'react';

interface DocumentsInfo {
  adhar: string | null;
  ration?: string | null;
  educational?: string | null;
  experience?: string | null;
  noc?: string | null;
}

interface DocumentsSectionProps {
  documentsInfo: DocumentsInfo;
}

const DocumentsSection: React.FC<DocumentsSectionProps> = ({ documentsInfo }) => {
  return (
    <div className="bg-white p-4 rounded border border-gray-200">
      <h2 className="text-base font-semibold text-gray-800 pb-2 border-b border-gray-200 mb-3">
        Documents
      </h2>
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {documentsInfo.adhar && (
            <div className="flex items-center p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div className="p-2 bg-red-50 rounded-lg mr-3">
                <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Aadhar Card</p>
                <a 
                  href={documentsInfo.adhar} 
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-blue-600 hover:underline"
                >
                  View Document
                </a>
              </div>
            </div>
          )}

          {documentsInfo.ration && (
            <div className="flex items-center p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div className="p-2 bg-green-50 rounded-lg mr-3">
                <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Ration Card</p>
                <a 
                  href={documentsInfo.ration} 
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-blue-600 hover:underline"
                >
                  View Document
                </a>
              </div>
            </div>
          )}

          {documentsInfo.educational && (
            <div className="flex items-center p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div className="p-2 bg-blue-50 rounded-lg mr-3">
                <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M12 14l9-5-9-5-9 5 9 5z" />
                  <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Educational Certificate</p>
                <a 
                  href={documentsInfo.educational} 
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-blue-600 hover:underline"
                >
                  View Document
                </a>
              </div>
            </div>
          )}

          {documentsInfo.experience && (
            <div className="flex items-center p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div className="p-2 bg-yellow-50 rounded-lg mr-3">
                <svg className="w-8 h-8 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Experience Certificate</p>
                <a 
                  href={documentsInfo.experience} 
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-blue-600 hover:underline"
                >
                  View Document
                </a>
              </div>
            </div>
          )}

          {documentsInfo.noc && (
            <div className="flex items-center p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div className="p-2 bg-purple-50 rounded-lg mr-3">
                <svg className="w-8 h-8 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">NOC Certificate</p>
                <a 
                  href={documentsInfo.noc} 
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-blue-600 hover:underline"
                >
                  View Document
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DocumentsSection;