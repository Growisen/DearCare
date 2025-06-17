"use server"

import { createSupabaseServerClient } from './auth'
import { revalidatePath } from 'next/cache';
import { IndividualFormData, OrganizationFormData, SavePatientAssessmentParams, SavePatientAssessmentResult  } from '@/types/client.types';
import { Database } from '@/lib/database.types';
import { createSupabaseAdminClient } from '@/lib/supabaseServiceAdmin';
import { sendClientCredentials, sendClientFormLink, sendClientRejectionNotification } from '@/lib/email'
import { v4 as uuidv4 } from 'uuid';
import { SupabaseClient } from '@supabase/supabase-js';
import { ClientCategory, ClientFile } from "@/types/client.types";

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
    console.error('Error generating storage URL:', error);
    return null;
  }
}
/**
 * Uploads a file to Supabase storage
 */
async function uploadProfilePicture(file: File, clientId: string, type: 'requestor' | 'patient'): Promise<string | null> {
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
      console.error(`Error uploading ${type} profile picture:`, error);
      return null;
    }
    
    return data.path;
  } catch (error) {
    console.error(`Error in uploadProfilePicture (${type}):`, error);
    return null;
  }
}

/**
 * Adds a new individual client to the database
 */
export async function addIndividualClient(formData: IndividualFormData) {
  try {
    const supabase = await createSupabaseServerClient()
    
    // First create the base client record
    const { data: clientData, error: clientError } = await supabase
      .from('clients')
      .insert({
        client_type: formData.clientType,
        client_category: formData.clientCategory,
        general_notes: formData.generalNotes,
        duty_period: formData.dutyPeriod,
        duty_period_reason: formData.dutyPeriodReason,
        status: 'pending'
      })
      .select()
      .single();
    
    if (clientError) {
      throw new Error(`Failed to create client: ${clientError.message}`);
    }
    
    // Upload profile pictures if provided
    let requestorProfilePicPath: string | null = null;
    let patientProfilePicPath: string | null = null;
    
    if (formData.requestorProfilePic) {
      requestorProfilePicPath = await uploadProfilePicture(
        formData.requestorProfilePic, 
        clientData.id, 
        'requestor'
      );
    }
    
    if (formData.patientProfilePic) {
      patientProfilePicPath = await uploadProfilePicture(
        formData.patientProfilePic, 
        clientData.id, 
        'patient'
      );
    }
    
    // Now create the individual client record
    const { error: individualError } = await supabase
      .from('individual_clients')
      .insert({
        care_duration: formData.careDuration,
        client_id: clientData.id,
        patient_age: parseInt(formData.patientAge) || null,
        patient_gender: formData.patientGender || null,
        patient_name: formData.patientName,
        patient_phone: formData.patientPhone || null,
        patient_address: formData.patientAddress,
        patient_pincode: formData.patientPincode,
        patient_district: formData.patientDistrict,
        patient_city: formData.patientCity,   
        patient_state: formData.patientState || null,  
        preferred_caregiver_gender: formData.preferredCaregiverGender || null,
        relation_to_patient: formData.relationToPatient || 'other',
        requestor_email: formData.requestorEmail,
        requestor_name: formData.requestorName,
        requestor_phone: formData.requestorPhone,
        service_required: formData.serviceRequired,
        start_date: formData.startDate,
        requestor_profile_pic: requestorProfilePicPath,
        patient_profile_pic: patientProfilePicPath,
        requestor_address: formData.requestorAddress || null,
        requestor_job_details: formData.requestorJobDetails || null,
        requestor_emergency_phone: formData.requestorEmergencyPhone || null,
        requestor_pincode: formData.requestorPincode || null,
        requestor_district: formData.requestorDistrict || null,
        requestor_city: formData.requestorCity || null,
        requestor_state: formData.requestorState || null,
      });
    
    if (individualError) {
      // If individual client creation fails, we should remove the base client
      await supabase.from('clients').delete().eq('id', clientData.id);
      
      // Also clean up any uploaded files
      if (requestorProfilePicPath) {
        await supabase.storage.from('profile-pictures').remove([requestorProfilePicPath]);
      }
      if (patientProfilePicPath) {
        await supabase.storage.from('profile-pictures').remove([patientProfilePicPath]);
      }
      
      throw new Error(`Failed to create individual client details: ${individualError.message}`);
    }
    
    revalidatePath('/clients');
    return { success: true, id: clientData.id };
    
  } catch (error: unknown) {
    console.error('Error adding individual client:', error);
    return { success: false, error: error instanceof Error ? error.message : 'An unknown error occurred' };
  }
}

