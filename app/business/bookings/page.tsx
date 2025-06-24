"use client"

import { useEffect, useState } from "react"
import { BusinessLayout } from "@/components/layouts/BusinessLayout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Loader2, Calendar, User, AlertCircle } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { getHostBookings, type Booking } from "@/lib/database" // Import Booking type

export default function BusinessBookingsPage() {
  const { user, isLoading: authLoading } = useAuth()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!authLoading && user?.id) {
      fetchBookings(user.id)
    } else if (!authLoading && !user) {
      // Handle case where user is not logged in or not a business user
      setError("You must be logged in as a business user to view bookings.")
      setIsLoading(false)
    }
  }, [user, authLoading])

  const fetchBookings = async (hostId: string) => {
    setIsLoading(true)
    setError(null)
    try {
      const { data, error: fetchError } = await getHostBookings(hostId)
      if (fetchError) {
        throw new Error(fetchError)
      }
      setBookings(data || [])
    } catch (err: any) {
      console.error("Failed to fetch bookings:", err)
      setError(err.message || "Failed to load bookings.")
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "completed":
        return "bg-blue-100 text-blue-800"
      case "cancelled_user":
      case "cancelled_host":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (isLoading) {
    return (
      <BusinessLayout>
        <div className="container mx-auto py-8 px-4 flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
          <span className="ml-2 text-gray-500">Loading bookings...</span>
        </div>
      </BusinessLayout>
    )
  }

  if (error) {
    return (
      <BusinessLayout>
        <div className="container mx-auto py-8 px-4 text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Bookings</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => user?.id && fetchBookings(user.id)}>Try Again</Button>
        </div>
      </BusinessLayout>
    )
  }

  return (
    <BusinessLayout>
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-6">Your Bookings</h1>
        <Card>
          <CardHeader>
            <CardTitle>Manage Customer Bookings</CardTitle>
            <CardDescription>A comprehensive list of all your bookings.</CardDescription>
          </CardHeader>
          <CardContent>
            {bookings.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-lg font-semibold text-gray-700 mb-2">No bookings found.</p>
                <p className="text-gray-500 mb-4">
                  Start by creating experiences and setting your availability to receive bookings.
                </p>
                <Button onClick={() => (window.location.href = "/business/experiences/new")}>
                  Create New Experience
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Experience</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Date & Time</TableHead>
                      <TableHead>Guests</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bookings.map((booking) => (
                      <TableRow key={booking.id}>
                        <TableCell className="font-medium">{booking.experiences?.title || "N/A"}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-gray-500" />
                            {booking.users?.first_name} {booking.users?.last_name}
                          </div>
                          <p className="text-sm text-gray-500">{booking.users?.email}</p>
                        </TableCell>
                        <TableCell>
                          {new Date(booking.booking_date).toLocaleDateString()}
                          {booking.departure_time && ` at ${booking.departure_time}`}
                        </TableCell>
                        <TableCell>{booking.number_of_guests}</TableCell>
                        <TableCell className="text-right">€{booking.total_price?.toFixed(2)}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(booking.booking_status)}>
                            {booking.booking_status.replace("_", " ")}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm">
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </BusinessLayout>
  )
}
