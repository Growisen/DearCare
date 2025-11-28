import React from 'react';
import { dutyPeriodOptions } from '@/utils/constants';

interface DutyPeriodSelectorProps {
  dutyPeriod: string;
  dutyPeriodReason: string;
  formErrors: {
    [key: string]: string;
  };
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleBlur: (id: string) => void;
}

export function DutyPeriodSelector({
  dutyPeriod,
  dutyPeriodReason,
  formErrors,
  handleInputChange,
  handleBlur,
}: DutyPeriodSelectorProps) {
  const showReasonField = dutyPeriod === 'above_3_months';

  const baseInputStyles = `
    w-full border border-gray-200 bg-white rounded-sm py-2 px-3 text-sm text-gray-800 
    placeholder:text-gray-400
    focus:border-gray-400 focus:outline-none focus:ring-0 
    transition-colors duration-200
  `;
  
  const errorInputStyles = "border-red-400 bg-red-50 text-red-900 focus:border-red-500";
  const labelStyles = "block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5";
  const errorTextStyles = "mt-1 text-xs text-red-500";

  return (
    <div className="grid grid-cols-1 gap-5">
      <div>
        <label htmlFor="dutyPeriod" className={labelStyles}>
          Duty Period <span className="text-red-500">*</span>
        </label>
        <select
          id="dutyPeriod"
          value={dutyPeriod}
          onChange={handleInputChange}
          onBlur={() => handleBlur('dutyPeriod')}
          className={`${baseInputStyles} ${formErrors.dutyPeriod ? errorInputStyles : ''} appearance-none`}
          style={{ backgroundImage: 'none' }}
        >
          {dutyPeriodOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {formErrors.dutyPeriod && (
          <p className={errorTextStyles}>{formErrors.dutyPeriod}</p>
        )}
      </div>

      {showReasonField && (
        <div className="animate-in fade-in slide-in-from-top-1 duration-200">
          <label htmlFor="dutyPeriodReason" className={labelStyles}>
            Reason for Extended Duration <span className="text-red-500">*</span>
          </label>
          <textarea
            id="dutyPeriodReason"
            value={dutyPeriodReason}
            onChange={handleInputChange}
            onBlur={() => handleBlur('dutyPeriodReason')}
            className={`${baseInputStyles} ${formErrors.dutyPeriodReason ? errorInputStyles : ''} min-h-[80px] resize-y`}
            placeholder="Please explain why you need care for more than 3 months"
          ></textarea>
          {formErrors.dutyPeriodReason && (
            <p className={errorTextStyles}>{formErrors.dutyPeriodReason}</p>
          )}
        </div>
      )}
    </div>
  );
}