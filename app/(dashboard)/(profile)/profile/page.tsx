"use client"

import { useState, useEffect, useRef } from "react"
import { User, Mail, Lock, Edit2, Check, X, AlertCircle, Trash2, Eye, EyeOff } from "lucide-react"
import Image from "next/image"

export default function ProfilePage() {
  const [userData, setUserData] = useState({
    name: "Akhil Krishna",
    adminType: "Super Admin",
    email: "admin@dearcare.com",
    password: "abc",
    photo: null as string | null
  })

  const [isEditingEmail, setIsEditingEmail] = useState(false)
  const [isEditingPassword, setIsEditingPassword] = useState(false)
  const [isEditingPhoto, setIsEditingPhoto] = useState(false)
  const [newPhoto, setNewPhoto] = useState<string | null>(null)
  const [newEmail, setNewEmail] = useState(userData.email)
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [passwordError, setPasswordError] = useState("")
  const [emailError, setEmailError] = useState("")
  const [isPasswordVisible, setIsPasswordVisible] = useState(false)
  const [isNewPasswordVisible, setIsNewPasswordVisible] = useState(false)
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false)
  const [passwordsMatch, setPasswordsMatch] = useState<boolean | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Email validation function
  const validateEmail = (email: string) => {
    if (!email.trim()) return "Email cannot be empty";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return "Invalid email format";
    return "";
  }

  // Password validation function
  const validatePassword = (password: string) => {
    if (!password) return "Password is required";
    
    const validations = [
      { check: password.length >= 6, message: "Password must be at least 6 characters" },
      { check: /\d/.test(password), message: "Password must contain at least one number" },
      { check: /[A-Z]/.test(password), message: "Password must contain at least one uppercase letter" },
      { check: /[!@#$%^&*(),.?":{}|<>]/.test(password), message: "Password must contain at least one special character" },
      { check: !(/123456|password|qwerty/i.test(password)), message: "Password contains common insecure patterns" }
    ];
    
    const failedRule = validations.find(rule => !rule.check);
    return failedRule ? failedRule.message : "";
  }

  // Confirm password validation function - now pure with no side effects
  const validateConfirmPassword = (password: string, confirmPwd: string) => {
    if (!confirmPwd) return "Please confirm your password";
    return password !== confirmPwd ? "Passwords don't match" : "";
  }
  
  // Function to check passwords match and update state accordingly
  const checkPasswordsMatch = (password: string, confirmPwd: string) => {
    if (!confirmPwd) {
      setPasswordsMatch(null);
      return;
    }
    setPasswordsMatch(password === confirmPwd);
    return password === confirmPwd;
  }

  const handleSaveEmail = () => {
    const error = validateEmail(newEmail);
    if (error) {
      setEmailError(error);
      return;
    }
    
    setUserData({ ...userData, email: newEmail });
    setEmailError("");
    setIsEditingEmail(false);
  }

  const handleSavePassword = () => {
    const validationError = validatePassword(newPassword);
    if (validationError) {
      setPasswordError(validationError);
      return;
    }
    
    const confirmError = validateConfirmPassword(newPassword, confirmPassword);
    if (confirmError) {
      setPasswordError(confirmError);
      return;
    }
    
    setUserData({ ...userData, password: newPassword });
    setIsEditingPassword(false);
    setNewPassword("");
    setConfirmPassword("");
    setPasswordError("");
    setIsPasswordVisible(false);
  }

  const handleCancelEdit = (field: 'email' | 'password' | 'photo') => {
    if (field === 'email') {
      setNewEmail(userData.email);
      setEmailError("");
      setIsEditingEmail(false);
    } else if (field === 'password') {
      setNewPassword("");
      setConfirmPassword("");
      setPasswordError("");
      setIsEditingPassword(false);
      setIsNewPasswordVisible(false);
      setIsConfirmPasswordVisible(false);
      setPasswordsMatch(null);
    } else if (field === 'photo') {
      setNewPhoto(null)
      setIsEditingPhoto(false)
    }
  }

  const handlePhotoClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setNewPhoto(reader.result as string);
        setIsEditingPhoto(true);
      };
      reader.readAsDataURL(file);
    }
  }

  const handleSavePhoto = () => {
    setUserData({ ...userData, photo: newPhoto });
    setIsEditingPhoto(false);
  }

  const handleRemovePhoto = () => {
    setUserData({ ...userData, photo: null });
    setNewPhoto(null);
    setIsEditingPhoto(false);
  }

  // Clear password error when either password field changes
  useEffect(() => {
    if (passwordError && newPassword && confirmPassword) {
      setPasswordError("")
    }
  }, [newPassword, confirmPassword, passwordError])

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  }

  const toggleNewPasswordVisibility = () => {
    setIsNewPasswordVisible(!isNewPasswordVisible);
  }

  const toggleConfirmPasswordVisibility = () => {
    setIsConfirmPasswordVisible(!isConfirmPasswordVisible);
  }

  // Add real-time password validation
  useEffect(() => {
    if (isEditingPassword && newPassword) {
      const error = validatePassword(newPassword);
      if (error) {
        setPasswordError(error);
      } else if (confirmPassword) {
        validateConfirmPassword(newPassword, confirmPassword);
        if (newPassword !== confirmPassword) {
          setPasswordError("Passwords don't match");
        } else {
          setPasswordError("");
        }
      } else {
        setPasswordError("");
        setPasswordsMatch(null);
      }
    }
  }, [newPassword, isEditingPassword]);

  // Add real-time confirm password validation
  useEffect(() => {
    if (isEditingPassword && confirmPassword) {
      if (newPassword !== confirmPassword) {
        setPasswordsMatch(false);
        setPasswordError("Passwords don't match");
      } else if (!validatePassword(newPassword)) {
        setPasswordsMatch(true);
        setPasswordError("");
      }
    } else if (isEditingPassword) {
      setPasswordsMatch(null);
    }
  }, [confirmPassword, newPassword, isEditingPassword]);

  return (
    <div className="flex items-center justify-center p-4 md:p-6 min-h-[calc(100vh-120px)]">
      <div className="w-full max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl shadow-md p-6 sm:p-8 border border-gray-100 transition-all duration-300 hover:shadow-lg">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6 sm:mb-8 border-b pb-6">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800 tracking-tight">My Profile</h1>
            <div className="px-3 sm:px-4 py-1.5 bg-blue-600/90 text-white rounded-full text-xs sm:text-sm font-medium shadow-sm">
              {userData.adminType}
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-8">
            {/* Profile Photo Section */}
            <div className="relative group w-full sm:w-auto flex flex-col items-center">
              {/* Hidden file input */}
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
                aria-label="Upload profile photo"
              />
              
              <div className="mb-2 sm:mb-0 relative cursor-pointer" onClick={!isEditingPhoto ? handlePhotoClick : undefined}>
                {isEditingPhoto && newPhoto ? (
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
                ) : userData.photo ? (
                  <div className="rounded-full p-1 bg-gradient-to-r from-blue-500 to-blue-700 shadow-md">
                    <Image 
                      src={userData.photo} 
                      alt={userData.name} 
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
                
                {!isEditingPhoto && (
                  <div 
                    className="absolute bottom-0 right-0 bg-white rounded-full p-1.5 shadow-md border border-gray-100 cursor-pointer hover:bg-gray-50 transition-all duration-300"
                  >
                    <Edit2 className="w-4 h-4 text-blue-600" />
                  </div>
                )}
              </div>
              
              {isEditingPhoto && (
                <div className="flex flex-wrap justify-center gap-2 mt-4 w-full">
                  <button
                    onClick={handleSavePhoto}
                    className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm transition-colors duration-200 flex items-center gap-1 text-sm"
                    aria-label="Save photo"
                  >
                    <Check className="w-4 h-4" />
                    <span>Save</span>
                  </button>
                  <button
                    onClick={() => handleCancelEdit('photo')}
                    className="px-3 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors duration-200 flex items-center gap-1 text-sm"
                    aria-label="Cancel photo edit"
                  >
                    <X className="w-4 h-4" />
                    <span>Cancel</span>
                  </button>
                  {(userData.photo || newPhoto) && (
                    <button
                      onClick={handleRemovePhoto}
                      className="mt-2 sm:mt-0 px-3 py-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg transition-colors duration-200 flex items-center gap-1 text-sm w-full sm:w-auto"
                      aria-label="Remove photo"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Remove</span>
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* User Details Section */}
            <div className="flex-1 w-full">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6 tracking-tight text-center sm:text-left">{userData.name}</h2>
              
              <div className="space-y-4 sm:space-y-5">
                {/* Email Field */}
                <div className="p-3 sm:p-4 border border-gray-200 hover:border-gray-300 rounded-xl bg-white shadow-sm transition-all duration-300">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="bg-blue-100 p-1.5 sm:p-2 rounded-lg">
                        <Mail className="w-4 sm:w-4.5 h-4 sm:h-4.5 text-blue-600" />
                      </div>
                      <span className="text-gray-600 font-medium text-sm sm:text-base">Email</span>
                    </div>
                    
                    {!isEditingEmail && (
                      <button 
                        onClick={() => setIsEditingEmail(true)}
                        className="p-1.5 sm:p-2 text-gray-500 hover:text-blue-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                        aria-label="Edit email"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  
                  {isEditingEmail ? (
                    <div className="mt-3">
                      <input
                        type="email"
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        className="border border-gray-300 rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 w-full focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-200"
                        autoFocus
                      />
                      {emailError && (
                        <p className="mt-2 text-red-500 text-xs sm:text-sm">{emailError}</p>
                      )}
                      <div className="flex flex-wrap justify-end gap-2 mt-3">
                        <button 
                          onClick={handleSaveEmail}
                          className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm transition-colors duration-200 flex items-center gap-1 text-sm order-2 sm:order-1"
                          aria-label="Save email"
                        >
                          <Check className="w-4 h-4" />
                          <span>Save</span>
                        </button>
                        <button 
                          onClick={() => handleCancelEdit('email')}
                          className="px-3 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors duration-200 flex items-center gap-1 text-sm order-1 sm:order-2"
                          aria-label="Cancel edit"
                        >
                          <X className="w-4 h-4" />
                          <span>Cancel</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="mt-2 text-gray-800 pl-7 sm:pl-9 text-sm sm:text-base break-words">{userData.email}</p>
                  )}
                </div>
                
                {/* Password Field */}
                <div className="p-3 sm:p-4 border border-gray-200 hover:border-gray-300 rounded-xl bg-white shadow-sm transition-all duration-300">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="bg-blue-100 p-1.5 sm:p-2 rounded-lg">
                        <Lock className="w-4 sm:w-4.5 h-4 sm:h-4.5 text-blue-600" />
                      </div>
                      <span className="text-gray-600 font-medium text-sm sm:text-base">Password</span>
                    </div>
                    
                    {!isEditingPassword && (
                      <div className="flex items-center">
                        <button 
                          onClick={togglePasswordVisibility}
                          className="p-1.5 sm:p-2 text-gray-500 hover:text-blue-600 hover:bg-gray-100 rounded-lg transition-colors duration-200 mr-1"
                          aria-label={isPasswordVisible ? "Hide password" : "Show password"}
                        >
                          {isPasswordVisible ? 
                            <EyeOff className="w-4 h-4" /> : 
                            <Eye className="w-4 h-4" />
                          }
                        </button>
                        <button 
                          onClick={() => setIsEditingPassword(true)}
                          className="p-1.5 sm:p-2 text-gray-500 hover:text-blue-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                          aria-label="Edit password"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                  
                  {isEditingPassword ? (
                    <div className="mt-3 space-y-3">
                      <div className="relative">
                        <input
                          type={isNewPasswordVisible ? "text" : "password"}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="New password"
                          className="border border-gray-300 rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 w-full focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-200 pr-10"
                          autoFocus
                        />
                        <button
                          type="button"
                          onClick={toggleNewPasswordVisibility}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                          aria-label={isNewPasswordVisible ? "Hide new password" : "Show new password"}
                        >
                          {isNewPasswordVisible ? 
                            <EyeOff className="w-4 h-4" /> : 
                            <Eye className="w-4 h-4" />
                          }
                        </button>
                      </div>

                      <div className="relative">
                        <input
                          type={isConfirmPasswordVisible ? "text" : "password"}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Confirm password"
                          className={`border ${
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
                          onClick={toggleConfirmPasswordVisibility}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                          aria-label={isConfirmPasswordVisible ? "Hide confirm password" : "Show confirm password"}
                        >
                          {isConfirmPasswordVisible ? 
                            <EyeOff className="w-4 h-4" /> : 
                            <Eye className="w-4 h-4" />
                          }
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
                          onClick={handleSavePassword}
                          className={`px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm transition-colors duration-200 flex items-center gap-1 text-sm order-2 sm:order-1 ${(!newPassword || !confirmPassword) ? 'opacity-50 cursor-not-allowed' : ''}`}
                          disabled={!newPassword || !confirmPassword}
                          aria-label="Save password"
                        >
                          <Check className="w-4 h-4" />
                          <span>Save</span>
                        </button>
                        <button 
                          onClick={() => handleCancelEdit('password')}
                          className="px-3 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors duration-200 flex items-center gap-1 text-sm order-1 sm:order-2"
                          aria-label="Cancel edit"
                        >
                          <X className="w-4 h-4" />
                          <span>Cancel</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="mt-2 text-gray-800 pl-7 sm:pl-9 text-sm sm:text-base">{isPasswordVisible ? userData.password : "••••••••"}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
