"use client";

import { useEffect, useState } from 'react';
import { Card } from "../ui/card";
import { WifiOff, Wifi, Loader2, X } from "lucide-react";
import ModalPortal from "../ui/ModalPortal";

type OfflineOverlayProps = {
  onClose?: () => void;
  autoRedirect?: boolean;
};

export default function OfflineOverlay({ 
  onClose,
  autoRedirect = true 
}: OfflineOverlayProps) {
  const [isOnline, setIsOnline] = useState(true);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Check initial status
    const initialStatus = navigator.onLine;
    setIsOnline(initialStatus);
    setVisible(!initialStatus);
    
    // Listen for online/offline events
    const handleOnline = () => {
      setIsOnline(true);
      
      if (autoRedirect) {
        setTimeout(() => {
          setVisible(false);
          if (onClose) onClose();
        }, 2000); // Small delay before hiding
      }
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      setVisible(true);
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [onClose, autoRedirect]);

  const handleDismiss = () => {
    setVisible(false);
    if (onClose) onClose();
  };

  if (!visible) return null;

  return (
    <ModalPortal>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <Card className="max-w-md w-full p-6 bg-white border border-slate-200 shadow-md rounded-sm relative">
          <button 
            onClick={handleDismiss}
            className="absolute top-2 right-2 text-slate-500 hover:text-slate-800"
            aria-label="Close"
          >
            <X size={18} />
          </button>
          
          <div className="text-center">
            {isOnline ? (
              <div className="flex justify-center mb-4">
                <div className="relative">
                  <Wifi className="w-16 h-16 text-emerald-600" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 text-emerald-700 animate-spin" />
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex justify-center mb-4">
                <WifiOff className="w-16 h-16 text-slate-700" />
              </div>
            )}
            
            <h1 className="text-xl sm:text-2xl font-semibold text-slate-800 mb-2">
              {isOnline ? "Connection Restored" : "You're Offline"}
            </h1>
            
            <div className="border-t border-slate-200 my-4"></div>
            
            <p className="mb-4 text-sm text-slate-600">
              {isOnline 
                ? "Your internet connection has been restored."
                : "Please check your internet connection and try again. The application may have limited functionality while offline."
              }
            </p>
            
            {isOnline && autoRedirect && (
              <div className="w-full bg-slate-100 rounded-full h-1.5 mt-4">
                <div 
                  className="bg-emerald-600 h-1.5 rounded-full animate-pulse"
                  style={{ width: '100%' }}
                ></div>
              </div>
            )}
            
            {isOnline && !autoRedirect && (
              <button 
                onClick={handleDismiss}
                className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-sm hover:bg-emerald-700 transition-colors"
              >
                Continue
              </button>
            )}
            
            {!isOnline && (
              <button 
                onClick={handleDismiss}
                className="mt-4 px-4 py-2 bg-slate-200 text-slate-800 rounded-sm hover:bg-slate-300 transition-colors"
              >
                Dismiss
              </button>
            )}
          </div>
        </Card>
      </div>
    </ModalPortal>
  );
}