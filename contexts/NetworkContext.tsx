"use client";

import { createContext, useContext, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import OfflineOverlay from '@/components/common/OfflineOverlay';

interface NetworkContextType {
  isOnline: boolean;
}

const NetworkContext = createContext<NetworkContextType>({ isOnline: true });

export const useNetwork = () => useContext(NetworkContext);

export const NetworkProvider = ({ children }: { children: React.ReactNode }) => {
  const [isOnline, setIsOnline] = useState(true);
  const [showOfflineOverlay, setShowOfflineOverlay] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const initialStatus = navigator.onLine;
      setIsOnline(initialStatus);
      setShowOfflineOverlay(!initialStatus);
      
      const handleOnline = () => {
        setIsOnline(true);
      };
      
      const handleOffline = () => {
        setIsOnline(false);
        setShowOfflineOverlay(true);
      };

      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);

      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }
  }, [pathname]);

  const handleOverlayClose = () => {
    setShowOfflineOverlay(false);
  };

  return (
    <NetworkContext.Provider value={{ isOnline }}>
      {children}
      {showOfflineOverlay && (
        <OfflineOverlay 
          onClose={handleOverlayClose} 
          autoRedirect={true}
        />
      )}
    </NetworkContext.Provider>
  );
};