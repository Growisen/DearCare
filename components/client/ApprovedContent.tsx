import React from 'react';

interface ApprovedContentProps {
  client: {
    assignedNurse?: string;
    shift?: string;
    condition?: string;
    medications?: string[];
    specialInstructions?: string;
  };
}

export function ApprovedContent({ client }: ApprovedContentProps) {
  return (
    <>
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">Care Assignment</h3>
          <button className="px-3 py-1.5 text-white bg-blue-600 rounded-lg hover:bg-blue-700 text-sm">
            Update Assignment
          </button>
        </div>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
          <div>
            <dt className="text-sm font-medium text-gray-500">Assigned Nurse</dt>
            <dd className="text-sm text-gray-900">{client.assignedNurse || 'Not assigned'}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Shift</dt>
            <dd className="text-sm text-gray-900">{client.shift || 'Not specified'}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Care Period</dt>
            <dd className="text-sm text-gray-900">Not specified</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Next Review</dt>
            <dd className="text-sm text-gray-900">Not scheduled</dd>
          </div>
        </dl>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900">Care Details</h3>
          <div className="flex gap-2">
            <button className="px-3 py-1.5 text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 text-sm">
              Edit Details
            </button>
            <button className="px-3 py-1.5 text-red-600 border border-red-200 rounded-lg hover:bg-red-50 text-sm">
              End Care
            </button>
          </div>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg space-y-4">
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-2">Medical Condition</h4>
            <p className="text-sm text-gray-600">{client.condition}</p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-2">Medications</h4>
            <ul className="list-disc list-inside text-sm text-gray-600">
              {client.medications?.map((med, index) => (
                <li key={index}>{med}</li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-2">Care Instructions</h4>
            <p className="text-sm text-gray-600">{client.specialInstructions}</p>
          </div>
        </div>
      </div>
    </>
  );
}