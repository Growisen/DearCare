'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';

interface ProfileImageUploadProps {
  id: string;
  label: string;
  value?: File | null;
  onChange: (file: File | null) => void;
  required?: boolean;
}

const ProfileImageUpload: React.FC<ProfileImageUploadProps> = ({
  id,
  label,
  onChange,
  required = false,
}) => {
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      // Validate file size (limit to 2MB)
      if (file.size > 2 * 1024 * 1024) {
        alert('File size must be less than 2MB');
        return;
      }
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Only image files are allowed');
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      onChange(file);
    } else {
      setPreview(null);
      onChange(null);
    }
  };

  const handleRemoveImage = () => {
    setPreview(null);
    onChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor={id}>
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      
      <div className="mt-1 flex items-center">
        {preview ? (
          <div className="relative w-24 h-24 rounded-full overflow-hidden bg-gray-100 mr-4">
            <Image 
              src={preview} 
              alt="Profile preview" 
              fill 
              className="object-cover"
            />
          </div>
        ) : (
          <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center mr-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
        )}
        
        <div className="flex flex-col space-y-2">
          <label className="block">
            <span className="sr-only">Choose profile photo</span>
            <input
              ref={fileInputRef}
              id={id}
              name={id}
              type="file"
              accept="image/*"
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100"
              onChange={handleFileChange}
              required={required}
            />
          </label>
          
          {preview && (
            <button
              type="button"
              onClick={handleRemoveImage}
              className="text-sm text-red-600 hover:text-red-800"
            >
              Remove image
            </button>
          )}
        </div>
      </div>
      
      <p className="mt-1 text-sm text-gray-500">
        JPG, PNG or GIF up to 2MB
      </p>
    </div>
  );
};

export default ProfileImageUpload;