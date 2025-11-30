"use client"

import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Clock, Sparkles } from "lucide-react"

export default function InvoicesPage() {
  return (
    <div className="box-border w-full max-w-full space-y-6 overflow-x-hidden pb-8">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Invoices</h1>
        <p className="text-sm text-muted-foreground">Manage and track your invoices</p>
      </div>

      {/* Coming Soon Card */}
      <Card className="mx-auto max-w-2xl border transition-shadow duration-200 hover:shadow-lg">
        <CardHeader className="pb-4 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <FileText className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">Coming Soon</CardTitle>
          <CardDescription className="mt-2 text-base">
            We&apos;re working hard to bring you a powerful invoice management system
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="mb-1 font-semibold">What to Expect</h3>
                <p className="text-sm text-muted-foreground">
                  Create, manage, and track invoices with ease. Generate professional invoices, send
                  them to clients, and monitor payment status all in one place.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <Clock className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="mb-1 font-semibold">Stay Tuned</h3>
                <p className="text-sm text-muted-foreground">
                  This feature is currently under development. We&apos;ll notify you as soon as
                  it&apos;s ready!
                </p>
              </div>
            </div>
          </div>

          <div className="border-t pt-4">
            <p className="text-center text-sm text-muted-foreground">
              In the meantime, you can manage your finances and track revenue from the{" "}
              <Link href="/financial" className="font-medium text-primary hover:underline">
                Finances
              </Link>{" "}
              page.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
