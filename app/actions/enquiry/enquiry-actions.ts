'use server'

import { createSupabaseServerClient } from '@/app/actions/authentication/auth';
import { logger } from '@/utils/logger';

/**
 * Data required to create a new service enquiry.
 */
export interface ServiceEnquiryData {
  name: string;
  email: string;
  phone: string;
  location: string;
  service: string;
}

/**
 * Inserts a new enquiry into the dearcare_services_enquiries table.
 *
 * @param data - The enquiry data to insert.
 * @returns An object with success status, the inserted record, or an error message.
 */
export async function createServiceEnquiry(
  data: ServiceEnquiryData
): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const supabase = await createSupabaseServerClient();

    const { error } = await supabase
      .from('dearcare_services_enquiries')
      .insert([data]);

    if (error) {
      logger.error('Error inserting service enquiry:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    logger.error('Unexpected error inserting service enquiry:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create service enquiry'
    };
  }
}



/**
 * Fetches all service enquiries from the dearcare_services_enquiries table.
 * Requires user authentication.
 *
 * @returns An object with success status, data (array of enquiries), or an error message.
 */
export async function fetchAllServiceEnquiries(): Promise<{
  success: boolean;
  data?: ServiceEnquiryData[];
  error?: string;
}> {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: 'Authentication required.' };
    }

    const { data, error } = await supabase
      .from('dearcare_services_enquiries')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      logger.error('Error fetching service enquiries:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    logger.error('Unexpected error fetching service enquiries:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch service enquiries'
    };
  }
}