"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Eye, Edit, Trash2, Calendar, Clock, Users, MapPin } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface Booking {
  id: string
  booking_date: string
  start_time: string
  end_time: string
  num_guests: number
  total_price: number
  status: "pending" | "confirmed" | "cancelled" | "completed"
  experiences?: {
    title: string
  }
  customer_name?: string
  users?: {
    first_name: string
    last_name: string
  }
  booking_status?: string
  departure_time?: string
  number_of_guests?: number
  experience_title?: string
}

interface RecentBookingsProps {
  bookings: Booking[]
}

export function RecentBookings({ bookings }: RecentBookingsProps) {
  const getStatusVariant = (status: string) => {
    switch (status) {
      case "confirmed":
        return "default"
      case "pending":
        return "secondary"
      case "cancelled":
        return "destructive"
      case "completed":
        return "outline"
      default:
        return "secondary"
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const formatTime = (timeString: string) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Bookings</CardTitle>
        <CardDescription>
          Latest booking activity for your adventures
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
            {bookings.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No recent bookings</p>
            ) : (
              bookings.map((booking) => (
                <div key={booking.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="font-medium text-gray-900">
                          {booking.customer_name || 
                           (booking.users ? `${booking.users.first_name} ${booking.users.last_name}` : 'Unknown Customer')}
                        </h4>
                        <Badge variant={
                          booking.booking_status === "confirmed" ? "default" : 
                          booking.booking_status === "pending" ? "secondary" : 
                          "destructive"
                        }>
                          {booking.booking_status}
                        </Badge>
                      </div>

                      <div className="space-y-1 text-sm text-gray-600">
                        <div className="flex items-center space-x-4">
                          <span className="flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            {new Date(booking.booking_date).toLocaleDateString()}
                          </span>
                          {booking.departure_time && (
                            <span className="flex items-center">
                              <Clock className="h-3 w-3 mr-1" />
                              {booking.departure_time}
                            </span>
                          )}
                          <span className="flex items-center">
                            <Users className="h-3 w-3 mr-1" />
                            {booking.number_of_guests} {booking.number_of_guests === 1 ? 'guest' : 'guests'}
                          </span>
                        </div>

                        <p className="font-medium text-gray-700">
                          {booking.experience_title || booking.experiences?.title || 'Unknown Experience'}
                        </p>

                        {booking.experiences?.location && (
                          <p className="flex items-center">
                            <MapPin className="h-3 w-3 mr-1" />
                            {booking.experiences.location}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="font-semibold text-lg">€{booking.total_price.toFixed(2)}</p>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Booking
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Cancel Booking
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))
            )}
          </div>
      </CardContent>
    </Card>
  )
}