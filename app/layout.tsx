"use client";

import "./globals.css";
import { AuthProvider } from '@/contexts/AuthContext'
import { NetworkProvider } from '@/contexts/NetworkContext'
import { Toaster } from 'react-hot-toast';
import { Providers } from "./providers";
import useOrgStore from '@/app/stores/UseOrgStore';
import { useEffect } from 'react';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { branding, _hasHydrated } = useOrgStore();

  // Apply organization branding to CSS variables
  useEffect(() => {
    if (_hasHydrated && branding?.color) {
      document.documentElement.style.setProperty('--brand-color', branding.color);
    }
  }, [branding, _hasHydrated]);

  return (
    <html lang="en">
      <body>
        {_hasHydrated ? (
          <AuthProvider>
            <NetworkProvider>
              <Providers>
                {children}
              </Providers>
              <Toaster 
                position="top-right"
                toastOptions={{
                  duration: 3000,
                  style: {
                    background: branding?.color || '#333',
                    color: '#fff',
                  },
                }} 
              />
            </NetworkProvider>
          </AuthProvider>
        ) : (
          // Show loading spinner or blank screen while hydrating
          <div className="flex items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        )}
      </body>
    </html>
  );
}