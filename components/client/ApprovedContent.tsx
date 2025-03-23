import React from 'react';

export function ApprovedContent() {
  return (
    <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="flex flex-col space-y-4">
        <div className="pt-4 border-t border-gray-100">
          <p className="text-gray-700">
            This client request has been approved and is ready for service.
          </p>
        </div>
      </div>
    </div>
  );
}

export default ApprovedContent;