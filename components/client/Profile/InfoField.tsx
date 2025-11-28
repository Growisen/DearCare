import React from 'react';

interface InfoFieldProps {
  label: string;
  value?: string | null | number;
  fallback?: string;
  icon?: React.ReactNode;
  className?: string; 
}

const InfoField: React.FC<InfoFieldProps> = ({ 
  label, 
  value, 
  fallback = 'Not specified', 
  icon,
  className = ""
}) => {
  const displayValue = (value !== null && value !== undefined && value !== '') ? value : fallback;
  const isFallback = displayValue === fallback;
  
  return (
    <div className={`group ${className}`}>
      <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide flex items-center gap-1.5 mb-1.5">
        {icon && <span className="text-gray-400">{icon}</span>}
        {label}
      </p>
      <p className={`text-sm leading-relaxed whitespace-pre-wrap ${isFallback ? 'text-gray-400 italic' : 'text-gray-800 font-medium'}`}>
        {displayValue}
      </p>
    </div>
  );
};

export default InfoField;