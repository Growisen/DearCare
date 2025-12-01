"use server"

import { createSupabaseServerClient } from '@/app/actions/authentication/auth';
import { revalidatePath } from 'next/cache';
import { OrganizationFormData } from '@/types/client.types';
import { logger } from '@/utils/logger';

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
        status: 'pending',
        prevRegisterNumber: formData.prevRegisterNumber
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
        shift_type: requirement.shiftType,
        custom_shift_timing: requirement.customShiftTiming || null
      }));
      
      const { error: staffError } = await supabase
        .from('staff_requirements')
        .insert(staffRequirementsData);
      
      if (staffError) {
        logger.error('Error adding staff requirements:', staffError);
        // We don't throw here to avoid rolling back the whole transaction,
        // but we log the error for investigation
      }
    }
    
    revalidatePath('/clients');
    return { success: true, id: clientData.id };
    
  } catch (error: unknown) {
    logger.error('Error adding organization client:', error);
    return { success: false, error: error instanceof Error ? error.message : 'An unknown error occurred' };
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
      logger.error('Error fetching staff requirements:', staffError)
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
    logger.error('Error fetching organization client details:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'An unknown error occurred'
    }
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
          logger.error('Error updating client general notes:', clientUpdateError);
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
        logger.error('Error updating organization details:', error);
        return { success: false, error: error.message };
      }
      
      const updatedRecord = Array.isArray(data) && data.length > 0 ? data[0] : data;
      
      revalidatePath(`/clients/${clientId}`);
      revalidatePath(`/client-profile/organization-client/${clientId}`);
      
      return { success: true, data: updatedRecord };
      
    } catch (error) {
      logger.error('Error in updateOrganizationDetails:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'An unknown error occurred' 
      };
    }
}