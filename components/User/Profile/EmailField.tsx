import { useState } from "react";
import { Mail, Edit2, Check, X } from "lucide-react";
import { useEmailValidation } from "@/hooks/useValidation";

type EmailFieldProps = {
  initialEmail: string;
  onEmailChange: (email: string) => void;
  isDisabled?: boolean;
};

export default function EmailField({ initialEmail, onEmailChange, isDisabled = false }: EmailFieldProps) {
  const [isEditing, setIsEditing] = useState(false);
  const { 
    email, 
    setEmail, 
    emailError, 
    checkEmailValidity 
  } = useEmailValidation(initialEmail);

  const handleSave = () => {
    if (checkEmailValidity()) {
      onEmailChange(email);
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEmail(initialEmail);
    setIsEditing(false);
  };

  return (
    <div className="p-3 border border-gray-200 hover:border-gray-300 rounded-lg bg-white shadow-sm transition-all duration-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="bg-gray-100 p-2 rounded-md">
            <Mail className="w-4 h-4 text-gray-600" />
          </div>
          <span className="text-gray-700 font-medium text-sm">Email</span>
        </div>

        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
            aria-label="Edit email"
            disabled={isDisabled}
          >
            <Edit2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {isEditing ? (
        <div className="mt-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 w-full focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 text-gray-800"
            autoFocus
            disabled={isDisabled}
          />
          {emailError && (
            <p className="mt-2 text-red-600 text-xs">{emailError}</p>
          )}
          <div className="flex justify-end gap-2 mt-3">
            <button
              onClick={handleSave}
              className="px-3 py-1.5 bg-gray-700 hover:bg-gray-800 text-white rounded-md shadow-sm transition-colors flex items-center gap-1 text-sm"
              aria-label="Save email"
              disabled={isDisabled || !!emailError}
            >
              <Check className="w-3.5 h-3.5" />
              <span>Save</span>
            </button>
            <button
              onClick={handleCancel}
              className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors flex items-center gap-1 text-sm"
              aria-label="Cancel edit"
              disabled={isDisabled}
            >
              <X className="w-3.5 h-3.5" />
              <span>Cancel</span>
            </button>
          </div>
        </div>
      ) : (
        <p className="mt-2 text-gray-800 pl-8 text-sm break-words">{initialEmail}</p>
      )}
    </div>
  );
}