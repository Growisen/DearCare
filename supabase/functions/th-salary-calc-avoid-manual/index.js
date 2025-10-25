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
    
    // Special case: if both start and end are 00:00:00, treat as 24-hour shift
    if (startHour === 0 && startMin === 0 && endHour === 0 && endMin === 0) {
      return 24
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

const getExistingSalaryRecords = async (supabase, startDate, endDate) => {
  const { data, error } = await supabase
    .from('salary_payments')
    .select('nurse_id, pay_period_start, pay_period_end, days_worked, hours_worked, salary')
    .gte('pay_period_end', startDate)
    .lte('pay_period_start', endDate)
  
  if (error && error.code !== 'PGRST116') {
    throw new Error(`Failed to fetch existing salary records: ${error.message}`)
  }
  
  const nurseRecordsMap = new Map()
  
  for (const record of (data || [])) {
    if (!nurseRecordsMap.has(record.nurse_id)) {
      nurseRecordsMap.set(record.nurse_id, [])
    }
    nurseRecordsMap.get(record.nurse_id).push({
      start: record.pay_period_start,
      end: record.pay_period_end,
      days_worked: record.days_worked,
      hours_worked: record.hours_worked,
      salary: record.salary
    })
  }
  
  console.log(`Found existing salary records for ${nurseRecordsMap.size} nurses`)
  
  return nurseRecordsMap
}

const isDateCovered = (date, existingPeriods) => {
  if (!existingPeriods || existingPeriods.length === 0) return false
  
  return existingPeriods.some(period => {
    return date >= period.start && date <= period.end
  })
}

const checkLastCalculationDate = async (supabase) => {
  const { data, error } = await supabase
    .from('dearcare_salary_calculation_runs')
    .select('run_date, pay_period_end')
    .eq('execution_status', 'success')
    .order('run_date', { ascending: false })
    .limit(1)
  
  if (error && error.code !== 'PGRST116') {
    throw new Error(`Failed to check last calculation: ${error.message}`)
  }
  
  return data?.[0] || null
}

const shouldRunCalculation = (lastRun) => {
  if (!lastRun) {
    console.log('No previous calculation found, running salary calculation and setting current date as baseline')
    return true
  }
  
  const today = new Date()
  const lastRunDate = new Date(lastRun.run_date)
  const daysSinceLastRun = Math.floor((today - lastRunDate) / (1000 * 60 * 60 * 24))
  
  console.log(`Last calculation: ${lastRun.run_date}, Days since: ${daysSinceLastRun}`)
  
  if (daysSinceLastRun >= 30) {
    console.log('30+ days have passed, running salary calculation')
    return true
  } else {
    console.log(`Only ${daysSinceLastRun} days since last calculation, skipping`)
    return false
  }
}

const logCalculationRun = async (supabase, runData) => {
  const { error } = await supabase
    .from('dearcare_salary_calculation_runs')
    .insert([runData])
  
  if (error) {
    console.error('Failed to log calculation run:', error)
  }
}

Deno.serve(async () => {
  const startTime = Date.now()
  
  try {
    validateEnvironment()
    
    const supabase = createClient(
      Deno.env.get('NEXT_PUBLIC_SUPABASE_URL'),
      Deno.env.get('SERVICE_KEY')
    )

    const lastRun = await checkLastCalculationDate(supabase)
    
    if (!shouldRunCalculation(lastRun)) {
      const runData = {
        pay_period_start: null,
        pay_period_end: null,
        total_nurses_calculated: 0,
        total_attendance_records: 0,
        total_salary_records_inserted: 0,
        execution_status: 'skipped',
        execution_duration_ms: Date.now() - startTime,
        metadata: {
          reason: 'Less than 30 days since last successful calculation',
          last_calculation_date: lastRun?.run_date,
          days_since_last_run: lastRun ? Math.floor((new Date() - new Date(lastRun.run_date)) / (1000 * 60 * 60 * 24)) : null
        }
      }
      
      await logCalculationRun(supabase, runData)
      
      return new Response(JSON.stringify({
        success: true,
        skipped: true,
        message: 'Salary calculation skipped - less than 30 days since last run',
        last_calculation: lastRun.run_date,
        next_calculation_due: new Date(new Date(lastRun.run_date).getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        days_since_last_run: Math.floor((new Date() - new Date(lastRun.run_date)) / (1000 * 60 * 60 * 24))
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const { startDate, endDate } = getDateRange(30)
    
    const existingSalaryRecordsMap = await getExistingSalaryRecords(supabase, startDate, endDate)
    
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
        .eq('nurse.admitted_type', 'Tata_Homenursing')
        .not('nurse', 'is', null),
      
      supabase
        .from('attendence_individual')
        .select('id, date, total_hours, assigned_id, start_time, end_time')
        .gte('date', startDate)
        .lte('date', endDate)
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
    let skippedMissingData = 0
    let skippedNoHours = 0
    let skippedAlreadyCalculated = 0 // NEW
    
    for (const record of attendanceRecords) {
      const assignmentData = nurseClientMap.get(record.assigned_id)
      if (!assignmentData) {
        skippedNoAssignment++
        console.log(`No assignment found for assigned_id: ${record.assigned_id}`)
        continue
      }
      
      const nurseId = assignmentData.nurse_id
      
      // NEW: Check if this date is already covered by existing salary records
      const existingPeriods = existingSalaryRecordsMap.get(nurseId)
      if (existingPeriods && isDateCovered(record.date, existingPeriods)) {
        skippedAlreadyCalculated++
        
        if (!nurseDataMap.has(nurseId)) {
          nurseDataMap.set(nurseId, {
            nurse_id: nurseId,
            name: assignmentData.name,
            total_hours: 0,
            total_salary: 0,
            days_worked: 0,
            assignments: new Set(),
            attendance_records: [],
            skipped_records: []
          })
        }
        
        const nurseData = nurseDataMap.get(nurseId)
        nurseData.skipped_records.push({
          record_id: record.id,
          date: record.date,
          reason: 'already_calculated',
          details: 'Date covered by existing salary record',
          record_data: {
            start_time: record.start_time,
            end_time: record.end_time,
            total_hours: record.total_hours
          }
        })
        
        continue
      }
      
      // Check for missing data in the record
      const missingDataItems = []
      if (!record.start_time || record.start_time.trim() === '') {
        missingDataItems.push('start_time')
      }
      if (!record.end_time || record.end_time.trim() === '') {
        missingDataItems.push('end_time')
      }
      if (!record.total_hours || record.total_hours.trim() === '') {
        missingDataItems.push('total_hours')
      }
      
      if (missingDataItems.length > 0) {
        skippedMissingData++
        
        if (!nurseDataMap.has(nurseId)) {
          nurseDataMap.set(nurseId, {
            nurse_id: nurseId,
            name: assignmentData.name,
            total_hours: 0,
            total_salary: 0,
            days_worked: 0,
            assignments: new Set(),
            attendance_records: [],
            skipped_records: []
          })
          console.log(`Created new nurse entry for: ${assignmentData.name} (ID: ${nurseId})`)
        }
        
        const nurseData = nurseDataMap.get(nurseId)
        nurseData.skipped_records.push({
          record_id: record.id,
          date: record.date,
          reason: 'missing_data',
          details: `Missing: ${missingDataItems.join(', ')}`,
          record_data: {
            start_time: record.start_time || 'MISSING',
            end_time: record.end_time || 'MISSING',
            total_hours: record.total_hours || 'MISSING'
          }
        })
        
        continue
      }
      
      // Calculate worked hours
      const workedHours = parseWorkedHours(record.total_hours)
      if (workedHours <= 0) {
        skippedNoHours++
        
        if (!nurseDataMap.has(nurseId)) {
          nurseDataMap.set(nurseId, {
            nurse_id: nurseId,
            name: assignmentData.name,
            total_hours: 0,
            total_salary: 0,
            days_worked: 0,
            assignments: new Set(),
            attendance_records: [],
            skipped_records: []
          })
          console.log(`Created new nurse entry for: ${assignmentData.name} (ID: ${nurseId})`)
        }
        
        const nurseData = nurseDataMap.get(nurseId)
        nurseData.skipped_records.push({
          record_id: record.id,
          date: record.date,
          reason: 'invalid_hours',
          details: `Invalid hours: ${record.total_hours}`,
          record_data: {
            start_time: record.start_time,
            end_time: record.end_time,
            total_hours: record.total_hours
          }
        })
        
        continue
      }
      
      processedRecords++
      
      if (!nurseDataMap.has(nurseId)) {
        nurseDataMap.set(nurseId, {
          nurse_id: nurseId,
          name: assignmentData.name,
          total_hours: 0,
          total_salary: 0,
          days_worked: 0,
          assignments: new Set(),
          attendance_records: [],
          skipped_records: []
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
    console.log(`- Skipped (already calculated): ${skippedAlreadyCalculated}`)
    console.log(`- Skipped (missing data): ${skippedMissingData}`)
    console.log(`- Skipped (no valid hours): ${skippedNoHours}`)
    console.log(`- Unique nurses found: ${nurseDataMap.size}`)

    const salaryRows = Array.from(nurseDataMap.values())
      .filter(nurse => nurse.days_worked > 0)
      .map(nurse => {
        const skippedRecordsSummary = nurse.skipped_records.length > 0 ? {
          total_skipped: nurse.skipped_records.length,
          already_calculated_count: nurse.skipped_records.filter(r => r.reason === 'already_calculated').length,
          missing_data_count: nurse.skipped_records.filter(r => r.reason === 'missing_data').length,
          invalid_hours_count: nurse.skipped_records.filter(r => r.reason === 'invalid_hours').length,
          skipped_dates: nurse.skipped_records.map(r => r.date).sort(),
          details: nurse.skipped_records.map(r => ({
            date: r.date,
            record_id: r.record_id,
            reason: r.reason,
            details: r.details
          }))
        } : null

        let infoText = `${nurse.days_worked} days, ${nurse.total_hours.toFixed(2)} hours across ${nurse.assignments.size} assignment(s): ${Array.from(nurse.assignments).join(', ')}`
        
        if (nurse.skipped_records.length > 0) {
          const alreadyCalc = nurse.skipped_records.filter(r => r.reason === 'already_calculated').length
          const missingData = nurse.skipped_records.filter(r => r.reason === 'missing_data').length
          const invalidHours = nurse.skipped_records.filter(r => r.reason === 'invalid_hours').length
          
          infoText += ` | SKIPPED: ${nurse.skipped_records.length} records`
          if (alreadyCalc > 0) infoText += ` (${alreadyCalc} already calculated`
          if (missingData > 0) infoText += `${alreadyCalc > 0 ? ', ' : ' ('}${missingData} missing data`
          if (invalidHours > 0) infoText += `${alreadyCalc > 0 || missingData > 0 ? ', ' : ' ('}${invalidHours} invalid hours`
          infoText += ')'
        }

        return {
          nurse_id: nurse.nurse_id,
          pay_period_start: startDate,
          pay_period_end: endDate,
          days_worked: nurse.days_worked,
          hours_worked: parseFloat(nurse.total_hours.toFixed(2)),
          average_hourly_rate: nurse.total_hours > 0 ? parseFloat((nurse.total_salary / nurse.total_hours).toFixed(2)) : 0,
          salary: parseFloat(nurse.total_salary.toFixed(2)),
          payment_status: 'pending',
          info: infoText,
          reviewed: false,
          skipped_records_count: nurse.skipped_records.length,
          skipped_records_details: skippedRecordsSummary
        }
      });

    let insertedRecords = 0
    if (salaryRows.length > 0) {
      console.log(`Inserting ${salaryRows.length} salary records into salary_payments table`)
      
      const insertResult = await supabase
        .from('salary_payments')
        .insert(salaryRows)
      
      if (insertResult.error) {
        console.error('Database insertion error:', insertResult.error)
        throw new Error(`Failed to insert salary payments: ${insertResult.error.message}`)
      }
      
      insertedRecords = salaryRows.length
      console.log(`Successfully inserted ${insertedRecords} salary payment records`)
    }

    // Log successful calculation
    const runData = {
      pay_period_start: startDate,
      pay_period_end: endDate,
      total_nurses_calculated: salaryRows.length,
      total_attendance_records: attendanceRecords.length,
      total_salary_records_inserted: insertedRecords,
      execution_status: 'success',
      execution_duration_ms: Date.now() - startTime,
      metadata: {
        valid_assignments: validAssignments,
        skipped_assignments: skippedAssignments,
        processed_records: processedRecords,
        skipped_no_assignment: skippedNoAssignment,
        skipped_already_calculated: skippedAlreadyCalculated,
        skipped_missing_data: skippedMissingData,
        skipped_no_hours: skippedNoHours,
        nurses_with_existing_records: existingSalaryRecordsMap.size,
        total_salary_amount: salaryRows.reduce((sum, row) => sum + row.salary, 0),
        nurses_with_skipped_records: salaryRows.filter(row => row.skipped_records_count > 0).length,
        total_skipped_records: salaryRows.reduce((sum, row) => sum + row.skipped_records_count, 0)
      }
    }
    
    await logCalculationRun(supabase, runData)
    
    return new Response(JSON.stringify({
      success: true,
      message: `Payroll calculation completed and ${insertedRecords} salary records inserted`,
      pay_period: `${startDate} to ${endDate}`,
      total_nurses: salaryRows.length,
      total_attendance_records: attendanceRecords.length,
      skipped_already_calculated: skippedAlreadyCalculated,
      skipped_missing_data: skippedMissingData,
      skipped_no_hours: skippedNoHours,
      nurses_with_existing_records: existingSalaryRecordsMap.size,
      nurses_with_skipped_records: salaryRows.filter(row => row.skipped_records_count > 0).length,
      total_skipped_records: salaryRows.reduce((sum, row) => sum + row.skipped_records_count, 0),
      inserted_records: insertedRecords,
      execution_time_ms: Date.now() - startTime,
      salaryRows
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
    
  } catch (error) {
    console.error('Payroll calculation error:', error)
    
    const supabase = createClient(
      Deno.env.get('NEXT_PUBLIC_SUPABASE_URL'),
      Deno.env.get('SERVICE_KEY')
    )
    
    const failedRunData = {
      pay_period_start: null,
      pay_period_end: null,
      total_nurses_calculated: 0,
      total_attendance_records: 0,
      total_salary_records_inserted: 0,
      execution_status: 'failed',
      execution_duration_ms: Date.now() - startTime,
      error_message: error instanceof Error ? error.message : 'Unknown error occurred',
      metadata: {
        error_stack: error instanceof Error ? error.stack : null
      }
    }
    
    await logCalculationRun(supabase, failedRunData)
    
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      timestamp: new Date().toISOString(),
      execution_time_ms: Date.now() - startTime
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
})