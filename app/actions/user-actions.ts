"use server";

import { createSupabaseServerClient } from '@/app/actions/authentication/auth';
import { revalidatePath } from 'next/cache';
import { logger } from '@/utils/logger';

/**
 * Represents a web user in the DearCare system.
 */
export interface WebUser {
  id: string;
  full_name: string;
  role: string;
  email: string;
  phone: string | null;
  profile_image_url: string | null;
  created_at: string;
  updated_at: string;
  address: string | null;
  city: string | null;
  state: string | null;
  postal_code: string | null;
  country: string | null;
}

/**
 * Data fields that can be updated for a user profile.
 */
export interface UserUpdateData {
  full_name?: string;
  email?: string;
  phone?: string;
  profile_image_url?: string;
  address?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
}

/**
 * Fetches a user by their ID from the `dearcare_web_users` table.
 *
 * @param userId - The unique ID of the user.
 * @returns An object with the following properties:
 *   - `success`: `true` if the user was found, otherwise `false`.
 *   - `user`: The {@link WebUser} object containing all user fields if found, otherwise `undefined`.
 *   - `error`: A string describing the error if the operation failed, otherwise `undefined`.
 *
 * @example
 * ```ts
 * const { success, user, error } = await getUserById("123");
 * if (success) console.log(user?.full_name);
 * ```
 */
export async function getUserById(userId: string): Promise<{
  success: boolean;
  user?: WebUser;
  error?: string;
}> {
  try {
    const supabase = await createSupabaseServerClient();
    
    const { data, error } = await supabase
      .from('dearcare_web_users')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) {
      logger.error('Error fetching user:', error);
      return {
        success: false,
        error: error.message
      };
    }
    
    return {
      success: true,
      user: data as WebUser
    };
  } catch (error) {
    logger.error('Unexpected error fetching user:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch user data'
    };
  }
}

/**
 * Updates a user's profile information in the `dearcare_web_users` table.
 *
 * @param userId - The unique ID of the user to update.
 * @param data - Partial fields of {@link UserUpdateData} to update.
 * @returns An object with the following properties:
 *   - `success`: `true` if the update was successful, otherwise `false`.
 *   - `user`: The updated {@link WebUser} object with all user fields if successful, otherwise `undefined`.
 *   - `error`: A string describing the error if the update failed, otherwise `undefined`.
 *
 * @example
 * ```ts
 * const result = await updateUserProfile("123", { city: "New York" });
 * if (result.success) console.log("Updated user:", result.user);
 * ```
 */
export async function updateUserProfile(
  userId: string, 
  data: UserUpdateData
): Promise<{
  success: boolean;
  user?: WebUser;
  error?: string;
}> {
  try {
    const supabase = await createSupabaseServerClient();
    
    // Add updated_at timestamp
    const updateData = {
      ...data,
      updated_at: new Date().toISOString()
    };
    
    const { data: updatedUser, error } = await supabase
      .from('dearcare_web_users')
      .update(updateData)
      .eq('id', userId)
      .select()
      .single();
    
    if (error) {
      logger.error('Error updating user profile:', error);
      return {
        success: false,
        error: error.message
      };
    }
    
    // Revalidate the profile page to reflect changes
    revalidatePath('/user/profile');
    
    return {
      success: true,
      user: updatedUser as WebUser
    };
  } catch (error) {
    logger.error('Unexpected error updating user profile:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update user profile'
    };
  }
}

/**
 * Uploads a profile image to Supabase storage and updates the `profile_image_url` in the user's record.
 *
 * @param userId - The unique ID of the user.
 * @param file - The image file to upload.
 * @returns An object with the following properties:
 *   - `success`: `true` if the image was uploaded and the user's profile updated, otherwise `false`.
 *   - `imageUrl`: The public URL string of the uploaded image if successful, otherwise `undefined`.
 *   - `error`: A string describing the error if the upload or update failed, otherwise `undefined`.
 *
 * @example
 * ```ts
 * const file = new File([blob], "avatar.png", { type: "image/png" });
 * const result = await uploadProfileImage("123", file);
 * if (result.success) console.log("Image URL:", result.imageUrl);
 * ```
 */
