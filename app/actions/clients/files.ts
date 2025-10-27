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
        const { data, error } = await supabase
            .storage
            .from('DearCare')
            .createSignedUrl(path, 60 * 30);

        if (error || !data?.signedUrl) {
            logger.error('Error generating signed storage URL:', error);
            return null;
        }

        return data.signedUrl;
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
    tags?: Record<string, string> 
): Promise<{success: boolean, data?: ClientFile[], error?: string}> {
    try {
      const supabase = await createSupabaseServerClient();
      const uploadResults = [];
      
      for (const file of files) {
        const tag = tags?.[file.name] || '';
        
        const fileArrayBuffer = await file.arrayBuffer();
        const fileBlob = new Blob([fileArrayBuffer], { type: file.type });
        
        const fileExt = file.name.split('.').pop();
        const fileName = `Clients/${clientId}/Files/${uuidv4()}.${fileExt}`;
        
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
        
        const { data: fileData, error: fileError } = await supabase
          .from('client_files')
          .insert({
            client_id: clientId,
            name: file.name,
            type: file.type,
            storage_path: uploadData.path,
            uploaded_at: new Date().toISOString(),
            tag: tag
          })
          .select()
          .single();
            
        if (fileError) {
          logger.error('Error storing file metadata:', fileError);
          await supabase.storage.from('DearCare').remove([uploadData.path]);
          continue;
        }
        
        uploadResults.push(fileData);
    }
    
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
        const { error: storageError } = await supabase
          .storage
          .from('DearCare')
          .remove([fileData.storage_path]);
          
        if (storageError) {
          logger.error('Error removing file from storage:', storageError);
        }
      }
      
      const { error: deleteError } = await supabase
        .from('client_files')
        .delete()
        .eq('id', fileId)
        .eq('client_id', clientId);
        
      if (deleteError) {
        return { success: false, error: deleteError.message };
      }
      
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
  
export async function getClientFiles(clientId: string): Promise<{success: boolean, data?: (ClientFile & { url: string | null })[], error?: string}> {
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

        const filesWithUrls = await Promise.all(
            (data || []).map(async (file) => ({
                ...file,
                url: await getStorageUrl(file.storage_path)
            }))
        );

        return {
            success: true,
            data: filesWithUrls
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