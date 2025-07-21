"use client"

import Link from "next/link"
import { Plus, CalendarPlus, DollarSign, Settings } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { HostProfile } from "@/lib/database"

interface QuickActionsProps {
  businessProfile: HostProfile | null
}

export function QuickActions({ businessProfile }: QuickActionsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions for {businessProfile?.name || "Your Business"}</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Button variant="outline" asChild>
          <Link href="/business/adventures/new">
            <Plus className="h-4 w-4 mr-2" />
            Add Adventure
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/business/bookings">
            <CalendarPlus className="h-4 w-4 mr-2" />
            Manage Bookings
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/business/earnings">
            <DollarSign className="h-4 w-4 mr-2" />
            View Earnings
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/business/settings">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}