export async function uploadProfileImage(
  userId: string,
  file: File
): Promise<{
  success: boolean;
  imageUrl?: string;
  error?: string;
}> {
  try {
    const supabase = await createSupabaseServerClient();
    
    if (!file) {
      return {
        success: false,
        error: 'No file provided'
      };
    }
    
    // Convert file to blob
    const fileArrayBuffer = await file.arrayBuffer();
    const fileBlob = new Blob([fileArrayBuffer], { type: file.type });
    
    // Generate a unique file path
    const fileExt = file.name.split('.').pop();
    const fileName = `user-profiles/${userId}/${Date.now()}.${fileExt}`;
    
    // Upload the file to storage
    const { error: uploadError, data } = await supabase.storage
      .from('DearCare')
      .upload(fileName, fileBlob, {
        contentType: file.type,
        cacheControl: '3600'
      });
    
    if (uploadError) {
      logger.error('Error uploading profile image:', uploadError);
      return {
        success: false,
        error: uploadError.message
      };
    }
    
    // Get the public URL
    const { data: { publicUrl } } = supabase
      .storage
      .from('DearCare')
      .getPublicUrl(data.path);
    
    // Update the user's profile_image_url
    const { error: updateError } = await supabase
      .from('dearcare_web_users')
      .update({
        profile_image_url: publicUrl,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);
    
    if (updateError) {
      logger.error('Error updating profile image URL:', updateError);
      return {
        success: false,
        error: updateError.message
      };
    }
    
    // Revalidate the profile page to reflect changes
    revalidatePath('/user/profile');
    
    return {
      success: true,
      imageUrl: publicUrl
    };
  } catch (error) {
    logger.error('Unexpected error uploading profile image:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to upload profile image'
    };
  }
}

/**
 * Fetches the currently logged-in user.
 *
 * @returns An object with the following properties:
 *   - `success`: `true` if an authenticated user was found, otherwise `false`.
 *   - `user`: The authenticated {@link WebUser} object with all user fields if found, otherwise `undefined`.
 *   - `error`: A string describing the error if no user is authenticated or fetching failed, otherwise `undefined`.
 *
 * @example
 * ```ts
 * const result = await getCurrentUser();
 * if (result.success) console.log("Current user:", result.user);
 * ```
 */
export async function getCurrentUser(): Promise<{
  success: boolean;
  user?: WebUser;
  error?: string;
}> {
  try {
    const supabase = await createSupabaseServerClient();
    
    // Get the current authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return {
        success: false,
        error: authError?.message || 'No authenticated user found'
      };
    }

    const userId = user.user_metadata?.user_id;
    logger.info("Using user ID:", userId);
    
    const { data, error } = await supabase
      .from('dearcare_web_users')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) {
      logger.error('Error fetching current user data:', error);
      return {
        success: false,
        error: error.message
      };
    }
    
    return {
      success: true,
      user: data as WebUser
    };
  } catch (error) {
    logger.error('Unexpected error fetching current user:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch current user'
    };
  }
}


/**
 * Updates the password of the currently authenticated Supabase Auth user.
 *
 * @param newPassword - The new password to set.
 * @returns An object with the following properties:
 *   - `success`: `true` if the password was updated, otherwise `false`.
 *   - `error`: A string describing the error if the update failed, otherwise `undefined`.
 *
 * @example
 * ```ts
 * const result = await updateAuthUserPassword("newStrongPassword123");
 * if (result.success) console.log("Password updated!");
 * ```
 */
export async function updateAuthUserPassword(
  newPassword: string
): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const supabase = await createSupabaseServerClient();

    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (error) {
      logger.error('Error updating auth user password:', error);
      return {
        success: false,
        error: error.message
      };
    }

    return {
      success: true
    };
  } catch (error) {
    logger.error('Unexpected error updating auth user password:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update password'
    };
  }
}