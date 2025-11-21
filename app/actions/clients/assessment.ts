"use server"

import { createSupabaseServerClient } from '@/app/actions/authentication/auth';
import { revalidatePath } from 'next/cache';
import { SavePatientAssessmentParams, SavePatientAssessmentResult } from '@/types/client.types';
import { sendClientFormLink } from '@/lib/email';
import { logger } from '@/utils/logger';

/**
 * Saves patient assessment data
 */
export async function savePatientAssessment(data: SavePatientAssessmentParams): Promise<SavePatientAssessmentResult> {
  try {
    const supabase = await createSupabaseServerClient();

    const environmentData = {
      is_clean: data.assessmentData.isClean,
      is_ventilated: data.assessmentData.isVentilated,
      is_dry: data.assessmentData.isDry,
      has_nature_view: data.assessmentData.hasNatureView,
      has_social_interaction: data.assessmentData.hasSocialInteraction,
      has_supportive_env: data.assessmentData.hasSupportiveEnv
    };
    
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

    const result = await supabase
      .from('patient_assessments')
      .insert({
        client_id: data.clientId,
        ...assessmentData,
        created_at: new Date().toISOString()
      })
      .select();

    if (result.error) {
      throw new Error(`Failed to save assessment: ${result.error.message}`);
    }

    revalidatePath(`/clients/${data.clientId}`);
    return { success: true, id: result.data?.[0]?.id };

  } catch (error: unknown) {
    logger.error('Error saving patient assessment:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'An unknown error occurred'
    };
  }
}


/**
 * Fetches patient assessment data for a specific client.
 * If assessmentId is provided, fetches that assessment.
 * Otherwise, fetches the latest assessment by created_at.
 * Also returns all assessments' id and created_at for the client.
 *
 * @param clientId - Unique client identifier
 * @param assessmentId - Optional assessment identifier
 * @returns Promise<{ success: boolean; assessment: any; assessments: Array<{ id: string; created_at: string }>; error?: string }>
 */
export async function getPatientAssessment(
  clientId: string,
  assessmentId?: string
): Promise<{
  success: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  assessment: any;
  assessments: Array<{ id: string; created_at: string }>;
  error?: string;
}> {
  try {
    const supabase = await createSupabaseServerClient();

    const { data: allAssessments, error: allError } = await supabase
      .from('patient_assessments')
      .select('id, created_at')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false });

    if (allError) {
      return { success: false, error: allError.message, assessment: null, assessments: [] };
    }

    let assessmentData = null;
    if (assessmentId) {
      const { data, error } = await supabase
        .from('patient_assessments')
        .select('*')
        .eq('id', assessmentId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return { success: true, assessment: null, assessments: allAssessments || [] };
        }
        return { success: false, error: error.message, assessment: null, assessments: allAssessments || [] };
      }
      assessmentData = data;
    } else if (allAssessments && allAssessments.length > 0) {
      const latestId = allAssessments[0].id;
      const { data, error } = await supabase
        .from('patient_assessments')
        .select('*')
        .eq('id', latestId)
        .single();

      if (error) {
        return { success: false, error: error.message, assessment: null, assessments: allAssessments };
      }
      assessmentData = data;
    }

    return {
      success: true,
      assessment: assessmentData,
      assessments: allAssessments || []
    };
  } catch (error: unknown) {
    logger.error('Error fetching patient assessment:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unknown error occurred',
      assessment: null,
      assessments: []
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
    logger.error('Error checking form status:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to check form status',
      isFormFilled: false
    };
  }
}

/**
 * Sends the client assessment form link to the client's email address.
 * Only sends the email in production environment.
 *
 * @param clientId - Unique client identifier
 * @returns Promise<{ success: boolean; error?: string }>
 */
export async function sendClientAssessmentFormLink(clientId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createSupabaseServerClient();

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

    const formBaseUrl = process.env.NEXT_PUBLIC_WEB_APP_URL || 'https://dearcare.com';
    const formLink = `${formBaseUrl}/patient-assessment/${clientId}`;

    const env = process.env.NODE_ENV;
    if (env === 'production') {
      const emailResult = await sendClientFormLink(clientEmail, {
        name: clientName,
        clientId: clientId,
        formLink: formLink
      });

      if (!emailResult.success) {
        throw new Error('Failed to send email');
      }
      return { success: true };
    } else {
      logger.info(`Skipped sending assessment form email to ${clientEmail} (env: ${env})`);
      return { success: true };
    }
  } catch (error) {
    logger.error('Error sending client assessment form:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An error occurred'
    };
  }
}

type IndividualClientData = {
  requestor_name: string;
  patient_name: string;
  clients?: {
    client_category?: string;
  };
};

export async function getClientNames(
  clientId: string
): Promise<{
  success: boolean;
  requestorName?: string;
  patientName?: string;
  clientCategory?: string;
  error?: string;
}> {
  try {
    const supabase = await createSupabaseServerClient();

    const { data, error } = await supabase
      .from('individual_clients')
      .select(`
        requestor_name, 
        patient_name, 
        clients (
          client_category
        )
      `)
      .eq('client_id', clientId)
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    const clientData = data as IndividualClientData;

    return {
      success: true,
      requestorName: clientData.requestor_name,
      patientName: clientData.patient_name,
      clientCategory: clientData.clients?.client_category
    };

  } catch (error) {
    logger.error('Error fetching client names:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unknown error occurred'
    };
  }
}