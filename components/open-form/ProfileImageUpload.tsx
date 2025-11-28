'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { User, Upload, X } from 'lucide-react';

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
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const file = e.target.files?.[0] || null;
    
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setError('File size must be less than 2MB');
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        return;
      }

      if (!file.type.startsWith('image/')) {
        setError('Only image files are allowed');
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
    setError(null);
    onChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const labelStyles = "block text-xs font-medium text-gray-500 uppercase tracking-wide mb-2";
  const buttonBaseStyles = "inline-flex items-center px-3 py-1.5 border border-gray-200 rounded-sm text-xs font-medium bg-white text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors cursor-pointer select-none";
  const removeButtonStyles = "inline-flex items-center px-3 py-1.5 border border-transparent rounded-sm text-xs font-medium text-red-600 hover:bg-red-50 transition-colors cursor-pointer ml-2";

  return (
    <div className="mb-4">
      <label className={labelStyles} htmlFor={id}>
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      
      <div className="flex items-center gap-4">
        <div className="relative w-14 h-14 shrink-0 rounded-full overflow-hidden bg-gray-100 border border-gray-200">
          {preview ? (
            <Image 
              src={preview} 
              alt="Profile preview" 
              fill 
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <User size={24} strokeWidth={1.5} />
            </div>
          )}
        </div>

        <div className="flex flex-col justify-center">
          <div className="flex items-center">
            <label className={buttonBaseStyles}>
              <Upload size={14} className="mr-2 text-gray-500" />
              Choose Image
              <input
                ref={fileInputRef}
                id={id}
                name={id}
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={handleFileChange}
                required={required}
              />
            </label>
            
            {preview && (
              <button
                type="button"
                onClick={handleRemoveImage}
                className={removeButtonStyles}
              >
                <X size={14} className="mr-1" />
                Remove
              </button>
            )}
          </div>
          
          <div className="mt-1.5">
             {error ? (
                <p className="text-xs text-red-500 animate-in fade-in">{error}</p>
             ) : (
                <p className="text-[10px] text-gray-400 uppercase tracking-wide">
                  Max 2MB • JPG/PNG
                </p>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileImageUpload;