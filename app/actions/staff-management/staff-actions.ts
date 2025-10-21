"use server"

import { createSupabaseServerClient } from '@/app/actions/authentication/auth'
import { revalidatePath } from 'next/cache';
import { v4 as uuidv4 } from 'uuid';
import { StaffRole, StaffOrganization } from '@/types/dearCareStaff.types';
import { SupabaseClient } from '@supabase/supabase-js';
import { getOrgMappings } from '@/app/utils/org-utils';

/**
 * Uploads a profile picture to Supabase storage
 */

async function generateStaffRegNo(
  supabase: SupabaseClient, 
  admittedType: 'Tata HomeNursing' | 'DearCare LLP'
): Promise<string> {
  const currentYear = new Date().getFullYear();
  const prefix = admittedType === 'Tata HomeNursing' ? 'STATH' : 'STADC';
  
  // Get current timestamp in milliseconds and take last 4 digits
  const timestamp = new Date().getTime();
  const uniqueSequence = String(timestamp % 10000).padStart(4, '0');
  
  // Format: PREFIX + YEAR + TIMESTAMP_SEQUENCE
  const staffRegNo = `${prefix}${currentYear}${uniqueSequence}`;

  // Verify uniqueness
  const { data: existingStaff } = await supabase
    .from('dearcare_staff')
    .select('reg_no')
    .eq('reg_no', staffRegNo)
    .single();

  // If a collision occurs (extremely rare), try again with new timestamp
  if (existingStaff) {
    return generateStaffRegNo(supabase, admittedType);
  }

  return staffRegNo;
}

async function uploadProfilePicture(file: File, staffId: string): Promise<string | null> {
  try {
    if (!file) return null;
    
    const supabase = await createSupabaseServerClient();
    
    const fileArrayBuffer = await file.arrayBuffer();
    const fileBlob = new Blob([fileArrayBuffer], { type: file.type });
    
    const fileExt = file.name.split('.').pop();
    const fileName = `Staff/ProfilePictures/${staffId}/${uuidv4()}.${fileExt}`;
    
    const { data, error } = await supabase.storage
      .from('DearCare')
      .upload(fileName, fileBlob, {
        contentType: file.type,
        cacheControl: '3600'
      });
    
    if (error) {
      console.error(`Error uploading staff profile picture:`, error);
      return null;
    }
    
    return data.path;
  } catch (error) {
    console.error(`Error in uploadProfilePicture:`, error);
    return null;
  }
}

/**
 * Retrieves the public URL for a stored file path
 */
export async function getStorageUrl(path: string | null): Promise<string | null> {
  if (!path) return null;
  
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { publicUrl } } = supabase
      .storage
      .from('DearCare')
      .getPublicUrl(path);
      
    return publicUrl;
  } catch (error) {
    console.error('Error generating storage URL:', error);
    return null;
  }
}

/**
 * Interface for staff form data
 */
export interface StaffFormData {
  name: string;
  email: string;
  phone: string;
  organization: StaffOrganization;
  role: StaffRole;
  profilePic?: File;
  joinDate?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  district: string;
  state: string;
  pincode: string;
  certifications?: string[];
  skills?: string[];
}

/**
 * Adds a new staff member to the database
 */
export async function createStaff(formData: StaffFormData) {
  try {
    const supabase = await createSupabaseServerClient();
    const staffid=await generateStaffRegNo(supabase, formData.organization);
    const { data: existingStaff, error: checkError } = await supabase
      .from('dearcare_staff')
      .select('id')
      .eq('email', formData.email)
      .maybeSingle();
    
    if (checkError && checkError.code !== 'PGRST116') {
      throw new Error(`Failed to check existing staff: ${checkError.message}`);
    }
    
    if (existingStaff) {
      return { success: false, error: 'A staff member with this email already exists' };
    }
    
    const newStaff = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      role: formData.role,
      join_date: formData.joinDate || new Date().toISOString().split('T')[0],
      address_line1: formData.addressLine1,
      address_line2: formData.addressLine2 || null,
      city: formData.city,
      district: formData.district,
      state: formData.state,
      pincode: formData.pincode,
      organization: formData.organization,
      reg_no: staffid
    };
    
    const { data: staffData, error: staffError } = await supabase
      .from('dearcare_staff')
      .insert(newStaff)
      .select()
      .single();
    
    if (staffError) {
      throw new Error(`Failed to create staff: ${staffError.message}`);
    }
    
    let profilePicPath: string | null = null;
    
    if (formData.profilePic) {
      profilePicPath = await uploadProfilePicture(
        formData.profilePic, 
        staffData.id
      );
      
      if (profilePicPath) {
        await supabase
          .from('dearcare_staff')
          .update({ profile_image: profilePicPath })
          .eq('id', staffData.id);
      }
    }
    
    revalidatePath('/staff');
    return { success: true, id: staffData.id };
    
  } catch (error: unknown) {
    console.error('Error adding staff:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'An unknown error occurred' 
    };
  }
}

