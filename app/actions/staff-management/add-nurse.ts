'use server'
import { getOrgMappings } from '@/app/utils/org-utils';


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
  phone: string;
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
    taluk?: string | null;
    nurse_reg_no?: string | null;
    nurse_prev_reg_no?: string | null;
    joining_date?: string | null;
    noc_status?: string | null;
    admitted_type?: string | null;
    created_at?: string | null;
    salary_per_month?: number | string;
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
import { createSupabaseServerClient } from '@/app/actions/authentication/auth'
import { SupabaseClient } from '@supabase/supabase-js'


async function generateNurseRegNo(
  supabase: SupabaseClient, 
  admittedType: 'Tata_Homenursing' | 'Dearcare_Llp'
): Promise<string> {
  const currentYear = new Date().getFullYear();
  const prefix = admittedType === 'Tata_Homenursing' ? 'TH' : 'DC';
  
  // Get current timestamp in milliseconds and take last 4 digits
  const timestamp = new Date().getTime();
  const uniqueSequence = String(timestamp % 10000).padStart(4, '0');
  
  // Format: PREFIX + YEAR + TIMESTAMP_SEQUENCE
  const nurseRegNo = `${prefix}${currentYear}${uniqueSequence}`;

  // Verify uniqueness
  const { data: existingNurse } = await supabase
    .from('nurses')
    .select('nurse_reg_no')
    .eq('nurse_reg_no', nurseRegNo)
    .single();

  // If a collision occurs (extremely rare), try again with new timestamp
  if (existingNurse) {
    return generateNurseRegNo(supabase, admittedType);
  }

  return nurseRegNo;
}


