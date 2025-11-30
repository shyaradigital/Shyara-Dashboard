"use client"

import { useState } from "react"
import { Sidebar } from "./Sidebar"
import { Topbar } from "./Topbar"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  return (
    <div className="box-border min-h-screen w-full max-w-full overflow-x-hidden bg-background">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <div className="box-border w-full max-w-full overflow-x-hidden lg:pl-64">
        <Topbar onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />
        <main className="box-border w-full max-w-full overflow-x-hidden p-4 sm:p-5 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
