
"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, Users } from "lucide-react"

export function UpcomingBookings() {
  // Mock data - replace with real data from your API
  const upcomingBookings = [
    {
      id: "1",
      customerName: "Emma Davis",
      customerAvatar: null,
      adventureName: "Morning Surf Lesson",
      date: "2024-01-26",
      time: "09:00",
      guests: 2,
      status: "confirmed",
    },
    {
      id: "2",
      customerName: "Robert Brown",
      customerAvatar: null,
      adventureName: "Island Hopping Tour",
      date: "2024-01-27",
      time: "10:30",
      guests: 4,
      status: "confirmed",
    },
    {
      id: "3",
      customerName: "Lisa Garcia",
      customerAvatar: null,
      adventureName: "Snorkeling Adventure",
      date: "2024-01-28",
      time: "14:00",
      guests: 3,
      status: "pending",
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upcoming Bookings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {upcomingBookings.map((booking) => (
          <div key={booking.id} className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center space-x-3">
              <Avatar>
                <AvatarImage src={booking.customerAvatar || undefined} />
                <AvatarFallback>{booking.customerName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{booking.customerName}</p>
                <p className="text-sm text-gray-600">{booking.adventureName}</p>
                <div className="flex items-center space-x-4 text-xs text-gray-500">
                  <span className="flex items-center">
                    <Calendar className="h-3 w-3 mr-1" />
                    {booking.date}
                  </span>
                  <span className="flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    {booking.time}
                  </span>
                  <span className="flex items-center">
                    <Users className="h-3 w-3 mr-1" />
                    {booking.guests} guests
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant={booking.status === "confirmed" ? "default" : "secondary"}>
                {booking.status}
              </Badge>
              <Button size="sm" variant="outline">
                View Details
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
