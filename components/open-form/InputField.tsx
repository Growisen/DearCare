import React, { memo } from 'react';

interface InputFieldProps {
  label: string;
  type?: string;
  placeholder: string;
  id: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  required?: boolean;
  min?: string | number;
  onBlur?: () => void;
  error?: string;
}

const InputField = memo(({ 
  label, 
  type = 'text', 
  placeholder, 
  id, 
  value, 
  onChange, 
  required = false,
  min,
  onBlur,
  error
}: InputFieldProps) => (
  <div className="mb-4">
    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor={id}>
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      type={type}
      id={id}
      name={id}
      className={`w-full border py-2 px-3 text-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-300 focus:border-transparent ${
        error ? 'border-red-500' : 'border-slate-200'
      }`}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      required={required}
      autoComplete="off"
      min={min}
      onBlur={onBlur ? () => onBlur() : undefined}
    />
    {error && (
      <p className="mt-1 text-sm text-red-600">{error}</p>
    )}
  </div>
));

InputField.displayName = 'InputField';

export default InputField;