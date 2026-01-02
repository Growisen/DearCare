"use client"
import Navbar from "../../components/navbar"
import Sidebar from "../../components/sidebar"
import { useState } from "react"
import { Inter } from 'next/font/google'

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
})

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isSidebarOpen, setSidebarOpen] = useState(false)
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false)

  const sidebarWidth = isSidebarCollapsed ? 'lg:pl-20' : 'lg:pl-56'

  return (
    <div className={`min-h-screen w-full bg-gradient-to-br from-[#ebf4f5] to-[#f7f5fa]  ${inter.className}`}>
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#004d6d08_1px,transparent_1px),linear-gradient(to_bottom,#004d6d08_1px,transparent_1px)] 
        bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_-20%,#000_70%,transparent_110%)]" />
      <div className="absolute inset-0 bg-gradient-to-br from-[#ebf4f5]/50 via-transparent to-[#f7f5fa]/50 pointer-events-none" />
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
        isCollapsed={isSidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
      />
      <div className={`relative transition-all duration-300 ${sidebarWidth} ${isSidebarOpen ? 'lg:filter-none filter blur-sm' : ''}`}>
        <Navbar onMenuClick={() => setSidebarOpen(!isSidebarOpen)} />
        <main className="pt-8 md:pt-12 p-0">
          <div className="pt-6 pb-3 px-0 m-0 md:px-2">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}