export async function createNurse(
  nurseData: NurseFormData,
  referenceData: NurseReferenceData,
  healthData: NurseHealthData,
  documents: NurseDocuments
  
): Promise<{ success: boolean; nurseId?: number; error?: string }> {
  

  try {
    
    // 1. Upload nurse profile image if exists
    const supabase = await createSupabaseServerClient()
    const nurseRegNo = await generateNurseRegNo(supabase, nurseData.admitted_type);
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

    // First check if email already exists
    if (nurseData.email) {
      const { data: existingNurse, error: checkError } = await supabase
        .from('nurses')
        .select('nurse_id')
        .eq('email', nurseData.email)
        .single()

      if (existingNurse) {
        return { 
          success: false, 
          error: 'This email is already registered with another nurse'
        }
      }

      if (checkError && checkError.code !== 'PGRST116') { // PGRST116 is "not found" error
        throw checkError;
      }
    }

    // Insert nurse base data
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
        nurse_reg_no: nurseRegNo,
        admitted_type: nurseData.admitted_type,
        nurse_prev_reg_no: nurseData.nurse_prev_reg_no,
        joining_date: nurseData.joining_date,
        salary_per_month: nurseData.salary_per_month ? Number(nurseData.salary_per_month) : null,
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
    // Handle specific database errors
    if (error instanceof Error) {
      if ('code' in error && error.code === '23505') {
        return { 
          success: false, 
          error: 'This email address is already registered with another nurse'
        }
      }
    }
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
  pagination?: PaginationParams,
  searchQuery?: string
): Promise<{ 
  data: NurseBasicDetails[] | null;
  count: number | null;
  error: string | null;
}> {
  try {
    const supabase = await createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser();
    const organization = user?.user_metadata?.organization;

    const { nursesOrg } = getOrgMappings(organization);

    const { page = 1, limit = 10 } = pagination || {}
    const start = (page - 1) * limit
    const end = start + limit - 1

    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return { data: null, count: null, error: 'Not authenticated' }
    }

    let nursesQuery = supabase
      .from('nurses')
      .select(`
        nurse_id,
        full_name,
        first_name,
        last_name,
        email,
        phone_number,
        experience,
        status,
        nurse_reg_no
      `, { count: 'exact' })
      .eq('admitted_type', nursesOrg)

    if (searchQuery && searchQuery.trim() !== '') {
      const q = `%${searchQuery.trim()}%`
      nursesQuery = nursesQuery.or(
        `full_name.ilike.${q},email.ilike.${q},phone_number.ilike.${q},nurse_reg_no.ilike.${q}`
      )
    }

    nursesQuery = nursesQuery
      .order('full_name')
      .range(start, end)

    const { data, error, count } = await nursesQuery

    if (error) throw error

    const transformedData: NurseBasicDetails[] = data.map(nurse => ({
      nurse_id: nurse.nurse_id,
      name: {
        first: nurse.first_name || '',
        last: nurse.last_name || ''
      },
      status: nurse.status || 'unassigned',
      experience: nurse.experience,
      regno: nurse.nurse_reg_no || null,
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
interface ExcelNurseData {
  'Nurse ID': number;
  'First Name': string;
  'Last Name': string;
  'Email': string;
  'Phone Number': string;
  'Gender': string;
  'Date of Birth': string;
  'Age': string;
  'Address': string;
  'City': string;
  'Taluk': string;
  'State': string;
  'PIN Code': string | number;
  'Languages': string;
  'Experience (Years)': number;
  'Service Type': string;
  'Shift Pattern': string;
  'Category': string;
  'Status': string;
  'Marital Status': string;
  'Religion': string;
  'Mother Tongue': string;
  'NOC Status': string;
  'Created Date': string;
  'Health Status': string;
  'Disability': string;
  'Source of Information': string;
  'Reference Name': string;
  'Reference Phone': string;
  'Reference Relation': string;
  'Recommendation Details': string;
  'Family References': string;
}

interface FamilyReference {
  name: string;
  phone: string;
  relation: string;
}

async function getAuthenticatedClient() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  const userId = user?.id;
  
  if (!userId) {
    throw new Error("User not authenticated");
  }

  const web_user_id = user.user_metadata.user_id

  const organization = user?.user_metadata?.organization;

  const { nursesOrg, clientsOrg } = getOrgMappings(organization);

  return { supabase, userId: web_user_id, nursesOrg, clientsOrg };
}


export async function exportNurseData(): Promise<{ 
  data: ExcelNurseData[] | null;
  error: string | null;
}> {
  try {
    const { supabase, nursesOrg } = await getAuthenticatedClient();

    // Verify authentication
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return { data: null, error: 'Not authenticated' };
    }

    // Fetch joined data from all three tables
    const { data, error } = await supabase
      .from('nurses')
      .select(`
        *,
        nurse_health (
          health_status,
          disability,
          source
        ),
        nurse_references (
          referer_name,
          phone_number,
          relation,
          description,
          family_references
        )
      `)
      .eq('admitted_type', nursesOrg);

    if (error) throw error;

    // Transform data for Excel format
    const excelData = data.map(nurse => ({
      'Nurse ID': nurse.nurse_id,
      'First Name': nurse.first_name || '',
      'Last Name': nurse.last_name || '',
      'Email': nurse.email || '',
      'Phone Number': nurse.phone_number || '',
      'Gender': nurse.gender || '',
      'Date of Birth': nurse.date_of_birth || '',
      'Age': nurse.age || '',
      'Address': nurse.address || '',
      'City': nurse.city || '',
      'Taluk': nurse.taluk || '',
      'State': nurse.state || '',
      'PIN Code': nurse.pin_code || '',
      'Languages': Array.isArray(nurse.languages) ? nurse.languages.join(', ') : '',
      'Experience (Years)': nurse.experience || 0,
      'Service Type': nurse.service_type || '',
      'Shift Pattern': nurse.shift_pattern || '',
      'Category': nurse.category || '',
      'Status': nurse.status || '',
      'Marital Status': nurse.marital_status || '',
      'Religion': nurse.religion || '',
      'Mother Tongue': nurse.mother_tongue || '',
      'NOC Status': nurse.noc_status || '',
      'Created Date': nurse.created_at ? new Date(nurse.created_at).toLocaleDateString() : '',
      
      // Health Information
      'Health Status': nurse.nurse_health?.health_status || '',
      'Disability': nurse.nurse_health?.disability || '',
      'Source of Information': nurse.nurse_health?.source || '',
      
      // Reference Information
      'Reference Name': nurse.nurse_references?.referer_name || '',
      'Reference Phone': nurse.nurse_references?.phone_number || '',
      'Reference Relation': nurse.nurse_references?.relation || '',
      'Recommendation Details': nurse.nurse_references?.description || '',
      
      // Family References (formatted as a string)
      'Family References': nurse.nurse_references?.family_references ? 
        nurse.nurse_references.family_references.map((ref: FamilyReference) => 
          `Name: ${ref.name}, Phone: ${ref.phone}, Relation: ${ref.relation}`
        ).join(' | ') : ''
    }));

    return { 
      data: excelData,
      error: null 
    };

  } catch (error) {
    console.error('Error exporting nurse data:', error);
    return { 
      data: null, 
      error: error instanceof Error ? error.message : 'Failed to export nurse data' 
    };
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


export async function updateNurseStatus(
  nurseId: number,
  status: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createSupabaseServerClient();

    // Verify authentication
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return { success: false, error: 'Not authenticated' };
    }

    // Update the nurse status
    const { error } = await supabase
      .from('nurses')
      .update({ status })
      .eq('nurse_id', nurseId);

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error('Error updating nurse status:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to update nurse status'
    };
  }
}

export async function deleteNurse(nurseId: number): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createSupabaseServerClient();

    // 1. Delete nurse images/documents from storage
    const folders = [
      'image',
      'adhar',
      'Educational_Certificates',
      'Experience_Certificates',
      'Noc_Certificate',
      'ration_card'
    ];
    for (const folder of folders) {
      // List files for this nurse in the folder
      const { data: files, error: listError } = await supabase
        .storage
        .from('DearCare')
        .list(`Nurses/${folder}`, { search: nurseId.toString() });
      if (listError) continue;
      if (files && files.length > 0) {
        for (const file of files) {
          if (file.name.startsWith(nurseId.toString())) {
            await supabase.storage.from('DearCare').remove([`Nurses/${folder}/${file.name}`]);
          }
        }
      }
    }

    // 2. Delete from nurse_health
    await supabase
      .from('nurse_health')
      .delete()
      .eq('nurse_id', nurseId);

    // 3. Delete from nurse_references
    await supabase
      .from('nurse_references')
      .delete()
      .eq('nurse_id', nurseId);

    // 4. Delete from nurses (main table)
    const { error } = await supabase
      .from('nurses')
      .delete()
      .eq('nurse_id', nurseId);

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error('Error deleting nurse:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete nurse'
    };
  }
}

export async function updateNurse(
  nurseId: number,
  formData: SimplifiedNurseDetails,
  tempFiles?: Record<string, { file: File; preview: string }[]>
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createSupabaseServerClient();

    // 1. Update nurse basic info (all fields from your Row type)
   const { error: basicError } = await supabase
  .from('nurses')
  .update({
    first_name: formData.basic.first_name,
    last_name: formData.basic.last_name,
    email: formData.basic.email,
    phone_number: formData.basic.phone_number,
    gender: formData.basic.gender,
    date_of_birth: formData.basic.date_of_birth,
    address: formData.basic.address,
    city: formData.basic.city,
    state: formData.basic.state,
    pin_code: formData.basic.pin_code ? Number(formData.basic.pin_code) : null,
    languages: formData.basic.languages,
    experience: formData.basic.experience ? Number(formData.basic.experience) : null,
    service_type: formData.basic.service_type,
    shift_pattern: formData.basic.shift_pattern,
    category: formData.basic.category,
    status: formData.basic.status,
    marital_status: formData.basic.marital_status,
    religion: formData.basic.religion,
    mother_tongue: formData.basic.mother_tongue,
    taluk: formData.basic.taluk ?? null,
    nurse_reg_no: formData.basic.nurse_reg_no ?? null,
    joining_date: formData.basic.joining_date ?? null,
    nurse_prev_reg_no: formData.basic.nurse_prev_reg_no ?? null,
    noc_status: formData.basic.noc_status ?? null,
    admitted_type: formData.basic.admitted_type ?? null,
    created_at: formData.basic.created_at ?? undefined,
    salary_per_month: formData.basic.salary_per_month ? Number(formData.basic.salary_per_month) : null,
  })
  .eq('nurse_id', nurseId);

    if (basicError) throw basicError;

    // 2. Update health info
    if (formData.health) {
      await supabase
        .from('nurse_health')
        .update({
          health_status: formData.health.health_status,
          disability: formData.health.disability,
          source: formData.health.source,
        })
        .eq('nurse_id', nurseId);
    }

    // 3. Update references
    if (formData.references) {
      await supabase
        .from('nurse_references')
        .update({
          referer_name: formData.references.referer_name,
          phone_number: formData.references.phone_number,
          relation: formData.references.relation,
          description: formData.references.description,
          family_references: formData.references.family_references,
        })
        .eq('nurse_id', nurseId);
    }

    // 4. Handle document uploads (if any)
    if (tempFiles) {
      const uploadFile = async (file: File, folder: string) => {
        const extension = file.name.split('.').pop();
        const fileName = `${nurseId}.${extension}`;
        return supabase.storage
          .from('DearCare')
          .upload(`Nurses/${folder}/${fileName}`, file, {
            cacheControl: '3600',
            upsert: true,
          });
      };

      for (const [docType, files] of Object.entries(tempFiles)) {
        if (files && files.length > 0) {
          // Only upload the first file for single-file fields
          let folder = docType;
          if (docType === 'profile_image') folder = 'image';
          if (docType === 'educational') folder = 'Educational_Certificates';
          if (docType === 'experience') folder = 'Experience_Certificates';
          if (docType === 'noc') folder = 'Noc_Certificate';
          if (docType === 'ration') folder = 'ration_card';
          await uploadFile(files[0].file, folder);
        }
      }
    }

    return { success: true };
  } catch (error) {
    console.error('Error updating nurse:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update nurse',
    };
  }
}


