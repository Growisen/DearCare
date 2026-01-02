import React from 'react';

interface InputFieldProps {
  label: string;
  type?: string;
  placeholder: string;
  id: string;
  value: number | string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  required?: boolean;
}

export const InputField = ({ label, type = 'text', placeholder, id, value, onChange, required = false }: InputFieldProps) => (
  <div className="mb-4">
    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor={id}>
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {type === 'textarea' ? (
      <textarea
        id={id}
        className="w-full border border-slate-200 rounded-sm py-2 px-3 text-gray-700 focus:outline-none"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        rows={4}
      />
    ) : (
      <input
        type={type}
        id={id}
        className="w-full border border-slate-200 rounded-sm py-2 px-3 text-gray-700 focus:outline-none"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
      />
    )}
  </div>
);