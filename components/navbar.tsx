"use client"
import { Bell, Search, Menu, BarChart2, HelpCircle } from "lucide-react"
import Image from "next/image"
import { Input } from "./ui/input"
import AccountDropdown from "./Admin/Accounts/AccountDropdown";

export default function Navbar({ onMenuClick }: { onMenuClick: () => void }) {
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

        <div className="hidden md:flex items-center gap-3">
          {[{ label: "Analytics", icon: BarChart2 }, { label: "Support", icon: HelpCircle }].map((item) => (
            <button
              key={item.label}
              className="px-3 py-1.5 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-md transition-colors flex items-center gap-1.5"
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </button>
          ))}
        </div>

        <div className="flex-1 flex justify-end max-w-3xl ml-4 md:ml-8 sm:flex">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search anything..."
              className="pl-10 w-full bg-slate-50/50 border-slate-200 focus:border-blue-600 pr-4 rounded-lg"
            />
          </div>
        </div>
        
        <div className="flex items-center gap-2 ml-auto md:ml-8">
          <button className="relative p-2 hover:bg-slate-50 rounded-lg transition-colors group">
            <Bell className="w-5 h-5 text-slate-500 group-hover:text-slate-700" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
          </button>
          <div className="h-6 w-px bg-slate-200 mx-1"></div>
          <AccountDropdown />
        </div>
      </div>
    </div>
  )
}