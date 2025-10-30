"use server"

import { createSupabaseServerClient } from '@/app/actions/authentication/auth';
import { createSupabaseAdminClient } from '@/lib/supabaseServiceAdmin';
import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/lib/database.types';
import { v4 as uuidv4 } from 'uuid';
import { ClientCategory } from '@/types/client.types';
import { logger } from '@/utils/logger';
import { sendClientCredentials } from '@/lib/email';

/**
 * Uploads a file to Supabase storage
 */
export async function uploadProfilePicture(file: File, clientId: string, type: 'requestor' | 'patient'): Promise<string | null> {
  try {
    if (!file) return null;
    
    const supabase = await createSupabaseServerClient();
    
    const fileArrayBuffer = await file.arrayBuffer();
    const fileBlob = new Blob([fileArrayBuffer], { type: file.type });
    
    const fileExt = file.name.split('.').pop();
    const typeFolder = type === 'patient' ? 'Patient' : 'Requestor';
    const fileName = `Clients/ProfilePictures/${typeFolder}/${clientId}/${uuidv4()}.${fileExt}`;
    
    const { data, error } = await supabase.storage
      .from('DearCare')
      .upload(fileName, fileBlob, {
        contentType: file.type,
        cacheControl: '3600'
      });
    
    if (error) {
      logger.error(`Error uploading ${type} profile picture:`, error);
      return null;
    }
    
    return data.path;
  } catch (error) {
    logger.error(`Error in uploadProfilePicture (${type}):`, error);
    return null;
  }
}

/**
 * Helper function to get client contact information
 */
export async function getClientContactInfo(
    supabase: SupabaseClient<Database>,  
    clientId: string, 
    clientType: string
  ): Promise<{
    clientEmail: string;
    clientName: string;
    error: string | null;
  }> {
    try {
      let clientEmail = '';
      let clientName = '';
      
      if (clientType === 'individual') {
        const { data: individualData, error: individualError } = await supabase
          .from('individual_clients')
          .select('requestor_email, requestor_name, patient_name')
          .eq('client_id', clientId)
          .single();
          
        if (individualError) {
          return { clientEmail, clientName, error: individualError.message };
        }
        
        clientEmail = individualData.requestor_email;
        clientName = individualData.requestor_name || individualData.patient_name || 'Unknown Client';
      } else {
        const { data: orgData, error: orgError } = await supabase
          .from('organization_clients')
          .select('contact_email, contact_person_name, organization_name')
          .eq('client_id', clientId)
          .single();
          
        if (orgError) {
          return { clientEmail, clientName, error: orgError.message };
        }
        
        clientEmail = orgData.contact_email;
        clientName = orgData.contact_person_name || orgData.organization_name || 'Unknown Organization';
      }
      
      return { clientEmail, clientName, error: null };
    } catch (error) {
      return { 
        clientEmail: '', 
        clientName: '', 
        error: error instanceof Error ? error.message : 'Error getting client info'
      };
    }
}


/**
 * Creates a user account for a client if one does not already exist.
 * If created, sends credentials via email only in production environment.
 *
 * @param supabase - Supabase admin client instance
 * @param clientEmail - Email address of the client
 * @param clientName - Name of the client
 * @param clientId - Unique client identifier
 * @returns Promise<void>
 */
export async function createUserAccountIfNeeded(
  supabase: SupabaseClient<Database>,
  clientEmail: string,
  clientName: string,
  clientId: string
): Promise<void> {
  const { data: userList, error: userListError } = await supabase.auth.admin.listUsers();

  if (userListError) {
    logger.error('Error listing users:', userListError);
    return;
  }

  const existingUser = userList?.users?.find(user =>
    user.email?.toLowerCase() === clientEmail.toLowerCase()
  );

  if (!existingUser) {
    const generateUniquePassword = () => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
      const timestamp = Date.now().toString(36);
      let password = timestamp.slice(0, 4);

      for (let i = 0; i < 8; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
      }

      return password;
    };

    const password = generateUniquePassword();

    const { error: createError } = await supabase.auth.admin.createUser({
      email: clientEmail,
      password: password,
      email_confirm: true,
      user_metadata: {
        name: clientName,
        role: 'client',
        client_id: clientId,
        requiresPasswordChange: true
      }
    });

    if (createError) {
      logger.error('Error creating user account:', createError);
    } else {
      const env = process.env.NODE_ENV;
      if (env === 'production') {
        const emailResult = await sendClientCredentials(clientEmail, {
          name: clientName,
          password: password,
          appDownloadLink: process.env.MOBILE_APP_DOWNLOAD_LINK || 'https://example.com/download'
        });

        if (emailResult.error) {
          logger.error('Error sending welcome email:', emailResult.error);
        } else {
          logger.info(`Welcome email sent to ${clientEmail}`);
        }
      } else {
        logger.info(`Skipped sending welcome email to ${clientEmail} (env: ${env})`);
      }
    }
  }
}

/**
 * Generates a unique registration number for a client
 */
export async function generateRegistrationNumber(
  clientType: 'individual' | 'organization' | 'hospital' | 'carehome',
  clientCategory: ClientCategory
): Promise<string> {
  const supabase = await createSupabaseAdminClient();
  const currentYear = new Date().getFullYear() % 100;
  
  const categoryPrefix = clientCategory === 'DearCare LLP' ? 'DC' : 'TH';

  let typeCode;
  switch (clientType) {
    case 'individual': typeCode = 'I'; break;
    case 'organization': typeCode = 'O'; break;
    case 'hospital': typeCode = 'H'; break;
    case 'carehome': typeCode = 'C'; break;
    default: typeCode = 'X';
  }

  const { data: counterData, error: counterError } = await supabase.rpc(
    'increment_registration_counter',
    { 
      p_category: categoryPrefix,
      p_type: typeCode,
      p_year: currentYear.toString()
    }
  );
  
  if (counterError) {
    logger.error('Error generating sequence number:', counterError);
    const timestamp = Date.now().toString().slice(-5);
    return `${categoryPrefix}${typeCode}${currentYear}E${timestamp}`;
  }
  
  const sequenceStr = counterData.toString().padStart(4, '0');
  
  return `${categoryPrefix}-${typeCode}${currentYear}-${sequenceStr}`;
}