/**
 * Gets all staff members with optional filtering
 */
export async function getStaff(
  category?: StaffOrganization | 'all',
  searchQuery?: string,
  page: number = 1,
  pageSize: number = 10
) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    const organization = user?.user_metadata?.organization;

    const { clientsOrg } = getOrgMappings(organization);

    let query = supabase
      .from('dearcare_staff')
      .select('*', { count: 'exact' });
    
    if (clientsOrg) {
      query = query.eq('organization', clientsOrg);
    }
    
    if (searchQuery && searchQuery.trim() !== '') {
      const searchTerm = searchQuery.toLowerCase().trim();
      
      query = query.or(`name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%`);
    }
    
    const { count, error: countError } = await query;
    
    if (countError) {
      console.error("Error counting staff:", countError);
      return { success: false, error: countError.message };
    }
    
    const { data, error } = await query
      .range((page - 1) * pageSize, (page * pageSize) - 1)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error("Error fetching staff:", error);
      return { success: false, error: error.message };
    }
    
    const staff = data.map(record => ({
      id: record.id,
      registrationNumber: record.reg_no,
      name: record.name,
      email: record.email,
      phone: record.phone,
      role: record.role,
      joinDate: record.join_date,
      organization: record.organization,
      status: record.status || 'active',
      profileImage: record.profile_image ? getStorageUrl(record.profile_image) : null,
      address: {
        line1: record.address_line1,
        line2: record.address_line2,
        city: record.city,
        district: record.district,
        state: record.state,
        pincode: record.pincode
      }
    }));
    
    return { 
      success: true, 
      staff,
      pagination: {
        totalCount: count || 0,
        currentPage: page,
        pageSize: pageSize,
        totalPages: Math.ceil((count || 0) / pageSize)
      }
    };
    
  } catch (error: unknown) {
    console.error('Error fetching staff:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'An unknown error occurred', 
      staff: [] 
    };
  }
}

/**
 * Gets a specific staff member by ID
 */
export async function getStaffById(staffId: string) {
  try {
    const supabase = await createSupabaseServerClient();
    
    const { data: staff, error } = await supabase
      .from('dearcare_staff')
      .select(`
        *
      `)
      .eq('id', staffId)
      .single();
    
    if (error) {
      return { success: false, error: error.message };
    }
    
    if (!staff) {
      return { success: false, error: 'Staff member not found' };
    }
    
    const profileImageUrl = staff.profile_image ? 
      await getStorageUrl(staff.profile_image) : null;
    
    return { 
      success: true, 
      staff: {
        ...staff,
        profileImageUrl
      } 
    };
    
  } catch (error: unknown) {
    console.error('Error fetching staff details:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'An unknown error occurred' 
    };
  }
}

/**
 * Updates a staff member's status
 */
export async function updateStaffStatus(
  staffId: string,
  newStatus: 'active' | 'inactive' | 'on_leave'
) {
  try {
    const supabase = await createSupabaseServerClient();
    
    const { data, error } = await supabase
      .from('dearcare_staff')
      .update({ status: newStatus })
      .eq('id', staffId)
      .select()
      .single();
    
    if (error) {
      return { success: false, error: error.message };
    }
    
    revalidatePath('/staff');
    return { success: true, staff: data };
    
  } catch (error: unknown) {
    console.error('Error updating staff status:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'An unknown error occurred' 
    };
  }
}

