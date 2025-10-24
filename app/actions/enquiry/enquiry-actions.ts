'use server'

import { createSupabaseServerClient } from '@/app/actions/authentication/auth';
import { getOrgMappings } from '@/app/utils/org-utils';
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
 * Pagination interface for service enquiries.
 */
export interface PaginationInfo {
  totalCount: number;
  currentPage: number;
  pageSize: number;
  totalPages: number;
}

/**
 * Fetches paginated service enquiries from the dearcare_services_enquiries table.
 * Requires user authentication.
 *
 * @param page - The page number to fetch (default: 1)
 * @param pageSize - Number of records per page (default: 10)
 * @param searchQuery - Optional search term to filter enquiries
 * @returns An object with success status, data, pagination info, or an error message.
 */
export async function fetchAllServiceEnquiries(
  page: number = 1,
  pageSize: number = 10,
  searchQuery?: string
): Promise<{
  success: boolean;
  data?: ServiceEnquiryData[];
  pagination?: PaginationInfo;
  error?: string;
}> {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser();
        
    const organization = user?.user_metadata?.organization;
    const { clientsOrg } = getOrgMappings(organization);

    if (authError || !user) {
      return { success: false, error: 'Authentication required.' };
    }

    let countQuery = supabase
      .from('dearcare_services_enquiries')
      .select('*', { count: 'exact', head: true });

    let dataQuery = supabase
      .from('dearcare_services_enquiries')
      .select('*');
      
    if (clientsOrg) {
      countQuery = countQuery.eq('organization', clientsOrg);
      dataQuery = dataQuery.eq('organization', clientsOrg);
    }

    if (searchQuery && searchQuery.trim() !== '') {
      const searchTerm = searchQuery.toLowerCase().trim();
      const searchFilter = `name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%,location.ilike.%${searchTerm}%,service.ilike.%${searchTerm}%`;
      
      countQuery = countQuery.or(searchFilter);
      dataQuery = dataQuery.or(searchFilter);
    }

    const { count, error: countError } = await countQuery;
    
    if (countError) {
      logger.error('Error counting service enquiries:', countError);
      return { success: false, error: countError.message };
    }

    if (count === 0) {
      return {
        success: true,
        data: [],
        pagination: {
          totalCount: 0,
          currentPage: page,
          pageSize,
          totalPages: 0
        }
      };
    }

    const { data, error } = await dataQuery
      .range((page - 1) * pageSize, (page * pageSize) - 1)
      .order('created_at', { ascending: false });

    if (error) {
      logger.error('Error fetching service enquiries:', error);
      return { success: false, error: error.message };
    }

    return { 
      success: true, 
      data, 
      pagination: {
        totalCount: count || 0,
        currentPage: page,
        pageSize,
        totalPages: Math.ceil((count || 0) / pageSize)
      }
    };
  } catch (error) {
    logger.error('Unexpected error fetching service enquiries:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch service enquiries'
    };
  }
}

/**
 * Exports all service enquiries without pagination - for data export purposes.
 * 
 * @param searchQuery - Optional search term to filter enquiries
 * @returns An object with success status, data, or an error message.
 */
export async function exportServiceEnquiries(
  searchQuery?: string
): Promise<{
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

    const organization = user?.user_metadata?.organization;
    const { clientsOrg } = getOrgMappings(organization);

    let query = supabase
      .from('dearcare_services_enquiries')
      .select('*');

    if (searchQuery && searchQuery.trim() !== '') {
      const searchTerm = searchQuery.toLowerCase().trim();
      query = query.or(
        `name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%,location.ilike.%${searchTerm}%,service.ilike.%${searchTerm}%`
      );
    }

    if (clientsOrg) {
      query = query.eq('organization', clientsOrg);
    }
    
    const { data, error } = await query
      .order('created_at', { ascending: false });

    if (error) {
      logger.error('Error exporting service enquiries:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    logger.error('Unexpected error exporting service enquiries:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to export service enquiries'
    };
  }
}