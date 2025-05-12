import React from 'react';

interface InfoFieldProps {
  label: string;
  value?: string | null;
  fallback?: string;
  icon?: React.ReactNode;
}

const InfoField: React.FC<InfoFieldProps> = ({ 
  label, 
  value, 
  fallback = 'Not specified', 
  icon,
}) => {
  const displayValue = value || fallback;
  
  return (
    <div className="group">
      <p className="text-xs text-gray-500 font-medium flex items-center gap-1 mb-1">
        {icon && <span className="mr-1">{icon}</span>}
        {label}
      </p>
        <p className={`text-sm ${value ? 'text-gray-700' : 'text-gray-500 italic'}`}>
          {displayValue}
        </p>
    </div>
  );
};

export default InfoField;