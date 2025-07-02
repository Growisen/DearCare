"use server"

import { createSupabaseServerClient } from './auth';
import { revalidatePath } from 'next/cache';
import { logger } from '@/utils/logger';

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
 * Fetches a user by their ID from the dearcare_web_users table
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
 * Updates a user's profile information
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
 * Uploads a profile image to storage and updates the user's profile_image_url
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
 * Fetches the currently logged in user
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