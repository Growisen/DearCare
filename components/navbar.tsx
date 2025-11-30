"use client"

import { 
  Bell, 
  Search, 
  Menu,
  X, 
  FileText, 
  ExternalLink,
  Copy,
  Check
} from "lucide-react"
import Image from "next/image"
import { Input } from "./ui/input"
import AccountDropdown from "./Admin/Accounts/AccountDropdown"
import { useState, useRef, useEffect } from "react"
import { useDcWebNotifications } from "@/hooks/useDcWebNotifications" 
import { WebNotification } from "@/types/notification.types"
import useOrgStore from "@/app/stores/UseOrgStore"

interface NavbarProps {
  onMenuClick: () => void
  onNavigate?: (section: string) => void
  searchResults?: Array<{
    title: string;
    description: string;
    type?: string;
  }>
  onSearch?: (query: string) => void
  registrationUrl?: string
}

export default function Navbar({ 
  onMenuClick, 
  onNavigate,
  searchResults = [],
  onSearch,
  registrationUrl: propRegistrationUrl = "/client-registration"
}: NavbarProps) {
  const { notificationsQuery } = useDcWebNotifications();
  const { organization } = useOrgStore()
  const notifications = notificationsQuery.data?.notifications || [];

  let registrationUrl = propRegistrationUrl;
  if (organization === "DearCare") {
    registrationUrl = "/dc/client-registration";
  } else if (organization === "TataHomeNursing") {
    registrationUrl = "/th/client-registration";
  }

  const [searchQuery, setSearchQuery] = useState("")
  const [showSearchResults, setShowSearchResults] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [isCopied, setIsCopied] = useState(false)
  
  const searchRef = useRef<HTMLDivElement>(null)
  const notificationRef = useRef<HTMLDivElement>(null)

  const hasNotifications = notifications.length > 0;

  const handleSearch = (value: string) => {
    setSearchQuery(value)
    if (onSearch) onSearch(value)
    setShowSearchResults(value.length > 0)
  }

  const handleNavigation = (section: string) => {
    if (onNavigate) onNavigate(section)
  }

  const handleCopyLink = async () => {
    try {
      const fullUrl = `${window.location.origin}${registrationUrl.startsWith("/") ? registrationUrl : `/${registrationUrl}`}`;
      await navigator.clipboard.writeText(fullUrl);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy", err);
    }
  }
  useEffect(() => {
    if (hasNotifications) {
      const dismissed = localStorage.getItem("notificationsDismissed");
      if (!dismissed) setShowNotifications(true);
    }
  }, [hasNotifications]);

  const handleCloseNotifications = () => {
    setShowNotifications(false);
    localStorage.setItem("notificationsDismissed", "true");
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node | null)) {
        setShowSearchResults(false)
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node | null)) {
        setShowNotifications(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="h-14 border-b border-gray-200 fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm z-20 shadow-sm lg:pl-56 transition-all duration-300">
      <div className="flex items-center justify-between h-full px-4 max-w-[1920px] mx-auto">
        
        <div className="flex items-center gap-3">
          <button 
            onClick={onMenuClick} 
            className="p-1.5 hover:bg-gray-100 rounded-md transition-colors lg:hidden text-gray-600"
            aria-label="Toggle Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          
          <div className="flex items-center lg:hidden">
            <Image 
              src="/dcTransparent.png" 
              alt="Logo" 
              width={100} 
              height={32} 
              className="object-contain h-8 w-auto" 
            />
          </div>
        </div>

        <div className="flex-1 max-w-xl px-4 lg:px-8">
          <div className="relative w-full" ref={searchRef}>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="h-9 pl-9 w-full bg-white border-gray-200 focus:border-gray-300 focus:ring-1 focus:ring-gray-200 rounded-md text-sm text-gray-800 placeholder:text-gray-400 transition-all shadow-sm"
            />
            
            {showSearchResults && searchResults && (
              <div className="absolute top-full left-0 right-0 mt-1.5 bg-white rounded-md shadow-lg border border-gray-100 max-h-96 overflow-y-auto z-50 animate-in fade-in zoom-in-95 duration-100">
                {searchResults.length > 0 ? (
                  <div className="py-1">
                    {searchResults.map((result, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          handleNavigation(result.type || 'dashboard')
                          setShowSearchResults(false)
                          setSearchQuery("")
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0"
                      >
                        <div className="font-medium text-gray-900 text-sm">{result.title}</div>
                        <div className="text-xs text-gray-500 mt-0.5">{result.description}</div>
                      </button>
                    ))}
                  </div>
                ) : searchQuery.length > 0 ? (
                  <div className="px-4 py-3 text-gray-500 text-sm">
                    No results found for &ldquo;{searchQuery}&rdquo;
                  </div>
                ) : null}
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          
          <div className="hidden sm:flex items-center rounded-md border border-blue-200 bg-blue-50 overflow-hidden shadow-sm">
            <a
              href={registrationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-blue-700 hover:bg-blue-100 transition-colors border-r border-blue-200"
              title="Open Registration Form"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Registration Form</span>
              <ExternalLink className="w-3 h-3 opacity-50" />
            </a>
            <button
              onClick={handleCopyLink}
              className="px-2 py-1.5 text-blue-700 hover:bg-blue-100 transition-colors flex items-center justify-center min-w-[32px]"
              title="Copy Link"
            >
              {isCopied ? (
                <Check className="w-3.5 h-3.5 text-green-600" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>
          </div>

          <div className="h-5 w-px bg-gray-200 hidden sm:block"></div>

          <div className="relative" ref={notificationRef}>
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-1.5 hover:bg-gray-100 text-gray-500 hover:text-gray-700 rounded-md transition-colors"
            >
              <Bell className="w-5 h-5" />
              {hasNotifications && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-100 max-h-[400px] overflow-y-auto z-50">
                <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                  <h3 className="font-semibold text-sm text-gray-900">Notifications</h3>
                  <button onClick={handleCloseNotifications} className="p-1 hover:bg-gray-200 rounded transition-colors">
                    <X className="w-4 h-4 text-gray-500" />
                  </button>
                </div>
                
                {hasNotifications ? (
                  <div className="py-1">
                    {notifications.map((notif: WebNotification, index: number) => (
                      <div
                        key={notif.id || index}
                        className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0"
                      >
                        <div className="flex items-start gap-3">
                          <div className="mt-1 min-w-[6px] h-[6px] rounded-full bg-blue-500" />
                          <div>
                            <div className="font-medium text-gray-900 text-sm">{notif.title}</div>
                            <div className="text-xs text-gray-500 mt-1 leading-relaxed">{notif.message}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="px-4 py-8 text-center text-gray-400 text-sm">
                    No new notifications
                  </div>
                )}
              </div>
            )}
          </div>
          
          <AccountDropdown />
        </div>
      </div>
    </div>
  )
}