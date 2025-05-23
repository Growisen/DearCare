"use client"
import { useState, useRef, useEffect } from "react"
import { User, UserCircle, Key, Edit, LogOut } from "lucide-react"

interface AccountDropdownProps {
  name: string;
  email: string;
  role: string;
}

export default function AccountDropdown({ name, email, role }: AccountDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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
        className="flex items-center gap-3 px-2 py-1.5 hover:bg-gray-50 rounded-lg transition-colors group"
      >
        <div className="w-8 h-8 rounded-full ring-2 ring-gray-100 bg-gradient-to-tr from-blue-600 to-blue-400 flex items-center justify-center text-white">
          <User className="w-4 h-4" />
        </div>
        <div className="hidden md:block text-left">
          <p className="text-sm font-medium text-gray-700 group-hover:text-gray-900">{name}</p>
          <p className="text-xs text-gray-500">{role}</p>
        </div>
      </button>
      
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-100 py-2 z-20">
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="text-sm font-semibold text-gray-800">{name}</p>
            <p className="text-xs text-gray-500">{email}</p>
          </div>
          
          <div className="py-1">
            <p className="px-4 py-1 text-xs font-medium text-gray-500 uppercase tracking-wider">Profile</p>
            <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
              <UserCircle className="w-4 h-4 text-gray-500" />
              <span>View Profile</span>
            </button>
            <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
              <Edit className="w-4 h-4 text-gray-500" />
              <span>Edit Profile</span>
            </button>
          </div>
          
          <div className="py-1 border-t border-gray-100">
            <p className="px-4 py-1 text-xs font-medium text-gray-500 uppercase tracking-wider">Security</p>
            <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
              <Key className="w-4 h-4 text-gray-500" />
              <span>Reset Password</span>
            </button>
          </div>
          
          <div className="border-t border-gray-100 pt-1 mt-1">
            <button className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2">
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}