/**
 * Adds a new organization client to the database with staff requirements
 */
export async function addOrganizationClient(formData: OrganizationFormData) {
  try {
    const supabase = await createSupabaseServerClient()
    
    // First create the base client record
    const { data: clientData, error: clientError } = await supabase
      .from('clients')
      .insert({
        client_type: formData.clientType,
        client_category: formData.clientCategory,
        general_notes: formData.generalNotes,
        duty_period: formData.dutyPeriod,
        duty_period_reason: formData.dutyPeriodReason,
        status: 'pending'
      })
      .select()
      .single();
    
    if (clientError) {
      throw new Error(`Failed to create client: ${clientError.message}`);
    }
    
    // Create the organization client record
    const { error: organizationError } = await supabase
      .from('organization_clients')
      .insert({
        client_id: clientData.id,
        organization_name: formData.organizationName,
        organization_type: formData.clientType || '',
        contact_person_name: formData.contactPersonName,
        contact_person_role: formData.contactPersonRole || '',
        contact_phone: formData.contactPhone,
        contact_email: formData.contactEmail,
        organization_address: formData.organizationAddress,
        start_date: formData.staffReqStartDate || null,
        organization_state: formData.organizationState || '',
        organization_district: formData.organizationDistrict || '',
        organization_city: formData.organizationCity || '',
        organization_pincode: formData.organizationPincode || ''
      });
    
    if (organizationError) {
      // Clean up the base client if organization details failed
      await supabase.from('clients').delete().eq('id', clientData.id);
      throw new Error(`Failed to create organization details: ${organizationError.message}`);
    }
    
    // Add staff requirements
    if (formData.staffRequirements && formData.staffRequirements.length > 0) {
      const staffRequirementsData = formData.staffRequirements.map(requirement => ({
        client_id: clientData.id,
        staff_type: requirement.staffType,
        count: requirement.count,
        shift_type: requirement.shiftType
      }));
      
      const { error: staffError } = await supabase
        .from('staff_requirements')
        .insert(staffRequirementsData);
      
      if (staffError) {
        console.error('Error adding staff requirements:', staffError);
        // We don't throw here to avoid rolling back the whole transaction,
        // but we log the error for investigation
      }
    }
    
    revalidatePath('/clients');
    return { success: true, id: clientData.id };
    
  } catch (error: unknown) {
    console.error('Error adding organization client:', error);
    return { success: false, error: error instanceof Error ? error.message : 'An unknown error occurred' };
  }
}

// export async function getClients(
//   status?: 'pending' | 'under_review' | 'approved' | 'rejected' | 'assigned' | 'all', 
//   searchQuery?: string,
//   page: number = 1,
//   pageSize: number = 10
// ) {
//   try {
//     const supabase = await createSupabaseServerClient()
    
//     // Build the base query
//     let query = supabase
//       .from('clients')
//       .select(`
//         id,
//         client_type,
//         status,
//         created_at,
//         general_notes,
//         registration_number,
//         individual_clients:individual_clients(
//           requestor_name,
//           requestor_phone, 
//           requestor_email,
//           patient_name,
//           complete_address,
//           service_required,
//           start_date
//         ),
//         organization_clients:organization_clients(
//           organization_name,
//           contact_person_name,
//           contact_phone,
//           contact_email,
//           organization_address
//         )
//       `, { count: 'exact' })
    
//     // Apply status filter if provided and not "all"
//     if (status && status !== "all") {
//       query = query.eq('status', status)
//     }
    
//     // Apply search filter at the database level if provided
//     if (searchQuery && searchQuery.trim() !== '') {
//       const searchTerm = searchQuery.toLowerCase().trim();
      
//       // Create a text search filter using Supabase's textSearch method
//       // First, handle individual_clients search
//       const individualClientsQuery = supabase
//         .from('individual_clients')
//         .select('client_id')
//         .or(`patient_name.ilike.%${searchTerm}%,requestor_phone.ilike.%${searchTerm}%,requestor_name.ilike.%${searchTerm}%,complete_address.ilike.%${searchTerm}%`);
      
//       // Then handle organization_clients search
//       const organizationClientsQuery = supabase
//         .from('organization_clients')
//         .select('client_id')
//         .or(`organization_name.ilike.%${searchTerm}%,contact_phone.ilike.%${searchTerm}%,contact_person_name.ilike.%${searchTerm}%,organization_address.ilike.%${searchTerm}%`);
        