interface AssignmentInfo {
  startDate: string;
  endDate: string | null;
  shiftType: 'day' | 'night' | '24h';
  clientId: string;
  clientType: string;
  registrationNumber: string;
}

export async function listNursesWithAssignments(
  paginationParams?: { page: number; pageSize: number },
  filterParams?: { status?: string; city?: string; admittedType?: string }
): Promise<{ 
  data: Nurse[] | null, 
  error: string | null,
  totalCount?: number,
  totalPages?: number
}> {
  try {
    const supabase = await createSupabaseServerClient();

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return { data: null, error: 'Not authenticated' };
    }

    const page = paginationParams?.page || 1;
    const pageSize = paginationParams?.pageSize || 25;

    const { nursesOrg } = getOrgMappings(filterParams?.admittedType ?? '');

    // Build base query with filters
    let nursesQuery = supabase
      .from('nurses')
      .select(`
        nurse_id,
        first_name,
        last_name,
        email,
        phone_number,
        experience,
        city,
        admitted_type,
        salary_per_month,
        joining_date
      `, { count: 'exact' });

    if (filterParams?.city) {
      nursesQuery = nursesQuery.like('city', filterParams.city);
    }
    if (filterParams?.admittedType) {
      nursesQuery = nursesQuery.eq('admitted_type', nursesOrg);
    }

    // First, fetch ALL nurses matching the base filters (without pagination)
    // to properly calculate status-based filtering
    const { data: allNursesData, error: allNursesError } = await nursesQuery
      .order('first_name');

    if (allNursesError) throw allNursesError;

    const allNurseIds = allNursesData.map(nurse => nurse.nurse_id);
    const currentDate = new Date().toISOString().split('T')[0];

    // Fetch leave data
    const { data: leaveData, error: leaveError } = await supabase
      .from('nurse_leave_requests')
      .select(`
        id,
        nurse_id,
        start_date,
        end_date,
        reason
      `)
      .in('nurse_id', allNurseIds)
      .eq('status', 'approved')
      .gte('end_date', currentDate);

    console.log("leave", leaveData);

    if (leaveError) throw leaveError;

    const leaveByNurseId = new Map();
    for (const leave of leaveData) {
      leaveByNurseId.set(leave.nurse_id, leave);
    }

    // Fetch all non-completed assignments (current + upcoming)
    const { data: assignmentsData, error: assignmentsError } = await supabase
      .from('nurse_client')
      .select(`
        nurse_id,
        client_id,
        start_date,
        end_date,
        shift_start_time,
        shift_end_time,
        clients(
          client_type,
          registration_number
        )
      `)
      .in('nurse_id', allNurseIds)
      .or(`end_date.is.null,end_date.gt.${currentDate}`) 
      .order('start_date');

    if (assignmentsError) throw assignmentsError;

    const assignmentsByNurseId = new Map();
    for (const assignment of assignmentsData) {
      if (!assignmentsByNurseId.has(assignment.nurse_id)) {
        assignmentsByNurseId.set(assignment.nurse_id, []);
      }
      assignmentsByNurseId.get(assignment.nurse_id).push(assignment);
    }

    // Transform all nurses to include status
    let allTransformedData: Nurse[] = allNursesData.map(nurse => {
      const nurseLeave = leaveByNurseId.get(nurse.nurse_id);
      const nurseAssignments = assignmentsByNurseId.get(nurse.nurse_id) || [];
      
      let nurseStatus: Nurse['status'] = 'unassigned';
      let assignments = [];
      let leaveInfo = null;
      
      if (nurseLeave) {
        nurseStatus = 'leave';
        leaveInfo = {
          startDate: nurseLeave.start_date,
          endDate: nurseLeave.end_date,
          reason: nurseLeave.reason
        };
      } 
      else if (nurseAssignments.length > 0) {
        nurseStatus = 'assigned';

        assignments = nurseAssignments.map((assignment: {
          start_date: string;
          end_date: string | null;
          shift_start_time: string | null;
          shift_end_time: string | null;
          client_id: string;
          clients?: { client_type: string, registration_number: string };
        }): AssignmentInfo => ({
          startDate: assignment.start_date,
          endDate: assignment.end_date,
          shiftType: assignment.shift_start_time && assignment.shift_end_time ? 
            determineShiftType(assignment.shift_start_time, assignment.shift_end_time) : 
            'day',
          clientId: assignment.client_id,
          clientType: assignment.clients?.client_type ?? '',
          registrationNumber: assignment.clients?.registration_number ?? ''
        }));
      }

      return {
        _id: nurse.nurse_id.toString(),
        firstName: nurse.first_name || '',
        lastName: nurse.last_name || '',
        email: nurse.email || '',
        phoneNumber: nurse.phone_number || '',
        experience: nurse.experience || 0,
        salaryPerHour: 0,
        salaryPerMonth: nurse.salary_per_month || 0,
        joiningDate: nurse.joining_date || null,
        admittedType: nurse.admitted_type || '',
        salaryCap: 0,
        gender: '',
        dob: '',
        status: nurseStatus,
        assignments: assignments,
        leaveInfo: leaveInfo,
        location: nurse.city || '',
        rating: 3,
        preferredLocations: [],
        reviews: []
      };
    });

    // Apply status filter if provided
    if (filterParams?.status) {
      allTransformedData = allTransformedData.filter(nurse => nurse.status === filterParams.status);
    }
    
    // Calculate pagination after filtering
    const totalCount = allTransformedData.length;
    const totalPages = Math.ceil(totalCount / pageSize);
    
    // Apply pagination slice
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const paginatedData = allTransformedData.slice(start, end);

    return { 
      data: paginatedData, 
      error: null,
      totalCount: totalCount,
      totalPages
    };
  } catch (error) {
    console.error('Error fetching nurses with assignments:', error);
    return { 
      data: null, 
      error: error instanceof Error ? error.message : 'Failed to fetch nurses with assignments' 
    };
  }
}
// export async function listNursesWithAssignments(
//   paginationParams?: { page: number; pageSize: number },
//   filterParams?: { status?: string; city?: string; admittedType?: string }
// ): Promise<{ 
//   data: Nurse[] | null, 
//   error: string | null,
//   totalCount?: number,
//   totalPages?: number
// }> {
//   try {
//     const supabase = await createSupabaseServerClient();

