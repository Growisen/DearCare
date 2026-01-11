"use client"
import { useState, useRef, useEffect } from "react"
import { User, UserCircle, LogOut } from "lucide-react"
import { useAuth } from '@/contexts/AuthContext'
import Modal from '@/components/ui/Modal'
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

      <Modal
        open={showConfirmModal}
        onClose={isSigningOut ? () => {} : cancelSignOut}
        onConfirm={confirmSignOut}
        variant="delete"
        title="Sign Out Confirmation"
        description="Are you sure you want to sign out? You will need to log in again to access your account."
        confirmText={isSigningOut ? "Signing out..." : "Sign Out"}
        cancelText="Cancel"
      />
    </div>
  );
}