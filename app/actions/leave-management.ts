"use server"

import { createSupabaseServerClient } from './auth'
import { revalidatePath } from 'next/cache'

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
  searchQuery?: string
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
    
    if (status) {
      query = query.eq('status', status)
    }
    
    const { data: countData, error: countError } = await supabase
      .from('nurse_leave_requests')
      .select('id', { count: 'exact' })
    
    console.log("Total records in nurse_leave_requests:", countData ? countData.length : 0)
    
    if (countError) {
      console.error('Error counting leave requests:', countError)
    }
    
    const { data: leaveData, error: leaveError } = await query
    
    if (leaveError) {
      console.error('Error fetching leave requests:', leaveError)
      return { success: false, error: leaveError.message, leaveRequests: [] }
    }

    if (leaveData && leaveData.length > 0) {
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
        leaveRequests: filteredRequests 
      }
    }
    
    return { success: true, leaveRequests: [] }
  } catch (error: unknown) {
    console.error('Error in getLeaveRequests:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'An unknown error occurred',
      leaveRequests: [] 
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
    
    const { data: leaveData, error: leaveError } = await supabase
      .from('nurse_leave_requests')
      .select('nurse_id')
      .eq('id', requestId)
      .single()
    
    if (leaveError) {
      throw new Error(`Failed to fetch leave request details: ${leaveError.message}`)
    }
    
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
    
    // If the leave is approved, update the nurse status to 'leave'
    if (newStatus === 'approved' && leaveData?.nurse_id) {
      const { error: nurseError } = await supabase
        .from('nurses')
        .update({ status: 'leave' })
        .eq('nurse_id', leaveData.nurse_id)
      
      if (nurseError) {
        console.error('Error updating nurse status:', nurseError)
        throw new Error(`Failed to update nurse status: ${nurseError.message}`)
      }
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