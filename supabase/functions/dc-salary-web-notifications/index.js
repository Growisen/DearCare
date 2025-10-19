import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from "jsr:@supabase/supabase-js"

const validateEnvironment = () => {
  const requiredVars = ['NEXT_PUBLIC_SUPABASE_URL', 'SERVICE_KEY']
  const missing = requiredVars.filter(varName => !Deno.env.get(varName))
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`)
  }
}

const getLastSalaryCalculation = async (supabase) => {
  const { data, error } = await supabase
    .from('dearcare_salary_calculation_runs')
    .select('run_date, pay_period_end, total_nurses_calculated')
    .eq('execution_status', 'success')
    .order('run_date', { ascending: false })
    .limit(1)
  
  if (error) {
    throw new Error(`Failed to fetch last salary calculation: ${error.message}`)
  }
  
  return data?.[0] || null
}

const checkForDuplicateNotification = async (supabase, title, hoursAgo = 24) => {
  const cutoffTime = new Date(Date.now() - hoursAgo * 60 * 60 * 1000).toISOString()
  
  const { data, error } = await supabase
    .from('notifications')
    .select('id')
    .eq('title', title)
    .gte('created_at', cutoffTime)
    .limit(1)
  
  if (error) {
    console.error('Error checking for duplicates:', error)
    return false
  }
  
  return data && data.length > 0
}

const createNotification = async (supabase, title, message, type = 'info', metadata = null) => {
  // Check for duplicate
  const isDuplicate = await checkForDuplicateNotification(supabase, title)
  
  if (isDuplicate) {
    console.log(`Skipping duplicate notification: ${title}`)
    return { created: false, reason: 'duplicate' }
  }
  
  const { error } = await supabase
    .from('notifications')
    .insert([{
      title,
      message,
      type,
      metadata
    }])
  
  if (error) {
    throw new Error(`Failed to create notification: ${error.message}`)
  }
  
  console.log(`✓ Created notification: ${title}`)
  return { created: true }
}

Deno.serve(async () => {
  const startTime = Date.now()
  
  try {
    validateEnvironment()
    
    const supabase = createClient(
      Deno.env.get('NEXT_PUBLIC_SUPABASE_URL'),
      Deno.env.get('SERVICE_KEY')
    )

    console.log('Checking for salary calculation notifications...')

    // Get last salary calculation
    const lastCalculation = await getLastSalaryCalculation(supabase)
    
    if (!lastCalculation) {
      console.log('No previous salary calculation found')
      return new Response(JSON.stringify({
        success: true,
        message: 'No previous salary calculation found',
        notifications_created: 0
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Calculate days since last run
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const lastRun = new Date(lastCalculation.run_date)
    lastRun.setHours(0, 0, 0, 0)
    
    const daysSinceLastRun = Math.floor((today.getTime() - lastRun.getTime()) / (24 * 60 * 60 * 1000))
    const daysUntilDue = 30 - daysSinceLastRun
    
    console.log(`Days since last calculation: ${daysSinceLastRun}`)
    console.log(`Days until next calculation due: ${daysUntilDue}`)

    const notificationsCreated = []

    // Create notifications based on days
    if (daysUntilDue === 2) {
      // 2 days before (28 days since last run)
      const result = await createNotification(
        supabase,
        'Salary Calculation Due in 2 Days',
        `The next salary calculation is due in 2 days. Last calculation was on ${new Date(lastCalculation.run_date).toLocaleDateString('en-IN')}.`,
        'info',
        {
          last_calculation_date: lastCalculation.run_date,
          days_until_due: daysUntilDue,
          days_since_last_run: daysSinceLastRun
        }
      )
      if (result.created) notificationsCreated.push('2_days_before')
    }
    
    if (daysUntilDue === 1) {
      // 1 day before (29 days since last run)
      const result = await createNotification(
        supabase,
        'Salary Calculation Due Tomorrow',
        `The next salary calculation is due tomorrow! Last calculation was on ${new Date(lastCalculation.run_date).toLocaleDateString('en-IN')}.`,
        'warning',
        {
          last_calculation_date: lastCalculation.run_date,
          days_until_due: daysUntilDue,
          days_since_last_run: daysSinceLastRun
        }
      )
      if (result.created) notificationsCreated.push('1_day_before')
    }
    
    if (daysUntilDue <= 0) {
      // Overdue (30+ days since last run)
      const result = await createNotification(
        supabase,
        'Salary Calculation Overdue',
        `The salary calculation is now overdue by ${Math.abs(daysUntilDue)} day(s)! Last calculation was on ${new Date(lastCalculation.run_date).toLocaleDateString('en-IN')}.`,
        'error',
        {
          last_calculation_date: lastCalculation.run_date,
          days_overdue: Math.abs(daysUntilDue),
          days_since_last_run: daysSinceLastRun
        }
      )
      if (result.created) notificationsCreated.push('overdue')
    }

    return new Response(JSON.stringify({
      success: true,
      message: `Notification check completed - ${notificationsCreated.length} notifications created`,
      last_calculation_date: lastCalculation.run_date,
      days_since_last_run: daysSinceLastRun,
      days_until_due: daysUntilDue,
      notifications_created: notificationsCreated,
      execution_time_ms: Date.now() - startTime
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
    
  } catch (error) {
    console.error('Notification generation error:', error)
    
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