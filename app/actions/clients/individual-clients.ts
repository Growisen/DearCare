"use server"

import { createSupabaseServerClient } from '@/app/actions/authentication/auth';
import { revalidatePath } from 'next/cache';
import { IndividualFormData } from '@/types/client.types';
import { uploadProfilePicture } from './utils';
import { logger } from '@/utils/logger';
import { FormData } from '@/types/homemaid.types';
import { DeliveryCareFormData } from '@/types/deliveryCare.types';
import { ChildCareFormData } from '@/types/childCare.types';

interface IndividualClientUpdateProfileData {
    patient_name: string;
    patient_phone: string;
    patient_age: string | null;
    patient_gender: string | null;
    patient_address: string;
    patient_city: string;
    patient_district: string;
    patient_pincode: string;
    requestor_name: string;
    requestor_phone: string;
    requestor_email: string;
    requestor_address: string;
    requestor_city: string;
    requestor_state: string;
    requestor_district: string;
    requestor_pincode: string;
    patient_profile_pic?: string | null;
    requestor_profile_pic?: string | null;
    preferred_caregiver_gender?: string | null;
    care_duration?: string | null;
    service_required?: string | null;
    start_date?: string | null;
    relation_to_patient?: string | null;
    requestor_emergency_phone?: string | null;
    requestor_job_details?: string | null;
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
        status: 'pending',
        prev_registration_number: formData.prevRegisterNumber
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
        patient_age: formData.patientAge || null,
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
        patient_dob: formData.patientDOB || null,
        requestor_dob: formData.requestorDOB || null,
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
    logger.error('Error adding individual client:', error);
    return { success: false, error: error instanceof Error ? error.message : 'An unknown error occurred' };
  }
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
      patientGender: string | null;
      patientAddress: string;
      patientCity: string;
      patientDistrict: string;
      patientState: string;
      patientPincode: string;
      patientProfilePic: File | null;
  
      preferredCaregiverGender?: string | null;
      careDuration?: string | null;
      serviceRequired?: string | null;
      startDate?: string | null;
  
      requestorName: string;
      requestorPhone: string;
      requestorEmail: string;
      requestorAddress: string;
      requestorCity: string;
      requestorDistrict: string;
      requestorState: string;
      requestorPincode: string;
      requestorProfilePic: File | null;
  
      relationToPatient?: string | null;
      requestorEmergencyPhone?: string | null;
      requestorJobDetails?: string | null;
    }
  ){
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
  
      // Build updateData with only valid fields
      const rawUpdateData: IndividualClientUpdateProfileData = {
        patient_name: `${profileData.patientFirstName} ${profileData.patientLastName}`.trim(),
        patient_phone: profileData.patientPhone,
        patient_age: profileData.patientAge ? profileData.patientAge : null,
        patient_gender: profileData.patientGender ?? null,
        patient_address: profileData.patientAddress,
        patient_city: profileData.patientCity,
        patient_district: profileData.patientDistrict,
        patient_pincode: profileData.patientPincode,
  
        preferred_caregiver_gender: profileData.preferredCaregiverGender ?? null,
        care_duration: profileData.careDuration ?? null,
        service_required: profileData.serviceRequired ?? null,
        start_date: profileData.startDate ?? null,
  
        requestor_name: profileData.requestorName,
        requestor_phone: profileData.requestorPhone,
        requestor_email: profileData.requestorEmail,
        requestor_address: profileData.requestorAddress,
        requestor_city: profileData.requestorCity,
        requestor_state: profileData.requestorState,
        requestor_district: profileData.requestorDistrict,
        requestor_pincode: profileData.requestorPincode,
  
        relation_to_patient: profileData.relationToPatient ?? null,
        requestor_emergency_phone: profileData.requestorEmergencyPhone ?? null,
        requestor_job_details: profileData.requestorJobDetails ?? null,
      };
  
      if (patientProfilePicPath) {
        rawUpdateData.patient_profile_pic = patientProfilePicPath;
      }
      if (requestorProfilePicPath) {
        rawUpdateData.requestor_profile_pic = requestorProfilePicPath;
      }
  
      const updateData: Partial<IndividualClientUpdateProfileData> = {};
      for (const [key, value] of Object.entries(rawUpdateData)) {
        if (
          value !== undefined &&
          value !== null &&
          (typeof value !== 'string' || value.trim() !== '')
        ) {
          const typedKey = key as keyof IndividualClientUpdateProfileData;
          updateData[typedKey] = value;
        }
      }
  
      if (Object.keys(updateData).length === 0) {
        return { success: false, error: 'No valid fields to update.' };
      }
  
      const { data, error } = await supabase
        .from('individual_clients')
        .update(updateData)
        .eq('client_id', clientId)
        .select();
  
      if (error) {
        logger.error('Error updating client profile:', error);
        return { success: false, error: error.message };
      }
  
      revalidatePath(`/client-profile/${clientId}`);
      revalidatePath('/clients');
      return { 
        success: true, 
        data: Array.isArray(data) && data.length > 0 ? data[0] : data 
      };
      
    } catch (error) {
      logger.error('Error updating client profile:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'An unknown error occurred' 
      };
    }
}

