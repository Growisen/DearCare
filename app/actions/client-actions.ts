"use server"

import { createSupabaseServerClient } from './auth'
import { revalidatePath } from 'next/cache';
import { IndividualFormData, OrganizationFormData } from '@/types/client.types';

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
        client_id: clientData.id,
        requestor_name: formData.requestorName,
        requestor_phone: formData.requestorPhone,
        requestor_email: formData.requestorEmail,
        relation_to_patient: formData.relationToPatient,
        patient_name: formData.patientName,
        patient_age: parseInt(formData.patientAge) || null,
        patient_gender: formData.patientGender || null,
        patient_phone: formData.patientPhone || null,
        complete_address: formData.completeAddress,
        service_required: formData.serviceRequired,
        care_duration: formData.careDuration,
        start_date: formData.startDate,
        preferred_caregiver_gender: formData.preferredCaregiverGender || null
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


export async function getClients(status?: string, searchQuery?: string) {
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
          ? new Date(individualData?.start_date || record.created_at).toISOString().split('T')[0]
          : new Date(record.created_at).toISOString().split('T')[0],
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