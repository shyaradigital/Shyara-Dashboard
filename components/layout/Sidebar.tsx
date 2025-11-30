"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useAuth } from "@/hooks/use-auth"
import {
  LayoutDashboard,
  FileText,
  DollarSign,
  Users,
  Menu,
  X,
} from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"

interface NavItem {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  permission?: string
}

const navItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
    permission: "dashboard:view",
  },
  {
    title: "Invoices",
    href: "/invoices",
    icon: FileText,
    permission: "invoices:view",
  },
  {
    title: "Finances",
    href: "/finances",
    icon: DollarSign,
    permission: "finances:view",
  },
  {
    title: "Users",
    href: "/users",
    icon: Users,
    permission: "users:view",
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const { checkPermission } = useAuth()
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  const filteredNavItems = navItems.filter((item) => {
    if (!item.permission) return true
    return checkPermission(item.permission)
  })

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsMobileOpen(!isMobileOpen)}
        >
          {isMobileOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </Button>
      </div>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-40 h-screen w-64 bg-card border-r border-border transition-transform duration-300 ease-in-out",
          "lg:translate-x-0",
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="h-full flex flex-col">
          {/* Logo */}
          <div className="h-16 flex items-center justify-center border-b border-border px-6">
            <h1 className="text-xl font-bold text-primary">Shyara</h1>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-1">
            {filteredNavItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.title}</span>
                </Link>
              )
            })}
          </nav>
        </div>
      </aside>

      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setIsMobileOpen(false)}
        />
      )}
    </>
  )
}

