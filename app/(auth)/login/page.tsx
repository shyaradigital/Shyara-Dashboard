"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ROLES } from "@/lib/constants"

export default function LoginPage() {
  const [selectedRole, setSelectedRole] = useState<"ADMIN" | "MANAGER">("ADMIN")
  const { login } = useAuth()
  const router = useRouter()

  const handleLogin = () => {
    // Dummy login - in production, this would call an API
    login({
      id: "1",
      name: selectedRole === "ADMIN" ? "Admin User" : "Manager User",
      email: selectedRole === "ADMIN" ? "admin@shyara.com" : "manager@shyara.com",
      role: selectedRole,
    })
    router.push("/")
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Welcome to Shyara</CardTitle>
          <CardDescription>
            Sign in to your account to continue. Select a role to preview the dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Select Role (Demo)</label>
            <div className="flex gap-2">
              <Button
                variant={selectedRole === "ADMIN" ? "default" : "outline"}
                className="flex-1"
                onClick={() => setSelectedRole("ADMIN")}
              >
                Admin
              </Button>
              <Button
                variant={selectedRole === "MANAGER" ? "default" : "outline"}
                className="flex-1"
                onClick={() => setSelectedRole("MANAGER")}
              >
                Manager
              </Button>
            </div>
          </div>
          <Button className="w-full" onClick={handleLogin}>
            Sign In
          </Button>
          <p className="text-xs text-center text-muted-foreground">
            This is a demo login. In production, this would require proper authentication.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

