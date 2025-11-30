"use client"

import { Loader2 } from "lucide-react"

export function AuthLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background to-muted/20">
      <div className="space-y-4 text-center">
        <div className="flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
        <div className="space-y-2">
          <p className="text-lg font-medium text-foreground">Loading your workspace...</p>
          <p className="text-sm text-muted-foreground">Please wait a moment</p>
        </div>
      </div>
    </div>
  )
}
