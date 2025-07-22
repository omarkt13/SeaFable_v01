"use client"

import Link from "next/link"
import { Calendar, Clock, Users, Phone, MessageSquare, Edit } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface UpcomingBooking {
  id: string
  customerName: string
  experienceTitle: string
  date: string
  time: string
  guests: number
  specialRequests: string
  phone: string
}

interface UpcomingBookingsProps {
  upcomingBookings: UpcomingBooking[]
}

export function UpcomingBookings({ upcomingBookings }: UpcomingBookingsProps) {
  // Defensive programming - ensure upcomingBookings is an array
  const safeUpcomingBookings = upcomingBookings || []

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Upcoming Bookings</CardTitle>
          <Button variant="outline" size="sm" asChild>
            <Link href="/business/bookings">
              <Calendar className="h-4 w-4 mr-2" />
              Calendar View
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {safeUpcomingBookings.length > 0 ? (
          <div className="space-y-4">
            {safeUpcomingBookings.map((booking) => (
              <div key={booking.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="font-medium text-gray-900">{booking.customerName}</p>
                    <p className="text-sm text-gray-500">{booking.experienceTitle}</p>
                  </div>
                  <Badge variant="secondary">{booking.date}</Badge>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center text-gray-600">
                    <Clock className="h-4 w-4 mr-2" />
                    {booking.time}
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Users className="h-4 w-4 mr-2" />
                    {booking.guests} guests
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Phone className="h-4 w-4 mr-2" />
                    {booking.phone}
                  </div>
                </div>
                {booking.specialRequests && (
                  <div className="mt-3 p-2 bg-blue-50 rounded text-sm">
                    <p className="text-blue-700">
                      <strong>Special Requests:</strong> {booking.specialRequests}
                    </p>
                  </div>
                )}
                <div className="flex space-x-2 mt-3">
                  <Button size="sm" variant="outline" title="Feature Coming Soon">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Message
                  </Button>
                  <Button size="sm" variant="outline" title="Feature Coming Soon">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500 py-8">No upcoming bookings.</div>
        )}
      </CardContent>
    </Card>
  )
}
