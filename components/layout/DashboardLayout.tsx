"use client"

import { Sidebar } from "./Sidebar"
import { Topbar } from "./Topbar"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="lg:pl-64">
        <Topbar />
        <main className="p-4 lg:p-6">{children}</main>
      </div>
    </div>
  )
}

