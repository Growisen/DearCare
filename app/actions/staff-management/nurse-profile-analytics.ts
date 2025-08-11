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
      attendanceRes,
      leaveRes,
      appliedLeaveRes
    ] = await Promise.all([
      supabase
        .from('nurse_client')
        .select('id', { count: 'exact', head: true })
        .eq('nurse_id', nurseId),

      supabase
        .from('attendence_individual')
        .select('id, start_time, is_admin_action', { count: 'exact' })
        .eq('assigned_id', nurseId),

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

    if (attendanceRes.error) throw attendanceRes.error
    const attendanceRecords = attendanceRes.data ?? []
    const workingDaysCount = attendanceRecords.length

    let lateAttendances = 0
    let onTimeAttendances = 0

    const { data: assignmentData, error: assignmentDataError } = await supabase
      .from('nurse_client')
      .select('id, shift_start_time')
      .eq('nurse_id', nurseId)

    if (assignmentDataError) throw assignmentDataError
    const assignmentShiftMap = new Map<number, string>()
    assignmentData?.forEach(a => assignmentShiftMap.set(a.id, a.shift_start_time))

    attendanceRecords.forEach(record => {
      const shiftStart = assignmentShiftMap.get(record.id)
      const actualStart = record.start_time
      if (shiftStart && actualStart) {
        const [shiftH, shiftM] = shiftStart.split(':').map(Number)
        const [actualH, actualM] = actualStart.split(':').map(Number)
        const scheduledMinutes = shiftH * 60 + shiftM
        const actualMinutes = actualH * 60 + actualM
        if (actualMinutes > scheduledMinutes + 15) {
          lateAttendances++
        } else {
          onTimeAttendances++
        }
      }
    })

    if (leaveRes.error) throw leaveRes.error
    const totalLeaveDays = leaveRes.data?.reduce((sum, req) => sum + (req.days || 0), 0) ?? 0

    if (appliedLeaveRes.error) throw appliedLeaveRes.error
    const totalAppliedLeaveRequests = appliedLeaveRes.count ?? 0

    console.log(assignmentCount, workingDaysCount, totalLeaveDays, lateAttendances, onTimeAttendances);

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
    console.log(error);
    logger.error('Error fetching nurse analytics:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}