//       // Execute both queries
//       const [individualResults, organizationResults] = await Promise.all([
//         individualClientsQuery,
//         organizationClientsQuery
//       ]);
      
//       // Extract client IDs from both queries
//       const individualClientIds = (individualResults.data || []).map(item => item.client_id);
//       const organizationClientIds = (organizationResults.data || []).map(item => item.client_id);
      
//       // Combine all matching client IDs
//       const matchingClientIds = [...individualClientIds, ...organizationClientIds];
      
//       if (matchingClientIds.length > 0) {
//         // Filter the main query to include only matching client IDs
//         query = query.in('id', matchingClientIds);
//       } else {
//         // If no matches, return empty result
//         return { 
//           success: true, 
//           clients: [],
//           pagination: {
//             totalCount: 0,
//             currentPage: page,
//             pageSize: pageSize,
//             totalPages: 0
//           }
//         };
//       }
//     }
    
//     // Get total count first
//     const { count, error: countError } = await query
    
//     if (countError) {
//       console.error("Error counting clients:", countError)
//       return { success: false, error: countError.message }
//     }
    
//     // Apply pagination to the main query
//     const { data, error } = await query
//       .range((page - 1) * pageSize, (page * pageSize) - 1)
//       .order('created_at', { ascending: false })
    
//     if (error) {
//       console.error("Error fetching clients:", error)
//       return { success: false, error: error.message }
//     }
    
//     // Map database records to Client interface
//     const clients = data.map(record => {
//       const isIndividual = record.client_type === 'individual'
//       // Extract the first item from the arrays or use null
//       const individualData = isIndividual ? (Array.isArray(record.individual_clients) 
//         ? record.individual_clients[0] 
//         : record.individual_clients) : null
//       const organizationData = !isIndividual ? (Array.isArray(record.organization_clients) 
//         ? record.organization_clients[0] 
//         : record.organization_clients) : null
      
//       return {
//         id: record.id,
//         name: isIndividual 
//           ? individualData?.patient_name || "Unknown" 
//           : organizationData?.organization_name || "Unknown",
//         requestDate: isIndividual
//           ? new Date(individualData?.start_date || record.created_at || new Date()).toISOString().split('T')[0]
//           : new Date(record.created_at || new Date()).toISOString().split('T')[0],
//         service: isIndividual ? individualData?.service_required : "Organization Care",
//         status: record.status,
//         email: isIndividual ? individualData?.requestor_email : organizationData?.contact_email,
//         phone: isIndividual ? individualData?.requestor_phone : organizationData?.contact_phone,
//         location: isIndividual ? individualData?.complete_address : organizationData?.organization_address,
//         description: record.general_notes || undefined,
//         registrationNumber: record.registration_number || undefined,
//       }
//     })
      
//     return { 
//       success: true, 
//       clients,
//       pagination: {
//         totalCount: count || 0,
//         currentPage: page,
//         pageSize: pageSize,
//         totalPages: Math.ceil((count || 0) / pageSize)
//       }
//     }
    
//   } catch (error: unknown) {
//     console.error('Error fetching clients:', error)
//     return { 
//       success: false, 
//       error: error instanceof Error ? error.message : 'An unknown error occurred', 
//       clients: [] 
//     }
//   }
// }

