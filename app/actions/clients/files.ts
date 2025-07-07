"use server"

import { createSupabaseServerClient } from '@/app/actions/authentication/auth';
import { revalidatePath } from 'next/cache';
import { ClientFile } from "@/types/client.types";
import { v4 as uuidv4 } from 'uuid';
import { logger } from '@/utils/logger';


export async function getStorageUrl(path: string | null): Promise<string | null> {
    if (!path) return null;
    
    try {
      const supabase = await createSupabaseServerClient();
      const { data: { publicUrl } } = supabase
        .storage
        .from('DearCare')
        .getPublicUrl(path);
        
      return publicUrl;
    } catch (error) {
      logger.error('Error generating storage URL:', error);
      return null;
    }
}


/**
 * Uploads files for a client and stores metadata in the database
 */
export async function uploadClientFiles(
    clientId: string, 
    files: File[],
    tags?: Record<string, string>  // New parameter for file tags
  ): Promise<{success: boolean, data?: ClientFile[], error?: string}> {
    try {
      const supabase = await createSupabaseServerClient();
      const uploadResults = [];
      
      for (const file of files) {
        // Get the tag for this file if provided
        const tag = tags?.[file.name] || '';
        
        // Convert File to Blob for Supabase storage
        const fileArrayBuffer = await file.arrayBuffer();
        const fileBlob = new Blob([fileArrayBuffer], { type: file.type });
        
        // Create a unique file path in the storage bucket
        const fileExt = file.name.split('.').pop();
        const fileName = `Clients/${clientId}/Files/${uuidv4()}.${fileExt}`;
        
        // Upload the file to storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('DearCare')
          .upload(fileName, fileBlob, {
            contentType: file.type,
            cacheControl: '3600'
          });
          
        if (uploadError) {
          logger.error('Error uploading file:', uploadError);
          continue;
        }
        
        // Get the public URL for the uploaded file
        const { data: { publicUrl } } = supabase
          .storage
          .from('DearCare')
          .getPublicUrl(uploadData.path);
        
        // Store file metadata in the database WITH tag
        const { data: fileData, error: fileError } = await supabase
          .from('client_files')
          .insert({
            client_id: clientId,
            name: file.name,
            type: file.type,
            storage_path: uploadData.path,
            url: publicUrl,
            uploaded_at: new Date().toISOString(),
            tag: tag  // Store the tag in the database
          })
          .select()
          .single();
          
        if (fileError) {
          logger.error('Error storing file metadata:', fileError);
          // If metadata storage fails, remove the uploaded file
          await supabase.storage.from('DearCare').remove([uploadData.path]);
          continue;
        }
        
        uploadResults.push(fileData);
      }
      
      // Revalidate the client page to reflect the changes
      revalidatePath(`/clients/${clientId}`);
      
      return { 
        success: uploadResults.length > 0,
        data: uploadResults,
        error: uploadResults.length === 0 ? 'Failed to upload files' : undefined
      };
      
    } catch (error) {
      logger.error('Error uploading client files:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'An unknown error occurred'
      };
    }
}


/**
 * Deletes a client file from storage and removes its metadata from the database
 */
export async function deleteClientFile(clientId: string, fileId: string): Promise<{success: boolean, error?: string}> {
    try {
      const supabase = await createSupabaseServerClient();
      
      // Get the file record to get the storage path
      const { data: fileData, error: fetchError } = await supabase
        .from('client_files')
        .select('storage_path')
        .eq('id', fileId)
        .eq('client_id', clientId)
        .single();
        
      if (fetchError) {
        return { success: false, error: fetchError.message };
      }
      
      if (fileData.storage_path) {
        // Delete the file from storage
        const { error: storageError } = await supabase
          .storage
          .from('DearCare')
          .remove([fileData.storage_path]);
          
        if (storageError) {
          logger.error('Error removing file from storage:', storageError);
          // Continue with deleting the record even if storage removal fails
        }
      }
      
      // Delete the file metadata from the database
      const { error: deleteError } = await supabase
        .from('client_files')
        .delete()
        .eq('id', fileId)
        .eq('client_id', clientId);
        
      if (deleteError) {
        return { success: false, error: deleteError.message };
      }
      
      // Revalidate the client page to reflect the changes
      revalidatePath(`/clients/${clientId}`);
      
      return { success: true };
      
    } catch (error) {
      logger.error('Error deleting client file:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'An unknown error occurred'
      };
    }
}
  
/**
* Gets all files for a client
*/
  
export async function getClientFiles(clientId: string): Promise<{success: boolean, data?: ClientFile[], error?: string}> {
    try {
      const supabase = await createSupabaseServerClient();
      
      const { data, error } = await supabase
        .from('client_files')
        .select('*')
        .eq('client_id', clientId)
        .order('uploaded_at', { ascending: false });
        
      if (error) {
        return { success: false, error: error.message };
      }
      
      return { 
        success: true,
        data: data || []
      };
      
    } catch (error) {
      logger.error('Error fetching client files:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'An unknown error occurred',
        data: []
      };
    }
}