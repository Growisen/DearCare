"use server"

import { createSupabaseServerClient } from './auth'
import { revalidatePath } from 'next/cache';
import { IndividualFormData, OrganizationFormData, SavePatientAssessmentParams, SavePatientAssessmentResult  } from '@/types/client.types';

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
        relation_to_patient: formData.relationToPatient,
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
        organization_type: formData.organizationType || '',
        contact_person_name: formData.contactPersonName,
        contact_person_role: formData.contactPersonRole || '',
        contact_phone: formData.contactPhone,
        contact_email: formData.contactEmail,
        organization_address: formData.organizationAddress,
        contract_duration: formData.duration || null
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


export async function getClients(status?: 'pending' | 'under_review' | 'approved' | 'rejected' | 'assigned' | 'all', searchQuery?: string) {
  try {
    const supabase = await createSupabaseServerClient()
    
    // Build the query
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
      `)
    
    // Apply status filter if provided and not "all"
    if (status && status !== "all") {
      query = query.eq('status', status)
    }
    
    const { data, error } = await query
    
    if (error) {
      console.error("Error fetching clients:", error)
      return { success: false, error: error.message }
    }
    
    // Map database records to Client interface
    const clients = data.map(record => {
      const isIndividual = record.client_type === 'individual'
      // Access the data directly without indexing
      const individualData = isIndividual ? record.individual_clients : null
      const organizationData = !isIndividual ? record.organization_clients : null
      
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
        // Convert null to undefined to match Client type
        description: record.general_notes || undefined
      }
    })
    
    // Apply search filter in JavaScript if provided
    const filteredClients = searchQuery
      ? clients.filter(client => 
          client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          client.email?.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : clients
      
    return { success: true, clients: filteredClients }
    
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
export async function updateClientStatus(clientId: string, newStatus: 'pending' | 'under_review' | 'approved' | 'rejected' | 'assigned') {
  try {
    const supabase = await createSupabaseServerClient();
    
    const { data, error } = await supabase
      .from('clients')
      .update({ status: newStatus })
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