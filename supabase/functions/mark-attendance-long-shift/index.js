import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from "jsr:@supabase/supabase-js"


Deno.serve(async (req) => {
  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { date } = await req.json().catch(() => ({}))
    const targetDate = date || new Date().toISOString().split('T')[0]

    const calculateHoursDifference = (startTime, endTime) => {
      const [startHours, startMinutes] = startTime.split(':').map(Number)
      const [endHours, endMinutes] = endTime.split(':').map(Number)
      
      let totalMinutes = 0

      if (endHours < startHours || (endHours === startHours && endMinutes < startMinutes)) {
        totalMinutes = ((24 - startHours) * 60 - startMinutes) + (endHours * 60 + endMinutes)
      } else {
        totalMinutes = (endHours - startHours) * 60 + (endMinutes - startMinutes)
      }
      
      return totalMinutes / 60
    }

    // Fetch approved leave requests for the target date
    const { data: approvedLeaves, error: leaveError } = await supabaseClient
      .from('nurse_leave_requests')
      .select('nurse_id')
      .eq('status', 'approved')
      .lte('start_date', targetDate)
      .gte('end_date', targetDate)

    if (leaveError) {
      throw new Error(`Error fetching leave requests: ${leaveError.message}`)
    }

    // Create a Set of nurse IDs who are on approved leave
    const nursesOnLeave = new Set(
      approvedLeaves?.map((leave) => leave.nurse_id) || []
    )

    const { data: shifts, error: shiftsError } = await supabaseClient
      .from('nurse_client')
      .select('id, nurse_id, client_id, shift_start_time, shift_end_time, assigned_type, start_date, end_date')
      .lte('start_date', targetDate)
      .or(`end_date.is.null,end_date.gte.${targetDate}`)
      .not('shift_start_time', 'is', null)
      .not('shift_end_time', 'is', null)

    if (shiftsError) {
      throw new Error(`Error fetching shifts: ${shiftsError.message}`)
    }

    if (!shifts || shifts.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'No active shifts found for the date',
          date: targetDate,
          inserted: 0
        }),
        { headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Filter out shifts for nurses on approved leave
    const shiftsWithoutLeave = shifts.filter((shift) => !nursesOnLeave.has(shift.nurse_id))

    const eligibleShifts = shiftsWithoutLeave.filter((shift) => {
      const hours = calculateHoursDifference(shift.shift_start_time, shift.shift_end_time)
      return hours >= 20
    })

    if (eligibleShifts.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'No shifts with duration >= 20 hours found (excluding nurses on leave)',
          date: targetDate,
          totalShifts: shifts.length,
          nursesOnLeave: nursesOnLeave.size,
          inserted: 0
        }),
        { headers: { 'Content-Type': 'application/json' } }
      )
    }

    const { data: existingAttendance, error: existingError } = await supabaseClient
      .from('attendence_individual')
      .select('assigned_id')
      .eq('date', targetDate)

    if (existingError) {
      throw new Error(`Error checking existing attendance: ${existingError.message}`)
    }

    const existingAssignedIds = new Set(
      existingAttendance?.map((record) => record.assigned_id) || []
    )

    const shiftsToInsert = eligibleShifts.filter(
      (shift) => !existingAssignedIds.has(shift.id)
    )

    if (shiftsToInsert.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'All eligible shifts already have attendance records',
          date: targetDate,
          inserted: 0
        }),
        { headers: { 'Content-Type': 'application/json' } }
      )
    }

    const attendanceRecords = shiftsToInsert.map((shift) => {
      const hours = calculateHoursDifference(shift.shift_start_time, shift.shift_end_time)
      
      return {
        assigned_id: shift.id,
        date: targetDate,
        start_time: shift.shift_start_time,
        end_time: shift.shift_end_time,
        total_hours: `${hours.toFixed(2)}`,
        location: null,
        end_location: null,
        is_admin_action: true
      }
    })

    const { data: insertedData, error: insertError } = await supabaseClient
      .from('attendence_individual')
      .insert(attendanceRecords)
      .select()

    if (insertError) {
      throw new Error(`Error inserting attendance: ${insertError.message}`)
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Attendance records inserted successfully',
        date: targetDate,
        totalShifts: shifts.length,
        nursesOnLeave: nursesOnLeave.size,
        shiftsExcludedDueToLeave: shifts.length - shiftsWithoutLeave.length,
        eligibleShifts: eligibleShifts.length,
        inserted: insertedData?.length || 0,
        records: insertedData
      }),
      { headers: { 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        status: 400,
        headers: { 'Content-Type': 'application/json' } 
      }
    )
  }
})