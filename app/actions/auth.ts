'use server'

import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { redirect } from 'next/navigation'
import { Database } from '@/lib/database.types'


export async function createSupabaseServerClient() {
  const cookieStore = await cookies()
  
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => {
          return cookieStore.getAll().map(cookie => ({
            name: cookie.name,
            value: cookie.value,
          }))
        },
        setAll: cookies => {
          for (const cookie of cookies) {
            cookieStore.set({
              name: cookie.name,
              value: cookie.value,
              ...cookie.options
            })
          }
        }
      },
      cookieOptions: {
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        sameSite: 'lax',
        httpOnly: true, // Add httpOnly flag for better security
      },
      cookieEncoding: 'raw'
    }
  )
}

export async function signIn(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  
  const supabase = await createSupabaseServerClient()
  
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  
  if (error) {
    return { error: error.message, success: false }
  }

  const { data: { user } } = await supabase.auth.getUser();

  console.log(user)
  
  return { error: null, success: true }
}

export async function signUp(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  
  const supabase = await createSupabaseServerClient()
  
  // const { error } = await supabase.auth.signUp({
  //   email,
  //   password,
  // })
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        role: 'admin' // Default role
      }
    }
  })
  
  if (error) {
    return { error: error.message, success: false }
  }
  
  return { error: null, success: true }
}

export async function signOut() {  
  const supabase = await createSupabaseServerClient()
  
  await supabase.auth.signOut()
  redirect('/signin')
}