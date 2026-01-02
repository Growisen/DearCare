import React from 'react';
import { AgreementSectionProps } from '@/types/agreement.types';

export const AgreementSection: React.FC<AgreementSectionProps> = ({
  title,
  content,
  // checkboxName,
  // checkboxLabel,
  // isChecked,
  // onChange
}) => {
  const bulletPoints = content
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0);

  return (
    <div className="space-y-3 p-4 rounded-sm bg-slate-50 border border-slate-200">
      <h3 className="font-semibold text-sm">{title}</h3>
      <ul className="text-sm text-slate-600 leading-relaxed list-disc pl-5">
        {bulletPoints.map((point, idx) => (
          <li key={idx}>{point.replace(/^•\s*/, '')}</li>
        ))}
      </ul>
      {/* <div className="flex items-start gap-3 pt-2">
        <input
          id={checkboxName}
          name={checkboxName}
          type="checkbox"
          checked={isChecked}
          onChange={onChange}
          className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-500/20"
        />
        <label htmlFor={checkboxName} className="text-sm text-slate-700 cursor-pointer">
          {checkboxLabel}
        </label>
      </div> */}
    </div>
  );
};