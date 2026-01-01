"use client"
import { useState, useRef, useEffect } from "react"
import { User, UserCircle, LogOut, AlertCircle, Loader2 } from "lucide-react"
import { useAuth } from '@/contexts/AuthContext'
import ModalPortal from '@/components/ui/ModalPortal'
import { useQueryClient } from "@tanstack/react-query"

export default function AccountDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { signOut } = useAuth();
  const queryClient = useQueryClient();

  const handleSignOut = async () => {
    setIsOpen(false); 
    setShowConfirmModal(true); 
  };

  const confirmSignOut = async () => {
    try {
      setIsSigningOut(true);
      queryClient.clear();
      await signOut();
    } catch (error) {
      console.error("Error signing out:", error);
    } finally {
      setIsSigningOut(false);
      setShowConfirmModal(false);
    }
  };

  const cancelSignOut = () => {
    setShowConfirmModal(false);
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="flex items-center gap-3 px-2 py-1.5 hover:bg-gray-50 rounded-sm transition-colors group"
      >
        <div className="w-8 h-8 rounded-full ring-2 ring-gray-100 bg-gradient-to-tr from-blue-600 to-blue-400 flex items-center justify-center text-white">
          <User className="w-4 h-4" />
        </div>
        <div className="hidden md:block text-left">
          <p className="text-sm font-medium text-gray-700 group-hover:text-gray-900">Account</p>
        </div>
      </button>
      
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-sm shadow-lg border border-slate-200 py-2 z-20">
          <div className="py-1">
            <p className="px-4 py-1 text-xs font-medium text-gray-500 uppercase tracking-wider">Profile</p>
            <a 
              href="/user/profile" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
            >
              <UserCircle className="w-4 h-4 text-gray-500" />
              <span>Profile</span>
            </a>
          </div>
          
          {/* <div className="py-1 border-t border-slate-200">
            <p className="px-4 py-1 text-xs font-medium text-gray-500 uppercase tracking-wider">Security</p>
            <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
              <Key className="w-4 h-4 text-gray-500" />
              <span>Reset Password</span>
            </button>
          </div> */}
          
          <div className="border-t border-slate-200 pt-1 mt-1">
            <button 
              onClick={handleSignOut}
              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}

      {/* Confirmation Modal with Portal */}
      {showConfirmModal && (
        <ModalPortal>
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div 
              className="bg-white rounded-sm shadow-lg max-w-md w-full p-6"
              style={{ animation: 'fadeIn 0.2s ease-out' }}
            >
              <div className="flex items-center gap-3 text-amber-500 mb-4">
                <AlertCircle className="w-6 h-6" />
                <h3 className="text-lg font-medium">Sign Out Confirmation</h3>
              </div>
              <p className="text-gray-600 mb-6">
                Are you sure you want to sign out? You will need to log in again to access your account.
              </p>
              <div className="flex justify-end gap-3">
                {!isSigningOut && (
                  <button 
                    onClick={cancelSignOut}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-sm"
                  >
                    Cancel
                  </button>
                )}
                <button 
                  onClick={confirmSignOut}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-sm flex items-center justify-center min-w-[80px]"
                  disabled={isSigningOut}
                >
                  {isSigningOut ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      <span>Signing out...</span>
                    </>
                  ) : (
                    <span>Sign Out</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </ModalPortal>
      )}
    </div>
  );
}