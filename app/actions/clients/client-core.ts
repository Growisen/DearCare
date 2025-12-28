"use server"

import { createSupabaseServerClient } from '@/app/actions/authentication/auth';
import { revalidatePath } from 'next/cache';
import { logger } from '@/utils/logger';
import { ClientCategory } from '@/types/client.types';
import { getStorageUrl } from './files';
import { Database } from '@/lib/database.types';
import { getOrgMappings } from '@/app/utils/org-utils';

async function getAuthenticatedClient() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  const userId = user?.id;
  
  if (!userId) {
    throw new Error("User not authenticated");
  }

  const web_user_id = user.user_metadata.user_id

  const organization = user?.user_metadata?.organization;

  const { nursesOrg, clientsOrg } = getOrgMappings(organization);

  return { supabase, userId: web_user_id, nursesOrg, clientsOrg };
}

export async function getClients(
  status?: 'pending' | 'under_review' | 'approved' | 'rejected' | 'assigned' | 'all', 
  searchQuery?: string,
  page: number = 1,
  pageSize: number = 10,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  category?: ClientCategory | 'all'
) {
  try {
    const supabase = await createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser();
    const organization = user?.user_metadata?.organization;

    const { clientsOrg } = getOrgMappings(organization);
    
    const selectFields = `
      id,
      client_type,
      status,
      created_at,
      individual_clients:individual_clients(
        requestor_email,
        requestor_phone,
        requestor_name,
        patient_name,
        service_required,
        start_date
      ),
      organization_clients:organization_clients(
        organization_name,
        contact_email,
        contact_phone
      )
    `
    
    const countQuery = supabase
      .from('clients')
      .select('id', { count: 'exact', head: true })
    
    const dataQuery = supabase
      .from('clients')
      .select(selectFields)
    
    if (status && status !== "all") {
      countQuery.eq('status', status)
      dataQuery.eq('status', status)
    }

    if (clientsOrg) {
      countQuery.eq('client_category', clientsOrg)
      dataQuery.eq('client_category', clientsOrg)
    }

    if (searchQuery && searchQuery.trim() !== '') {
      const searchTerm = searchQuery.toLowerCase().trim()
      
      const { data: matchingIds, error: searchError } = await supabase.rpc(
        'search_clients', 
        { search_term: `%${searchTerm}%` }
      )
      
      // If DB doesn't have an RPC function:
      /*
      const { data: matchingIds, error: searchError } = await supabase
        .from('client_search_view')  // Consider creating a optimized view for searching
        .select('client_id')
        .ilike('search_text', `%${searchTerm}%`)
      */
      
      if (searchError) {
        logger.error("Error in search query:", searchError)
        return { success: false, error: searchError.message }
      }
      
      if (!matchingIds || matchingIds.length === 0) {
        return { 
          success: true, 
          clients: [],
          pagination: { totalCount: 0, currentPage: page, pageSize, totalPages: 0 }
        }
      }
      
      interface SearchResult {
        client_id: string;
      }

      const clientIds: string[] = (matchingIds as SearchResult[]).map(item => item.client_id);
      countQuery.in('id', clientIds)
      dataQuery.in('id', clientIds)
    }
    
    const { count, error: countError } = await countQuery
    
    if (countError) {
      logger.error("Error counting clients:", countError)
      return { success: false, error: countError.message }
    }
    
    if (count === 0) {
      return { 
        success: true, 
        clients: [],
        pagination: { totalCount: 0, currentPage: page, pageSize, totalPages: 0 }
      }
    }
    
    const { data, error } = await dataQuery
      .range((page - 1) * pageSize, (page * pageSize) - 1)
      .order('created_at', { ascending: false })
    
    if (error) {
      logger.error("Error fetching clients:", error)
      return { success: false, error: error.message }
    }
    

    const clients = data
    .filter(record => {
      const isIndividual = record.client_type === 'individual';
      const individualData = isIndividual && record.individual_clients
        ? (Array.isArray(record.individual_clients) ? record.individual_clients[0] : record.individual_clients)
        : null;
      const organizationData = !isIndividual && record.organization_clients
        ? (Array.isArray(record.organization_clients) ? record.organization_clients[0] : record.organization_clients)
        : null;

      if (isIndividual) {
        return (
          individualData?.requestor_name ||
          individualData?.patient_name ||
          individualData?.requestor_email ||
          individualData?.requestor_phone
        );
      } else {
        return (
          organizationData?.organization_name ||
          organizationData?.contact_email ||
          organizationData?.contact_phone
        );
      }
    })
    .map(record => {
      const isIndividual = record.client_type === 'individual'
      const individualData = isIndividual && record.individual_clients ? 
        (Array.isArray(record.individual_clients) ? record.individual_clients[0] : record.individual_clients) 
        : null
      const organizationData = !isIndividual && record.organization_clients ? 
        (Array.isArray(record.organization_clients) ? record.organization_clients[0] : record.organization_clients) 
        : null
      
      return {
        id: record.id,
        name: isIndividual 
          ? (individualData?.requestor_name || individualData?.patient_name) 
          : (organizationData?.organization_name),
        requestDate: isIndividual
          ? new Date(individualData?.start_date || record.created_at || new Date()).toISOString().split('T')[0]
          : new Date(record.created_at || new Date()).toISOString().split('T')[0],
        createdAt: record.created_at,
        service: isIndividual ? individualData?.service_required : "Organization Care",
        status: record.status,
        email: isIndividual ? individualData?.requestor_email : organizationData?.contact_email,
        phone: isIndividual ? individualData?.requestor_phone : organizationData?.contact_phone,
      }
    })
    
    return { 
      success: true, 
      clients,
      pagination: {
        totalCount: count || 0,
        currentPage: page,
        pageSize: pageSize,
        totalPages: Math.ceil((count || 0) / pageSize)
      }
    }
    
  } catch (error: unknown) {
    logger.error('Error fetching clients:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'An unknown error occurred', 
      clients: [] 
    }
  }
}


