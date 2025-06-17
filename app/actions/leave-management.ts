"use server"

import { createSupabaseServerClient } from './auth'
import { revalidatePath } from 'next/cache'
import { formatDate } from '@/utils/formatters'

export type LeaveRequest = {
  id: string
  nurseName: string
  nurseId: string
  leaveType: string
  leaveMode: string
  startDate: string
  endDate: string
  days: number
  reason: string
  status: 'pending' | 'approved' | 'rejected'
  appliedOn: string
  rejectionReason?: string
}


/**
 * Fetches all leave requests for admin view
 */
export async function getLeaveRequests(
  status?: 'pending' | 'approved' | 'rejected' | null,
  searchQuery?: string,
  startDate?: string | null,
  endDate?: string | null,
  page: number = 1,
  pageSize: number = 10
) {
  try {
    const supabase = await createSupabaseServerClient()
    
    let baseQuery = supabase
      .from('nurse_leave_requests')
      .select(`
        id,
        nurse_id,
        leave_type,
        leave_mode,
        start_date,
        end_date,
        days,
        reason,
        status,
        rejection_reason,
        applied_on
      `)
    
    if (status) {
      baseQuery = baseQuery.eq('status', status)
    }
    
    if (startDate) {
      baseQuery = baseQuery.gte('applied_on', startDate)
    }
    
    if (endDate) {
      baseQuery = baseQuery.lte('applied_on', endDate)
    }
    
    let countQuery = supabase
      .from('nurse_leave_requests')
      .select('*', { count: 'exact', head: true })
    
    if (status) {
      countQuery = countQuery.eq('status', status)
    }
    if (startDate) {
      countQuery = countQuery.gte('applied_on', startDate)
    }
    if (endDate) {
      countQuery = countQuery.lte('applied_on', endDate)
    }
    
    const { count, error: countError } = await countQuery
    
    if (countError) {
      console.error('Error counting leave requests:', countError)
      return { success: false, error: countError.message, leaveRequests: [], totalCount: 0 }
    }
    
    const query = baseQuery
      .order('applied_on', { ascending: false })
      .range((page - 1) * pageSize, page * pageSize - 1)
    
    const { data: leaveData, error: leaveError } = await query
    
    if (leaveError) {
      console.error('Error fetching leave requests:', leaveError)
      return { success: false, error: leaveError.message, leaveRequests: [], totalCount: 0 }
    }

    if (!leaveData || leaveData.length === 0) {
      return { success: true, leaveRequests: [], totalCount: count || 0 }
    }
    
    const nurseIds = [...new Set(leaveData.map(item => item.nurse_id))]
    
    const { data: nursesData, error: nursesError } = await supabase
      .from('nurses')
      .select('nurse_id, first_name, last_name')
      .in('nurse_id', nurseIds)
    
    if (nursesError) {
      console.error('Error fetching nurses:', nursesError)
    }
    
    const nurseMap = new Map()
    if (nursesData) {
      nursesData.forEach(nurse => {
        nurseMap.set(nurse.nurse_id, 
          `${nurse.first_name || ''} ${nurse.last_name || ''}`.trim())
      })
    }
    
    const leaveRequests: LeaveRequest[] = leaveData.map(item => ({
      id: item.id,
      nurseId: String(item.nurse_id),
      nurseName: nurseMap.get(item.nurse_id) || 'Unknown',
      leaveType: formatLeaveType(item.leave_type),
      leaveMode: formatLeaveMode(item.leave_mode),
      startDate: item.start_date,
      endDate: item.end_date,
      days: item.days,
      reason: item.reason || '',
      status: item.status,
      appliedOn: item.applied_on,
      rejectionReason: item.rejection_reason
    }))
    
    const filteredRequests = searchQuery ? 
      leaveRequests.filter(request => 
        request.nurseName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        request.nurseId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        request.leaveType.toLowerCase().includes(searchQuery.toLowerCase())
      ) : 
      leaveRequests
    
    return { 
      success: true, 
      leaveRequests: filteredRequests,
      totalCount: count
    }
  } catch (error: unknown) {
    console.error('Error in getLeaveRequests:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'An unknown error occurred',
      leaveRequests: [],
      totalCount: 0
    }
  }
}


/**
 * Updates the status of a leave request
 */
export async function updateLeaveRequestStatus(
  requestId: string, 
  newStatus: 'approved' | 'rejected',
  rejectionReason?: string
) {
  try {
    const supabase = await createSupabaseServerClient()
    
    const updateData: { 
      status: 'approved' | 'rejected',
      rejection_reason?: string 
    } = { 
      status: newStatus 
    }
    
    if (newStatus === 'rejected' && rejectionReason) {
      updateData.rejection_reason = rejectionReason
    }
    
    // Update the leave request status
    const { error } = await supabase
      .from('nurse_leave_requests')
      .update(updateData)
      .eq('id', requestId)
    
    if (error) {
      throw new Error(`Failed to update leave request: ${error.message}`)
    }
    
    revalidatePath('/leave-requests')
    
    return { success: true }
  } catch (error: unknown) {
    console.error('Error updating leave request status:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'An unknown error occurred'
    }
  }
}

