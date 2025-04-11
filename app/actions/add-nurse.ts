'use server'

type NurseDocuments = {
  adhar: File | null
  educational: File | null
  experience: File | null
  profile_image: File | null
  noc: File | null
  ration: File | null
}

interface PaginationParams {
  page: number;
  limit: number;
}

interface FamilyReference {
  name: string;
  phone_number: string;
  relation: string;
}

export interface NurseAssignmentWithClient {
  assignment: {
    id: number;
    start_date: string;
    end_date: string | null;
    shift_start_time: string | null;
    shift_end_time: string | null;
    salary_hour: number | null;
  };
  client: {
    type: 'individual' | 'hospital' | 'carehome' | 'organization';
    details: {
      individual?: {
        patient_name: string;
        patient_age: number | null;
        patient_gender: string | null;
        complete_address: string;
        service_required: string;
        requestor_name: string;
        requestor_phone: string;
        requestor_email: string;
        relation_to_patient: string;
        care_duration: string;
        start_date: string;
      };
      organization?: {
        organization_name: string;
        organization_type: string | null;
        organization_address: string;
        contact_person_name: string;
        contact_person_role: string | null;
        contact_phone: string;
        contact_email: string;
        start_date: string | null;
      };
    };
  };
}




export interface SimplifiedNurseDetails {
  basic: {
    nurse_id: number;
    first_name: string | null;
    last_name: string | null;
    email: string | null;
    phone_number: string | null;
    gender: string | null;
    date_of_birth: string | null;
    address: string | null;
    city: string | null;
    state: string | null;
    pin_code: number | null;
    languages: string[] | null;
    experience: number | null;
    service_type: string | null;
    shift_pattern: string | null;
    category: string | null;
    status: string;
    marital_status: string | null;
    religion: string | null;
    mother_tongue: string | null;
  };
  health: {
    health_status: string | null;
    disability: string | null;
    source: string | null;
  } | null;
  references: {
    referer_name: string | null;
    phone_number: string | null;
    relation: string | null;
    description: string | null;
    family_references: FamilyReference[] | null; 
  } | null;
  documents: {
    profile_image: string | null;
    adhar: string | null;
    educational?: string | null;
    experience?: string | null;
    noc?: string | null;
    ration: string | null;
  };
}

import { NurseFormData, NurseReferenceData, NurseHealthData, NurseBasicInfo, Nurse, NurseBasicDetails } from '@/types/staff.types'
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

export async function fetchNurseDetailsmain(nurseId: number): Promise<{
  data: SimplifiedNurseDetails | null;
  error: string | null;
}> {
  try {
    const supabase = await createSupabaseServerClient()

    // Verify authentication
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return { data: null, error: 'Not authenticated' }
    }

    // Fetch basic nurse information
    const { data: basicData, error: basicError } = await supabase
      .from('nurses')
      .select('*')
      .eq('nurse_id', nurseId)
      .single()

    if (basicError) throw basicError

    // Fetch health information
    const { data: healthData } = await supabase
      .from('nurse_health')
      .select('health_status, disability, source')
      .eq('nurse_id', nurseId)
      .single()

    // Fetch reference information
    const { data: referenceData } = await supabase
      .from('nurse_references')
      .select('referer_name, phone_number, relation, description, family_references')
      .eq('nurse_id', nurseId)
      .single()

    // Fetch document URLs
    const getDocumentUrl = async (folder: string): Promise<string | null> => {
      const { data: files } = await supabase
        .storage
        .from('DearCare')
        .list(`Nurses/${folder}`, {
          limit: 1,
          search: nurseId.toString(),
        })

      if (files && files.length > 0) {
        const { data: url } = supabase
          .storage
          .from('DearCare')
          .getPublicUrl(`Nurses/${folder}/${files[0].name}`)
        return url.publicUrl
      }
      return null
    }

    const documents = {
      profile_image: await getDocumentUrl('image'),
      adhar: await getDocumentUrl('adhar'),
      educational: await getDocumentUrl('Educational_Certificates'),
      experience: await getDocumentUrl('Experience_Certificates'),
      noc: await getDocumentUrl('Noc_Certificate'),
      ration: await getDocumentUrl('ration_card')
    }

    console.log('Documents:', documents)

    console.log('Basic Data:', basicData)

    console.log('Health Data:', healthData)

    console.log('Reference Data:', referenceData)

    return {
      data: {
        basic: basicData,
        health: healthData,
        references: referenceData,
        documents
      },
      error: null
    }

  } catch (error) {
    console.error('Error fetching nurse details:', error)
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Failed to fetch nurse details'
    }
  }
}



interface AssignmentResponse {
  id: number;
  start_date: string;
  end_date: string | null;
  shift_start_time: string | null;
  shift_end_time: string | null;
  salary_hour: number | null;
  client_id: string;
  clients: {
    client_type: 'individual' | 'hospital' | 'carehome' | 'organization';
  };
}

