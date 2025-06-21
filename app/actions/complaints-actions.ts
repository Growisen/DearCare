"use server"

import { createSupabaseServerClient } from './auth'
import { Complaint, ComplaintStatus, ComplaintSource, StatusHistoryEntry } from '@/types/complaint.types'

function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}


async function getAuthenticatedClient() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  const userId = user?.id;
  
  if (!userId) {
    throw new Error("User not authenticated");
  }

  const web_user_id = user.user_metadata.user_id
  
  return { supabase, userId: web_user_id };
}

export async function fetchComplaints(
  page: number = 1,
  pageSize: number = 10,
  status?: ComplaintStatus | 'all',
  source?: ComplaintSource | 'all',
  searchQuery?: string
): Promise<{
    success: boolean;
    data?: Complaint[];
    pagination?: {
      totalCount: number;
      currentPage: number;
      pageSize: number;
      totalPages: number;
    };
    error?: string;
  }> {
    try {
      const { supabase } = await getAuthenticatedClient();
      
      // Build base query
      let query = supabase.from('dearcare_complaints').select('*', { count: 'exact' });
      
      // Apply filters
      if (status && status !== 'all') {
        query = query.eq('status', status);
      }
      
      if (source && source !== 'all') {
        query = query.eq('source', source);
      }
      
      if (searchQuery && searchQuery.trim() !== '') {
        const searchTerm = `%${searchQuery.toLowerCase().trim()}%`;
        query = query.or(`title.ilike.${searchTerm},description.ilike.${searchTerm}`);
      }
      
      // Get paginated data and count in a single query
      const { data: complaintsData, count, error: complaintsError } = await query
        .order('submission_date', { ascending: false })
        .range((page - 1) * pageSize, (page * pageSize) - 1);
        
      if (complaintsError) {
        throw new Error(complaintsError.message);
      }
      
      // Batch fetch submitter information
      const clientIds = complaintsData
        .filter(record => record.source === 'client' && record.submitter_id)
        .map(record => record.submitter_id);
        
      const nurseIds = complaintsData
        .filter(record => record.source === 'nurse' && record.submitter_id)
        .map(record => record.submitter_id);
      
      // Get all client types in a single query if needed
      const clientTypesMap = new Map();
      if (clientIds.length > 0) {
        const { data: clientsData } = await supabase
          .from('clients')
          .select('id, client_type')
          .in('id', clientIds);
          
        if (clientsData) {
          clientsData.forEach(client => {
            clientTypesMap.set(client.id, client.client_type);
          });
        }
      }
      
      // Get all individual clients in a single query
      const individualClientsMap = new Map();
      const individualClientIds = [...clientTypesMap.entries()]
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        .filter(([id, type]) => type === 'individual')
        .map(([id]) => id);
        
      if (individualClientIds.length > 0) {
        const { data: individualData } = await supabase
          .from('individual_clients')
          .select('client_id, requestor_name')
          .in('client_id', individualClientIds);
          
        if (individualData) {
          individualData.forEach(client => {
            individualClientsMap.set(client.client_id, client.requestor_name);
          });
        }
      }
      
      // Get all organization clients in a single query
      const orgClientsMap = new Map();
      const orgClientIds = [...clientTypesMap.entries()]
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        .filter(([id, type]) => type === 'organization')
        .map(([id]) => id);
        
      if (orgClientIds.length > 0) {
        const { data: orgData } = await supabase
          .from('organization_clients')
          .select('client_id, organization_name')
          .in('client_id', orgClientIds);
          
        if (orgData) {
          orgData.forEach(org => {
            orgClientsMap.set(org.client_id, org.organization_name);
          });
        }
      }
      
      // Get all nurses in a single query
      const nursesMap = new Map();
      if (nurseIds.length > 0) {
        const { data: nursesData } = await supabase
          .from('nurses')
          .select('nurse_id, first_name, last_name')
          .in('nurse_id', nurseIds);
          
        if (nursesData) {
          nursesData.forEach(nurse => {
            nursesMap.set(nurse.nurse_id, `${nurse.first_name} ${nurse.last_name}`);
          });
        }
      }
      
      // Process complaints with the batch-loaded data
      const complaints: Complaint[] = complaintsData.map(record => {
        let submitterName = '';
        
        if (record.submitter_id) {
          if (record.source === 'client') {
            const clientType = clientTypesMap.get(record.submitter_id);
            if (clientType === 'individual') {
              submitterName = individualClientsMap.get(record.submitter_id) || '';
            } else if (clientType === 'organization') {
              submitterName = orgClientsMap.get(record.submitter_id) || '';
            }
          } else if (record.source === 'nurse') {
            submitterName = nursesMap.get(record.submitter_id) || '';
          }
        }
        
        return {
          id: record.id,
          title: record.title,
          description: record.description,
          status: record.status as ComplaintStatus,
          submitterName: submitterName,
          submissionDate: formatDate(record.submission_date),
          source: record.source as ComplaintSource,
          lastUpdated: formatDate(record.last_updated),
          submitterId: record.submitter_id
        };
      });
      
      return { 
        success: true, 
        data: complaints,
        pagination: {
          totalCount: count || 0,
          currentPage: page,
          pageSize: pageSize,
          totalPages: Math.ceil((count || 0) / pageSize)
        }
      };
    } catch (error) {
      console.error('Error fetching complaints:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An unknown error occurred'
      };
    }
}