export async function getUnifiedClients(
  status?: 'pending' | 'under_review' | 'approved' | 'rejected' | 'assigned' | 'all',
  searchQuery?: string,
  page: number = 1,
  pageSize: number = 10,
  createdAt?: Date | null,
) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    const organization = user?.user_metadata?.organization;
    const { clientsOrg } = getOrgMappings(organization);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const applyFilters = (baseQuery: any) => {
      let q = baseQuery;

      if (status && status !== "all") {
        q = q.eq('status', status);
      }

      if (clientsOrg) {
        q = q.eq('client_category', clientsOrg);
      }

      if (searchQuery && searchQuery.trim() !== '') {
        const searchTerm = `%${searchQuery.toLowerCase().trim()}%`;
        q = q.ilike('search_text', searchTerm);
      }

      if (createdAt) {
        const date = typeof createdAt === 'string' ? new Date(createdAt) : createdAt;
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        q = q.gte('created_at', startOfDay.toISOString())
            .lte('created_at', endOfDay.toISOString());
      }

      return q;
    };

    console.log('Filters - Status:', status, 'Search Query:', searchQuery, 'Created At:', createdAt);

    let query = supabase
      .from('clients_view_unified')
      .select(`
        id,
        client_type,
        registration_number,
        prev_registration_number,
        status,
        created_at,
        client_category,
        requestor_email,
        requestor_phone,
        requestor_name,
        patient_name,
        service_required,
        start_date,
        organization_name,
        contact_email,
        contact_phone,
        search_text
      `);

    query = applyFilters(query);

    let countQuery = supabase
      .from('clients_view_unified')
      .select('id', { count: 'exact', head: true });

    countQuery = applyFilters(countQuery);

    const { count, error: countError } = await countQuery;

    if (countError) {
      logger.error("Error counting unified clients:", countError);
      return { success: false, error: countError.message };
    }

    if (count === 0) {
      return {
        success: true,
        clients: [],
        pagination: { totalCount: 0, currentPage: page, pageSize, totalPages: 0 }
      };
    }

    const { data, error } = await query
      .range((page - 1) * pageSize, (page * pageSize) - 1)
      .order('created_at', { ascending: false });

    if (error) {
      logger.error("Error fetching unified clients:", error);
      return { success: false, error: error.message };
    }

    const clients = (data || []).map(record => {
      const isIndividual = record.client_type === 'individual';
      return {
        id: record.id,
        name: isIndividual
          ? (record.requestor_name || record.patient_name)
          : (record.organization_name),
        requestDate: isIndividual
          ? new Date(record.start_date || record.created_at || new Date()).toISOString().split('T')[0]
          : new Date(record.created_at || new Date()).toISOString().split('T')[0],
        createdAt: record.created_at,
        service: isIndividual ? record.service_required : "Organization Care",
        status: record.status,
        email: isIndividual ? record.requestor_email : record.contact_email,
        phone: isIndividual ? record.requestor_phone : record.contact_phone,
        registrationNumber: record.registration_number || undefined,
        previousRegistrationNumber: record.prev_registration_number || undefined,
      };
    });

    return {
      success: true,
      clients,
      pagination: {
        totalCount: count || 0,
        currentPage: page,
        pageSize: pageSize,
        totalPages: Math.ceil((count || 0) / pageSize)
      }
    };
  } catch (error: unknown) {
    logger.error('Error fetching unified clients:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unknown error occurred',
      clients: []
    };
  }
}


