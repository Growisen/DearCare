"use client";

import "./globals.css";
import { AuthProvider } from '@/contexts/AuthContext'
import { NetworkProvider } from '@/contexts/NetworkContext'
import { Toaster } from 'react-hot-toast';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <NetworkProvider>
            {children}
            <Toaster 
              position="top-right"
              toastOptions={{
                duration: 3000,
                style: {
                  background: '#333',
                  color: '#fff',
                },
              }} 
            />
          </NetworkProvider>
        </AuthProvider>
      </body>
    </html>
  );
}