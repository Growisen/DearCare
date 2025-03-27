import React, { memo } from 'react';

interface InputFieldProps {
  label: string;
  type?: string;
  placeholder: string;
  id: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  required?: boolean;
}

const InputField = memo(({ 
  label, 
  type = 'text', 
  placeholder, 
  id, 
  value, 
  onChange, 
  required = false 
}: InputFieldProps) => (
  <div className="mb-4">
    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor={id}>
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      type={type}
      id={id}
      name={id}
      className="w-full border border-gray-300 rounded-md py-2 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      required={required}
      autoComplete="off"
    />
  </div>
));

// Add display name for debugging purposes
InputField.displayName = 'InputField';

export default InputField;