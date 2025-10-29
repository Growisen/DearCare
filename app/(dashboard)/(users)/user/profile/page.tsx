"use client"

import { useState } from "react";
import { useUserData, UserFieldType } from "@/hooks/useUserData";
import ProfilePhoto from "@/components/User/Profile/ProfilePhoto";
import EmailField from "@/components/User/Profile/EmailField";
import EditableField from "@/components/User/Profile/EditableField";
import PasswordField from "@/components/User/Profile/PasswordField";
import { updateUserProfile, uploadProfileImage, updateAuthUserPassword } from "@/app/actions/user-actions";
import { toast } from "react-hot-toast";
import { Briefcase } from "lucide-react";
import Loader from '@/components/Loader';

export default function ProfilePage() {
  const { userData, updateEmail, updatePhoto, updateField } = useUserData(true);
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

  const handlePasswordUpdate = async (newPassword: string) => {
    setIsSubmitting(true);
    try {
      const result = await updateAuthUserPassword(newPassword);
      if (result.success) {
        toast.success("Password updated successfully");
      } else {
        toast.error(result.error || "Failed to update password");
      }
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (userData.isLoading) {
    return(
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center gap-2">
          <Loader message="Loading profile..." color="secondary" />
        </div>
      </div>
    );
  }

  if (userData.error) {
    return <div className="h-full flex items-center justify-center">
      <div className="text-red-500 text-xl">{userData.error}</div>
    </div>;
  }

  return (
    <div className="flex items-start justify-center p-4 md:p-6 h-full">
      <div className="w-full max-w-7xl shadow-sm border border-gray-200 rounded-lg bg-white">
        {/* Header Section */}
        <div className="p-4 md:p-5 pb-0">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <div className="space-y-1">
              <h2 className="text-2xl font-semibold text-gray-800">User Profile</h2>
              <p className="text-sm text-gray-500">Manage your personal information</p>
            </div>
            <div className="mt-2 sm:mt-0 flex items-center gap-2 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-md text-xs font-medium">
              <Briefcase className="w-3.5 h-3.5" />
              {userData.role}
            </div>
          </div>
        </div>

        {/* Separator */}
        <hr className="h-px my-3 bg-gray-200 border-0" />

        {/* Main Content */}
        <div className="px-4 md:px-5 pb-5">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Profile Photo Section */}
            <div className="lg:w-1/5 flex flex-col items-center">
              <ProfilePhoto
                photo={userData.photo}
                name={userData.name}
                onPhotoChange={handlePhotoUpdate}
                isDisabled={isSubmitting}
              />
              <h2 className="text-xl font-medium text-gray-800 mt-3 text-center">
                {userData.name}
              </h2>
            </div>

            <div className="lg:w-4/5">
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-x-10">
                <div className="mb-2">
                  <h3 className="text-md font-medium text-gray-700 mb-3">Contact Information</h3>
                  <div className="space-y-3">
                    <EmailField 
                      initialEmail={userData.email} 
                      onEmailChange={handleEmailUpdate}
                      isDisabled={isSubmitting}
                    />
                    <EditableField 
                      label="Phone"
                      value={userData.phone}
                      onSave={(value) => handleFieldUpdate('phone', value)}
                      isDisabled={isSubmitting}
                      fieldType="tel"
                    />

                    <PasswordField
                      currentPassword="••••••••"
                      onPasswordChange={handlePasswordUpdate}
                    />
                  </div>
                </div>

                <div>
                  <h3 className="text-md font-medium text-gray-700 mb-3">Address Information</h3>
                  <div className="space-y-3">
                    <EditableField 
                      label="Address"
                      value={userData.address}
                      onSave={(value) => handleFieldUpdate('address', value)}
                      isDisabled={isSubmitting}
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
      </div>
    </div>
  );
}