export async function getClients(
  status?: 'pending' | 'under_review' | 'approved' | 'rejected' | 'assigned' | 'all', 
  searchQuery?: string,
  page: number = 1,
  pageSize: number = 10
) {
  try {
    const supabase = await createSupabaseServerClient()
    
    const selectFields = `
       id,
          client_type,
          status,
          created_at,
          individual_clients:individual_clients(
            requestor_email,
            requestor_phone,
            patient_name,
            requestor_name,
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
        console.error("Error in search query:", searchError)
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
      console.error("Error counting clients:", countError)
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
      console.error("Error fetching clients:", error)
      return { success: false, error: error.message }
    }
    

    const clients = data.map(record => {
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
          ? (individualData?.requestor_name || "Unknown") 
          : (organizationData?.organization_name || "Unknown"),
        requestDate: isIndividual
          ? new Date(individualData?.start_date || record.created_at || new Date()).toISOString().split('T')[0]
          : new Date(record.created_at || new Date()).toISOString().split('T')[0],
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
    console.error('Error fetching clients:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'An unknown error occurred', 
      clients: [] 
    }
  }
}

/**
 * Fetches detailed information for a specific client by ID
 */
export async function getClientDetails(clientId: string) {
  try {
    const supabase = await createSupabaseServerClient()
    
    // Get the base client record first to determine the type
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('*')
      .eq('id', clientId)
      .single()
    
    if (clientError) {
      return { success: false, error: clientError.message }
    }
    
    if (!client) {
      return { success: false, error: 'Client not found' }
    }
    
    // Based on client type, fetch the appropriate details
    if (client.client_type === 'individual') {
      const { data: individualClient, error: individualError } = await supabase
        .from('individual_clients')
        .select('*')
        .eq('client_id', clientId)
        .single()
        
      if (individualError) {
        return { success: false, error: individualError.message }
      }
      
      const patientPicUrl = individualClient.patient_profile_pic ? 
        await getStorageUrl(individualClient.patient_profile_pic) : null;
      const requestorPicUrl = individualClient.requestor_profile_pic ? 
        await getStorageUrl(individualClient.requestor_profile_pic) : null;
      
      return { 
        success: true, 
        client: {
          ...client,
          details: {
            ...individualClient,
            patient_profile_pic_url: patientPicUrl,
            requestor_profile_pic_url: requestorPicUrl,
            // Keep original paths for reference
            patient_profile_pic: individualClient.patient_profile_pic,
            requestor_profile_pic: individualClient.requestor_profile_pic,
          }
        }
      }
    } else {
      // For organization, hospital, or carehome clients
      const { data: organizationClient, error: organizationError } = await supabase
        .from('organization_clients')
        .select('*')
        .eq('client_id', clientId)
        .single()
        
      if (organizationError) {
        return { success: false, error: organizationError.message }
      }
      
      // Fetch staff requirements if any
      const { data: staffRequirements } = await supabase
        .from('staff_requirements')
        .select('*')
        .eq('client_id', clientId)
        
      return { 
        success: true, 
        client: {
          ...client,
          details: organizationClient,
          staffRequirements: staffRequirements || []
        }
      }
    }
  } catch (error: unknown) {
    console.error('Error fetching client details:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'An unknown error occurred'
    }
  }
}


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
          console.log(`Rejection notification sent to ${clientEmail}`);
        } catch (emailError) {
          console.error('Error sending rejection email:', emailError);
        }
      } else {
        console.warn('Unable to send rejection email: Missing client email or name');
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
    console.error('Error updating client status:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'An unknown error occurred'
    };
  }
}

/**
 * Helper function to get client contact information
 */
async function getClientContactInfo(
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
      clientName = individualData.requestor_name || individualData.patient_name;
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
      clientName = orgData.contact_person_name || orgData.organization_name;
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
 * Helper function to create a user account if needed
 */
async function createUserAccountIfNeeded(
  supabase: SupabaseClient<Database>,
  clientEmail: string,
  clientName: string,
  clientId: string
): Promise<void> {
  const { data: userList, error: userListError } = await supabase.auth.admin.listUsers();
  
  if (userListError) {
    console.error('Error listing users:', userListError);
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
      console.error('Error creating user account:', createError);
    } else {
      const emailResult = await sendClientCredentials(clientEmail, {
        name: clientName,
        password: password,
        appDownloadLink: process.env.MOBILE_APP_DOWNLOAD_LINK || 'https://example.com/download'
      });
      
      if (emailResult.error) {
        console.error('Error sending welcome email:', emailResult.error);
      } else {
        console.log(`Welcome email sent to ${clientEmail}`);
      }
    }
  }
}


/**
 * Saves patient assessment data
 */
export async function savePatientAssessment(data: SavePatientAssessmentParams): Promise<SavePatientAssessmentResult> {
  try {
    const supabase = await createSupabaseServerClient();
    
    // Check if an assessment already exists for this client
    const { data: existingAssessment } = await supabase
      .from('patient_assessments')
      .select('id')
      .eq('client_id', data.clientId)
      .single();
    
    // Prepare environment JSONB data
    const environmentData = {
      is_clean: data.assessmentData.isClean,
      is_ventilated: data.assessmentData.isVentilated,
      is_dry: data.assessmentData.isDry,
      has_nature_view: data.assessmentData.hasNatureView,
      has_social_interaction: data.assessmentData.hasSocialInteraction,
      has_supportive_env: data.assessmentData.hasSupportiveEnv
    };
    
    // Prepare lab investigations JSONB data
    const labInvestigationsData = {
      hb: data.assessmentData.hb,
      rbc: data.assessmentData.rbc,
      esr: data.assessmentData.esr,
      urine: data.assessmentData.urine,
      sodium: data.assessmentData.sodium,
      other: data.assessmentData.otherLabInvestigations,
      custom_tests: data.assessmentData.customLabTests || []
    };

    const recorderData = {
      recorderId: data.assessmentData.recorderInfo.recorderId,
      recorderName: data.assessmentData.recorderInfo.recorderName,
      recorderRole: data.assessmentData.recorderInfo.recorderRole,
      recordedAt: data.assessmentData.recorderInfo.recorderTimestamp || new Date().toISOString()
    };
    
    // Common assessment data for both insert and update
    const assessmentData = {
      guardian_occupation: data.assessmentData.guardianOccupation,
      marital_status: data.assessmentData.maritalStatus,
      height: data.assessmentData.height,
      weight: data.assessmentData.weight,
      pincode: data.assessmentData.pincode,
      district: data.assessmentData.district,
      city_town: data.assessmentData.cityTown,
      current_status: data.assessmentData.currentStatus,
      chronic_illness: data.assessmentData.chronicIllness,
      medical_history: data.assessmentData.medicalHistory,
      surgical_history: data.assessmentData.surgicalHistory,
      medication_history: data.assessmentData.medicationHistory,
      alertness_level: data.assessmentData.alertnessLevel,
      physical_behavior: data.assessmentData.physicalBehavior,
      speech_patterns: data.assessmentData.speechPatterns,
      emotional_state: data.assessmentData.emotionalState,
      drugs_use: data.assessmentData.drugsUse,
      alcohol_use: data.assessmentData.alcoholUse,
      tobacco_use: data.assessmentData.tobaccoUse,
      other_social_history: data.assessmentData.otherSocialHistory,
      present_condition: data.assessmentData.presentCondition,
      blood_pressure: data.assessmentData.bloodPressure,
      sugar_level: data.assessmentData.sugarLevel,
      lab_investigations: labInvestigationsData,
      final_diagnosis: data.assessmentData.finalDiagnosis,
      foods_to_include: data.assessmentData.foodsToInclude,
      foods_to_avoid: data.assessmentData.foodsToAvoid,
      patient_position: data.assessmentData.patientPosition,
      feeding_method: data.assessmentData.feedingMethod,
      environment: environmentData,
      equipment: data.assessmentData.equipment, 
      family_members: data.assessmentData.familyMembers,
      recorder_info: recorderData,
      updated_at: new Date().toISOString()
    };
    
    let result;
    
    if (existingAssessment) {
      // Update existing assessment
      result = await supabase
        .from('patient_assessments')
        .update(assessmentData)
        .eq('id', existingAssessment.id)
        .select();
    } else {
      // Insert new assessment
      result = await supabase
        .from('patient_assessments')
        .insert({
          client_id: data.clientId,
          ...assessmentData,
          created_at: new Date().toISOString()
        })
        .select();
    }
    
    if (result.error) {
      throw new Error(`Failed to save assessment: ${result.error.message}`);
    }
    
    revalidatePath(`/clients/${data.clientId}`);
    return { success: true, id: result.data?.[0]?.id };
    
  } catch (error: unknown) {
    console.error('Error saving patient assessment:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'An unknown error occurred'
    };
  }
}


/**
 * Fetches patient assessment data for a specific client
 */
export async function getPatientAssessment(clientId: string) {
  try {
    const supabase = await createSupabaseServerClient();
    
    const { data, error } = await supabase
      .from('patient_assessments')
      .select('*')
      .eq('client_id', clientId)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        // Record not found, return success with null data
        return { success: true, assessment: null };
      }
      return { success: false, error: error.message };
    }
    
    return { success: true, assessment: data };
  } catch (error: unknown) {
    console.error('Error fetching patient assessment:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'An unknown error occurred',
      assessment: null
    };
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
    console.error('Error updating client category:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'An unknown error occurred'
    };
  }
}

export async function sendClientAssessmentFormLink(clientId: string) {
  try {
    const supabase = await createSupabaseServerClient();
    
    // First get the client type to determine where to look for contact info
    const { error: clientError } = await supabase
      .from('clients')
      .select('client_type')
      .eq('id', clientId)
      .single();
    
    if (clientError) {
      return { success: false, error: `Client not found: ${clientError.message}` };
    }
    
    let clientEmail = '';
    let clientName = '';
    
      const { data: individualData, error: individualError } = await supabase
        .from('individual_clients')
        .select('requestor_email, requestor_name, patient_name')
        .eq('client_id', clientId)
        .single();
        
      if (individualError) {
        return { success: false, error: `Client details not found: ${individualError.message}` };
      }
      
      clientEmail = individualData.requestor_email;
      clientName = individualData.requestor_name || individualData.patient_name;
    
    if (!clientEmail) {
      return { success: false, error: 'Client email not found' };
    }

    // Generate form link with client ID
    const formBaseUrl = process.env.NEXT_PUBLIC_WEB_APP_URL || 'https://dearcare.com';
    const formLink = `${formBaseUrl}/patient-assessment/${clientId}`;

    // Send email
    const emailResult = await sendClientFormLink(clientEmail, {
      name: clientName,
      clientId: clientId,
      formLink: formLink
    });

    if (!emailResult.success) {
      throw new Error('Failed to send email');
    }

    return { success: true };
  } catch (error) {
    console.error('Error sending client assessment form:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'An error occurred' 
    };
  }
}


export async function getClientAssessmentFormStatus(clientId: string) {
  try {
    const supabase = await createSupabaseServerClient();

    const { data, error } = await supabase
      .from('patient_assessments')
      .select('id')
      .eq('client_id', clientId)
      .single();
    
    if (error && error.code !== 'PGRST116') {
      throw error;
    }
    
    return {
      success: true,
      isFormFilled: !!data
    };
  } catch (error) {
    console.error('Error checking form status:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to check form status',
      isFormFilled: false
    };
  }
}


/**
 * Fetches detailed information for a specific organization client by ID
 */
export async function getOrganizationClientDetails(clientId: string) {
  try {
    const supabase = await createSupabaseServerClient()
    
    // Get the base client record first to verify it's an organization client
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('*')
      .eq('id', clientId)
      .single()
    
    if (clientError) {
      return { success: false, error: clientError.message }
    }
    
    if (!client) {
      return { success: false, error: 'Client not found' }
    }
    
    // Verify the client type is organization (or related types)
    if (client.client_type !== 'organization' && client.client_type !== 'hospital' && client.client_type !== 'carehome') {
      return { success: false, error: 'Not an organization client' }
    }
    
    // Fetch organization details
    const { data: organizationDetails, error: organizationError } = await supabase
      .from('organization_clients')
      .select('*')
      .eq('client_id', clientId)
      .single()
      
    if (organizationError) {
      return { success: false, error: organizationError.message }
    }
    
    // Fetch staff requirements if any
    const { data: staffRequirements, error: staffError } = await supabase
      .from('staff_requirements')
      .select('*')
      .eq('client_id', clientId)
      
    if (staffError) {
      console.error('Error fetching staff requirements:', staffError)
      // Continue without staff requirements rather than failing completely
    }
    
    return { 
      success: true, 
      client: {
        ...client,
        details: organizationDetails,
        staffRequirements: staffRequirements || []
      }
    }
  } catch (error: unknown) {
    console.error('Error fetching organization client details:', error)
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

    console.log("status", data.status)
    
    return { 
      success: true, 
      status: data.status
    };
  } catch (error: unknown) {
    console.error('Error fetching client status:', error);
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
    const supabase = await createSupabaseServerClient()
    
    let query = supabase
      .from('clients')
      .select(`
        id,
        client_type,
        status,
        created_at,
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
    
    if (status && status !== "all") {
      query = query.eq('status', status)
    }
    
    if (searchQuery && searchQuery.trim() !== '') {
      const searchTerm = searchQuery.toLowerCase().trim();
      
      const individualClientsQuery = supabase
        .from('individual_clients')
        .select('client_id')
        .or(`patient_name.ilike.%${searchTerm}%,requestor_phone.ilike.%${searchTerm}%,requestor_name.ilike.%${searchTerm}%,complete_address.ilike.%${searchTerm}%`);
      
      const organizationClientsQuery = supabase
        .from('organization_clients')
        .select('client_id')
        .or(`organization_name.ilike.%${searchTerm}%,contact_phone.ilike.%${searchTerm}%,contact_person_name.ilike.%${searchTerm}%,organization_address.ilike.%${searchTerm}%`);
        
      const [individualResults, organizationResults] = await Promise.all([
        individualClientsQuery,
        organizationClientsQuery
      ]);
      
      const individualClientIds = (individualResults.data || []).map(item => item.client_id);
      const organizationClientIds = (organizationResults.data || []).map(item => item.client_id);
      
      const matchingClientIds = [...individualClientIds, ...organizationClientIds];
      
      if (matchingClientIds.length > 0) {
        query = query.in('id', matchingClientIds);
      } else {
        return { 
          success: true, 
          clients: [],
          clientsData: []
        };
      }
    }
    
    const { data, error } = await query
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error("Error fetching clients for export:", error)
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
    console.error('Error exporting clients:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'An unknown error occurred', 
      clients: [],
      clientsData: []
    }
  }
}


