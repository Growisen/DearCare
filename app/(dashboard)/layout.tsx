"use client"
import Navbar from "../../components/navbar"
import Sidebar from "../../components/sidebar"
import { useState } from "react"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isSidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#ebf4f5] to-[#f7f5fa]">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#004d6d08_1px,transparent_1px),linear-gradient(to_bottom,#004d6d08_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_-20%,#000_70%,transparent_110%)]" />
      <div className="absolute inset-0 bg-gradient-to-br from-[#ebf4f5]/50 via-transparent to-[#f7f5fa]/50 pointer-events-none" />
      <Sidebar isOpen={isSidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="relative lg:pl-48">
        <Navbar onMenuClick={() => setSidebarOpen(!isSidebarOpen)} />
        <main className="pt-16">
          <div className="p-8 max-w-[1400px] mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
