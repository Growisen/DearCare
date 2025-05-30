"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from "../../components/ui/card";
import { MdWifiOff, MdWifi } from "react-icons/md";
import { BiLoaderAlt } from "react-icons/bi";

export default function OfflinePage() {
  const [isOnline, setIsOnline] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check initial status
    setIsOnline(navigator.onLine);
    
    // If already online, redirect to home
    if (navigator.onLine) {
      router.push('/');
    }
    
    // Listen for when we come back online
    const handleOnline = () => {
      setIsOnline(true);
      setTimeout(() => {
        router.push('/');
      }, 2000); // Small delay before redirecting
    };
    
    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [router]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-slate-50">
      <Card className="max-w-md w-full p-6 bg-white border border-slate-200 shadow-md rounded-lg">
        <div className="text-center">
          {isOnline ? (
            <div className="flex justify-center mb-4">
              <div className="relative">
                <MdWifi className="w-16 h-16 text-emerald-600" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <BiLoaderAlt className="w-8 h-8 text-emerald-700 animate-spin" />
                </div>
              </div>
            </div>
          ) : (
            <div className="flex justify-center mb-4">
              <MdWifiOff className="w-16 h-16 text-slate-700" />
            </div>
          )}
          
          <h1 className="text-xl sm:text-2xl font-semibold text-slate-800 mb-2">
            {isOnline ? "Connection Restored" : "You're Offline"}
          </h1>
          
          <div className="border-t border-slate-200 my-4"></div>
          
          <p className="mb-4 text-sm text-slate-600">
            {isOnline 
              ? "Your internet connection has been restored. Redirecting you back..."
              : "Please check your internet connection and try again. The application will automatically redirect when your connection returns."
            }
          </p>
          
          {isOnline && (
            <div className="w-full bg-slate-100 rounded-full h-1.5 mt-4">
              <div 
                className="bg-emerald-600 h-1.5 rounded-full animate-pulse"
                style={{ width: '100%' }}
              ></div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}