'use server'

import { NurseFormData, NurseReferenceData, NurseHealthData } from '@/types/staff.types'
import { createSupabaseServerClient } from './auth'

export async function createNurse(
  nurseData: NurseFormData,
  referenceData: NurseReferenceData,
  healthData: NurseHealthData,
  
): Promise<{ success: boolean; nurseId?: number; error?: string }> {
  

  try {
    // 1. Upload nurse profile image if exists
    const supabase = await createSupabaseServerClient()

    // Verify authentication first
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return { success: false, error: 'Not authenticated' };
    }
  

    // 2. Upload documents
 

    // 3. Insert nurse base data
    const { data: nurse, error: nurseError } = await supabase
      .from('nurses')
      .insert({
        first_name: nurseData.first_name,
        last_name: nurseData.last_name,
        gender: nurseData.gender,
        date_of_birth: nurseData.date_of_birth,
        address: nurseData.address,
        city: nurseData.city,
        taluk: nurseData.taluk,
        state: nurseData.state,
        pin_code: Number(nurseData.pin_code), // Convert to number
        phone_number: nurseData.phone_number,
        languages: nurseData.languages, // This is Json type
        service_type: nurseData.service_type,
        shift_pattern: Number(nurseData.shift_pattern), // Convert to number
        category: nurseData.category,
        experience: Number(nurseData.experience), // Convert to number
        marital_status: nurseData.marital_status,
        religion: nurseData.religion,
        mother_tongue: nurseData.mother_tongue,
        noc_status: nurseData.noc_status,
        created_at: new Date().toISOString()
      })
      .select('nurse_id')
      .single()

    if (nurseError) throw nurseError

    // 4. Insert reference data
    const { error: referenceError } = await supabase
      .from('nurse_references')
      .insert({
        nurse_id: nurse.nurse_id,
        referer_name: referenceData.reference_name,
        phone_number: referenceData.reference_phone,
        relation: referenceData.reference_relation,
        description: referenceData.reference_address,
        type: 'personal'
      })

    if (referenceError) throw referenceError

    // 5. Insert health data
    const { error: healthError } = await supabase
      .from('nurse_health')
      .insert({
        nurse_id: nurse.nurse_id,
        health_status: healthData.health_status,
        disability: healthData.disability,
        source: healthData.source,
        created_at: new Date().toISOString()
      })

    if (healthError) throw healthError

    return { success: true, nurseId: nurse.nurse_id }

  } catch (error) {
    console.error('Error creating nurse:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'An unknown error occurred'
    }
  }
}