export async function exportComplaintsToCSV(): Promise<{
  success: boolean;
  data?: string;
  error?: string;
}> {
  try {
    const { supabase } = await getAuthenticatedClient();
    
    const { data, error } = await supabase
      .from('dearcare_complaints')
      .select('*')
      .order('submission_date', { ascending: false });
      
    if (error) {
      throw new Error(error.message);
    }
    
    // Convert data to CSV format
    const headers = [
      'ID', 
      'Title', 
      'Description', 
      'Status', 
      'Submitter Name', 
      'Submission Date', 
      'Source', 
      'Last Updated'
    ];
    
    const csvRows = [
      headers.join(','),
      ...data.map(row => [
        row.id,
        `"${row.title.replace(/"/g, '""')}"`, // Escape quotes in CSV
        `"${row.description.replace(/"/g, '""')}"`,
        row.status,
        `"${row.submitter_name?.replace(/"/g, '""') || ''}"`,
        formatDate(row.submission_date),
        row.source,
        formatDate(row.last_updated)
      ].join(','))
    ];
    
    const csvString = csvRows.join('\n');
    
    return { 
      success: true, 
      data: csvString 
    };
  } catch (error) {
    console.error('Error exporting complaints:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unknown error occurred'
    };
  }
}


export async function fetchComplaintById(complaintId: string): Promise<{
  success: boolean;
  data?: Complaint;
  error?: string;
}> {
  try {
    const { supabase } = await getAuthenticatedClient();
    
    // Fetch the complaint
    const { data: complaint, error: complaintError } = await supabase
      .from('dearcare_complaints')
      .select('*')
      .eq('id', complaintId)
      .single();
      
    if (complaintError) {
      throw new Error(complaintError.message);
    }
    
    if (!complaint) {
      return {
        success: false,
        error: "Complaint not found"
      };
    }

    // Fetch submitter information based on the source
    let submitterInfo = null;
    
    if (complaint.submitter_id) {
      if (complaint.source === 'client') {
        const { data: clientTypeData } = await supabase
          .from('clients')
          .select('client_type')
          .eq('id', complaint.submitter_id)
          .single();
          
        if (clientTypeData) {
          if (clientTypeData.client_type === 'individual') {
            const { data: individualData } = await supabase
              .from('individual_clients')
              .select('*')
              .eq('client_id', complaint.submitter_id)
              .single();
              
            if (individualData) {
              submitterInfo = {
                id: complaint.submitter_id,
                name: individualData.requestor_name,
                type: 'individual',
                email: individualData.requestor_email,
                phone: individualData.requestor_phone,
              };
            }
          } else if (clientTypeData.client_type === 'organization') {
            const { data: orgData } = await supabase
              .from('organization_clients')
              .select('*')
              .eq('client_id', complaint.submitter_id)
              .single();
              
            if (orgData) {
              submitterInfo = {
                id: complaint.submitter_id,
                name: orgData.organization_name,
                type: 'organization',
                email: orgData.contact_email,
                phone: orgData.contact_phone
              };
            }
          }
        }
      } else if (complaint.source === 'nurse') {
        const { data: nurseData } = await supabase
          .from('nurses')
          .select('*')
          .eq('nurse_id', complaint.submitter_id)
          .single();
          
        if (nurseData) {
          submitterInfo = {
            id: complaint.submitter_id,
            name: `${nurseData.first_name} ${nurseData.last_name}`,
            type: 'nurse',
            email: nurseData.email,
            phone: nurseData.phone_number
          };
        }
      }
    }
    
    const commentsData = complaint.comments || [];

    interface MediaFile {
      url: string;
      name: string;
      type: string;
    }
    
    let supportingMedia = [];
    if (complaint.media_files && Array.isArray(complaint.media_files)) {
      supportingMedia = complaint.media_files.map((file: MediaFile) => ({
        id: file.url ? file.url.split('/').pop() || '' : '',
        url: file.url || '',
        fileName: file.name || '',
        fileType: file.type || '',
      }));
    }
    
    let resolutionDetails = null;
    let statusHistory = [];

    const { data: resolutionData } = await supabase
      .from('dearcare_complaint_resolutions')
      .select('*')
      .eq('complaint_id', complaintId)
      .single();
        
    if (resolutionData) {
      let resolverInfo = null;
      
      if (resolutionData.resolved_by) {
        const { data: resolverData } = await supabase
          .from('dearcare_web_users')
          .select('full_name, role')
          .eq('id', resolutionData.resolved_by)
          .single();
          
        if (resolverData) {
          resolverInfo = {
            id: resolutionData.resolved_by,
            name: resolverData.full_name,
            role: resolverData.role
          };
        }
      }
      
      resolutionDetails = {
        resolvedBy: resolverInfo || resolutionData.resolved_by || "",
        resolutionDate: formatDate(resolutionData.resolution_date) || "",
        resolutionNotes: resolutionData.resolution_notes || "",
      };
      
      statusHistory = Array.isArray(resolutionData.status_history) 
        ? resolutionData.status_history 
        : [];
    }
    
    
    const complaintData: Complaint = {
      id: complaint.id,
      title: complaint.title,
      description: complaint.description,
      status: complaint.status,
      submissionDate: formatDate(complaint.submission_date),
      lastUpdated: formatDate(complaint.last_updated),
      source: complaint.source,
      submitter: submitterInfo,
      comments: commentsData,
      supportingMedia: supportingMedia,
      resolution: resolutionDetails,
      statusHistory,
      reportedId: complaint.reported_id
    };

    
    return {
      success: true,
      data: complaintData
    };
  } catch (error) {
    console.error('Error fetching complaint details:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unknown error occurred'
    };
  }
}


