import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import type { Database } from './lib/database.types'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const pathname = req.nextUrl.pathname
  
  // Create a Supabase client configured for middleware
  const supabase = createMiddlewareClient<Database>({ req, res })
  
  // Refresh session if expired and still valid
  const {
    data: { session },
  } = await supabase.auth.getSession()
  
  // Define public routes that don't require authentication
  const publicRoutes = ['/signin', '/register', '/', '/about', '/client-registration']
  const isPublicRoute = publicRoutes.includes(pathname) || 
                       pathname.startsWith('/api/') || 
                       pathname.includes('.')
  
  // Check auth status and redirect if needed
  if (!session && !isPublicRoute) {
    // Redirect unauthenticated users to login page
    const redirectUrl = new URL('/signin', req.url)
    redirectUrl.searchParams.set('redirectTo', pathname)
    return NextResponse.redirect(redirectUrl)
  }
  
  // Allow authenticated users to access protected routes
  return res
}

// Specify which routes the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
}