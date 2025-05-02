import React from 'react';

interface InfoFieldProps {
  label: string;
  value: string | number | undefined;
  fallback?: string;
}

const InfoField: React.FC<InfoFieldProps> = ({ 
  label, 
  value, 
  fallback = 'Not recorded' 
}) => {
  return (
    <div>
      <p className="text-xs text-gray-500 font-medium">{label}</p>
      <p className="text-sm text-gray-700">{value || fallback}</p>
    </div>
  );
};

export default InfoField;