/**
 * Fetches detailed information for a specific client by ID
 * OPTIMIZED: Uses relational joins to reduce DB round trips and Promise.all for parallel storage calls.
 */
export async function getClientDetails(clientId: string) {
  try {
    const supabase = await createSupabaseServerClient()
    const { data: clientData, error: clientError } = await supabase
      .from('clients')
      .select(`
        *,
        individual_clients (*),
        organization_clients (*),
        staff_requirements (*)
      `)
      .eq('id', clientId)
      .single()

    if (clientError) {
      return { success: false, error: clientError.message }
    }

    if (!clientData) {
      return { success: false, error: 'Client not found' }
    }

    const { 
      individual_clients, 
      organization_clients, 
      staff_requirements, 
      ...baseClient 
    } = clientData

    if (baseClient.client_type === 'individual') {
      const individualDetails = individual_clients

      if (!individualDetails) {
         return { success: false, error: 'Individual client details not found' }
      }
      const [patientPicUrl, requestorPicUrl] = await Promise.all([
        individualDetails.patient_profile_pic 
          ? getStorageUrl(individualDetails.patient_profile_pic) 
          : null,
        individualDetails.requestor_profile_pic 
          ? getStorageUrl(individualDetails.requestor_profile_pic) 
          : null
      ])

      return {
        success: true,
        client: {
          ...baseClient,
          details: {
            ...individualDetails,
            patient_profile_pic_url: patientPicUrl,
            requestor_profile_pic_url: requestorPicUrl,
            patient_profile_pic: individualDetails.patient_profile_pic,
            requestor_profile_pic: individualDetails.requestor_profile_pic,
          }
        }
      }
    } else {
      const organizationDetails = organization_clients

      if (!organizationDetails) {
        return { success: false, error: 'Organization client details not found' }
      }

      return {
        success: true,
        client: {
          ...baseClient,
          details: organizationDetails,
          staffRequirements: staff_requirements || []
        }
      }
    }
  } catch (error: unknown) {
    logger.error('Error fetching client details:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unknown error occurred'
    }
  }
}


export async function getClientStatus(clientId: string) {
    try {
      const supabase = await createSupabaseServerClient();
      
      const { data, error } = await supabase
        .from('clients')
        .select('status')
        .eq('id', clientId)
        .single();
      
      if (error) {
        return { 
          success: false, 
          error: error.message 
        };
      }
      
      if (!data) {
        return { 
          success: false, 
          error: 'Client not found' 
        };
      }
  
      logger.info("status", data.status)
      
      return { 
        success: true, 
        status: data.status
      };
    } catch (error: unknown) {
      logger.error('Error fetching client status:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'An unknown error occurred' 
      };
    }
}