export async function deleteClient(clientId: string) {
  try {
    const supabase = await createSupabaseServerClient();

    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('client_type')
      .eq('id', clientId)
      .single();

    if (clientError) {
      return { success: false, error: clientError.message };
    }

    const deleteOperations = [];

    const { data: nurseAssignments } = await supabase
      .from('nurse_client')
      .select('nurse_id')
      .eq('client_id', clientId);

    deleteOperations.push(
      supabase
        .from('nurse_client')
        .delete()
        .eq('client_id', clientId)
    );

    deleteOperations.push(
      supabase
        .from('patient_assessments')
        .delete()
        .eq('client_id', clientId)
    );

    if (client.client_type === 'individual') {
      deleteOperations.push(
        supabase
          .from('individual_clients')
          .delete()
          .eq('client_id', clientId)
      );
    } else {

      deleteOperations.push(
        supabase
          .from('staff_requirements')
          .delete()
          .eq('client_id', clientId)
      );
      
      deleteOperations.push(
        supabase
          .from('organization_clients')
          .delete()
          .eq('client_id', clientId)
      );
    }

    deleteOperations.push(
      supabase
        .from('clients')
        .delete()
        .eq('id', clientId)
    );

    await Promise.all(deleteOperations);

    if (nurseAssignments && nurseAssignments.length > 0) {
      const uniqueNurseIds = [...new Set(nurseAssignments.map(na => na.nurse_id))];
      
      await Promise.all(
        uniqueNurseIds.map(async (nurseId) => {
          const { data: remainingAssignments } = await supabase
            .from('nurse_client')
            .select('id')
            .eq('nurse_id', nurseId)
            .neq('client_id', clientId);

          if (!remainingAssignments || remainingAssignments.length === 0) {
            await supabase
              .from('nurses')
              .update({ status: 'unassigned' })
              .eq('nurse_id', nurseId);
          }
        })
      );
    }

    revalidatePath('/clients');

    return { success: true };
    
  } catch (error: unknown) {
    console.error('Error deleting client:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unknown error occurred'
    };
  }
}