/**
 * Exports leave requests as CSV data based on filters
 */
export async function exportLeaveRequests(
  status?: 'pending' | 'approved' | 'rejected' | null,
  searchQuery?: string,
  startDate?: string | null,
  endDate?: string | null
) {
  try {
    const supabase = await createSupabaseServerClient()
    
    let query = supabase
      .from('nurse_leave_requests')
      .select(`
        id,
        nurse_id,
        leave_type,
        leave_mode,
        start_date,
        end_date,
        days,
        reason,
        status,
        rejection_reason,
        applied_on
      `)
      .order('applied_on', { ascending: false })
    
    if (status) {
      query = query.eq('status', status)
    }
    
    if (startDate) {
      query = query.gte('applied_on', startDate)
    }
    
    if (endDate) {
      query = query.lte('applied_on', endDate)
    }
    
    const { data: leaveData, error: leaveError } = await query
    
    if (leaveError) {
      console.error('Error fetching leave requests for export:', leaveError)
      return { success: false, error: leaveError.message }
    }

    if (!leaveData || leaveData.length === 0) {
      return { success: true, csvData: '', message: 'No data to export' }
    }
    
    const nurseIds = [...new Set(leaveData.map(item => item.nurse_id))]
    
    const { data: nursesData, error: nursesError } = await supabase
      .from('nurses')
      .select('nurse_id, first_name, last_name')
      .in('nurse_id', nurseIds)
    
    if (nursesError) {
      console.error('Error fetching nurses for export:', nursesError)
    }
    
    const nurseMap = new Map()
    if (nursesData) {
      nursesData.forEach(nurse => {
        nurseMap.set(nurse.nurse_id, 
          `${nurse.first_name || ''} ${nurse.last_name || ''}`.trim())
      })
    }
    
    // Transform the data
    const leaveRequests = leaveData.map(item => ({
      id: item.id,
      nurseId: String(item.nurse_id),
      nurseName: nurseMap.get(item.nurse_id) || 'Unknown',
      leaveType: formatLeaveType(item.leave_type),
      leaveMode: formatLeaveMode(item.leave_mode),
      startDate: item.start_date,
      endDate: item.end_date,
      days: item.days,
      reason: item.reason || '',
      status: item.status,
      appliedOn: item.applied_on,
      rejectionReason: item.rejection_reason || ''
    }))
    
    // Filter by search query if provided
    const filteredRequests = searchQuery ? 
      leaveRequests.filter(request => 
        request.nurseName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        request.nurseId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        request.leaveType.toLowerCase().includes(searchQuery.toLowerCase())
      ) : 
      leaveRequests
    
    // Generate CSV content
    const headers = [
      'Nurse ID', 
      'Nurse Name', 
      'Leave Type', 
      'Leave Mode', 
      'Start Date', 
      'End Date', 
      'Days', 
      'Reason', 
      'Status', 
      'Applied On', 
      'Rejection Reason'
    ]
    
    const csvRows = [
      headers.join(','),
      ...filteredRequests.map(row => [
        row.nurseId,
        `"${row.nurseName}"`, // Quotes to handle names with commas
        formatLeaveType(`"${row.leaveType}"`),
        formatLeaveMode(`"${row.leaveMode}"`),
        formatDate(row.startDate),
        formatDate(row.endDate),
        row.days,
        `"${row.reason.replace(/"/g, '""')}"`, // Escape quotes in CSV
        row.status,
        formatDate(row.appliedOn),
        `"${row.rejectionReason?.replace(/"/g, '""') || ''}"`
      ].join(','))
    ]
    
    const csvData = csvRows.join('\n')
    
    return { 
      success: true, 
      csvData,
      recordCount: filteredRequests.length
    }
  } catch (error: unknown) {
    console.error('Error in exportLeaveRequests:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'An unknown error occurred'
    }
  }
}

// Helper functions to format enum values for display
function formatLeaveType(type: string): string {
  const mapping: Record<string, string> = {
    'sick': 'Sick Leave',
    'annual': 'Annual Leave',
    'personal': 'Personal Leave',
    'casual': 'Casual Leave',
    'maternity': 'Maternity Leave',
    'paternity': 'Paternity Leave',
    'unpaid': 'Unpaid Leave'
  }
  return mapping[type] || type
}

function formatLeaveMode(mode: string): string {
  const mapping: Record<string, string> = {
    'full_day': 'Full Day',
    'half_day_morning': 'Half Day (Morning)',
    'half_day_afternoon': 'Half Day (Afternoon)'
  }
  return mapping[mode] || mode
}