export async function fetchNurseAssignments(
  nurseId: number
): Promise<{
  data: NurseAssignmentWithClient[] | null;
  error: string | null;
}> {
  try {
    const supabase = await createSupabaseServerClient();

    // Verify authentication
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return { data: null, error: 'Not authenticated' };
    }

    // First fetch assignments with client type
    const { data: assignments, error: assignmentError } = await supabase
      .from('nurse_client')
      .select<string, AssignmentResponse>(`
        id,
        start_date,
        end_date,
        shift_start_time,
        shift_end_time,
        salary_hour,
        client_id,
        clients!inner (
          client_type
        )
      `)
      .eq('nurse_id', nurseId);

    if (assignmentError) throw assignmentError;
    if (!assignments) return { data: null, error: 'No assignments found' };

    // Fetch detailed client information for each assignment
    const assignmentsWithDetails = await Promise.all(
      assignments.map(async (assignment) => {
        const isIndividual = assignment.clients.client_type === 'individual';

        // Fetch client details based on type
        const { data: clientDetails, error: clientError } = await supabase
          .from(isIndividual ? 'individual_clients' : 'organization_clients')
          .select('*')
          .eq('client_id', assignment.client_id)
          .single();

        if (clientError) {
          console.error(`Error fetching client details: ${clientError.message}`);
          return null;
        }

        return {
          assignment: {
            id: assignment.id,
            start_date: assignment.start_date,
            end_date: assignment.end_date,
            shift_start_time: assignment.shift_start_time,
            shift_end_time: assignment.shift_end_time,
            salary_hour: assignment.salary_hour,
          },
          client: {
            type: assignment.clients.client_type,
            details: isIndividual
              ? { individual: clientDetails, organization: undefined }
              : { organization: clientDetails, individual: undefined }
          }
        } as NurseAssignmentWithClient;
      })
    );

    // Filter out any null values from failed client detail fetches
    const validAssignments = assignmentsWithDetails.filter(
      (assignment): assignment is NurseAssignmentWithClient => assignment !== null
    );
    

    return { data: validAssignments, error: null };
  } catch (error) {
    console.error('Error fetching nurse assignments:', error);
    return { data: null, error: 'Failed to fetch assignments' };
  }
}



export async function fetchBasicDetails(
  pagination?: PaginationParams
): Promise<{ 
  data: NurseBasicDetails[] | null;
  count: number | null;
  error: string | null;
}> {
  try {
    const supabase = await createSupabaseServerClient()
    const { page = 1, limit = 10 } = pagination || {}
    const start = (page - 1) * limit
    const end = start + limit - 1

    // Verify authentication
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return { data: null, count: null, error: 'Not authenticated' }
    }

    // Get total count first
    const { count, error: countError } = await supabase
      .from('nurses')
      .select('*', { count: 'exact', head: true })

    if (countError) throw countError

    // Fetch paginated nurse information
    const { data, error } = await supabase
      .from('nurses')
      .select(`
        nurse_id,
        first_name,
        last_name,
        email,
        phone_number,
        experience,
        status
      `)
      .order('first_name')
      .range(start, end)

    if (error) throw error

    // Transform the data
    const transformedData: NurseBasicDetails[] = data.map(nurse => ({
      nurse_id: nurse.nurse_id,
      name: {
        first: nurse.first_name || '',
        last: nurse.last_name || ''
      },
      status: nurse.status || 'unassigned',
      experience: nurse.experience,
      rating: 0,
      contact: {
        email: nurse.email,
        phone: nurse.phone_number
      }
    }))

    return {
      data: transformedData,
      count,
      error: null
    }

  } catch (error) {
    console.error('Error fetching basic nurse details:', error)
    return {
      data: null,
      count: null,
      error: error instanceof Error ? error.message : 'Failed to fetch nurse details'
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


    const get47 = async (nurseId:number) => {
      const { data, error } = await supabase
        .from('nurse_client')
        .select(`
          id,
          nurse_id,
          client_id,
          assigned_type,
          start_date,
          end_date,
          shift_start_time,
          shift_end_time,
          salary_hour,
          created_at
        `)
        .eq('nurse_id', nurseId)  // Add this line to filter by nurse_id
    
      if (error) {
        console.error('Error fetching nurse_client:', error)
        return null
      }
    
      console.log('Nurse 47 Assignments:', data)
      return data
    }
    
    // Call the function to test
    


   
    

    const getNurseImageUrl = async (nurseId: number): Promise<string | null> => {
      const { data: files } = await supabase
        .storage
        .from('DearCare')
        .list(`Nurses/image`, {
          limit: 1,
          search: nurseId.toString(),
        })

      if (files && files.length > 0) {
        const { data: imageUrl } = supabase
          .storage
          .from('DearCare')
          .getPublicUrl(`Nurses/image/${files[0].name}`)

        return imageUrl.publicUrl
      }
      return null
    }

    // Transform the data to include a default status
    const transformedData = await Promise.all(data.map(async nurse => ({
      nurse_id: nurse.nurse_id,
      first_name: nurse.first_name,
      last_name: nurse.last_name,
      status: 'unassigned',
      email: nurse.email,
      phone_number: nurse.phone_number,
      experience: nurse.experience,
      photo: await getNurseImageUrl(nurse.nurse_id)  // This now matches the interface
    } as NurseBasicInfo)))

    await get47(transformedData[0].nurse_id) // Example call to get47 with the first nurse's ID

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