//     const { data: { session } } = await supabase.auth.getSession();
//     if (!session) {
//       return { data: null, error: 'Not authenticated' };
//     }

//     const page = paginationParams?.page || 1;
//     const pageSize = paginationParams?.pageSize || 25;
//     const start = (page - 1) * pageSize;
//     const end = start + pageSize - 1;

//     let nursesQuery = supabase
//       .from('nurses')
//       .select(`
//         nurse_id,
//         first_name,
//         last_name,
//         email,
//         phone_number,
//         experience,
//         service_type,
//         created_at,
//         status,
//         gender,
//         date_of_birth,
//         address,
//         city,
//         taluk,
//         state,
//         pin_code,
//         languages,
//         shift_pattern,
//         category,
//         marital_status,
//         religion,
//         mother_tongue,
//         admitted_type
//       `);

//     if (filterParams?.status) {
//       nursesQuery = nursesQuery.eq('status', filterParams.status);
//     }
//     if (filterParams?.city) {
//       nursesQuery = nursesQuery.eq('city', filterParams.city);
//     }
//     if (filterParams?.admittedType) {
//       nursesQuery = nursesQuery.eq('admitted_type', filterParams.admittedType);
//     }

//     const { count, error: countError } = await supabase
//       .from('nurses')
//       .select('*', { count: 'exact', head: true });
    
