
"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Eye, MessageSquare } from "lucide-react"

export function RecentBookings() {
  // Mock data - replace with real data from your API
  const recentBookings = [
    {
      id: "1",
      customerName: "John Smith",
      customerAvatar: null,
      adventureName: "Sunset Sailing",
      date: "2024-01-25",
      status: "confirmed",
      amount: "€150",
    },
    {
      id: "2",
      customerName: "Sarah Johnson",
      customerAvatar: null,
      adventureName: "Kayak Adventure",
      date: "2024-01-24",
      status: "pending",
      amount: "€85",
    },
    {
      id: "3",
      customerName: "Mike Wilson",
      customerAvatar: null,
      adventureName: "Deep Sea Fishing",
      date: "2024-01-23",
      status: "completed",
      amount: "€220",
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "completed":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Bookings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {recentBookings.map((booking) => (
          <div key={booking.id} className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center space-x-3">
              <Avatar>
                <AvatarImage src={booking.customerAvatar || undefined} />
                <AvatarFallback>{booking.customerName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{booking.customerName}</p>
                <p className="text-sm text-gray-600">{booking.adventureName}</p>
                <p className="text-xs text-gray-500">{booking.date}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge className={getStatusColor(booking.status)}>
                {booking.status}
              </Badge>
              <span className="font-semibold">{booking.amount}</span>
              <div className="flex space-x-1">
                <Button size="sm" variant="outline">
                  <Eye className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="outline">
                  <MessageSquare className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
