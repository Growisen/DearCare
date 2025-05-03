import React from 'react';

type ClientType = 'individual' | 'organization' | 'hospital' | 'carehome';

interface ClientTypeSelectorProps {
  selectedType: ClientType;
  onTypeChange: (type: ClientType) => void;
}

export const ClientTypeSelector = ({ selectedType, onTypeChange }: ClientTypeSelectorProps) => {
  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-3">Client Type</h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { id: 'individual', label: 'Individual' },
          { id: 'organization', label: 'Organization' },
          { id: 'hospital', label: 'Hospital' },
          { id: 'carehome', label: 'Care Home' }
        ].map((type) => (
          <button
            key={type.id}
            onClick={() => onTypeChange(type.id as ClientType)}
            className={`p-3 rounded-lg border ${
              selectedType === type.id
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-200 hover:border-gray-300 text-gray-900 font-medium'
            } transition-colors duration-200`}
          >
            {type.label}
          </button>
        ))}
      </div>
    </div>
  );
};