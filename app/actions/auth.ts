'use server'

import { cookies } from 'next/headers'
import { createServerActionClient } from '@supabase/auth-helpers-nextjs'
import { redirect } from 'next/navigation'
import { Database } from '@/lib/database.types'

export async function signIn(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  
  const supabase = createServerActionClient<Database>({ cookies })
  
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  
  if (error) {
    return { error: error.message, success: false }
  }
  
  return { error: null, success: true }
}

export async function signUp(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  
  const supabase = createServerActionClient<Database>({ cookies })
  
  const { error } = await supabase.auth.signUp({
    email,
    password,
  })
  
  if (error) {
    return { error: error.message, success: false }
  }
  
  return { error: null, success: true }
}

export async function signOut() {
  const supabase = createServerActionClient<Database>({ cookies })
  await supabase.auth.signOut()
  redirect('/signin')
}