interface HousemaidRequestData extends FormData {
  clientId: string;
}

/**
 * Adds a new housemaid request to the database
 * Only one request per client_id is allowed
 */
export async function addHousemaidRequest(formData: HousemaidRequestData) {
  try {
    const supabase = await createSupabaseServerClient();

    const { data: existing, error: fetchError } = await supabase
      .from('housemaid_requests')
      .select('id')
      .eq('client_id', formData.clientId)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      logger.error('Error checking existing housemaid request:', fetchError);
      return { success: false, error: fetchError.message };
    }

    if (existing) {
      return { success: false, error: 'You already have a housemaid request.' };
    }

    const { error } = await supabase
      .from('housemaid_requests')
      .insert({
        client_id: formData.clientId,
        service_type: formData.serviceType,
        service_type_other: formData.serviceTypeOther ?? null,
        frequency: formData.frequency ?? null,
        preferred_schedule: formData.preferredSchedule ?? null,
        home_type: formData.homeType ?? null,
        bedrooms: formData.bedrooms ?? 0,
        bathrooms: formData.bathrooms ?? 0,
        household_size: formData.householdSize ?? 1,
        has_pets: formData.hasPets ?? false,
        pet_details: formData.petDetails ?? null,
        duties: formData.duties ?? {},
        meal_prep_details: formData.mealPrepDetails ?? null,
        childcare_details: formData.childcareDetails ?? null,
        allergies: formData.allergies ?? null,
        restricted_areas: formData.restrictedAreas ?? null,
        special_instructions: formData.specialInstructions ?? null,
      });

    if (error) {
      logger.error('Error adding housemaid request:', error);
      return { success: false, error: error.message };
    }

    revalidatePath('/clients');
    return { success: true };
  } catch (error) {
    logger.error('Error adding housemaid request:', error);
    return { success: false, error: error instanceof Error ? error.message : 'An unknown error occurred' };
  }
}


export async function fetchHousemaidRequestsByClientId(clientId: string) {
  try {
    const supabase = await createSupabaseServerClient();

    const { data, error } = await supabase
      .from('housemaid_requests')
      .select('*')
      .eq('client_id', clientId);

    if (error) {
      throw new Error(error.message);
    }

    const mappedData = Array.isArray(data)
      ? data.map((item) => ({
          ...item,
          has_pets: item.has_pets ? "Yes" : "No"
        }))
      : [];

    return { success: true, data: mappedData };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'An unknown error occurred' 
    };
  }
}


export async function updateHousemaidRequest(clientId: string, formData: Partial<FormData>) {
  try {
    const supabase = await createSupabaseServerClient();

    const { error } = await supabase
      .from('housemaid_requests')
      .update({
        service_type: formData.serviceType,
        service_type_other: formData.serviceTypeOther ?? null,
        frequency: formData.frequency ?? null,
        preferred_schedule: formData.preferredSchedule ?? null,
        home_type: formData.homeType ?? null,
        bedrooms: formData.bedrooms,
        bathrooms: formData.bathrooms,
        household_size: formData.householdSize,
        has_pets: formData.hasPets,
        pet_details: formData.petDetails ?? null,
        duties: formData.duties ?? {},
        meal_prep_details: formData.mealPrepDetails ?? null,
        childcare_details: formData.childcareDetails ?? null,
        allergies: formData.allergies ?? null,
        restricted_areas: formData.restrictedAreas ?? null,
        special_instructions: formData.specialInstructions ?? null,
      })
      .eq('client_id', clientId);

    if (error) {
      logger.error('Error updating housemaid request:', error);
      return { success: false, error: error.message };
    }

    revalidatePath('/clients');
    return { success: true };
  } catch (error) {
    logger.error('Error updating housemaid request:', error);
    return { success: false, error: error instanceof Error ? error.message : 'An unknown error occurred' };
  }
}


