"use client"
import { Bell, Search, User, Menu, BarChart2, HelpCircle } from "lucide-react"
import Image from "next/image"
import { Input } from "./ui/input"

export default function Navbar({ onMenuClick }: { onMenuClick: () => void }) {
  return (
    <div className="h-16 border-b border-gray-100 fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md backdrop-filter z-10 shadow-sm lg:pl-56">
      <div className="flex items-center h-full px-4">
        <div className="flex items-center gap-2">
          <button onClick={onMenuClick} className="p-2 hover:bg-gray-100 rounded-lg transition-colors lg:hidden">
            <Menu className="w-5 h-5 text-gray-500" />
          </button>
          <div className="h-16 border-b border-white/10 flex items-center pr-6 lg:hidden">
            <Image src="/dcTransparent.png" alt="Logo" width={120} height={40} className="my-2 object-contain" />
          </div>
        </div>

        <div className="hidden md:flex items-center gap-3 ">
          {[{ label: "Analytics", icon: BarChart2 }, { label: "Support", icon: HelpCircle }].map((item) => (
            <button
              key={item.label}
              className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors flex items-center gap-1.5"
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </button>
          ))}
        </div>

        <div className="flex-1 flex justify-end max-w-3xl ml-4 md:ml-8 sm:flex">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search anything..."
              className="pl-10 w-full bg-gray-50/50 border-gray-100 focus:border-blue-500 pr-4 rounded-lg"
            />
          </div>
        </div>
        
        <div className="flex items-center gap-2 ml-auto md:ml-8">
          <button className="relative p-2 hover:bg-gray-50 rounded-lg transition-colors group">
            <Bell className="w-5 h-5 text-gray-500 group-hover:text-gray-700" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
          </button>
          <div className="h-6 w-px bg-gray-200 mx-1"></div>
          <button className="flex items-center gap-3 px-2 py-1.5 hover:bg-gray-50 rounded-lg transition-colors group">
            <div className="w-8 h-8 rounded-full ring-2 ring-gray-100 bg-gradient-to-tr from-blue-600 to-blue-400 flex items-center justify-center text-white">
              <User className="w-4 h-4" />
            </div>
            <div className="hidden md:block text-left">
              <p className="text-sm font-medium text-gray-700 group-hover:text-gray-900">Admin User</p>
              <p className="text-xs text-gray-500">Super Admin</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}
