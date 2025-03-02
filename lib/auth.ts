// lib/auth.ts
'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';

// Define public routes that don't require authentication
const publicRoutes = ['/signin'];

// Create the authentication library
export function useAuthProtection() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // Add loading state
  const pathname = usePathname();
  const router = useRouter();

  // Auth methods
  const login = () => {
    setIsAdmin(true);
    localStorage.setItem('isAdmin', 'true');
    router.push('/dashboard');
  };

  const logout = () => {
    setIsAdmin(false);
    localStorage.removeItem('isAdmin');
    router.push('/signin');
  };

  // Check localStorage on initial load
  useEffect(() => {
    const storedAuth = localStorage.getItem('isAdmin');
    if (storedAuth === 'true') {
      setIsAdmin(true);
    }
    setIsLoading(false); // Mark loading as complete
  }, []);

  // Protect routes on navigation - run this effect first with higher priority
  useEffect(() => {
    // Still loading auth state, don't make decisions yet
    if (isLoading) return;
    
    // Skip for public routes
    if (publicRoutes.includes(pathname)) {
      return;
    }
    
    // If not authenticated, redirect to signin
    if (!isAdmin) {
      router.push('/signin');
    }
  }, [isAdmin, pathname, router, isLoading]);

  // Check if current route is protected
  const isProtectedRoute = () => !publicRoutes.includes(pathname);

  // Return auth state and methods to be made globally available
  return {
    isAdmin,
    isLoading,
    login,
    logout,
    isProtectedRoute
  };
}

// Expose auth globally to window
export function setupGlobalAuth(authMethods: ReturnType<typeof useAuthProtection>) {
  if (typeof window !== 'undefined') {
    window.auth = authMethods;
  }
}

// Type definition for global auth
declare global {
  interface Window {
    auth: ReturnType<typeof useAuthProtection>;
  }
}