export async function updateComplaintStatus(
  complaintId: string,
  status: ComplaintStatus,
  resolutionNotes?: string
): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const { supabase, userId } = await getAuthenticatedClient();
    
    const now = new Date().toISOString();
    
    const { error: fetchError } = await supabase
      .from('dearcare_complaints')
      .select('status')
      .eq('id', complaintId)
      .single();
      
    if (fetchError) {
      throw new Error(`Failed to fetch current complaint status: ${fetchError.message}`);
    }
    
    const statusHistoryEntry: StatusHistoryEntry = {
      status: status,
      timestamp: now,
      changed_by: userId,
      notes: resolutionNotes || undefined
    };
    
    const { error: updateError } = await supabase
      .from('dearcare_complaints')
      .update({
        status: status,
      })
      .eq('id', complaintId);
      
    if (updateError) {
      throw new Error(`Failed to update complaint status: ${updateError.message}`);
    }
    
    const { data: existingResolution, error: checkError } = await supabase
      .from('dearcare_complaint_resolutions')
      .select('id, status_history')
      .eq('complaint_id', complaintId)
      .maybeSingle();
    
    if (checkError) {
      console.warn(`Error checking for existing resolution: ${checkError.message}`);
    }
    
    let statusHistory;
    if (existingResolution && existingResolution.status_history && 
        Array.isArray(existingResolution.status_history)) {
      statusHistory = [...existingResolution.status_history, statusHistoryEntry];
    } else {
      statusHistory = [statusHistoryEntry];
    }
    
    if (existingResolution) {
      const { error: resolutionError } = await supabase
        .from('dearcare_complaint_resolutions')
        .update({
          status_history: statusHistory,
          resolution_notes: status === 'resolved' ? (resolutionNotes || '') : undefined,
          resolution_date: status === 'resolved' ? now : undefined,
          resolved_by: status === 'resolved' ? userId : undefined
        })
        .eq('id', existingResolution.id);
        
      if (resolutionError) {
        throw new Error(`Failed to update resolution details: ${resolutionError.message}`);
      }
    } else {
      const { error: resolutionError } = await supabase
        .from('dearcare_complaint_resolutions')
        .insert({
          complaint_id: complaintId,
          status_history: statusHistory,
          resolution_notes: status === 'resolved' ? (resolutionNotes || '') : '',
          resolution_date: status === 'resolved' ? now : null,
          resolved_by: status === 'resolved' ? userId : null
        });
        
      if (resolutionError) {
        throw new Error(`Failed to add resolution details: ${resolutionError.message}`);
      }
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error updating complaint status:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unknown error occurred'
    };
  }
}


export async function getProfileUrl(
  id: string | number,
  entityType?: 'client' | 'nurse' | 'organization' | string
): Promise<{
  success: boolean;
  url?: string;
  error?: string;
}> {
  try {
    const { supabase } = await getAuthenticatedClient();

    // If entityType is not provided, determine it from available data
    if (!entityType) {
      // First check if it's a nurse
      const { data: nurse, error: nurseError } = await supabase
        .from('nurses')
        .select('nurse_id')
        .eq('nurse_id', id)
        .maybeSingle();

      if (!nurseError && nurse) {
        entityType = 'nurse';
      } else {
        // Check if it's a client
        const { data: client, error: clientError } = await supabase
          .from('clients')
          .select('id, client_type')
          .eq('id', id)
          .maybeSingle();

        if (!clientError && client) {
          entityType = client.client_type === 'organization' ? 'organization' : 'client';
        }
      }
    }

    // Generate URL based on entity type
    let url = '';
    switch (entityType) {
      case 'nurse':
        url = `/nurses/${id}`;
        break;
      case 'organization':
        url = `/client-profile/organization-client/${id}`;
        break;
      case 'client':
      case 'individual':
        url = `/client-profile/${id}`;
        break;
      default:
        return {
          success: false,
          error: 'Unable to determine profile type'
        };
    }

    return {
      success: true,
      url
    };
  } catch (error) {
    console.error('Error generating profile URL:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unknown error occurred'
    };
  }
}