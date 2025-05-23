import { useState } from "react";
import { Lock, Edit2, Check, X, AlertCircle, Eye, EyeOff } from "lucide-react";
import { usePasswordValidation } from "@/hooks/useValidation";

type PasswordFieldProps = {
  currentPassword: string;
  onPasswordChange: (password: string) => void;
};

export default function PasswordField({ currentPassword, onPasswordChange }: PasswordFieldProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isCurrentPasswordVisible, setIsCurrentPasswordVisible] = useState(false);
  const [isNewPasswordVisible, setIsNewPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);
  
  const {
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    passwordError,
    passwordsMatch,
    checkPasswordValidity
  } = usePasswordValidation();

  const handleSave = () => {
    if (checkPasswordValidity()) {
      onPasswordChange(newPassword);
      setIsEditing(false);
      setNewPassword("");
      setConfirmPassword("");
    }
  };

  const handleCancel = () => {
    setNewPassword("");
    setConfirmPassword("");
    setIsEditing(false);
    setIsNewPasswordVisible(false);
    setIsConfirmPasswordVisible(false);
  };

  return (
    <div className="p-3 sm:p-4 border border-gray-200 hover:border-gray-300 rounded-xl bg-white shadow-sm transition-all duration-300">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="bg-blue-100 p-1.5 sm:p-2 rounded-lg">
            <Lock className="w-4 sm:w-4.5 h-4 sm:h-4.5 text-blue-600" />
          </div>
          <span className="text-gray-600 font-medium text-sm sm:text-base">Password</span>
        </div>

        {!isEditing && (
          <div className="flex items-center">
            <button
              onClick={() => setIsCurrentPasswordVisible(!isCurrentPasswordVisible)}
              className="p-1.5 sm:p-2 text-gray-500 hover:text-blue-600 hover:bg-gray-100 rounded-lg transition-colors duration-200 mr-1"
              aria-label={isCurrentPasswordVisible ? "Hide password" : "Show password"}
            >
              {isCurrentPasswordVisible ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
            <button
              onClick={() => setIsEditing(true)}
              className="p-1.5 sm:p-2 text-gray-500 hover:text-blue-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              aria-label="Edit password"
            >
              <Edit2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {isEditing ? (
        <div className="mt-3 space-y-3">
          <div className="relative">
            <input
              type={isNewPasswordVisible ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="New password"
              className="border border-gray-300 rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 w-full focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-200 pr-10 text-gray-800"
              autoFocus
            />
            <button
              type="button"
              onClick={() => setIsNewPasswordVisible(!isNewPasswordVisible)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              aria-label={isNewPasswordVisible ? "Hide new password" : "Show new password"}
            >
              {isNewPasswordVisible ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>

          <div className="relative">
            <input
              type={isConfirmPasswordVisible ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm password"
              className={`text-gray-800 border ${
                passwordError && confirmPassword ? 'border-red-400 focus:ring-red-500/30' : 
                passwordsMatch === true ? 'border-green-400 focus:ring-green-500/30' :
                'border-gray-300'
              } rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 w-full focus:outline-none focus:ring-2 focus:border-blue-500 transition-all duration-200 pr-10 ${
                confirmPassword && passwordsMatch === true ? 'bg-green-50' : 
                confirmPassword && passwordsMatch === false ? 'bg-red-50' : ''
              }`}
            />

            {confirmPassword && (
              <div className="absolute right-10 top-1/2 transform -translate-y-1/2">
                {passwordsMatch === true && (
                  <Check className="w-4 h-4 text-green-500" />
                )}
                {passwordsMatch === false && (
                  <X className="w-4 h-4 text-red-500" />
                )}
              </div>
            )}

            <button
              type="button"
              onClick={() => setIsConfirmPasswordVisible(!isConfirmPasswordVisible)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              aria-label={isConfirmPasswordVisible ? "Hide confirm password" : "Show confirm password"}
            >
              {isConfirmPasswordVisible ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>

          {passwordError && (
            <div className="flex items-center gap-1.5 text-red-500 text-xs sm:text-sm bg-red-50 p-2 rounded-lg">
              <AlertCircle className="w-3.5 sm:w-4 h-3.5 sm:h-4 flex-shrink-0" />
              <span>{passwordError}</span>
            </div>
          )}

          <div className="flex flex-wrap justify-end gap-2">
            <button
              onClick={handleSave}
              className={`px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm transition-colors duration-200 flex items-center gap-1 text-sm order-2 sm:order-1 ${
                !newPassword || !confirmPassword ? "opacity-50 cursor-not-allowed" : ""
              }`}
              disabled={!newPassword || !confirmPassword}
              aria-label="Save password"
            >
              <Check className="w-4 h-4" />
              <span>Save</span>
            </button>
            <button
              onClick={handleCancel}
              className="px-3 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors duration-200 flex items-center gap-1 text-sm order-1 sm:order-2"
              aria-label="Cancel edit"
            >
              <X className="w-4 h-4" />
              <span>Cancel</span>
            </button>
          </div>
        </div>
      ) : (
        <p className="mt-2 text-gray-800 pl-7 sm:pl-9 text-sm sm:text-base">
          {isCurrentPasswordVisible ? currentPassword : "••••••••"}
        </p>
      )}
    </div>
  );
}