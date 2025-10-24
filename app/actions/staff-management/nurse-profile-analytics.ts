"use server"

import { createSupabaseServerClient } from '@/app/actions/authentication/auth'
import { logger } from '@/utils/logger'

export interface NurseAnalytics {
  nurseId: number
  totalAssignments: number
  totalWorkingDays: number
  totalLeaveDays: number
  lateAttendances: number
  onTimeAttendances: number
  totalAppliedLeaveRequests: number
}

export async function getNurseProfileAnalytics(nurseId: number): Promise<{
  success: boolean
  data?: NurseAnalytics
  error?: string
}> {
  try {
    const supabase = await createSupabaseServerClient()

    const [
      assignmentRes,
      leaveRes,
      appliedLeaveRes
    ] = await Promise.all([
      supabase
        .from('nurse_client')
        .select('id', { count: 'exact', head: true })
        .eq('nurse_id', nurseId),

      supabase
        .from('nurse_leave_requests')
        .select('days')
        .eq('nurse_id', nurseId)
        .eq('status', 'approved'),

      supabase
        .from('nurse_leave_requests')
        .select('id', { count: 'exact', head: true })
        .eq('nurse_id', nurseId)
    ])

    const assignmentCount = assignmentRes.count ?? 0
    if (assignmentRes.error) throw assignmentRes.error

    let lateAttendances = 0
    let onTimeAttendances = 0
    let workingDaysCount = 0

    const { data: assignmentData, error: assignmentDataError } = await supabase
      .from('nurse_client')
      .select('id, shift_start_time, shift_end_time')
      .eq('nurse_id', nurseId)

    if (assignmentDataError) throw assignmentDataError

    if (assignmentData && assignmentData.length > 0) {
      const assignmentIds = assignmentData.map(a => a.id)
      
      const { data: attendanceRecords, error: attendanceError } = await supabase
        .from('attendence_individual')
        .select('id, start_time, end_time, assigned_id, is_admin_action')
        .in('assigned_id', assignmentIds)

      if (attendanceError) throw attendanceError

      workingDaysCount = attendanceRecords?.length ?? 0

      const assignmentShiftMap = new Map<number, { start: string, end: string }>()
      assignmentData.forEach(assignment => {
        assignmentShiftMap.set(assignment.id, {
          start: assignment.shift_start_time,
          end: assignment.shift_end_time
        })
      })

      attendanceRecords?.forEach(record => {
        const shiftTimes = assignmentShiftMap.get(record.assigned_id)
        
        
        if (shiftTimes && record.start_time && shiftTimes.start) {
          const shiftStartTime = shiftTimes.start
          const actualStartTime = record.start_time
          
          const [shiftH, shiftM] = shiftStartTime.split(':').map(Number)
          const [actualH, actualM] = actualStartTime.split(':').map(Number)
          
          const scheduledMinutes = shiftH * 60 + shiftM
          const actualMinutes = actualH * 60 + actualM
          
          if (actualMinutes > scheduledMinutes + 15) {
            lateAttendances++
          } else {
            onTimeAttendances++
          }
        } else {
        }
      })
    }

    if (leaveRes.error) throw leaveRes.error
    const totalLeaveDays = leaveRes.data?.reduce((sum, req) => sum + (req.days || 0), 0) ?? 0

    if (appliedLeaveRes.error) throw appliedLeaveRes.error
    const totalAppliedLeaveRequests = appliedLeaveRes.count ?? 0

    console.log({
      assignmentCount, 
      workingDaysCount, 
      totalLeaveDays, 
      lateAttendances, 
      onTimeAttendances,
      totalAppliedLeaveRequests
    })

    return {
      success: true,
      data: {
        nurseId,
        totalAssignments: assignmentCount,
        totalWorkingDays: workingDaysCount,
        totalLeaveDays,
        lateAttendances,
        onTimeAttendances,
        totalAppliedLeaveRequests
      }
    }
  } catch (error) {
    console.log(error)
    logger.error('Error fetching nurse analytics:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}