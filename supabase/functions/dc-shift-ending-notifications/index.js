import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from "jsr:@supabase/supabase-js"

const validateEnvironment = () => {
  const requiredVars = ['NEXT_PUBLIC_SUPABASE_URL', 'SERVICE_KEY']
  const missing = requiredVars.filter(varName => !Deno.env.get(varName))
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`)
  }
}

const getShiftsEndingToday = async (supabase) => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayStr = today.toISOString().split('T')[0]
  
  const { data, error } = await supabase
    .from('dearcare_shifts')
    .select(`
      id,
      end_date,
      nurse_id,
      dearcare_nurses!inner (
        nurse_id,
        first_name,
        last_name
      )
    `)
    .eq('end_date', todayStr)
  
  if (error) {
    throw new Error(`Failed to fetch shifts ending today: ${error.message}`)
  }
  
  return data || []
}

const checkForDuplicateNotification = async (supabase, title, hoursAgo = 24) => {
  const cutoffTime = new Date(Date.now() - hoursAgo * 60 * 60 * 1000).toISOString()
  
  const { data, error } = await supabase
    .from('dearcare_web_notifications')
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
  const isDuplicate = await checkForDuplicateNotification(supabase, title)
  
  if (isDuplicate) {
    console.log(`Skipping duplicate notification: ${title}`)
    return { created: false, reason: 'duplicate' }
  }
  
  const { error } = await supabase
    .from('dearcare_web_notifications')
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

    console.log('Checking for shifts ending today...')

    const shiftsEndingToday = await getShiftsEndingToday(supabase)
    
    if (shiftsEndingToday.length === 0) {
      console.log('No shifts ending today')
      return new Response(JSON.stringify({
        success: true,
        message: 'No shifts ending today',
        notifications_created: 0
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    console.log(`Found ${shiftsEndingToday.length} shift(s) ending today`)

    const notificationsCreated = []

    for (const shift of shiftsEndingToday) {
      const nurse = shift.dearcare_nurses
      const nurseName = `${nurse.first_name} ${nurse.last_name}`
      
      const title = `Shift Ending Today - ${nurseName}`
      const message = `${nurseName}'s shift is ending today (${new Date(shift.end_date).toLocaleDateString('en-IN')}). Please review and process accordingly.`
      
      const result = await createNotification(
        supabase,
        title,
        message,
        'warning',
        {
          shift_id: shift.id,
          nurse_id: shift.nurse_id,
          nurse_name: nurseName,
          end_date: shift.end_date
        }
      )
      
      if (result.created) {
        notificationsCreated.push({
          shift_id: shift.id,
          nurse_name: nurseName
        })
      }
    }

    return new Response(JSON.stringify({
      success: true,
      message: `Shift end check completed - ${notificationsCreated.length} notifications created`,
      shifts_ending_today: shiftsEndingToday.length,
      notifications_created: notificationsCreated,
      execution_time_ms: Date.now() - startTime
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
    
  } catch (error) {
    console.error('Shift end notification error:', error)
    
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