/**
 * Generates a unique registration number for a client
 */
async function generateRegistrationNumber(
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
    console.error('Error generating sequence number:', counterError);
    const timestamp = Date.now().toString().slice(-5);
    return `${categoryPrefix}${typeCode}${currentYear}E${timestamp}`;
  }
  
  const sequenceStr = counterData.toString().padStart(4, '0');
  
  return `${categoryPrefix}-${typeCode}${currentYear}-${sequenceStr}`;
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
        console.error('Error uploading file:', uploadError);
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
        console.error('Error storing file metadata:', fileError);
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
    console.error('Error uploading client files:', error);
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
        console.error('Error removing file from storage:', storageError);
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
    console.error('Error deleting client file:', error);
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
    console.error('Error fetching client files:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'An unknown error occurred',
      data: []
    };
  }
}

interface IndividualClientUpdateProfileData {
  patient_name: string;
  patient_phone: string;
  patient_age: number | null;
  patient_gender: string;
  patient_address: string;
  patient_city: string;
  patient_district: string;
  patient_pincode: string;
  requestor_name: string;
  requestor_phone: string;
  requestor_email: string;
  requestor_address: string;
  requestor_city: string;
  requestor_district: string;
  requestor_pincode: string;
  patient_profile_pic?: string | null;
  requestor_profile_pic?: string | null;
}

