"use client"

import React, { useRef } from "react";

interface FileUploadProps {
  label?: string;
  accept?: string;
  value: File | null;
  onChange: (file: File | null) => void;
  error?: string;
  helperText?: string;
}

const FileUpload: React.FC<FileUploadProps> = ({
  label,
  accept,
  value,
  onChange,
  error,
  helperText,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onChange(e.target.files[0]);
    }
  };

  const handleRemove = () => {
    onChange(null);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium mb-2 text-gray-700">
          {label}
        </label>
      )}
      
      {!value ? (
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={handleFileChange}
          className={`block w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-slate-50 file:text-slate-700 hover:file:bg-slate-100 border rounded-md cursor-pointer ${error ? 'border-red-400' : 'border-gray-300'}`}
        />
      ) : (
        <div className={`flex items-center justify-between p-3 border rounded-md bg-gray-50 ${error ? 'border-red-400' : 'border-gray-300'}`}>
          <div className="flex items-center overflow-hidden">
            <svg className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="text-sm text-gray-700 truncate font-medium">
              {value.name}
            </span>
            <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
              ({(value.size / 1024).toFixed(1)} KB)
            </span>
          </div>
          <button
            onClick={handleRemove}
            className="text-gray-400 hover:text-red-500 focus:outline-none p-1 rounded-full hover:bg-gray-200 transition-colors"
            type="button"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {error && <p className="text-red-600 text-xs mt-1.5">{error}</p>}
      {!error && helperText && <p className="text-gray-500 text-xs mt-1.5">{helperText}</p>}
    </div>
  );
};

export default FileUpload;