export async function deleteClient(clientId: string) {
    try {
        const supabase = await createSupabaseServerClient();
        
        const { data: nurseAssignments, error: nurseError } = await supabase
            .from('nurse_client')
            .select('nurse_id')
            .eq('client_id', clientId);

        if (nurseError) {
            return { success: false, error: nurseError.message };
        }

        if (nurseAssignments && nurseAssignments.length > 0) {
            return { success: false, error: 'Client cannot be deleted' };
        }

        const { data: client, error: clientError } = await supabase
            .from('clients')
            .select('client_type')
            .eq('id', clientId)
            .single();

        if (clientError) {
            return { success: false, error: clientError.message };
        }

        const { data: clientFiles } = await supabase
            .from('client_files')
            .select('id, storage_path')
            .eq('client_id', clientId);

        if (clientFiles && clientFiles.length > 0) {
            const filePaths = clientFiles.map(file => file.storage_path).filter(Boolean);
            if (filePaths.length > 0) {
                await supabase.storage.from('DearCare').remove(filePaths);
            }

            await supabase
                .from('client_files')
                .delete()
                .eq('client_id', clientId);
        }

        await supabase
            .from('patient_assessments')
            .delete()
            .eq('client_id', clientId);

        if (client.client_type === 'individual') {
            await supabase
                .from('individual_clients')
                .delete()
                .eq('client_id', clientId);
        } else {
            await supabase
                .from('staff_requirements')
                .delete()
                .eq('client_id', clientId);

            await supabase
                .from('organization_clients')
                .delete()
                .eq('client_id', clientId);

            await supabase
                .from('otp')
                .delete()
                .eq('client_id', clientId);
        }

        const { error: deleteError } = await supabase
            .from('clients')
            .delete()
            .eq('id', clientId);

        if (deleteError) {
            logger.error('Error deleting client record:', deleteError);
            return { success: false, error: deleteError.message };
        }

        revalidatePath('/clients');
        return { success: true };

    } catch (error: unknown) {
        logger.error('Error deleting client:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'An unknown error occurred'
        };
    }
}


/**
 * Exports all clients without pagination - for data export purposes
 */
export async function exportClients(
  status?: 'pending' | 'under_review' | 'approved' | 'rejected' | 'assigned' | 'all', 
  searchQuery?: string
) {
  try {
    const { supabase, clientsOrg } = await getAuthenticatedClient();
    
    let query = supabase
      .from('clients')
      .select(`
        id,
        client_type,
        status,
        created_at,
        client_category,
        general_notes,
        individual_clients:individual_clients(
          requestor_name,
          requestor_phone, 
          requestor_email,
          patient_name,
          patient_age,
          patient_gender,
          requestor_address,
          requestor_city,
          requestor_district,
          requestor_pincode,
          service_required,
          start_date,
          care_duration,
          relation_to_patient
        ),
        organization_clients:organization_clients(
          organization_name,
          organization_type,
          contact_person_name,
          contact_person_role,
          contact_phone,
          contact_email,
          organization_address,
          organization_state,
          organization_district,
          organization_city,
          organization_pincode,
          start_date
        )
      `)

    if (clientsOrg) {
      query = query.eq('client_category', clientsOrg);
    }
    
    if (status && status !== "all") {
      //query = query.eq('status', status)
    }
    
    if (searchQuery && searchQuery.trim() !== '') {
      // const searchTerm = searchQuery.toLowerCase().trim();
      
      // const individualClientsQuery = supabase
      //   .from('individual_clients')
      //   .select('client_id')
      //   .or(`patient_name.ilike.%${searchTerm}%,requestor_phone.ilike.%${searchTerm}%,requestor_name.ilike.%${searchTerm}%,complete_address.ilike.%${searchTerm}%`);
      
      // const organizationClientsQuery = supabase
      //   .from('organization_clients')
      //   .select('client_id')
      //   .or(`organization_name.ilike.%${searchTerm}%,contact_phone.ilike.%${searchTerm}%,contact_person_name.ilike.%${searchTerm}%,organization_address.ilike.%${searchTerm}%`);
        
      // const [individualResults, organizationResults] = await Promise.all([
      //   individualClientsQuery,
      //   organizationClientsQuery
      // ]);
      
      // const individualClientIds = (individualResults.data || []).map(item => item.client_id);
      // const organizationClientIds = (organizationResults.data || []).map(item => item.client_id);
      
      // const matchingClientIds = [...individualClientIds, ...organizationClientIds];
      
      // if (matchingClientIds.length > 0) {
      //   query = query.in('id', matchingClientIds);
      // } else {
      //   return { 
      //     success: true, 
      //     clients: [],
      //     clientsData: []
      //   };
      // }
    }
    
    const { data, error } = await query
      .order('created_at', { ascending: false })
    
    if (error) {
      logger.error("Error fetching clients for export:", error)
      return { success: false, error: error.message }
    }
    
    // Create detailed data for export
    const clientsData = data.map(record => {
      const isIndividual = record.client_type === 'individual';
      const individualData = isIndividual ? 
        (Array.isArray(record.individual_clients) ? record.individual_clients[0] : record.individual_clients) : null;
      const organizationData = !isIndividual ? 
        (Array.isArray(record.organization_clients) ? record.organization_clients[0] : record.organization_clients) : null;
        
      return {
        client_type: record.client_type,
        status: record.status,
        created_at: record.created_at,
        general_notes: record.general_notes,
        ...individualData,
        ...organizationData
      };
    });
    
    // Also keep the regular client objects for backward compatibility
    const clients = data.map(record => {
      const isIndividual = record.client_type === 'individual'
      const individualData = isIndividual ? (Array.isArray(record.individual_clients) 
        ? record.individual_clients[0] 
        : record.individual_clients) : null
      const organizationData = !isIndividual ? (Array.isArray(record.organization_clients) 
        ? record.organization_clients[0] 
        : record.organization_clients) : null
      
      return {
        name: isIndividual 
          ? individualData?.patient_name || "Unknown" 
          : organizationData?.organization_name || "Unknown",
        requestDate: isIndividual
          ? new Date(individualData?.start_date || record.created_at || new Date()).toISOString().split('T')[0]
          : new Date(record.created_at || new Date()).toISOString().split('T')[0],
        service: isIndividual ? individualData?.service_required : "Organization Care",
        status: record.status,
        email: isIndividual ? individualData?.requestor_email : organizationData?.contact_email,
        phone: isIndividual ? individualData?.requestor_phone : organizationData?.contact_phone,
        requestor_address: isIndividual ? individualData?.requestor_address : organizationData?.organization_address,
        organization_state: organizationData?.organization_state,
        requestor_district: isIndividual ? individualData?.requestor_district : organizationData?.organization_district,
        requestor_city: isIndividual ? individualData?.requestor_city : organizationData?.organization_city,
        description: record.general_notes || undefined
      }
    })
      
    return { 
      success: true, 
      clients,
      clientsData
    }
    
  } catch (error: unknown) {
    logger.error('Error exporting clients:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'An unknown error occurred', 
      clients: [],
      clientsData: []
    }
  }
}


