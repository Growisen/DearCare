import { useState } from "react";
import { Mail, Edit2, Check, X } from "lucide-react";
import { useEmailValidation } from "@/hooks/useValidation";

type EmailFieldProps = {
  initialEmail: string;
  onEmailChange: (email: string) => void;
  isDisabled?: boolean; // Added this prop
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
    <div className="p-3 sm:p-4 border border-gray-200 hover:border-gray-300 rounded-xl bg-white shadow-sm transition-all duration-300">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="bg-blue-100 p-1.5 sm:p-2 rounded-lg">
            <Mail className="w-4 sm:w-4.5 h-4 sm:h-4.5 text-blue-600" />
          </div>
          <span className="text-gray-600 font-medium text-sm sm:text-base">Email</span>
        </div>

        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="p-1.5 sm:p-2 text-gray-500 hover:text-blue-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
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
            className="border border-gray-300 rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 w-full focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-200 text-gray-800"
            autoFocus
            disabled={isDisabled}
          />
          {emailError && (
            <p className="mt-2 text-red-500 text-xs sm:text-sm">{emailError}</p>
          )}
          <div className="flex flex-wrap justify-end gap-2 mt-3">
            <button
              onClick={handleSave}
              className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm transition-colors duration-200 flex items-center gap-1 text-sm order-2 sm:order-1"
              aria-label="Save email"
              disabled={isDisabled}
            >
              <Check className="w-4 h-4" />
              <span>Save</span>
            </button>
            <button
              onClick={handleCancel}
              className="px-3 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors duration-200 flex items-center gap-1 text-sm order-1 sm:order-2"
              aria-label="Cancel edit"
              disabled={isDisabled}
            >
              <X className="w-4 h-4" />
              <span>Cancel</span>
            </button>
          </div>
        </div>
      ) : (
        <p className="mt-2 text-gray-800 pl-7 sm:pl-9 text-sm sm:text-base break-words">{initialEmail}</p>
      )}
    </div>
  );
}