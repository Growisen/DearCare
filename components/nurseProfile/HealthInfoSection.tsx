import React from 'react';

interface HealthInfo {
  health_status: string | null;
  disability?: string | null;
  source: string | null;
}

interface HealthInfoSectionProps {
  healthInfo: HealthInfo | null;
}

const HealthInfoSection: React.FC<HealthInfoSectionProps> = ({ healthInfo }) => {
  if (!healthInfo) return null;
  
  return (
    <div className="bg-white p-4 rounded border border-gray-200">
      <h2 className="text-base font-semibold text-gray-800 pb-2 border-b border-gray-200 mb-3">
        Health Information
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-center space-x-3 mb-2">
            <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <h3 className="text-sm font-medium text-gray-700">Current Health Status</h3>
          </div>
          <p className="text-sm text-gray-600">{healthInfo.health_status}</p>
        </div>

        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-center space-x-3 mb-2">
            <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-sm font-medium text-gray-700">Disability Details</h3>
          </div>
          <p className="text-sm text-gray-600">{healthInfo.disability || 'None'}</p>
        </div>

        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-center space-x-3 mb-2">
            <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-sm font-medium text-gray-700">Source of Information</h3>
          </div>
          <p className="text-sm text-gray-600">{healthInfo.source}</p>
        </div>
      </div>
    </div>
  );
};

export default HealthInfoSection;