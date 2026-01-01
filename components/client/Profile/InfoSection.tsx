import React, { ReactNode } from 'react';

interface InfoSectionProps {
  title: string;
  children: ReactNode;
  className?: string;
}

const InfoSection: React.FC<InfoSectionProps> = ({ title, children, className }) => {
  return (
    <div className={`bg-white rounded-sm p-4 shadow-none ${className || ''}`}>
      <h3 className="text-sm font-semibold mb-3 text-gray-800 border-b pb-2">{title}</h3>
      {children}
    </div>
  );
};

export default InfoSection;