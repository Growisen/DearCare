import React from 'react';
import { ClientType } from '../../types/client.types';
import { clientTypeOptions } from '../../utils/constants';

interface ClientTypeSelectorProps {
  selectedType: ClientType;
  onTypeChange: (type: ClientType) => void;
}

export const ClientTypeSelector = ({ selectedType, onTypeChange }: ClientTypeSelectorProps) => {
  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-3">Client Type</h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {clientTypeOptions.map((type) => (
          <button
            key={type.id}
            onClick={() => onTypeChange(type.id)}
            className={`p-3 rounded-sm border ${
              selectedType === type.id
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-slate-200 hover:border-slate-200 text-gray-900 font-medium'
            } transition-colors duration-200`}
          >
            {type.label}
          </button>
        ))}
      </div>
    </div>
  );
};