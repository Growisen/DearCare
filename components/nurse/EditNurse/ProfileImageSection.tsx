"use client"
import React, { useMemo } from 'react';
import Image from 'next/image';
import { IconCollection } from './IconComponents';
import { SimplifiedNurseDetails, TempFile } from './types';

type Props = {
  formData: SimplifiedNurseDetails | null;
  tempFiles: Record<string, TempFile[]>;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>, docType: string) => void;
  onRemoveDocument: (docType: string) => void;
  onRemoveTempFile: (docType: string, index: number) => void;
};

export const ProfileImageSection: React.FC<Props> = ({
  formData, tempFiles, onFileUpload, onRemoveDocument, onRemoveTempFile
}) => {
  
  const renderProfileImage = useMemo(() => {
    if (!formData) return null;
    
    // Show temp file preview if available
    if (tempFiles["profile_image"]?.length > 0) {
      return (
        <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg">
          <Image
            src={tempFiles["profile_image"][0].preview}
            alt="New Profile"
            fill
            className="object-cover"
            sizes="128px"
            priority
          />
          <button 
            onClick={() => onRemoveTempFile('profile_image', 0)}
            className="absolute bottom-0 right-0 p-1.5 rounded-full bg-white shadow-md text-red-500 hover:text-red-600"
            title="Remove new profile image"
            type="button"
          >
            {IconCollection.remove}
          </button>
        </div>
      );
    } 
    
    // Show existing profile image
    if (formData.documents.profile_image) {
      return (
        <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg">
          <Image
            src={formData.documents.profile_image}
            alt="Profile"
            fill
            className="object-cover"
            sizes="128px"
            priority
          />
          <button 
            onClick={() => onRemoveDocument('profile_image')}
            className="absolute bottom-0 right-0 p-1.5 rounded-full bg-white shadow-md text-red-500 hover:text-red-600"
            title="Remove profile image"
            type="button"
          >
            {IconCollection.remove}
          </button>
        </div>
      );
    }
    
    // Show empty profile placeholder
    return (
      <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center border-4 border-white shadow-lg">
        {IconCollection.profile}
      </div>
    );
  }, [formData, tempFiles, onRemoveDocument, onRemoveTempFile]);

  return (
    <section className="bg-gray-50 rounded-lg p-5">
      <h2 className="text-lg font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-2">
        Profile Image
      </h2>
      <div className="flex items-start flex-col md:flex-row gap-6">
        {renderProfileImage}
        
        <div className="flex-1 w-full">
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Upload Profile Image</h4>
            <p className="text-xs text-gray-500 mb-3">Please upload a clear photo. Profile image should be JPG or PNG format.</p>
            <label 
              htmlFor="profile-image-upload" 
              className="flex items-center justify-center w-full p-4 bg-gray-50 border border-gray-200 border-dashed rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
            >
              <div className="flex flex-col items-center">
                {IconCollection.upload}
                <span className="text-sm font-medium text-gray-600">Click to upload image</span>
              </div>
            </label>
            <input
              id="profile-image-upload"
              type="file"
              onChange={(e) => onFileUpload(e, "profile_image")}
              className="hidden"
              accept=".jpg,.jpeg,.png"
            />
          </div>
        </div>
      </div>
    </section>
  );
};