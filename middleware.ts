import { type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { Database } from './lib/database.types'

export async function middleware(request: NextRequest) {
  try {
    let supabaseResponse = NextResponse.next({
      request,
    })

    const supabase = createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
            supabaseResponse = NextResponse.next({
              request,
            })
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options)
            )
          },
        },
      }
    )

    // IMPORTANT: DO NOT add code between client creation and getUser()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    
    // Define public routes that don't require authentication
    const pathname = request.nextUrl.pathname
    const publicRoutes = ['/signin', '/register', '/', '/about', '/client-registration', '/offline']
    const isPublicRoute = publicRoutes.includes(pathname) || 
                          pathname.startsWith('/api/') || 
                          pathname.startsWith('/patient-assessment/') ||
                          pathname.includes('.')

    // Check auth status and redirect if needed
    if (!user && !isPublicRoute) {
      // Redirect unauthenticated users to login page
      const redirectUrl = new URL('/signin', request.url)
      redirectUrl.searchParams.set('redirectTo', pathname)
      return NextResponse.redirect(redirectUrl)
    }

    // Check admin role for authenticated routes
    if (user && !isPublicRoute && (!user.user_metadata?.role || user.user_metadata.role !== 'admin')) {
      // Sign out users without admin privileges
      await supabase.auth.signOut()
      supabaseResponse.cookies.delete('sb-access-token')
      supabaseResponse.cookies.delete('sb-refresh-token')
      
      const redirectUrl = new URL('/signin', request.url)
      redirectUrl.searchParams.set('error', 'Access denied: Admin privileges required')
      return NextResponse.redirect(redirectUrl)
    }

    return supabaseResponse
  } catch (error) {
    console.error('Middleware error:', error)
    return NextResponse.next({
      request,
    })
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
}