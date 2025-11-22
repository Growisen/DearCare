"use server"

import { createSupabaseServerClient } from '@/app/actions/authentication/auth';
import { logger } from '@/utils/logger';
import { FormData } from '@/types/reassessment.types';

/**
 * Inserts a new reassessment record for a client.
 * @param clientId - The UUID of the client.
 * @param formData - The reassessment form data.
 */
export async function insertReassessment(clientId: string, formData: FormData) {
  try {
    const supabase = await createSupabaseServerClient();

    const { error } = await supabase
      .from('reassessment')
      .insert({
        client_id: clientId,
        diagnosis: formData.diagnosis,
        present_condition: formData.presentCondition,
        vitals: formData.vitals,
        bed_sore: formData.bedSore,
        mental_status: formData.mentalStatus,
        hygiene: formData.hygiene,
        general_status: formData.generalStatus,
        care_status: formData.careStatus,
        outdoor_hours: formData.outdoorHours,
        nursing_diagnosis: formData.nursingDiagnosis,
        follow_up_evaluation: formData.followUpEvaluation,
        assignment_done_by: formData.assignmentDoneBy,
        allotted_staff_name: formData.allottedStaffName,
        assigning_period: formData.assigningPeriod,
        previous_visited_date: formData.previousVisitedDate || null,
        dynamic_fields: formData.dynamicFields,
      });

    if (error) {
      logger.error('Error inserting reassessment:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error: unknown) {
    logger.error('Error inserting reassessment:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unknown error occurred'
    };
  }
}

/**
 * Fetches reassessment records for a client and formats the result.
 * If reassessmentId is provided, fetches only that record.
 * Otherwise, fetches the latest record for the client.
 * @param clientId - The UUID of the client.
 * @param reassessmentId - (Optional) The UUID of the reassessment.
 */
export async function fetchReassessments(clientId: string, reassessmentId?: string) {
  try {
    const supabase = await createSupabaseServerClient();

    let query = supabase
      .from('reassessment')
      .select(`
        id,
        diagnosis,
        present_condition,
        vitals,
        bed_sore,
        mental_status,
        hygiene,
        general_status,
        care_status,
        outdoor_hours,
        nursing_diagnosis,
        follow_up_evaluation,
        assignment_done_by,
        allotted_staff_name,
        assigning_period,
        previous_visited_date,
        dynamic_fields,
        created_at
      `);

    if (reassessmentId) {
      query = query.eq('id', reassessmentId).limit(1);
    } else {
      query = query.eq('client_id', clientId).order('created_at', { ascending: false }).limit(1);
    }

    const { data, error } = await query;

    const { data: totalData, error: totalError } = await supabase
      .from('reassessment')
      .select('id, created_at')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false });

    if (error) {
      logger.error('Error fetching reassessments:', error);
      return { success: false, error: error.message, reassessments: [], totalReassessments: [] };
    }

    if (totalError) {
      logger.error('Error fetching total reassessments:', totalError);
      return { success: false, error: totalError.message, reassessments: [], totalReassessments: [] };
    }

    const reassessments = (data || []).map(item => ({
      id: item.id,
      diagnosis: item.diagnosis,
      presentCondition: item.present_condition,
      vitals: item.vitals,
      bedSore: item.bed_sore,
      mentalStatus: item.mental_status,
      hygiene: item.hygiene,
      generalStatus: item.general_status,
      careStatus: item.care_status,
      outdoorHours: item.outdoor_hours,
      nursingDiagnosis: item.nursing_diagnosis,
      followUpEvaluation: item.follow_up_evaluation,
      assignmentDoneBy: item.assignment_done_by,
      allottedStaffName: item.allotted_staff_name,
      assigningPeriod: item.assigning_period,
      previousVisitedDate: item.previous_visited_date,
      dynamicFields: item.dynamic_fields,
      createdAt: item.created_at,
    }));

    const totalReassessments = (totalData || []).map(item => ({
      id: item.id,
      createdAt: item.created_at,
    }));

    return { success: true, reassessments, totalReassessments };
  } catch (error: unknown) {
    logger.error('Error fetching reassessments:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unknown error occurred',
      reassessments: [],
      totalReassessments: []
    };
  }
}