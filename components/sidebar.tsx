"use client"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import { Users, Briefcase, Calendar, MapPin, Settings, ClipboardList, Home, LogOut } from "lucide-react"
import { useState, useEffect } from "react"

export default function Sidebar({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const pathname = usePathname()
  const { data: session, status } = useSession()

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('click', handleClickOutside)
    } else {
      document.removeEventListener('click', handleClickOutside)
    }
    return () => {
      document.removeEventListener('click', handleClickOutside)
    }
  }, [isOpen])

  const handleClickOutside = (event: MouseEvent) => {
    const sidebar = document.getElementById('sidebar')
    if (sidebar && !sidebar.contains(event.target as Node)) {
      onClose()
    }
  }

  return (
    <div id="sidebar" className={`w-48 h-screen bg-dCblue fixed left-0 top-0 shadow-[1px_0_3px_0_rgb(0,0,0,0.2)] z-50 rounded-r-2xl flex flex-col justify-between transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
      <div>
        <div className="h-16 border-b border-white/10 flex items-center px-6">
          <Image src="/logo.png" alt="Logo" width={180} height={60} className="mb-2 object-contain" />
        </div>
        <div className="p-4">
          <nav className="space-y-2">
            {[
              { icon: Home, label: "Dashboard", href: "/dashboard" },
              { icon: Users, label: "Nurses", href: "/nurses" },
              { icon: Briefcase, label: "Assignments", href: "/assignments" },
              { icon: MapPin, label: "Locations", href: "/locations" },
              { icon: Calendar, label: "Schedule", href: "/schedule" },
              { icon: ClipboardList, label: "Reports", href: "/reports" },
              { icon: Settings, label: "Settings", href: "/settings" },
            ].map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
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
      <div className="p-4">
        <button onClick={() => signOut()} className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-white/70 hover:bg-white/10 hover:text-white w-full">
          <div className="transition-all duration-200 p-1 rounded-lg group-hover:bg-white/15 group-hover:text-white">
            <LogOut className="w-[18px] h-[18px]" />
          </div>
          <span className="text-sm tracking-wide group-hover:font-medium">Logout</span>
        </button>
      </div>
    </div>
  )
}
