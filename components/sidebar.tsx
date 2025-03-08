"use client"
import { useCallback } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { Users, Briefcase, Calendar, MapPin, Settings, ClipboardList, Home, LogOut, ArrowLeftCircle } from "lucide-react"
import { useEffect } from "react"
import { useAuth } from '@/contexts/AuthContext'

export default function Sidebar({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const pathname = usePathname()
  const { signOut } = useAuth()

  const handleClickOutside = useCallback((event: MouseEvent) => {
    const sidebar = document.getElementById('sidebar')
    if (sidebar && !sidebar.contains(event.target as Node)) {
      onClose()
    }
  }, [onClose])

  const handleSignOut = async () => {
    await signOut();
  };

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('click', handleClickOutside)
    } else {
      document.removeEventListener('click', handleClickOutside)
    }
    return () => {
      document.removeEventListener('click', handleClickOutside)
    }
  }, [isOpen, handleClickOutside])

  return (
    <div id="sidebar" className={`w-48 h-screen bg-dCblue fixed left-0 top-0 shadow-[1px_0_3px_0_rgb(0,0,0,0.2)] z-50 rounded-r-2xl flex flex-col justify-between transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
      <div>
        <div className="h-16 border-b border-white/10 flex items-center gap-2 px-3">
          <div className="flex-1 min-w-0">
            <Image src="/logo.png" alt="Logo" width={140} height={60} className="object-contain" />
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 shrink-0 flex items-center justify-center hover:bg-white/20 
              rounded-lg transition-all duration-200 lg:hidden"
            aria-label="Close sidebar"
          >
            <ArrowLeftCircle className="w-5 h-5 text-white/90 hover:text-white" />
          </button>
        </div>
        <div className="p-4">
          <nav className="space-y-2">
            {[
              { icon: Home, label: "Dashboard", href: "/dashboard" },
              { icon: Users, label: "Nurses", href: "/nurses" },
              { icon: Users, label: "Clients", href: "/clients" },
              { icon: Briefcase, label: "Assignments", href: "/assignments" },
              { icon: MapPin, label: "Locations", href: "/locations" },
              { icon: Calendar, label: "Schedule", href: "/schedule" },
              { icon: ClipboardList, label: "Reports", href: "/reports" },
              { icon: Settings, label: "Settings", href: "/settings" },
              { icon: LogOut, label: "Logout", href: "#", onClick: () => handleSignOut() },
            ].map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={item.onClick}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative
                    ${isActive 
                      ? 'bg-white/15 text-white' 
                      : 'text-white/70 hover:bg-white/10 hover:text-white'
                    }`}
                >
                  <div className={`transition-all duration-200 p-1 rounded-lg 
                    ${isActive 
                      ? 'bg-white/25 text-white' 
                      : 'group-hover:bg-white/15 group-hover:text-white'
                    }`}>
                    <item.icon className="w-[18px] h-[18px]" />
                  </div>
                  <span className={`text-sm tracking-wide transition-all duration-200
                    ${isActive 
                      ? 'font-semibold' 
                      : 'group-hover:font-medium'
                    }`}
                  >
                    {item.label}
                  </span>
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-7 bg-white rounded-r-full" />
                  )}
                </Link>
              )
            })}
          </nav>
        </div>
      </div>
    </div>
  )
}