export async function updateClientCategory(
    clientId: string,
    newCategory: Database["public"]["Enums"]["client_category"]
  ) {
    try {
      const supabase = await createSupabaseServerClient();
      
      const { data, error } = await supabase
        .from('clients')
        .update({ client_category: newCategory })
        .eq('id', clientId)
        .select()
        .single();
  
      if (error) {
        return { success: false, error: error.message };
      }
      
      // Revalidate the clients page to reflect the changes
      revalidatePath('/clients');
      
      return { success: true, client: data };
    } catch (error: unknown) {
      logger.error('Error updating client category:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'An unknown error occurred'
      };
    }
}


export async function fetchApprovedClientNames(searchTerm?: string): Promise<{
  data: { client_id: string; registration_number: string; patient_name: string, patient_state: string, patient_district: string, patient_city: string, client_type: string }[] | null;
  error: string | null;
}> {
  try {
    const supabase = await createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser();
    const organization = user?.user_metadata?.organization;

    const { clientsOrg } = getOrgMappings(organization);

    let query = supabase
      .from('approved_clients_view')
      .select('client_id, registration_number, patient_name, patient_state, patient_district, patient_city, client_type');

    if (clientsOrg) {
      query = query.eq('client_category', clientsOrg);
    }

    if (searchTerm && searchTerm.trim() !== '') {
      const q = `%${searchTerm.trim()}%`;
      query = query.or(`registration_number.ilike.${q},patient_name.ilike.${q}`);
    }

    query = query.order('patient_name');

    const { data, error } = await query;

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    logger.error('Error fetching approved client names:', error);
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Failed to fetch client names'
    };
  }
}


/**
 * Updates either patient_location_link or requestor_location_link for an individual client.
 * @param clientId - The client_id of the individual client.
 * @param field - Either 'patient_location_link' or 'requestor_location_link'.
 * @param value - The new value to set for the field.
 */
