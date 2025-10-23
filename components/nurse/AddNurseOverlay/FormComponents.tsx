import React, { useState, useRef } from 'react';
import { X, ChevronDown, Check } from 'lucide-react';
import Image from 'next/image';
import { DropdownProps } from '@/types/staff.types';
import { FORM_CONFIG } from './Config';

// Utility components
export const FormField = ({ label, required = true, children }: { label: string, required?: boolean, children: React.ReactNode }) => (
  <div>
    <label className={FORM_CONFIG.styles.label}>{label}{required && ' *'}</label>
    {children}
  </div>
);

export const FormLayout = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
  <div className={`${FORM_CONFIG.styles.layout} ${className}`}>{children}</div>
);

// Form field components consolidated into a single object
export const Fields = {
  Input: ({ label, required = true, ...props }: {
    label: string,
    required?: boolean
  } & React.InputHTMLAttributes<HTMLInputElement>) => (
    <FormField label={label} required={required}>
      <input
        {...props}
        required={required}
        className={FORM_CONFIG.styles.input}
      />
    </FormField>
  ),

  Select: ({ label, options, value, onChange, required = true }: { label: string, options: readonly string[] | string[], value: string, onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void, required?: boolean }) => (
    <FormField label={label} required={required}>
      <select className={FORM_CONFIG.styles.input} value={value} onChange={onChange} required={required}>
        <option value="">Select {label.toLowerCase()}</option>
        {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
      </select>
    </FormField>
  ),

  TextArea: ({ label, required=false, ...props }: { label: string, required?: boolean } & React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
    <FormField label={label} required={required}>
      <textarea {...props} required={required} className={FORM_CONFIG.styles.input} rows={3} />
    </FormField>
  ),

  Dropdown: ({ label, options, selectedOptions, toggleOption, isOpen, setIsOpen, dropdownRef }: DropdownProps) => (
    <div className="relative" ref={dropdownRef}>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        <span className="text-gray-400 text-xs ml-1">({selectedOptions.length} selected)</span>
      </label>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full rounded-lg border border-gray-200 py-2 px-3 text-sm text-left bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 flex items-center justify-between"
      >
        <span className="truncate">{selectedOptions.length ? `${selectedOptions.length} selected` : 'Select options...'}</span>
        <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${isOpen ? 'transform rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
          <div className="p-2 space-y-1">
            {options.map((option: string, idx: number) => (
              <button
                key={idx}
                onClick={() => toggleOption(option)}
                className="w-full px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 rounded-md flex items-center justify-between group transition-colors duration-200"
              >
                <span>{option}</span>
                {selectedOptions.includes(option) && <Check className="h-4 w-4 text-blue-500" />}
              </button>
            ))}
          </div>
        </div>
      )}
      <div className="mt-2 flex flex-wrap gap-2">
        {selectedOptions.map((option: string, idx: number) => (
          <div key={idx} className="flex items-center bg-blue-50 border border-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm group hover:bg-blue-100 transition-colors duration-200">
            {option}
            <button type="button" onClick={() => toggleOption(option)} className="ml-2 text-blue-400 hover:text-blue-600 group-hover:text-blue-700" aria-label={`Remove ${option}`}>
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
      </div>
    </div>
  ),

  File: ({ label, docType, onFileSelect, required = true }: {
    label: string,
    docType: string,
    onFileSelect: (file: File) => void,
    required?: boolean
  }) => {
    const [preview, setPreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const getAcceptedFileTypes = (type: string) => {
      const typeMap: Record<string, string> = {
        'ration': '.pdf,.jpg,.jpeg,.png',
        'aadhar': '.pdf,.jpg,.jpeg,.png',
        'pan': '.pdf,.jpg,.jpeg,.png',
        'passport': '.pdf,.jpg,.jpeg,.png',
        'default': '.pdf,.jpg,.jpeg,.png'
      };
      return typeMap[type] || typeMap.default;
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        onFileSelect(file);

        if (file.type.startsWith('image/')) {
          const reader = new FileReader();
          reader.onload = (e) => setPreview(e.target?.result as string);
          reader.readAsDataURL(file);
        } else {
          setPreview(null);
        }
      }
    };

    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label} {docType && <span className="text-xs text-gray-500">({docType})</span>}
        </label>
        <div className="mt-1 space-y-2">
          <div className="flex items-center">
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              onChange={handleFileSelect}
              accept={getAcceptedFileTypes(docType)}
              required={required}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Choose File
            </button>
            <span className="ml-3 text-sm text-gray-500">
              {fileInputRef.current?.files?.[0]?.name || "No file chosen"}
            </span>
          </div>
          {preview && (
            <div className="relative w-32 h-32 border rounded-lg overflow-hidden">
              <Image
                src={preview}
                alt="File preview"
                fill
                className="object-cover"
                sizes="128px"
              />
            </div>
          )}
        </div>
      </div>
    );
  }
};