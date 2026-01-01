import React from 'react';

interface InputFieldProps {
  label: string;
  type?: string;
  placeholder: string;
  id: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  error?: string;
  required?: boolean;
  onBlur?: () => void;
}

export const InputField = ({
  label,
  type = 'text',
  placeholder,
  id,
  value,
  onChange,
  error,
  required = false,
  onBlur
}: InputFieldProps) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor={id}>
      {label}{required && <span className="text-red-500 ml-1">*</span>}
    </label>
    <input
      type={type}
      id={id}
      className={`w-full rounded-sm border ${error ? 'border-red-500' : 'border-slate-200'} py-2 px-3 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200`}
      placeholder={placeholder}
      aria-label={label}
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      aria-invalid={error ? "true" : "false"}
    />
    {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
  </div>
);