/**
 * Updates a client's profile information
 */
export async function updateIndividualClientProfile(
  clientId: string,
  profileData: {
    patientFirstName: string;
    patientLastName: string;
    patientPhone: string;
    patientAge: string;
    patientGender: string;
    patientAddress: string;
    patientCity: string;
    patientDistrict: string;
    patientState: string;
    patientPincode: string;
    patientProfilePic: File | null;
    
    requestorName: string;
    requestorPhone: string;
    requestorEmail: string;
    requestorAddress: string;
    requestorCity: string;
    requestorDistrict: string;
    requestorState: string;
    requestorPincode: string;
    requestorProfilePic: File | null;
  }
) {
  try {
    const supabase = await createSupabaseServerClient();

    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('client_type')
      .eq('id', clientId)
      .single();

    if (clientError) {
      return { success: false, error: clientError.message };
    }

    if (client.client_type !== 'individual') {
      return { success: false, error: 'Only individual clients can be updated with this function' };
    }

    let patientProfilePicPath: string | null = null;
    let requestorProfilePicPath: string | null = null;
    
    if (profileData.patientProfilePic) {
      patientProfilePicPath = await uploadProfilePicture(
        profileData.patientProfilePic, 
        clientId, 
        'patient'
      );
    }
    
    if (profileData.requestorProfilePic) {
      requestorProfilePicPath = await uploadProfilePicture(
        profileData.requestorProfilePic, 
        clientId, 
        'requestor'
      );
    }
  
    const updateData: IndividualClientUpdateProfileData = {
      patient_name: `${profileData.patientFirstName} ${profileData.patientLastName}`.trim(),
      patient_phone: profileData.patientPhone,
      patient_age: profileData.patientAge ? parseInt(profileData.patientAge) : null,
      patient_gender: profileData.patientGender,
      patient_address: profileData.patientAddress,
      patient_city: profileData.patientCity,
      patient_district: profileData.patientDistrict,
      patient_pincode: profileData.patientPincode,
      
      requestor_name: profileData.requestorName,
      requestor_phone: profileData.requestorPhone,
      requestor_email: profileData.requestorEmail,
      requestor_address: profileData.requestorAddress,
      requestor_city: profileData.requestorCity,
      requestor_district: profileData.requestorDistrict, 
      requestor_pincode: profileData.requestorPincode,
    };

    if (patientProfilePicPath) {
      updateData.patient_profile_pic = patientProfilePicPath;
    }
    
    if (requestorProfilePicPath) {
      updateData.requestor_profile_pic = requestorProfilePicPath;
    }

    const { data, error } = await supabase
      .from('individual_clients')
      .update(updateData)
      .eq('client_id', clientId)
      .select();

    if (error) {
      console.error('Error updating client profile:', error);
      return { success: false, error: error.message };
    }

    revalidatePath(`/client-profile/${clientId}`);
    revalidatePath('/clients');

    return { success: true, data };
    
  } catch (error) {
    console.error('Error updating client profile:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'An unknown error occurred' 
    };
  }
}

