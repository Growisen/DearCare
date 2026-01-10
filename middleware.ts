import { type NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
  try {
    let supabaseResponse = NextResponse.next({
      request,
    })

    const supabase = createServerClient(
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
        // Optimization: Explicitly disable realtime to avoid WebSocket errors in Edge
        // (This helps if you are stuck on an older version of supabase-js)
        realtime: {
          
        }
      }
    )

    // IMPORTANT: DO NOT add code between client creation and getUser()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    const pathname = request.nextUrl.pathname
    
    const publicPaths = [
      '/signin', '/', '/about', 
      '/client-registration', '/dc/client-registration', '/th/client-registration',
      '/forgot-password', '/client-enquiry'
    ]

    const publicPrefixes = [
      '/api/', 
      '/patient-assessment/', 
      '/reassessment/', 
      '/delivery-care-preferences/', 
      '/home-maid-preferences/', 
      '/child-care-preferences/'
    ]

    const isPublicRoute = 
      publicPaths.includes(pathname) || 
      publicPrefixes.some(prefix => pathname.startsWith(prefix)) ||
      pathname.includes('.')

    if (!user && !isPublicRoute) {
      console.log('Middleware: Unauthenticated access to', pathname)
      const redirectUrl = new URL('/signin', request.url)
      redirectUrl.searchParams.set('redirectTo', pathname)
      return NextResponse.redirect(redirectUrl)
    }

    if (user && !isPublicRoute) {
      const role = user.user_metadata?.role
      if (role !== 'admin') {
        console.log(`Middleware: Access denied for user ${user.id} (Role: ${role})`)

        await supabase.auth.signOut()

        supabaseResponse.cookies.delete('sb-access-token')
        supabaseResponse.cookies.delete('sb-refresh-token')

        const redirectUrl = new URL('/signin', request.url)
        redirectUrl.searchParams.set('error', 'Access denied: Admin privileges required')
        return NextResponse.redirect(redirectUrl)
      }
    }

    return supabaseResponse
    
  } catch (error) {
    console.error('Middleware error:', error)
    // In case of error, allow request to proceed (safer than crashing)
    // or redirect to a custom error page depending on preference
    return NextResponse.next({
      request,
    })
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public folder)
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
}