//     if (countError) throw countError;
//     const totalCount = count;

//     const { data: nursesData, error: nursesError } = await nursesQuery
//       .order('first_name')
//       .range(start, end);

//     if (nursesError) throw nursesError;

//     const nurseIds = nursesData.map(nurse => nurse.nurse_id);

//     const currentDate = new Date().toISOString().split('T')[0]; 

//     const { data: assignmentsData, error: assignmentsError } = await supabase
//       .from('nurse_client')
//       .select(`
//         id,
//         nurse_id,
//         client_id,
//         start_date,
//         end_date,
//         shift_start_time,
//         shift_end_time,
//         salary_hour,
//         clients(client_type)
//       `)
//       .in('nurse_id', nurseIds)
//       .or(`end_date.is.null,end_date.gte.${currentDate}`);

//     if (assignmentsError) throw assignmentsError;

//     const assignmentsByNurseId = new Map();
//     for (const assignment of assignmentsData) {
//       if (!assignmentsByNurseId.has(assignment.nurse_id)) {
//         assignmentsByNurseId.set(assignment.nurse_id, []);
//       }
//       assignmentsByNurseId.get(assignment.nurse_id).push(assignment);
//     }

//     const transformedData: Nurse[] = nursesData.map(nurse => {
//       const nurseAssignments = assignmentsByNurseId.get(nurse.nurse_id) || [];
      
