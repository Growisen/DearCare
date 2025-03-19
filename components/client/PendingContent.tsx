import React from 'react';

export function PendingContent() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Initial Assessment</h3>
        <div className="space-y-4">
          <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Start Review Process
          </button>
        </div>
      </div>
    </div>
  );
}