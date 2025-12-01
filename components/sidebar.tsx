import { useCallback, useEffect } from "react"
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
  UserPlus,
  CreditCard,
  ChevronLeft,
  ChevronRight
} from "lucide-react"
import useOrgStore from "@/app/stores/UseOrgStore"

export default function Sidebar({ isOpen, onClose, isCollapsed, setCollapsed }: { 
  isOpen: boolean, 
  onClose: () => void,
  isCollapsed: boolean,
  setCollapsed: (collapsed: boolean) => void
}) {
  const pathname = usePathname()
  const { branding, organization, _hasHydrated } = useOrgStore()
  
  const orgLabel = organization === 'TataHomeNursing' ? 'Tata Home Nursing' : (organization || 'DearCare')

  const handleClickOutside = useCallback((event: MouseEvent) => {
    const sidebar = document.getElementById('sidebar')
    if (sidebar && !sidebar.contains(event.target as Node)) {
      onClose()
    }
  }, [onClose])

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

  if (!_hasHydrated) {
    return null;
  }

  return (
    <div 
      id="sidebar" 
      className={`fixed left-0 top-0 h-screen shadow-lg z-50 rounded-r-xl flex flex-col justify-between transition-all duration-300 
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
        lg:translate-x-0 
        ${isCollapsed ? 'w-20' : 'w-56'}`}
      style={{ backgroundColor: branding?.color || '#1e40af' }}
    >
      <div className="flex flex-col h-full overflow-hidden">
        <div className={`h-16 border-b border-white/15 flex items-center gap-2 transition-all duration-300 ${isCollapsed ? 'justify-center px-0' : 'px-4'}`}>
          <div className={`${isCollapsed ? 'hidden' : 'flex-1 min-w-0'}`}>
            <Image 
              src={branding?.logo || "/logo.png"} 
              alt="Organization Logo" 
              width={120} 
              height={60} 
              className="object-contain" 
            />
          </div>
          
          {isCollapsed && (
             <div className="w-10 h-10 relative">
               <Image 
                src={branding?.logo || "/logo.png"} 
                alt="Logo" 
                fill
                className="object-contain p-1" 
              />
             </div>
          )}

          <button 
            onClick={onClose}
            className="w-8 h-8 shrink-0 flex items-center justify-center hover:bg-white/15 rounded-md transition-all duration-200 lg:hidden"
            aria-label="Close sidebar"
          >
            <ArrowLeftCircle className="w-5 h-5 text-white/90 hover:text-white" />
          </button>

          <button 
            onClick={() => setCollapsed(!isCollapsed)}
            className="hidden lg:flex w-6 h-6 shrink-0 items-center justify-center hover:bg-white/15 rounded-md transition-all duration-200"
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4 text-white" /> : <ChevronLeft className="w-4 h-4 text-white" />}
          </button>
        </div>
        
        <div className="p-3 flex-1 overflow-y-auto no-scrollbar">
          <nav className="space-y-1">
          {[
            { icon: Home, label: "Dashboard", href: "/dashboard" },
            { icon: Users, label: "Clients", href: "/clients" },
            { icon: CreditCard, label: "Client Payments", href: "/client-payments" },
            { icon: HeartPulse, label: "Nurses", href: "/nurses" },
            { icon: ClipboardCheck, label: "Nurse Salary", href: "/nurses-salary" },
            { icon: Building, label: "Staff", href: "/staff" },
            { icon: Clipboard, label: "Assignments", href: "/assignments" },
            { icon: ClipboardCheck, label: "Staff Attendance", href: "/staff-attendance" },
            { icon: Calendar, label: "Leave Management", href: "/leave-requests" },
            { icon: MessageSquare, label: "Complaints", href: "/complaints" },
            { icon: UserPlus, label: "Enquiry", href: "/enquiry-data" },
          ].map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={isCollapsed ? item.label : ""}
                  className={`flex items-center gap-3 py-2.5 rounded-lg transition-all duration-200 group relative
                    ${isCollapsed ? 'justify-center px-0' : 'px-3'}
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
                  
                  {!isCollapsed && (
                    <span className={`text-sm tracking-wide transition-all duration-200 whitespace-nowrap
                      ${isActive 
                        ? 'font-medium' 
                        : 'group-hover:font-medium'
                      }`}
                    >
                      {item.label}
                    </span>
                  )}
                  
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-white rounded-r-full" />
                  )}
                </Link>
              )
            })}
          </nav>
        </div>
        
        <div className={`mt-auto p-4 border-t border-white/15 ${isCollapsed ? 'hidden' : 'block'}`}>
          <div className="bg-white/10 rounded-lg p-3 shadow-sm">
            <div className="text-xs font-medium text-white/80 mb-1 truncate">{orgLabel} Admin</div>
            <div className="text-[11px] text-white/60 truncate">Care Management System</div>
          </div>
        </div>
      </div>
    </div>
  )
}