interface DeliveryCareRequestData extends DeliveryCareFormData {
  clientId: string;
}


export async function addDeliveryCareRequest(formData: DeliveryCareRequestData) {
  try {
    const supabase = await createSupabaseServerClient();

    const { error } = await supabase
      .from('delivery_care_requests')
      .insert({
        client_id: formData.clientId,
        care_preferred: formData.carePreferred,
        delivery_date: formData.deliveryDate ?? null,
        delivery_type: formData.deliveryType ?? null,
        mother_allergies: formData.motherAllergies ?? null,
        mother_medications: formData.motherMedications ?? null,
        number_of_babies: formData.numberOfBabies ?? null,
        feeding_method: formData.feedingMethod ?? null,
        baby_allergies: formData.babyAllergies ?? null,
        preferred_schedule: formData.preferredSchedule ?? null,
        duties: formData.duties ?? { babyCare: false, motherCare: false },
        expected_due_date: formData.expectedDueDate ?? null,
        backup_contact_name: formData.backupContactName ?? null,
        backup_contact_number: formData.backupContactNumber ?? null,
        medical_history: formData.medicalHistory ?? null,
        hospital_name: formData.hospitalName ?? null,
        doctor_name: formData.doctorName ?? null,
        birth_date_time: formData.birthDateTime ?? null,
        room_details: formData.roomDetails ?? null,
        baby_gender: formData.babyGender ?? null,
        baby_weight: formData.babyWeight ?? null,
      });

    if (error) {
      logger.error('Error adding delivery care request:', error);
      return { success: false, error: error.message };
    }

    revalidatePath('/clients');
    return { success: true };
  } catch (error) {
    logger.error('Error adding delivery care request:', error);
    return { success: false, error: error instanceof Error ? error.message : 'An unknown error occurred' };
  }
}


export async function fetchDeliveryCareRequestsByClientId(clientId: string) {
  try {
    const supabase = await createSupabaseServerClient();

    const { data, error } = await supabase
      .from('delivery_care_requests')
      .select('*')
      .eq('client_id', clientId);

    if (error) {
      logger.error('Error fetching delivery care requests:', error);
      return { success: false, error: error.message };
    }

    const mappedData = Array.isArray(data)
      ? data.map(item => ({
          id: item.id,
          clientId: item.client_id,
          carePreferred: item.care_preferred,
          deliveryDate: item.delivery_date,
          deliveryType: item.delivery_type,
          motherAllergies: item.mother_allergies,
          motherMedications: item.mother_medications,
          numberOfBabies: item.number_of_babies,
          feedingMethod: item.feeding_method,
          babyAllergies: item.baby_allergies,
          preferredSchedule: item.preferred_schedule,
          duties: item.duties,
          expectedDueDate: item.expected_due_date,
          backupContactName: item.backup_contact_name,
          backupContactNumber: item.backup_contact_number,
          medicalHistory: item.medical_history,
          hospitalName: item.hospital_name,
          doctorName: item.doctor_name,
          birthDateTime: item.birth_date_time,
          roomDetails: item.room_details,
          babyGender: item.baby_gender,
          babyWeight: item.baby_weight,
          createdAt: item.created_at,
          updatedAt: item.updated_at
        }))
      : [];

    return { success: true, data: mappedData };
  } catch (error) {
    logger.error('Error fetching delivery care requests:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'An unknown error occurred' 
    };
  }
}


export async function updateDeliveryCareRequest(clientId: string, formData: Partial<DeliveryCareFormData>) {
  try {
    const supabase = await createSupabaseServerClient();

    const { error } = await supabase
      .from('delivery_care_requests')
      .update({
        care_preferred: formData.carePreferred,
        delivery_date: formData.deliveryDate ?? null,
        delivery_type: formData.deliveryType ?? null,
        mother_allergies: formData.motherAllergies ?? null,
        mother_medications: formData.motherMedications ?? null,
        number_of_babies: formData.numberOfBabies ?? null,
        feeding_method: formData.feedingMethod ?? null,
        baby_allergies: formData.babyAllergies ?? null,
        preferred_schedule: formData.preferredSchedule ?? null,
        duties: formData.duties ?? { babyCare: false, motherCare: false },
        expected_due_date: formData.expectedDueDate ?? null,
        backup_contact_name: formData.backupContactName ?? null,
        backup_contact_number: formData.backupContactNumber ?? null,
        medical_history: formData.medicalHistory ?? null,
        hospital_name: formData.hospitalName ?? null,
        doctor_name: formData.doctorName ?? null,
        birth_date_time: formData.birthDateTime ?? null,
        room_details: formData.roomDetails ?? null,
        baby_gender: formData.babyGender ?? null,
        baby_weight: formData.babyWeight ?? null,
      })
      .eq('client_id', clientId);

    if (error) {
      logger.error('Error updating delivery care request:', error);
      return { success: false, error: error.message };
    }

    revalidatePath('/clients');
    return { success: true };
  } catch (error) {
    logger.error('Error updating delivery care request:', error);
    return { success: false, error: error instanceof Error ? error.message : 'An unknown error occurred' };
  }
}