/**
 * Deletes a staff member
 */
export async function deleteStaff(staffId: string) {
  try {
    const supabase = await createSupabaseServerClient();
    
    const deleteOperations = [];
    
    deleteOperations.push(
      supabase
        .from('staff_certifications')
        .delete()
        .eq('staff_id', staffId)
    );
    
    deleteOperations.push(
      supabase
        .from('staff_skills')
        .delete()
        .eq('staff_id', staffId)
    );
    
    await Promise.all(deleteOperations);
    
    const { error } = await supabase
      .from('dearcare_staff')
      .delete()
      .eq('id', staffId);
    
    if (error) {
      return { success: false, error: error.message };
    }
    
    revalidatePath('/staff');
    return { success: true };
    
  } catch (error: unknown) {
    console.error('Error deleting staff:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'An unknown error occurred' 
    };
  }
}

/**
 * Export all staff without pagination - for data export
 */
export async function exportStaff(
  role?: StaffRole | 'all',
  searchQuery?: string
) {
  try {
    const supabase = await createSupabaseServerClient();
    
    let query = supabase
      .from('dearcare_staff')
      .select(`
        id,
        name,
        email,
        phone,
        role,
        join_date,
        address_line1,
        address_line2,
        city,
        district,
        state,
        pincode,
        created_at,
        updated_at,
        status
      `);
    
    if (role && role !== "all") {
      query = query.eq('role', role);
    }
    
    if (searchQuery && searchQuery.trim() !== '') {
      const searchTerm = searchQuery.toLowerCase().trim();
      query = query.or(`name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%`);
    }
    
    const { data, error } = await query.order('created_at', { ascending: false });
    
    if (error) {
      console.error("Error exporting staff:", error);
      return { success: false, error: error.message };
    }
    
    return { 
      success: true, 
      data: data || []
    };
    
  } catch (error: unknown) {
    console.error('Error exporting staff:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'An unknown error occurred',
      data: [] 
    };
  }
}

/**
 * Interface for staff update data
 */
export interface StaffUpdateData {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: StaffRole;
  joinDate?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  district: string;
  state: string;
  pincode: string;
  profilePic?: File;
}

/**
 * Updates an existing staff member
 */
export async function updateStaff(formData: StaffUpdateData) {
  try {
    const supabase = await createSupabaseServerClient();
    
    // Check if a staff with the same email already exists (and it's not this staff member)
    const { data: existingStaff, error: checkError } = await supabase
      .from('dearcare_staff')
      .select('id')
      .eq('email', formData.email)
      .neq('id', formData.id)
      .maybeSingle();
    
    if (checkError && checkError.code !== 'PGRST116') {
      throw new Error(`Failed to check existing staff: ${checkError.message}`);
    }
    
    if (existingStaff) {
      return { success: false, error: 'Another staff member with this email already exists' };
    }
    
    // Prepare staff update data
    const staffUpdate = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      role: formData.role,
      join_date: formData.joinDate || new Date().toISOString().split('T')[0],
      address_line1: formData.addressLine1,
      address_line2: formData.addressLine2 || null,
      city: formData.city,
      district: formData.district,
      state: formData.state,
      pincode: formData.pincode
    };
    
    // Update the staff record
    const { data: updatedStaff, error: updateError } = await supabase
      .from('dearcare_staff')
      .update(staffUpdate)
      .eq('id', formData.id)
      .select()
      .single();
    
    if (updateError) {
      throw new Error(`Failed to update staff: ${updateError.message}`);
    }
    
    // Upload new profile picture if provided
    if (formData.profilePic) {
      const profilePicPath = await uploadProfilePicture(
        formData.profilePic, 
        formData.id
      );
      
      if (profilePicPath) {
        await supabase
          .from('dearcare_staff')
          .update({ profile_image: profilePicPath })
          .eq('id', formData.id);
      }
    }
    
    revalidatePath('/staff');
    return { success: true, staff: updatedStaff };
    
  } catch (error: unknown) {
    console.error('Error updating staff:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'An unknown error occurred' 
    };
  }
}