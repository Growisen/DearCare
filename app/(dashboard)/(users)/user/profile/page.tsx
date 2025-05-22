"use client"

import { useState } from "react";
import { useUserData, UserFieldType } from "@/hooks/useUserData";
import ProfilePhoto from "@/components/User/Profile/ProfilePhoto";
import EmailField from "@/components/User/Profile/EmailField";
import EditableField from "@/components/User/Profile/EditableField";
import { updateUserProfile, uploadProfileImage } from "@/app/actions/user-actions";
import { toast } from "react-hot-toast";

export default function ProfilePage() {
  const { userData, updateEmail, updatePhoto, updateField } = useUserData(true); // true means auto fetch
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleEmailUpdate = async (newEmail: string) => {
    if (!userData.id) return;
    
    setIsSubmitting(true);
    try {
      const result = await updateUserProfile(userData.id, { email: newEmail });
      if (result.success) {
        updateEmail(newEmail);
        toast.success("Email updated successfully");
      } else {
        toast.error(result.error || "Failed to update email");
      }
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePhotoUpdate = async (file: File) => {
    if (!userData.id) return;
    
    setIsSubmitting(true);
    try {
      const result = await uploadProfileImage(userData.id, file);
      if (result.success && result.imageUrl) {
        updatePhoto(result.imageUrl);
        toast.success("Profile picture updated successfully");
      } else {
        toast.error(result.error || "Failed to update profile picture");
      }
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFieldUpdate = async (field: UserFieldType, newValue: string) => {
    if (!userData.id) return;
    
    setIsSubmitting(true);
    try {
      const fieldMapping: Record<UserFieldType, string> = {
        email: 'email',
        phone: 'phone',
        address: 'address',
        city: 'city',
        state: 'state',
        postalCode: 'postal_code',
        country: 'country'
      };
      
      const result = await updateUserProfile(userData.id, { [fieldMapping[field]]: newValue });
      if (result.success) {
        updateField(field, newValue);
        toast.success(`${field.charAt(0).toUpperCase() + field.slice(1)} updated successfully`);
      } else {
        toast.error(result.error || `Failed to update ${field}`);
      }
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (userData.isLoading) {
    return <div className="min-h-[calc(100vh-120px)] flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>;
  }

  if (userData.error) {
    return <div className="min-h-[calc(100vh-120px)] flex items-center justify-center">
      <div className="text-red-500 text-xl">{userData.error}</div>
    </div>;
  }

  return (
    <div className="flex items-center justify-center p-4 md:p-6 min-h-[calc(100vh-120px)]">
      <div className="w-full max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl shadow-md p-6 sm:p-8 border border-gray-100 transition-all duration-300 hover:shadow-lg">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6 sm:mb-8 border-b pb-6">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800 tracking-tight">My Profile</h1>
            <div className="px-3 sm:px-4 py-1.5 bg-blue-600/90 text-white rounded-full text-xs sm:text-sm font-medium shadow-sm">
              {userData.role}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-8">
            {/* Profile Photo Section */}
            <ProfilePhoto
              photo={userData.photo}
              name={userData.name}
              onPhotoChange={handlePhotoUpdate}
              isDisabled={isSubmitting}
            />

            {/* User Details Section */}
            <div className="flex-1 w-full">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6 tracking-tight text-center sm:text-left">
                {userData.name}
              </h2>

              <div className="space-y-4 sm:space-y-5">
                {/* Email Field */}
                <EmailField 
                  initialEmail={userData.email} 
                  onEmailChange={handleEmailUpdate}
                  isDisabled={isSubmitting}
                />

                {/* Phone Field */}
                <EditableField 
                  label="Phone"
                  value={userData.phone}
                  onSave={(value) => handleFieldUpdate('phone', value)}
                  isDisabled={isSubmitting}
                  fieldType="tel"
                />

                {/* Address Fields (editable) */}
                <EditableField 
                  label="Address"
                  value={userData.address}
                  onSave={(value) => handleFieldUpdate('address', value)}
                  isDisabled={isSubmitting}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <EditableField 
                    label="City"
                    value={userData.city}
                    onSave={(value) => handleFieldUpdate('city', value)}
                    isDisabled={isSubmitting}
                  />
                  
                  <EditableField 
                    label="State/Province"
                    value={userData.state}
                    onSave={(value) => handleFieldUpdate('state', value)}
                    isDisabled={isSubmitting}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <EditableField 
                    label="Postal Code"
                    value={userData.postalCode}
                    onSave={(value) => handleFieldUpdate('postalCode', value)}
                    isDisabled={isSubmitting}
                  />
                  
                  <EditableField 
                    label="Country"
                    value={userData.country}
                    onSave={(value) => handleFieldUpdate('country', value)}
                    isDisabled={isSubmitting}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}