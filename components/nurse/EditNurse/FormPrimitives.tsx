"use client"
import React from 'react';
import { FormFieldProps } from './types';

// This file contains all the primitive, reusable form input components.

const formFieldStyles = {
  input: "w-full px-3 py-2 bg-gray-50 text-gray-700 border border-slate-200 rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 hover:border-slate-200",
  label: "block text-xs font-medium text-gray-600 transition-colors duration-200",
  error: "text-xs text-red-500 mt-1"
};

export const FormInput = ({ label, name, value = "", onChange, type = "text", error, ...props }: 
  FormFieldProps & { type?: string }) => (
  <div className="space-y-1">
    <label className={formFieldStyles.label}>{label}</label>
    <input type={type} name={name} value={value} onChange={onChange} className={formFieldStyles.input} {...props}/>
    {error && <span className={formFieldStyles.error}>{error}</span>}
  </div>
);

export const FormSelect = ({ label, name, value = "", onChange, options, error }: 
  FormFieldProps & { options: { value: string; label: string; }[] }) => (
  <div className="space-y-1">
    <label className={formFieldStyles.label}>{label}</label>
    <select name={name} value={value} onChange={onChange} className={`${formFieldStyles.input} appearance-none`}>
      {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
    </select>
    {error && <span className={formFieldStyles.error}>{error}</span>}
  </div>
);

export const FormTextArea = ({ label, name, value = "", onChange, rows = 3, error }: 
  FormFieldProps & { rows?: number }) => (
  <div className="space-y-1">
    <label className={formFieldStyles.label}>{label}</label>
    <textarea name={name} value={value} onChange={onChange} rows={rows} className={formFieldStyles.input} />
    {error && <span className={formFieldStyles.error}>{error}</span>}
  </div>
);

export const FormMultiSelect = ({ label, values = [], onAdd, onRemove, options, error }: 
  Omit<FormFieldProps, 'value'> & { values: string[]; onAdd: (v: string) => void; onRemove: (v: string) => void; 
  options: { value: string; label: string; }[] }) => (
  <div className="space-y-2">
    <label className={formFieldStyles.label}>{label}</label>
    <div className="flex flex-wrap gap-2 mb-2">
      {values.map(value => (
        <span key={value} className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
          {value}
          <button type="button" onClick={() => onRemove(value)} className="ml-1 text-blue-400 hover:text-blue-600">×</button>
        </span>
      ))}
    </div>
    <select onChange={e => e.target.value && onAdd(e.target.value)} value="" 
      className={`${formFieldStyles.input} appearance-none`}>
      <option value="">Add Location</option>
      {options.filter(opt => !values.includes(opt.value))
        .map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
    </select>
    {error && <span className={formFieldStyles.error}>{error}</span>}
  </div>
);