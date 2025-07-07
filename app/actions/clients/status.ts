"use server"

import { createSupabaseAdminClient } from '@/lib/supabaseServiceAdmin';
import { revalidatePath } from 'next/cache';
import { sendClientRejectionNotification } from '@/lib/email';
import { getClientContactInfo, createUserAccountIfNeeded, generateRegistrationNumber } from './utils';
import { logger } from '@/utils/logger';


/**
 * Updates a client's status
 */
export async function updateClientStatus(
    clientId: string,
    newStatus: 'pending' | 'under_review' | 'approved' | 'rejected' | 'assigned',
    rejectionReason?: string
  ) {
    try {
      const supabase = await createSupabaseAdminClient();
      
      const { data: client, error: clientError } = await supabase
        .from('clients')
        .select('client_type, client_category')
        .eq('id', clientId)
        .single();
        
      if (clientError) {
        return { success: false, error: clientError.message };
      }
      
      const { clientEmail, clientName, error: contactError } = await getClientContactInfo(
        supabase,
        clientId,
        client.client_type
      );
      
      if (contactError) {
        return { success: false, error: contactError };
      }
      
      if (newStatus === 'rejected' && rejectionReason) {
        const { data, error } = await supabase
          .from('clients')
          .update({ 
            status: newStatus,
            rejection_reason: rejectionReason
          })
          .eq('id', clientId)
          .select()
          .single();
  
        if (error) {
          return { success: false, error: error.message };
        }
        
        // Send rejection email if email is available
        if (clientEmail && clientName) {
          try {
            await sendClientRejectionNotification(clientEmail, {
              name: clientName,
              rejectionReason: rejectionReason
            });
            logger.error(`Rejection notification sent to ${clientEmail}`);
          } catch (emailError) {
            logger.error('Error sending rejection email:', emailError);
          }
        } else {
          logger.warn('Unable to send rejection email: Missing client email or name');
        }
        
        revalidatePath('/clients');
        return { success: true, client: data };
      }
      else if (newStatus === 'approved') {
  
        const registrationNumber = await generateRegistrationNumber(
          client.client_type,
          client.client_category
        );
        
        if (clientEmail) {
          await createUserAccountIfNeeded(supabase, clientEmail, clientName, clientId);
        }
  
        const { data, error } = await supabase
          .from('clients')
          .update({ 
            status: newStatus,
            registration_number: registrationNumber
          })
          .eq('id', clientId)
          .select()
          .single();
  
        if (error) {
          return { success: false, error: error.message };
        }
  
        revalidatePath('/clients');
        return { success: true, client: data };
      }
      else {
        const { data, error } = await supabase
          .from('clients')
          .update({ status: newStatus })
          .eq('id', clientId)
          .select()
          .single();
  
        if (error) {
          return { success: false, error: error.message };
        }
        
        revalidatePath('/clients');
        return { success: true, client: data };
      }
      
    } catch (error: unknown) {
      logger.error('Error updating client status:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'An unknown error occurred'
      };
    }
}
  