export async function updateIndividualClientLocationLink(
  clientId: string,
  field: 'patient_location_link' | 'requestor_location_link',
  value: string
) {
  if (!['patient_location_link', 'requestor_location_link'].includes(field)) {
    return { success: false, error: 'Invalid field name' };
  }
  try {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase
      .from('individual_clients')
      .update({ [field]: value })
      .eq('client_id', clientId);

    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (error: unknown) {
    logger.error('Error updating location link:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unknown error occurred'
    };
  }
}


/**
 * Updates the created_at field for a client.
 * @param clientId - The ID of the client.
 * @param newCreatedAt - The new created_at value (ISO string or Date).
 */
export async function updateClientCreatedAt(clientId: string, newCreatedAt: string | Date) {
  try {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase
      .from('clients')
      .update({ created_at: typeof newCreatedAt === 'string' ? newCreatedAt : newCreatedAt.toISOString() })
      .eq('id', clientId);

    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (error: unknown) {
    logger.error('Error updating created_at:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unknown error occurred'
    };
  }
}

/**
 * Updates the service_start_date and service_end_date fields for a client.
 * @param clientId - The ID of the client.
 * @param startDate - The new service start date (string in 'YYYY-MM-DD' format or Date).
 * @param endDate - The new service end date (string in 'YYYY-MM-DD' format or Date).
 */
export async function updateClientServicePeriod(
  clientId: string,
  startDate: string | Date,
  endDate: string | Date
) {
  try {
    const supabase = await createSupabaseServerClient();
    const formatDate = (d: string | Date) =>
      typeof d === 'string'
        ? d
        : d.toISOString().split('T')[0];

    const { error } = await supabase
      .from('clients')
      .update({
        service_start_date: formatDate(startDate),
        service_end_date: formatDate(endDate),
      })
      .eq('id', clientId);

    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (error: unknown) {
    logger.error('Error updating service period:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unknown error occurred'
    };
  }
}

export type ServiceHistoryItem = {
  id: string;
  client_id: string;
  start_date: string;
  end_date: string;
  note?: string;
  created_at?: string;
  service_required?: string;
};

/**
 * Adds a new service item to the client_service_history table.
 * @param clientId - The ID of the client.
 * @param serviceItem - The service item details.
 */
export async function addServiceHistoryItem(
  clientId: string,
  serviceItem: { start_date: string; end_date: string; note?: string; service_required?: string }
) {
  try {
    const supabase = await createSupabaseServerClient();

    const { data, error } = await supabase
      .from('client_service_history')
      .insert({
        client_id: clientId,
        start_date: serviceItem.start_date,
        end_date: serviceItem.end_date,
        note: serviceItem.note,
        service_required: serviceItem.service_required,
      })
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error: unknown) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unknown error occurred',
    };
  }
}

/**
 * Updates a specific service history row.
 * @param clientId - The ID of the client (used for safety check).
 * @param itemId - The specific UUID of the service history row.
 * @param updates - Object containing fields to change.
 */
export async function updateServiceHistoryItem(
  clientId: string,
  itemId: string,
  updates: Partial<{ start_date: string; end_date: string; note: string; service_required: string }>
) {
  try {
    const supabase = await createSupabaseServerClient();

    const { error } = await supabase
      .from('client_service_history')
      .update(updates)
      .eq('id', itemId)
      .eq('client_id', clientId); 
    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error: unknown) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unknown error occurred',
    };
  }
}

/**
 * Fetches service history from the table, sorted by newest start_date.
 * @param clientId - The ID of the client.
 */
export async function getServiceHistory(clientId: string) {
  try {
    const supabase = await createSupabaseServerClient();

    const { data, error } = await supabase
      .from('client_service_history')
      .select('*')
      .eq('client_id', clientId)
      .order('start_date', { ascending: false }); // Database handles the sorting now

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: data as ServiceHistoryItem[] };
  } catch (error: unknown) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unknown error occurred',
    };
  }
}

/**
 * Deletes a service history item.
 * @param itemId - The UUID of the item to delete.
 */
export async function deleteServiceHistoryItem(itemId: string) {
  try {
    const supabase = await createSupabaseServerClient();

    const { error } = await supabase
      .from('client_service_history')
      .delete()
      .eq('id', itemId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error: unknown) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unknown error occurred',
    };
  }
}