/**
 * Updates organization client details
 */
export async function updateOrganizationDetails(
  clientId: string,
  updatedData: {
    details: {
      organization_name: string;
      contact_person_name: string;
      contact_person_role: string;
      contact_email: string;
      contact_phone: string;
      organization_address: string;
      organization_state: string;
      organization_district: string;
      organization_city: string;
      organization_pincode: string;
    },
    general_notes?: string;
  }
) {
  try {
    const supabase = await createSupabaseServerClient();
    
    if (updatedData.general_notes !== undefined) {
      const { error: clientUpdateError } = await supabase
        .from('clients')
        .update({ general_notes: updatedData.general_notes })
        .eq('id', clientId);
      
      if (clientUpdateError) {
        console.error('Error updating client general notes:', clientUpdateError);
        return { success: false, error: clientUpdateError.message };
      }
    }
    
    const { data, error } = await supabase
      .from('organization_clients')
      .update({
        organization_name: updatedData.details.organization_name,
        contact_person_name: updatedData.details.contact_person_name,
        contact_person_role: updatedData.details.contact_person_role,
        contact_email: updatedData.details.contact_email,
        contact_phone: updatedData.details.contact_phone,
        organization_address: updatedData.details.organization_address,
        organization_state: updatedData.details.organization_state,
        organization_district: updatedData.details.organization_district,
        organization_city: updatedData.details.organization_city,
        organization_pincode: updatedData.details.organization_pincode
      })
      .eq('client_id', clientId)
      .select();
    
    if (error) {
      console.error('Error updating organization details:', error);
      return { success: false, error: error.message };
    }
    
    revalidatePath(`/clients/${clientId}`);
    revalidatePath(`/client-profile/organization-client/${clientId}`);
    
    return { success: true, data };
    
  } catch (error) {
    console.error('Error in updateOrganizationDetails:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'An unknown error occurred' 
    };
  }
}