interface ChildCareRequestData extends ChildCareFormData {
  clientId: string;
}

/**
 * Adds a new child care request to the database
 */
export async function addChildCareRequest(formData: ChildCareRequestData) {
  try {
    const supabase = await createSupabaseServerClient();

    const { error } = await supabase
      .from('child_care_requests')
      .insert({
        client_id: formData.clientId,
        number_of_children: formData.numberOfChildren,
        ages_of_children: formData.agesOfChildren,
        care_needs: formData.careNeeds,
        care_needs_details: formData.careNeedsDetails,
        notes: formData.notes,
        primary_focus: formData.primaryFocus,
        home_tasks: formData.homeTasks,
        home_tasks_details: formData.homeTasksDetails,
      });

    if (error) {
      logger.error('Error adding child care request:', error);
      return { success: false, error: error.message };
    }

    revalidatePath('/clients');
    return { success: true };
  } catch (error) {
    logger.error('Error adding child care request:', error);
    return { success: false, error: error instanceof Error ? error.message : 'An unknown error occurred' };
  }
}


export async function fetchChildCareRequestsByClientId(clientId: string) {
  try {
    const supabase = await createSupabaseServerClient();

    const { data, error } = await supabase
      .from('child_care_requests')
      .select('*')
      .eq('client_id', clientId);

    if (error) {
      logger.error('Error fetching child care requests:', error);
      return { success: false, error: error.message };
    }

    const mappedData = Array.isArray(data)
      ? data.map(item => ({
          id: item.id,
          clientId: item.client_id,
          numberOfChildren: item.number_of_children,
          agesOfChildren: item.ages_of_children,
          careNeeds: item.care_needs,
          careNeedsDetails: item.care_needs_details,
          notes: item.notes,
          primaryFocus: item.primary_focus,
          homeTasks: item.home_tasks,
          homeTasksDetails: item.home_tasks_details,
          createdAt: item.created_at,
          updatedAt: item.updated_at
        }))
      : [];

    return { success: true, data: mappedData };
  } catch (error) {
    logger.error('Error fetching child care requests:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'An unknown error occurred' 
    };
  }
}


export async function updateChildCareRequest(clientId: string, formData: Partial<ChildCareFormData>) {
  try {
    const supabase = await createSupabaseServerClient();

    const { error } = await supabase
      .from('child_care_requests')
      .update({
        number_of_children: formData.numberOfChildren,
        ages_of_children: formData.agesOfChildren,
        care_needs: formData.careNeeds,
        care_needs_details: formData.careNeedsDetails,
        notes: formData.notes,
        primary_focus: formData.primaryFocus,
        home_tasks: formData.homeTasks,
        home_tasks_details: formData.homeTasksDetails,
      })
      .eq('client_id', clientId);

    if (error) {
      logger.error('Error updating child care request:', error);
      return { success: false, error: error.message };
    }

    revalidatePath('/clients');
    return { success: true };
  } catch (error) {
    logger.error('Error updating child care request:', error);
    return { success: false, error: error instanceof Error ? error.message : 'An unknown error occurred' };
  }
}


export async function isDeliveryCareRequestSubmitted(clientId: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from('delivery_care_requests')
    .select('id')
    .eq('client_id', clientId)
    .single();
  return { submitted: !!data && !error };
}

export async function isHousemaidRequestSubmitted(clientId: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from('housemaid_requests')
    .select('id')
    .eq('client_id', clientId)
    .single();
  return { submitted: !!data && !error };
}

export async function isChildCareRequestSubmitted(clientId: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from('child_care_requests')
    .select('id')
    .eq('client_id', clientId)
    .single();
  return { submitted: !!data && !error };
}