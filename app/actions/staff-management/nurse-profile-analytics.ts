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

    // Get all assignments for this nurse with their shift times
    const { data: assignmentData, error: assignmentDataError } = await supabase
      .from('nurse_client')
      .select('id, shift_start_time, shift_end_time')
      .eq('nurse_id', nurseId)

    if (assignmentDataError) throw assignmentDataError

    console.log('Assignment data:', assignmentData)

    // Get attendance records for each assignment
    if (assignmentData && assignmentData.length > 0) {
      const assignmentIds = assignmentData.map(a => a.id)
      
      // Now query attendance using the correct relationship
      // Assuming assigned_id in attendance refers to the assignment ID (nurse_client.id)
      const { data: attendanceRecords, error: attendanceError } = await supabase
        .from('attendence_individual')
        .select('id, start_time, end_time, assigned_id, is_admin_action')
        .in('assigned_id', assignmentIds)

      if (attendanceError) throw attendanceError

      console.log('Attendance records:', attendanceRecords)

      workingDaysCount = attendanceRecords?.length ?? 0

      // Create a map for shift times based on assignment ID
      const assignmentShiftMap = new Map<number, { start: string, end: string }>()
      assignmentData.forEach(assignment => {
        assignmentShiftMap.set(assignment.id, {
          start: assignment.shift_start_time,
          end: assignment.shift_end_time
        })
      })

      console.log('Assignment shift map:', Array.from(assignmentShiftMap.entries()))

      // Calculate late attendances
      attendanceRecords?.forEach(record => {
        const shiftTimes = assignmentShiftMap.get(record.assigned_id)
        
        console.log(`Processing record ${record.id}:`, {
          assigned_id: record.assigned_id,
          start_time: record.start_time,
          shift_times: shiftTimes
        })
        
        if (shiftTimes && record.start_time && shiftTimes.start) {
          const shiftStartTime = shiftTimes.start
          const actualStartTime = record.start_time
          
          // Convert times to minutes for comparison
          const [shiftH, shiftM] = shiftStartTime.split(':').map(Number)
          const [actualH, actualM] = actualStartTime.split(':').map(Number)
          
          const scheduledMinutes = shiftH * 60 + shiftM
          const actualMinutes = actualH * 60 + actualM
          
          console.log(`Time comparison for record ${record.id}:`, {
            scheduled: `${shiftH}:${shiftM} (${scheduledMinutes} minutes)`,
            actual: `${actualH}:${actualM} (${actualMinutes} minutes)`,
            difference: actualMinutes - scheduledMinutes
          })
          
          // Consider late if more than 15 minutes after scheduled start
          if (actualMinutes > scheduledMinutes + 15) {
            lateAttendances++
            console.log(`✓ Late attendance detected for record ${record.id}`)
          } else {
            onTimeAttendances++
            console.log(`✓ On-time attendance for record ${record.id}`)
          }
        } else {
          console.log(`⚠️ Skipping record ${record.id} - missing data`)
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