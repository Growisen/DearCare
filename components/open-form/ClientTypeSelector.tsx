import React from 'react';

type ClientType = 'individual' | 'organization' | 'hospital' | 'carehome';

interface ClientTypeSelectorProps {
  clientType: ClientType;
  onClientTypeChange: (type: ClientType) => void;
}

export const ClientTypeSelector = ({ clientType, onClientTypeChange }: ClientTypeSelectorProps) => {
  const clientTypes = [
    { id: 'individual', label: 'Individual' },
    { id: 'organization', label: 'Organization' },
    { id: 'hospital', label: 'Hospital' },
    { id: 'carehome', label: 'Care Home' }
  ];

  return (
    <div className="mb-8 border-b border-gray-200 pb-6">
      <h2 className="text-lg font-medium text-gray-900 mb-4">Client Type</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {clientTypes.map((type) => (
          <div key={type.id} className="flex items-center">
            <input
              id={`type-${type.id}`}
              type="radio"
              name="clientType"
              checked={clientType === type.id}
              onChange={() => onClientTypeChange(type.id as ClientType)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
            />
            <label htmlFor={`type-${type.id}`} className="ml-2 block text-sm font-medium text-gray-700">
              {type.label}
            </label>
          </div>
        ))}
      </div>

      {clientType && (
        <div className="mt-4 p-4 bg-blue-50 border-l-4 border-blue-500 rounded-md">
          <h3 className="text-sm font-medium text-blue-700">
            Instructions for {clientType.charAt(0).toUpperCase() + clientType.slice(1)} Registration
          </h3>
          {getInstructions(clientType)}
        </div>
      )}
    </div>
  );
};

function getInstructions(clientType: ClientType) {
  switch (clientType) {
    case 'individual':
      return (
        <p className="text-sm text-gray-600 mt-1">
          Please provide information about both the requestor (you) and the patient. All fields marked with * are required. 
          If you are registering for yourself, select &quot;Self&quot; as the relation to patient and fill the same details.
        </p>
      );
    case 'organization':
      return (
        <p className="text-sm text-gray-600 mt-1">
          Please provide your organization details and contact information. You&apos;ll need to specify staff requirements including 
          staff types, counts, and shift types for each position needed.
        </p>
      );
    case 'hospital':
      return (
        <p className="text-sm text-gray-600 mt-1">
          For hospital registrations, include complete contact details and address information. Medical staff requirements 
          should be specified with qualification levels and experience requirements in the additional notes.
        </p>
      );
    case 'carehome':
      return (
        <p className="text-sm text-gray-600 mt-1">
          For care home registrations, please specify the facility type, number of residents, and detailed staff requirements. 
          Include any specific qualifications needed for specialized care in the additional notes.
        </p>
      );
  }
}