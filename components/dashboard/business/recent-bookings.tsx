"use client"

import Link from "next/link"
import { Eye, ChevronRight } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface RecentBooking {
  id: string
  customerName: string
  experienceTitle: string
  date: string
  amount: number
  guests: number
  avatar: string
  status: string
}

interface RecentBookingsProps {
  recentBookings: RecentBooking[]
}

export function RecentBookings({ recentBookings }: RecentBookingsProps) {
  // Defensive programming - ensure recentBookings is an array
  const safeRecentBookings = recentBookings || []

  const getStatusBadge = (status: string) => {
    const variants: { [key: string]: "default" | "secondary" | "destructive" | "outline" } = {
      confirmed: "default",
      pending: "secondary",
      completed: "outline",
      cancelled: "destructive",
    }
    return <Badge variant={variants[status] || "secondary"}>{status}</Badge>
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Recent Bookings</CardTitle>
          <Button variant="outline" size="sm" asChild>
            <Link href="/business/bookings">
              <Eye className="h-4 w-4 mr-2" />
              View All
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {safeRecentBookings.length > 0 ? (
          <div className="space-y-4">
            {safeRecentBookings.map((booking) => (
              <div key={booking.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <img
                    src={booking.avatar || "/placeholder.svg"}
                    alt={booking.customerName}
                    className="w-10 h-10 rounded-full"
                  />
                  <div>
                    <p className="font-medium text-gray-900">{booking.customerName}</p>
                    <p className="text-sm text-gray-500">{booking.experienceTitle}</p>
                    <p className="text-xs text-gray-400">
                      {booking.date} • {booking.guests} guests
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">${booking.amount}</p>
                    {getStatusBadge(booking.status)}
                  </div>
                  <Button variant="ghost" size="icon" asChild>
                    <Link href={`/business/bookings?id=${booking.id}`} title="View Booking Details">
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500 py-8">No recent bookings.</div>
        )}
      </CardContent>
    </Card>
  )
}
