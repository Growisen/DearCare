import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from "jsr:@supabase/supabase-js"

const validateEnvironment = () => {
  const requiredVars = ['NEXT_PUBLIC_SUPABASE_URL', 'SERVICE_KEY']
  const missing = requiredVars.filter(varName => !Deno.env.get(varName))
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`)
  }
}

const calculateShiftHours = (startTime, endTime) => {
  try {
    const [startHour, startMin] = startTime.split(':').map(Number)
    const [endHour, endMin] = endTime.split(':').map(Number)
    
    if (isNaN(startHour) || isNaN(startMin) || isNaN(endHour) || isNaN(endMin)) {
      throw new Error(`Invalid time format: ${startTime} - ${endTime}`)
    }
    
    const startMinutes = startHour * 60 + startMin
    let endMinutes = endHour * 60 + endMin
    
    if (endMinutes < startMinutes) {
      endMinutes += 24 * 60
    }
    
    return Math.max(0, (endMinutes - startMinutes) / 60)
  } catch (error) {
    console.error(`Error calculating shift hours for ${startTime}-${endTime}:`, error)
    return 8
  }
}

const parseWorkedHours = (hoursStr) => {
  if (!hoursStr || typeof hoursStr !== 'string') return 0
  
  try {
    const [hours, minutes = 0] = hoursStr.split(':').map(Number)
    if (isNaN(hours) || isNaN(minutes)) return 0
    return Math.max(0, hours + (minutes / 60))
  } catch {
    return 0
  }
}

const getDateRange = (days = 1000) => {
  const today = new Date()
  const endDate = today.toISOString().split('T')[0]
  const startDateObj = new Date(today.getTime() - (days - 1) * 24 * 60 * 60 * 1000)
  const startDate = startDateObj.toISOString().split('T')[0]
  return { startDate, endDate }
}

Deno.serve(async () => {
  try {
    validateEnvironment()
    
    const supabase = createClient(
      Deno.env.get('NEXT_PUBLIC_SUPABASE_URL'),
      Deno.env.get('SERVICE_KEY')
    )

    const { startDate, endDate } = getDateRange(28)
    
    const [nurseClientsResult, attendanceResult] = await Promise.all([
      supabase
        .from('nurse_client')
        .select(`
          id,
          nurse_id,
          salary_per_day,
          shift_start_time,
          shift_end_time,
          nurse:nurse_id (
            nurse_id,
            first_name,
            last_name,
            admitted_type
          )
        `)
        .eq('nurse.admitted_type', 'Dearcare_Llp')
        .not('nurse', 'is', null),
      
      supabase
        .from('attendence_individual')
        .select('id, date, total_hours, assigned_id')
        .gte('date', startDate)
        .lte('date', endDate)
        .not('total_hours', 'is', null)
    ])
    
    if (nurseClientsResult.error) {
      throw new Error(`Nurse client fetch error: ${nurseClientsResult.error.message}`)
    }
    if (attendanceResult.error) {
      throw new Error(`Attendance fetch error: ${attendanceResult.error.message}`)
    }
    
    const nurseClients = nurseClientsResult.data
    const attendanceRecords = attendanceResult.data
    
    console.log(`Fetched ${nurseClients?.length || 0} nurse clients`)
    console.log(`Fetched ${attendanceRecords?.length || 0} attendance records`)
    
    const nurseClientMap = new Map()
    let validAssignments = 0
    let skippedAssignments = 0
    
    for (const assignment of nurseClients) {
      if (!assignment.shift_start_time || 
          !assignment.shift_end_time || 
          !assignment.nurse ||
          !assignment.salary_per_day) {
        skippedAssignments++
        console.log(`Skipped assignment ${assignment.id}: missing data`)
        continue
      }
      
      const shiftHours = calculateShiftHours(assignment.shift_start_time, assignment.shift_end_time)
      
      if (shiftHours <= 0) {
        skippedAssignments++
        console.log(`Skipped assignment ${assignment.id}: invalid shift hours`)
        continue
      }
      
      validAssignments++
      const fullName = `${assignment.nurse.first_name} ${assignment.nurse.last_name}`.trim()
      
      nurseClientMap.set(assignment.id, {
        nurse_id: assignment.nurse_id,
        name: fullName,
        standard_shift_hours: shiftHours,
        salary_per_day: assignment.salary_per_day
      })
    }
    
    console.log(`Assignment processing: ${validAssignments} valid, ${skippedAssignments} skipped`)
    
    const nurseDataMap = new Map()
    
    console.log(`Processing ${attendanceRecords.length} attendance records`)
    console.log(`Have ${nurseClientMap.size} nurse client assignments`)
    
    let processedRecords = 0
    let skippedNoAssignment = 0
    let skippedNoHours = 0
    
    for (const record of attendanceRecords) {
      const assignmentData = nurseClientMap.get(record.assigned_id)
      if (!assignmentData) {
        skippedNoAssignment++
        console.log(`No assignment found for assigned_id: ${record.assigned_id}`)
        continue
      }
      
      const workedHours = parseWorkedHours(record.total_hours)
      if (workedHours <= 0) {
        skippedNoHours++
        console.log(`No valid hours for record ${record.id}: ${record.total_hours}`)
        continue
      }
      
      const nurseId = assignmentData.nurse_id
      processedRecords++
      
      if (!nurseDataMap.has(nurseId)) {
        nurseDataMap.set(nurseId, {
          nurse_id: nurseId,
          name: assignmentData.name,
          total_hours: 0,
          total_salary: 0,
          days_worked: 0,
          assignments: new Set(),
          attendance_records: []
        })
        console.log(`Created new nurse entry for: ${assignmentData.name} (ID: ${nurseId})`)
      }
      
      const nurseData = nurseDataMap.get(nurseId)
      
      const billableHours = Math.min(workedHours, assignmentData.standard_shift_hours)
      
      const hourlyRate = assignmentData.salary_per_day / assignmentData.standard_shift_hours
      
      const dayEarnings = billableHours * hourlyRate
      
      nurseData.total_hours += billableHours
      nurseData.total_salary += dayEarnings
      nurseData.days_worked += 1
      nurseData.assignments.add(`${assignmentData.salary_per_day}/${assignmentData.standard_shift_hours}h (₹${hourlyRate.toFixed(2)}/hr)`)
      nurseData.attendance_records.push(record)
    }
    
    console.log(`Processing summary:`)
    console.log(`- Processed records: ${processedRecords}`)
    console.log(`- Skipped (no assignment): ${skippedNoAssignment}`)
    console.log(`- Skipped (no hours): ${skippedNoHours}`)
    console.log(`- Unique nurses found: ${nurseDataMap.size}`)


    const salaryRows = Array.from(nurseDataMap.values()).map(nurse => ({
      nurse_id: nurse.nurse_id,
      pay_period_start: startDate,
      pay_period_end: endDate,
      days_worked: nurse.days_worked,
      hours_worked: parseFloat(nurse.total_hours.toFixed(2)),
      average_hourly_rate: parseFloat((nurse.total_salary / nurse.total_hours).toFixed(2)),
      salary: parseFloat(nurse.total_salary.toFixed(2)),
      payment_status: 'pending',
      info: `${nurse.days_worked} days, ${nurse.total_hours.toFixed(2)} hours across ${nurse.assignments.size} assignment(s): ${Array.from(nurse.assignments).join(', ')}`,
      reviewed: false
    }));

    if (salaryRows.length > 0) {
      console.log(`Inserting ${salaryRows.length} salary records into salary_payments table`)
      
      const insertResult = await supabase
        .from('salary_payments')
        .insert(salaryRows)
      
      if (insertResult.error) {
        console.error('Database insertion error:', insertResult.error)
        throw new Error(`Failed to insert salary payments: ${insertResult.error.message}`)
      }
      
      console.log(`Successfully inserted ${salaryRows.length} salary payment records`)
    }
    
    
    return new Response(JSON.stringify({
      success: true,
      message: `Payroll calculation completed and ${salaryRows.length} salary records inserted`,
      pay_period: `${startDate} to ${endDate}`,
      total_nurses: salaryRows.length,
      total_attendance_records: attendanceRecords.length,
      inserted_records: salaryRows.length,
      salaryRows
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
    
  } catch (error) {
    console.error('Payroll calculation error:', error)
    
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
})