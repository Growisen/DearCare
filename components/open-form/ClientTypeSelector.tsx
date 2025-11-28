import React from 'react';
import { User, Building2, Hospital, Home } from 'lucide-react';

export type ClientType = 'individual' | 'organization' | 'hospital' | 'carehome';

interface ClientTypeSelectorProps {
  clientType: ClientType;
  onClientTypeChange: (type: ClientType) => void;
}

export const ClientTypeSelector = ({ clientType, onClientTypeChange }: ClientTypeSelectorProps) => {
  const clientTypes = [
    { id: 'individual', label: 'Individual', icon: User },
    { id: 'organization', label: 'Organization', icon: Building2 },
    { id: 'hospital', label: 'Hospital', icon: Hospital },
    { id: 'carehome', label: 'Care Home', icon: Home }
  ];

  const headerStyle = "text-base font-semibold text-gray-800 mb-4";
  const tileBaseStyle = "relative flex items-center justify-center py-2.5 px-3 border rounded-sm cursor-pointer transition-all duration-200 select-none group";
  const tileSelectedStyle = "bg-blue-50 border-blue-200 text-blue-700 font-medium shadow-sm";
  const tileUnselectedStyle = "bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50";
  const radioInputStyle = "sr-only";

  return (
    <div className="mb-6 border-b border-gray-100 pb-6">
      <h2 className={headerStyle}>Client Type</h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {clientTypes.map((type) => {
          const isSelected = clientType === type.id;
          const Icon = type.icon;
          
          return (
            <label 
              key={type.id} 
              className={`${tileBaseStyle} ${isSelected ? tileSelectedStyle : tileUnselectedStyle}`}
            >
              <input
                type="radio"
                name="clientType"
                value={type.id}
                checked={isSelected}
                onChange={() => onClientTypeChange(type.id as ClientType)}
                className={radioInputStyle}
              />
              <Icon 
                className={`w-4 h-4 mr-2 ${isSelected ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-500'}`} 
                strokeWidth={2}
              />
              <span className="text-sm">{type.label}</span>
            </label>
          );
        })}
      </div>

      <div className="mt-4">
        {getInstructions(clientType)}
      </div>
    </div>
  );
};

function getInstructions(clientType: ClientType) {
  const containerStyle = "p-3 bg-gray-50 rounded-sm border border-gray-100 text-xs text-gray-600 leading-relaxed";
  
  switch (clientType) {
    case 'individual':
      return (
        <div className={containerStyle}>
          <span className="font-semibold text-gray-700 block mb-1">Individual Registration</span>
          Please provide information about both the requestor (you) and the patient. All fields marked with * are required. 
          If you are registering for yourself, select &quot;Self&quot; as the relation to patient.
        </div>
      );
    case 'organization':
      return (
        <div className={containerStyle}>
          <span className="font-semibold text-gray-700 block mb-1">Organization Registration</span>
          Please provide your organization details and contact information. You&apos;ll need to specify staff requirements including 
          staff types, counts, and shift types for each position needed.
        </div>
      );
    case 'hospital':
      return (
        <div className={containerStyle}>
          <span className="font-semibold text-gray-700 block mb-1">Hospital Registration</span>
          For hospital registrations, include complete contact details and address information. Medical staff requirements 
          should be specified with qualification levels and experience requirements in the additional notes.
        </div>
      );
    case 'carehome':
      return (
        <div className={containerStyle}>
          <span className="font-semibold text-gray-700 block mb-1">Care Home Registration</span>
          For care home registrations, please specify the facility type, number of residents, and detailed staff requirements. 
          Include any specific qualifications needed for specialized care.
        </div>
      );
    default:
      return null;
  }
}