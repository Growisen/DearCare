import { useCallback } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { 
  Users, 
  Calendar, 
  ClipboardCheck,
  Home, 
  ArrowLeftCircle, 
  MessageSquare, 
  Clipboard,
  HeartPulse,
  Building,
  Settings
} from "lucide-react"
import { useEffect } from "react"
// import { useAuth } from '@/contexts/AuthContext'

export default function Sidebar({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const pathname = usePathname()
  // const { signOut } = useAuth()

  const handleClickOutside = useCallback((event: MouseEvent) => {
    const sidebar = document.getElementById('sidebar')
    if (sidebar && !sidebar.contains(event.target as Node)) {
      onClose()
    }
  }, [onClose])

  // const handleSignOut = async () => {
  //   await signOut();
  // };

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
    <div id="sidebar" className={`w-56 h-screen bg-dCblue fixed left-0 top-0 shadow-lg z-50 rounded-r-xl flex flex-col justify-between transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
      <div className="flex flex-col h-full">
        <div className="h-16 border-b border-white/15 flex items-center gap-2 px-4">
          <div className="flex-1 min-w-0">
            <Image src="/logo.png" alt="Logo" width={120} height={60} className="object-contain" />
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 shrink-0 flex items-center justify-center hover:bg-white/15 
              rounded-md transition-all duration-200 lg:hidden"
            aria-label="Close sidebar"
          >
            <ArrowLeftCircle className="w-5 h-5 text-white/90 hover:text-white" />
          </button>
        </div>
        
        <div className="p-3 flex-1">
          <nav className="space-y-1">
          {[
            { icon: Home, label: "Dashboard", href: "/dashboard" },
            { icon: Users, label: "Clients", href: "/clients" },
            { icon: HeartPulse, label: "Nurses", href: "/nurses" },
            { icon: Building, label: "Staff", href: "/staff" },
            { icon: Clipboard, label: "Assignments", href: "/assignments" },
            { icon: ClipboardCheck, label: "Staff Attendance", href: "/staff-attendance" },
            { icon: Calendar, label: "Leave Management", href: "/leave-requests" },
            { icon: MessageSquare, label: "Complaints", href: "/complaints" },
            { icon: Settings, label: "Settings", href: "/settings" },
          ].map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative
                    ${isActive 
                      ? 'bg-white/15 text-white' 
                      : 'text-white/70 hover:bg-white/10 hover:text-white'
                    }`}
                >
                  <div className={`transition-all duration-200 p-1.5 rounded-md
                    ${isActive 
                      ? 'bg-white/20 text-white shadow-sm' 
                      : 'group-hover:bg-white/10 group-hover:text-white'
                    }`}>
                    <item.icon className="w-[18px] h-[18px]" strokeWidth={2.25} />
                  </div>
                  <span className={`text-sm tracking-wide transition-all duration-200
                    ${isActive 
                      ? 'font-medium' 
                      : 'group-hover:font-medium'
                    }`}
                  >
                    {item.label}
                  </span>
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-white rounded-r-full" />
                  )}
                </Link>
              )
            })}
          </nav>
        </div>
        
        <div className="mt-auto p-4 border-t border-white/15">
          <div className="bg-white/10 rounded-lg p-3 shadow-sm">
            <div className="text-xs font-medium text-white/80 mb-1">DearCare Admin</div>
            <div className="text-[11px] text-white/60">Care Management System</div>
          </div>
        </div>
      </div>
    </div>
  )
}