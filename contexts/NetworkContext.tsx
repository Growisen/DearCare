"use client";

import { createContext, useContext, useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';

interface NetworkContextType {
  isOnline: boolean;
}

const NetworkContext = createContext<NetworkContextType>({ isOnline: true });

export const useNetwork = () => useContext(NetworkContext);

export const NetworkProvider = ({ children }: { children: React.ReactNode }) => {
  const [isOnline, setIsOnline] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Set initial state based on navigator
    if (typeof window !== 'undefined') {
      setIsOnline(navigator.onLine);
      
      // Handle offline/online events
      const handleOnline = () => {
        setIsOnline(true);
        if (pathname === '/offline') {
          router.back();
        }
      };
      
      const handleOffline = () => {
        setIsOnline(false);
        router.push('/offline');
      };
      
      // Initialize
      if (!navigator.onLine) {
        router.push('/offline');
      }

      // Add event listeners
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);

      // Clean up
      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }
  }, [router, pathname]);

  return (
    <NetworkContext.Provider value={{ isOnline }}>
      {children}
    </NetworkContext.Provider>
  );
};