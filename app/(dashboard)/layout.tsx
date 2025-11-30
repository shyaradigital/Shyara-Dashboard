"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { DateFilterProvider } from "@/contexts/DateFilterContext"
import { AuthLoader } from "@/components/layout/AuthLoader"

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, initializeAuth } = useAuth()
  const router = useRouter()

  // Initialize auth on mount
  useEffect(() => {
    initializeAuth()
  }, [initializeAuth])

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login")
    }
  }, [isAuthenticated, isLoading, router])

  if (isLoading) {
    return <AuthLoader />
  }

  if (!isAuthenticated) {
    return <AuthLoader />
  }

  return (
    <DateFilterProvider>
      <DashboardLayout>{children}</DashboardLayout>
    </DateFilterProvider>
  )
}
