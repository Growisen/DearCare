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
    setNewPhoto(null);
    setSelectedFile(null);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setNewPhoto(null);
    setSelectedFile(null);
    setIsEditing(false);
  };

  return (
    <div className="relative flex flex-col items-center">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
        aria-label="Upload profile photo"
        disabled={isDisabled}
      />

      <div className="mb-3 relative cursor-pointer" onClick={handlePhotoClick}>
        {isEditing && newPhoto ? (
          <div className="rounded-full p-1 border-2 border-slate-200 shadow-md">
            <Image
              src={newPhoto}
              alt="New profile photo"
              width={120}
              height={120}
              className="rounded-full object-cover w-28 h-28"
            />
            <div className="absolute inset-0 rounded-full bg-black/10 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
              <span className="text-white text-xs font-medium">Preview</span>
            </div>
          </div>
        ) : photo ? (
          <div className="rounded-full p-1 border-2 border-slate-200 shadow-md">
            <Image
              src={photo}
              alt={name}
              width={120}
              height={120}
              className="rounded-full object-cover w-28 h-28"
            />
            {!isDisabled && (
              <div className="absolute inset-0 rounded-full bg-black/10 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="text-white text-xs font-medium">Change photo</span>
              </div>
            )}
          </div>
        ) : (
          <div className="w-28 h-28 rounded-full bg-gray-100 border-2 border-slate-200 flex items-center justify-center shadow-none">
            <User className="w-12 h-12 text-gray-500" />
            {!isDisabled && (
              <div className="absolute inset-0 rounded-full bg-black/10 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="text-white text-xs font-medium">Add photo</span>
              </div>
            )}
          </div>
        )}

        {!isEditing && !isDisabled && (
          <div className="absolute bottom-0 right-0 bg-white rounded-full p-1.5 shadow border border-slate-200 cursor-pointer hover:bg-gray-50 transition-all duration-200">
            <Edit2 className="w-3.5 h-3.5 text-gray-700" />
          </div>
        )}
      </div>

      {isEditing && (
        <div className="flex flex-wrap justify-center gap-2 mt-3 w-full">
          <button
            onClick={handleSavePhoto}
            className="px-3 py-1.5 bg-gray-700 hover:bg-gray-800 text-white rounded-sm shadow-none transition-colors flex items-center gap-1 text-xs"
            aria-label="Save photo"
            disabled={isDisabled}
          >
            <Check className="w-3.5 h-3.5" />
            <span>Save</span>
          </button>
          <button
            onClick={handleCancel}
            className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-sm transition-colors flex items-center gap-1 text-xs"
            aria-label="Cancel photo edit"
            disabled={isDisabled}
          >
            <X className="w-3.5 h-3.5" />
            <span>Cancel</span>
          </button>
          {(photo || newPhoto) && (
            <button
              onClick={handleRemovePhoto}
              className="mt-2 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 rounded-sm transition-colors flex items-center gap-1 text-xs w-full"
              aria-label="Remove photo"
              disabled={isDisabled}
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Remove</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}