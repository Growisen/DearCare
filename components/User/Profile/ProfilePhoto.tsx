import { useState, useRef } from "react";
import Image from "next/image";
import { User, Edit2, Check, X, Trash2 } from "lucide-react";

type ProfilePhotoProps = {
  photo: string | null;
  name: string;
  onPhotoChange: (file: File) => Promise<void>;
  isDisabled?: boolean;
};

export default function ProfilePhoto({ photo, name, onPhotoChange, isDisabled = false }: ProfilePhotoProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [newPhoto, setNewPhoto] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoClick = () => {
    if (!isEditing && !isDisabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setNewPhoto(reader.result as string);
        setIsEditing(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSavePhoto = async () => {
    if (selectedFile) {
      await onPhotoChange(selectedFile);
      setIsEditing(false);
      setSelectedFile(null);
    }
  };

  const handleRemovePhoto = () => {
    // Here we would need to handle removal differently
    // since we can't send null to onPhotoChange anymore
    setNewPhoto(null);
    setSelectedFile(null);
    setIsEditing(false);
    // You may need to implement a separate removal handler in the parent component
  };

  const handleCancel = () => {
    setNewPhoto(null);
    setSelectedFile(null);
    setIsEditing(false);
  };

  return (
    <div className="relative group w-full sm:w-auto flex flex-col items-center">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
        aria-label="Upload profile photo"
        disabled={isDisabled}
      />

      <div className="mb-2 sm:mb-0 relative cursor-pointer" onClick={handlePhotoClick}>
        {isEditing && newPhoto ? (
          <div className="rounded-full p-1 bg-gradient-to-r from-blue-500 to-blue-700 shadow-md">
            <Image
              src={newPhoto}
              alt="New profile photo"
              width={110}
              height={110}
              className="rounded-full border-2 border-white object-cover w-28 h-28"
            />
            <div className="absolute inset-0 rounded-full bg-black/10 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
              <span className="text-white text-xs font-medium">Preview</span>
            </div>
          </div>
        ) : photo ? (
          <div className="rounded-full p-1 bg-gradient-to-r from-blue-500 to-blue-700 shadow-md">
            <Image
              src={photo}
              alt={name}
              width={110}
              height={110}
              className="rounded-full border-2 border-white object-cover w-28 h-28"
            />
            <div className="absolute inset-0 rounded-full bg-black/10 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
              <span className="text-white text-xs font-medium">Change photo</span>
            </div>
          </div>
        ) : (
          <div className="w-28 h-28 rounded-full bg-gradient-to-r from-blue-500 to-blue-700 flex items-center justify-center text-white shadow-md transform transition-transform duration-300 group-hover:scale-105">
            <User className="w-12 h-12" />
            <div className="absolute inset-0 rounded-full bg-black/10 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
              <span className="text-white text-xs font-medium">Add photo</span>
            </div>
          </div>
        )}

        {!isEditing && !isDisabled && (
          <div className="absolute bottom-0 right-0 bg-white rounded-full p-1.5 shadow-md border border-gray-100 cursor-pointer hover:bg-gray-50 transition-all duration-300">
            <Edit2 className="w-4 h-4 text-blue-600" />
          </div>
        )}
      </div>

      {isEditing && (
        <div className="flex flex-wrap justify-center gap-2 mt-4 w-full">
          <button
            onClick={handleSavePhoto}
            className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm transition-colors duration-200 flex items-center gap-1 text-sm"
            aria-label="Save photo"
            disabled={isDisabled}
          >
            <Check className="w-4 h-4" />
            <span>Save</span>
          </button>
          <button
            onClick={handleCancel}
            className="px-3 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors duration-200 flex items-center gap-1 text-sm"
            aria-label="Cancel photo edit"
            disabled={isDisabled}
          >
            <X className="w-4 h-4" />
            <span>Cancel</span>
          </button>
          {(photo || newPhoto) && (
            <button
              onClick={handleRemovePhoto}
              className="mt-2 sm:mt-0 px-3 py-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg transition-colors duration-200 flex items-center gap-1 text-sm w-full sm:w-auto"
              aria-label="Remove photo"
              disabled={isDisabled}
            >
              <Trash2 className="w-4 h-4" />
              <span>Remove</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}