//       let nurseStatus: Nurse['status'] = nurse.status || 'pending';
//       let assignment = null;
      
//       if (nurseAssignments.length > 0) {
//         nurseStatus = 'assigned';
//         const currentAssignment = nurseAssignments[0]; 
        
//         assignment = {
//           startDate: currentAssignment.start_date,
//           endDate: currentAssignment.end_date,
//           shiftType: currentAssignment.shift_start_time && currentAssignment.shift_end_time ? 
//             determineShiftType(currentAssignment.shift_start_time, currentAssignment.shift_end_time) : 
//             'day',
//           clientId: currentAssignment.client_id,
//           clientType: currentAssignment.clients?.client_type
//         };
//       }

//       return {
//         _id: nurse.nurse_id.toString(),
//         firstName: nurse.first_name || '',
//         lastName: nurse.last_name || '',
//         email: nurse.email || '',
//         phoneNumber: nurse.phone_number || '',
//         gender: nurse.gender || '',
//         dateOfBirth: nurse.date_of_birth || '',
//         address: nurse.address || '',
//         city: nurse.city || '',
//         state: nurse.state || '',
//         pinCode: nurse.pin_code?.toString() || '',
//         languages: nurse.languages || [],
//         experience: nurse.experience || 0,
//         salaryCap: 0,
//         salaryPerHour: 0,
//         status: nurseStatus,
//         assignment: assignment,
//         location: nurse.city || '',
//         dob: nurse.date_of_birth || '',
//         preferredLocations: [],
//         hiringDate: nurse.created_at,
//         rating: 3,
//         reviews: [],
//         serviceType: nurse.service_type || '',
//         shiftPattern: nurse.shift_pattern || '',
//         category: nurse.category || '',
//         maritalStatus: nurse.marital_status || '',
//         religion: nurse.religion || '',
//         motherTongue: nurse.mother_tongue || '',
//         taluk: nurse.taluk || ''
//       };
//     });

//     const totalPages = Math.ceil((totalCount || 0) / pageSize);

//     return { 
//       data: transformedData, 
//       error: null,
//       totalCount: totalCount || 0,
//       totalPages
//     };
//   } catch (error) {
//     console.error('Error fetching nurses with assignments:', error);
//     return { 
//       data: null, 
//       error: error instanceof Error ? error.message : 'Failed to fetch nurses with assignments' 
//     };
//   }
// }

function determineShiftType(startTime: string, endTime: string): 'day' | 'night' | '24h' {
  const startHour = parseInt(startTime.split(':')[0]);
  const endHour = parseInt(endTime.split(':')[0]);
  
  if (endHour - startHour >= 12 || (startHour > endHour && startHour - endHour <= 12)) {
    return '24h';
  } else if (startHour >= 6 && startHour < 18) {
    return 'day';
  } else {
    return 'night';
  }
}