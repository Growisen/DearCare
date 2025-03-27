"use server"

import { createSupabaseServerClient } from './auth'
import { revalidatePath } from 'next/cache';
import { IndividualFormData, OrganizationFormData, SavePatientAssessmentParams, SavePatientAssessmentResult  } from '@/types/client.types';
import { Database } from '@/lib/database.types';
import { createSupabaseAdminClient } from '@/lib/supabaseServiceAdmin';
import { sendClientCredentials } from '@/lib/email'
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
        status: 'pending'
      })
      .select()
      .single();
    
    if (clientError) {
      throw new Error(`Failed to create client: ${clientError.message}`);
    }
    
    // Now create the individual client record
    const { error: individualError } = await supabase
      .from('individual_clients')
      .insert({
        care_duration: formData.careDuration,
        client_id: clientData.id,
        complete_address: formData.completeAddress,
        patient_age: parseInt(formData.patientAge) || null,
        patient_gender: formData.patientGender || null,
        patient_name: formData.patientName,
        patient_phone: formData.patientPhone || null,
        preferred_caregiver_gender: formData.preferredCaregiverGender || null,
        relation_to_patient: formData.relationToPatient || 'other',
        requestor_email: formData.requestorEmail,
        requestor_name: formData.requestorName,
        requestor_phone: formData.requestorPhone,
        service_required: formData.serviceRequired,
        start_date: formData.startDate,
      });
    
    if (individualError) {
      // If individual client creation fails, we should remove the base client
      await supabase.from('clients').delete().eq('id', clientData.id);
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
        start_date: formData.staffReqStartDate || null
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


// export async function getClients(status?: 'pending' | 'under_review' | 'approved' | 'rejected' | 'assigned' | 'all', searchQuery?: string) {
//   try {
//     const supabase = await createSupabaseServerClient()
    
//     // Build the query
//     let query = supabase
//       .from('clients')
//       .select(`
//         id,
//         client_type,
//         status,
//         created_at,
//         general_notes,
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
//       `)
    
//     // Apply status filter if provided and not "all"
//     if (status && status !== "all") {
//       query = query.eq('status', status)
//     }
    
//     const { data, error } = await query
    
//     if (error) {
//       console.error("Error fetching clients:", error)
//       return { success: false, error: error.message }
//     }
    
//     // Map database records to Client interface
//     const clients = data.map(record => {
//       const isIndividual = record.client_type === 'individual'
//       // Access the data directly without indexing
//       const individualData = isIndividual ? record.individual_clients : null
//       const organizationData = !isIndividual ? record.organization_clients : null
      
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
//         // Convert null to undefined to match Client type
//         description: record.general_notes || undefined
//       }
//     })
    
//     // Apply search filter in JavaScript if provided
//     const filteredClients = searchQuery
//       ? clients.filter(client => 
//           client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
//           client.email?.toLowerCase().includes(searchQuery.toLowerCase())
//         )
//       : clients
      
//     return { success: true, clients: filteredClients }
    
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
    
    // Build the base query
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
          complete_address,
          service_required,
          start_date
        ),
        organization_clients:organization_clients(
          organization_name,
          contact_person_name,
          contact_phone,
          contact_email,
          organization_address
        )
      `, { count: 'exact' })
    
    // Apply status filter if provided and not "all"
    if (status && status !== "all") {
      query = query.eq('status', status)
    }
    
    // Apply search filter at the database level if provided
    if (searchQuery && searchQuery.trim() !== '') {
      const searchTerm = searchQuery.toLowerCase().trim();
      
      // Create a text search filter using Supabase's textSearch method
      // First, handle individual_clients search
      const individualClientsQuery = supabase
        .from('individual_clients')
        .select('client_id')
        .or(`patient_name.ilike.%${searchTerm}%,requestor_phone.ilike.%${searchTerm}%,requestor_name.ilike.%${searchTerm}%`);
      
      // Then handle organization_clients search
      const organizationClientsQuery = supabase
        .from('organization_clients')
        .select('client_id')
        .or(`organization_name.ilike.%${searchTerm}%,contact_phone.ilike.%${searchTerm}%,contact_person_name.ilike.%${searchTerm}%`);
        
      // Execute both queries
      const [individualResults, organizationResults] = await Promise.all([
        individualClientsQuery,
        organizationClientsQuery
      ]);
      
      // Extract client IDs from both queries
      const individualClientIds = (individualResults.data || []).map(item => item.client_id);
      const organizationClientIds = (organizationResults.data || []).map(item => item.client_id);
      
      // Combine all matching client IDs
      const matchingClientIds = [...individualClientIds, ...organizationClientIds];
      
      if (matchingClientIds.length > 0) {
        // Filter the main query to include only matching client IDs
        query = query.in('id', matchingClientIds);
      } else {
        // If no matches, return empty result
        return { 
          success: true, 
          clients: [],
          pagination: {
            totalCount: 0,
            currentPage: page,
            pageSize: pageSize,
            totalPages: 0
          }
        };
      }
    }
    
    // Get total count first
    const { count, error: countError } = await query
    
    if (countError) {
      console.error("Error counting clients:", countError)
      return { success: false, error: countError.message }
    }
    
    // Apply pagination to the main query
    const { data, error } = await query
      .range((page - 1) * pageSize, (page * pageSize) - 1)
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error("Error fetching clients:", error)
      return { success: false, error: error.message }
    }
    
    // Map database records to Client interface
    const clients = data.map(record => {
      const isIndividual = record.client_type === 'individual'
      // Extract the first item from the arrays or use null
      const individualData = isIndividual ? (Array.isArray(record.individual_clients) 
        ? record.individual_clients[0] 
        : record.individual_clients) : null
      const organizationData = !isIndividual ? (Array.isArray(record.organization_clients) 
        ? record.organization_clients[0] 
        : record.organization_clients) : null
      
      return {
        id: record.id,
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
        location: isIndividual ? individualData?.complete_address : organizationData?.organization_address,
        description: record.general_notes || undefined
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
      
      return { 
        success: true, 
        client: {
          ...client,
          details: individualClient
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
  rejectionReason?: string) {
  try {
    const supabase = await createSupabaseAdminClient();

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
      
      revalidatePath('/clients');
      
      return { success: true, client: data };
    }
    else if (newStatus === 'approved') {
      const { data: client, error: clientError } = await supabase
        .from('clients')
        .select('client_type')
        .eq('id', clientId)
        .single();
        
      if (clientError) {
        return { success: false, error: clientError.message };
      }
      
      let clientEmail = '';
      let clientName = '';
      
      if (client.client_type === 'individual') {
        const { data: individualData, error: individualError } = await supabase
          .from('individual_clients')
          .select('requestor_email, requestor_name')
          .eq('client_id', clientId)
          .single();
          
        if (individualError) {
          return { success: false, error: individualError.message };
        }
        
        clientEmail = individualData.requestor_email;
        clientName = individualData.requestor_name;
      } else {
        const { data: orgData, error: orgError } = await supabase
          .from('organization_clients')
          .select('contact_email, contact_person_name')
          .eq('client_id', clientId)
          .single();
          
        if (orgError) {
          return { success: false, error: orgError.message };
        }
        
        clientEmail = orgData.contact_email;
        clientName = orgData.contact_person_name;
      }
      
      const { data: userList, error: userListError } = await supabase.auth.admin.listUsers();
      
      if (userListError) {
        return { success: false, error: userListError.message };
      }
      
      const existingUser = userList?.users?.find(user => 
        user.email?.toLowerCase() === clientEmail.toLowerCase()
      );

      if (!existingUser && clientEmail) {
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
    else{
      const { data, error } = await supabase
      .from('clients')
      .update({ status: newStatus,})
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
      other: data.assessmentData.otherLabInvestigations
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