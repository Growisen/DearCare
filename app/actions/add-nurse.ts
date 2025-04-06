'use server'

type NurseDocuments = {
  adhar: File | null
  educational: File | null
  experience: File | null
  profile_image: File | null
  noc: File | null
  ration: File | null
}
import { NurseFormData, NurseReferenceData, NurseHealthData, NurseBasicInfo, Nurse } from '@/types/staff.types'
import { createSupabaseServerClient } from './auth'

export async function createNurse(
  nurseData: NurseFormData,
  referenceData: NurseReferenceData,
  healthData: NurseHealthData,
  documents: NurseDocuments
  
): Promise<{ success: boolean; nurseId?: number; error?: string }> {
  

  try {
    
    // 1. Upload nurse profile image if exists
    const supabase = await createSupabaseServerClient()

    // // Verify authentication first
    // const { data: { session } } = await supabase.auth.getSession();
    // if (!session) {
    //   return { success: false, error: 'Not authenticated' };
    // }

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return { success: false, error: 'Not authenticated' };
    }

    // Add role verification
    const { data: { user } } = await supabase.auth.getUser();
    console.log(user?.user_metadata?.role)
    if (user?.user_metadata?.role !== 'admin') {
      return { success: false, error: 'Unauthorized: Admin access required' };
    }



  

    // 2. Upload documents
 

    // 3. Insert nurse base data
    const { data: nurse, error: nurseError } = await supabase
      .from('nurses')
      .insert({
        first_name: nurseData.first_name,
        email:nurseData.email ? String(nurseData.email) : null,
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
        shift_pattern: nurseData.shift_pattern, // Convert to number
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
        description: referenceData.recommendation_details,
        family_references: referenceData.family_references
        
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

    const uploadPromises = []
    const nurse_id = nurse.nurse_id.toString()
    const uploadFile = async (file: File, folder: string) => {
      const extension = file.name.split('.').pop()
      const fileName = `${nurse_id}.${extension}`
      
      return supabase.storage
        .from('DearCare')
        .upload(`Nurses/${folder}/${fileName}`, file, {
          cacheControl: '3600',
          upsert: false
        })
    }

    if (documents.adhar) {
      uploadPromises.push(uploadFile(documents.adhar, 'adhar'))
    }
    
    if (documents.educational) {
      uploadPromises.push(uploadFile(documents.educational, 'Educational_Certificates'))
    }
    
    if (documents.experience) {
      uploadPromises.push(uploadFile(documents.experience, 'Experience_Certificates'))
    }
    
    if (documents.profile_image) {
      uploadPromises.push(uploadFile(documents.profile_image, 'image'))
    }
    
    if (documents.noc) {
      uploadPromises.push(uploadFile(documents.noc, 'Noc_Certificate'))
    }

    if (documents.ration) {
      uploadPromises.push(uploadFile(documents.ration, 'ration_card'))
    }

    const uploadResults = await Promise.all(uploadPromises)


    const uploadErrors = uploadResults
      .filter(result => result.error)
      .map(result => result.error)

    if (uploadErrors.length > 0) {
      throw new Error(`File upload errors: ${uploadErrors.join(', ')}`)
    }

    return { success: true, nurseId: nurse.nurse_id }

  } catch (error) {
    console.error('Error creating nurse:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'An unknown error occurred'
    }
  }
}

export async function fetchNurseDetails(): Promise<{ data: NurseBasicInfo[] | null, error: string | null }> {
  try {
    const supabase = await createSupabaseServerClient()

    // Verify authentication
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return { data: null, error: 'Not authenticated' }
    }

    const { data, error } = await supabase
      .from('nurses')
      .select(`
        nurse_id,
        first_name,
        last_name,
        email,
        phone_number,
        experience,
        service_type
      `)
      .order('first_name')

    if (error) throw error

    // Transform the data to include a default status
    const transformedData = data.map(nurse => ({
      nurse_id: nurse.nurse_id,
      first_name: nurse.first_name,
      last_name: nurse.last_name,
      status: 'unassigned', // Default status or derive from service_type
      email: nurse.email,
      phone_number: nurse.phone_number,
      experience: nurse.experience
    }))

    return { 
      data: transformedData, 
      error: null 
    }

  } catch (error) {
    console.error('Error fetching nurses:', error)
    return { 
      data: null, 
      error: error instanceof Error ? error.message : 'Failed to fetch nurses' 
    }
  }
}


export async function listNurses(): Promise<{ data: Nurse[] | null, error: string | null }> {
  try {
    const supabase = await createSupabaseServerClient()

    // Verify authentication
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return { data: null, error: 'Not authenticated' }
    }

    const { data, error } = await supabase
      .from('nurses')
      .select(`
        nurse_id,
        first_name,
        last_name,
        email,
        phone_number,
        experience,
        service_type,
        created_at,
        status,
        gender,
        date_of_birth,
        address,
        city,
        taluk,
        state,
        pin_code,
        languages,
        shift_pattern,
        category,
        marital_status,
        religion,
        mother_tongue
      `)
      .order('first_name')

    if (error) throw error

    // Transform the data to match the Nurse interface
    const transformedData: Nurse[] = data.map(nurse => ({
      _id: nurse.nurse_id.toString(),
      firstName: nurse.first_name || '',
      lastName: nurse.last_name || '',
      email: nurse.email || '',
      phoneNumber: nurse.phone_number || '',
      gender: nurse.gender || '',
      dateOfBirth: nurse.date_of_birth || '',
      address: nurse.address || '',
      city: nurse.city || '',
      state: nurse.state || '',
      pinCode: nurse.pin_code?.toString() || '',
      languages: nurse.languages || [],
      experience: nurse.experience || 0,
      salaryCap:  0,
      salaryPerHour:   0,
      status: (nurse.status as Nurse['status']) || 'pending',
      // Add missing required fields
      location: nurse.city || '', // or construct from address fields
      dob: nurse.date_of_birth || '', // use existing dateOfBirth field
      preferredLocations:[], // Add to database query if not present
      // Optional fields
      hiringDate: nurse.created_at,
      rating: 3,
      reviews:[],
      serviceType: nurse.service_type || '',
      shiftPattern: nurse.shift_pattern || '',
      category: nurse.category || '',
      maritalStatus: nurse.marital_status || '',
      religion: nurse.religion || '',
      motherTongue: nurse.mother_tongue || '',
      taluk: nurse.taluk || ''
    }))

    return { 
      data: transformedData, 
      error: null 
    }

  } catch (error) {
    console.error('Error fetching nurses:', error)
    return { 
      data: null, 
      error: error instanceof Error ? error.message : 'Failed to fetch nurses' 
    }
  }
}