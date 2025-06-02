'use server'

import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { redirect } from 'next/navigation'


export async function createSupabaseServerClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
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
  
  if (!user) {
    return { error: "User not found", success: false }
  }
  
  if (!user.user_metadata?.role || user.user_metadata.role !== 'admin') {
    await supabase.auth.signOut()
    return { error: "Access denied: Admin privileges required", success: false }
  }
  
  return { 
    error: null, 
    success: true,
    user: {
      id: user.id,
      email: user.email,
      role: user.user_metadata.role,
      name: user.user_metadata.name || user.email
    }
  }
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