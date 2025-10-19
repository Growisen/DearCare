"use client"
import { Bell, Search, Menu, BarChart2, HelpCircle, X } from "lucide-react"
import Image from "next/image"
import { Input } from "./ui/input"
import AccountDropdown from "./Admin/Accounts/AccountDropdown"
import { useState, useRef, useEffect } from "react"
import { useDcWebNotifications } from "@/hooks/useDcWebNotifications" 
import { WebNotification } from "@/types/notification.types"

interface NavbarProps {
  onMenuClick: () => void
  onNavigate?: (section: string) => void
  searchResults?: Array<{
    title: string;
    description: string;
    type?: string;
  }>
  onSearch?: (query: string) => void
}

export default function Navbar({ 
  onMenuClick, 
  onNavigate,
  searchResults = [],
  onSearch,
}: NavbarProps) {
  const { notificationsQuery } = useDcWebNotifications();
  
  const notifications = notificationsQuery.data?.notifications || [];

  const [searchQuery, setSearchQuery] = useState("")
  const [showSearchResults, setShowSearchResults] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const notificationRef = useRef<HTMLDivElement>(null)

  const hasNotifications = notifications.length > 0;

  const handleSearch = (value: string) => {
    setSearchQuery(value)
    if (onSearch) {
      onSearch(value)
    }
    setShowSearchResults(value.length > 0)
  }

  const handleNavigation = (section: string) => {
    if (onNavigate) {
      onNavigate(section)
    }
  }

  useEffect(() => {
    if (hasNotifications) {
      const dismissed = localStorage.getItem("notificationsDismissed");
      if (!dismissed) {
        setShowNotifications(true);
      }
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
    <div className="h-16 border-b border-slate-200 fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-md backdrop-filter z-10 shadow-sm lg:pl-56">
      <div className="flex items-center h-full px-4">
        <div className="flex items-center gap-2">
          <button onClick={onMenuClick} className="p-2 hover:bg-slate-100 rounded-lg transition-colors lg:hidden">
            <Menu className="w-5 h-5 text-slate-500" />
          </button>
          <div className="h-16 border-b border-white/10 flex items-center pr-6 lg:hidden">
            <Image src="/dcTransparent.png" alt="Logo" width={120} height={40} className="my-2 object-contain" />
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="hidden md:flex items-center gap-3">
          <button
            onClick={() => handleNavigation('analytics')}
            className="px-3 py-1.5 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-md transition-colors flex items-center gap-1.5"
          >
            <BarChart2 className="w-4 h-4" />
            Analytics
          </button>
          <button
            onClick={() => handleNavigation('support')}
            className="px-3 py-1.5 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-md transition-colors flex items-center gap-1.5"
          >
            <HelpCircle className="w-4 h-4" />
            Support
          </button>
        </div>

        {/* Search Bar with Results */}
        <div className="flex-1 flex justify-end max-w-3xl ml-4 md:ml-8">
          <div className="relative w-full max-w-md" ref={searchRef}>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search anything..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10 w-full bg-slate-50/50 border-slate-200 focus:border-blue-600 pr-4 rounded-lg text-gray-800"
            />
            
            {/* Search Results Dropdown */}
            {showSearchResults && searchResults && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg border border-slate-200 max-h-96 overflow-y-auto z-50">
                {searchResults.length > 0 ? (
                  <div className="py-2">
                    {searchResults.map((result, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          handleNavigation(result.type || 'dashboard')
                          setShowSearchResults(false)
                          setSearchQuery("")
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-slate-50 transition-colors"
                      >
                        <div className="font-medium text-slate-900">{result.title}</div>
                        <div className="text-sm text-slate-500">{result.description}</div>
                      </button>
                    ))}
                  </div>
                ) : searchQuery.length > 0 ? (
                  <div className="px-4 py-3 text-slate-500 text-sm">
                    No results found for `{searchQuery}`
                  </div>
                ) : null}
              </div>
            )}
          </div>
        </div>
        
        {/* Notifications and Account */}
        <div className="flex items-center gap-2 ml-auto md:ml-8">
          <div className="relative" ref={notificationRef}>
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 hover:bg-slate-50 rounded-lg transition-colors group"
            >
              <Bell className="w-5 h-5 text-slate-500 group-hover:text-slate-700" />
              {hasNotifications && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute top-full right-0 mt-1 w-80 bg-white rounded-lg shadow-lg border border-slate-200 max-h-96 overflow-y-auto z-50">
                <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
                  <h3 className="font-medium text-slate-900">Notifications</h3>
                  <button
                    onClick={handleCloseNotifications}
                    className="p-1 hover:bg-slate-100 rounded"
                  >
                    <X className="w-4 h-4 text-slate-500" />
                  </button>
                </div>
                
                {hasNotifications ? (
                  <div className="py-2">
                    {notifications.map((notif: WebNotification, index: number) => (
                      <div
                        key={notif.id || index}
                        className="w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors border-l-2 border-transparent"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="font-medium text-slate-900 text-sm">{notif.title}</div>
                            <div className="text-sm text-slate-600 mt-1">{notif.message}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="px-4 py-6 text-center text-slate-500">
                    No notifications
                  </div>
                )}
              </div>
            )}
          </div>
          
          <div className="h-6 w-px bg-slate-200 mx-1"></div>
          <AccountDropdown />
        </div>
      </div>
    </div>
  )
}