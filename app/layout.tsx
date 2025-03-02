'use client';

import { useAuthProtection, setupGlobalAuth } from '../lib/auth';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Initialize auth protection from our library
  const auth = useAuthProtection();
  const pathname = usePathname();
  const router = useRouter();
  
  // Make auth methods globally available
  setupGlobalAuth(auth);

  // Handle special redirects for already authenticated users
  useEffect(() => {
    // Only run this effect once auth is loaded
    if (auth.isLoading) {
      return;
    }
    
    // If user is logged in and tries to access /signin, redirect to dashboard
    if (auth.isAdmin && pathname === '/signin') {
      router.push('/dashboard');
    }
  }, [auth.isAdmin, auth.isLoading, pathname, router]);

  // Determine if we should show content or a loading state
  const showContent = () => {
    // If still loading auth state, show loading for protected routes
    if (auth.isLoading && !auth.isProtectedRoute()) {
      return true; // Show content for public routes even while loading
    }
    
    // For protected routes, only show content if authenticated
    if (auth.isProtectedRoute() && !auth.isAdmin) {
      return false; // Don't show protected content if not authenticated
    }
    
    // Special case: don't show signin page for logged-in users
    if (pathname === '/signin' && auth.isAdmin) {
      return false; // Don't show signin if already logged in
    }
    
    return true; // Otherwise show content
  };

  return (
    <html lang="en">
      <body>
        {showContent() ? (
          children
        ) : (
          <div className="flex flex-col items-center justify-center h-screen bg-white">
            <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
            <p className="mt-4 text-sm text-gray-600 font-medium">Please wait...</p>
          </div>
        )}
      </body>
    </html>
  );
}