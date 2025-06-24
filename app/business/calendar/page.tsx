"use client"

import { BusinessLayout } from "@/components/layouts/BusinessLayout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
import { useState, useEffect } from "react"
import { format } from "date-fns"
import { useAuth } from "@/lib/auth-context"
import { getHostAvailability } from "@/lib/supabase-business"
import { getHostBookings, type Booking } from "@/lib/database"
import { Loader2, AlertCircle, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface HostAvailabilitySlot {
  id: string
  date: string
  start_time: string
  end_time: string
  available_capacity: number
  price_override: number | null
  notes: string | null
  weather_dependent: boolean
  is_recurring: boolean
  recurring_pattern: string | null
}

export default function BusinessCalendarPage() {
  const { user, isLoading: authLoading } = useAuth()
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [hostAvailability, setHostAvailability] = useState<HostAvailabilitySlot[]>([])
  const [bookingsForSelectedDate, setBookingsForSelectedDate] = useState<Booking[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!authLoading && user?.id) {
      fetchCalendarData(user.id, selectedDate)
    } else if (!authLoading && !user) {
      setError("You must be logged in as a business user to view the calendar.")
      setIsLoading(false)
    }
  }, [user, authLoading, selectedDate])

  const fetchCalendarData = async (hostId: string, date?: Date) => {
    setIsLoading(true)
    setError(null)
    try {
      const formattedDate = date ? format(date, "yyyy-MM-dd") : undefined

      // Fetch host availability
      const { data: availabilityData, error: availabilityError } = await getHostAvailability(
        hostId,
        formattedDate,
        formattedDate,
      )
      if (availabilityError) {
        throw new Error(availabilityError.message)
      }
      setHostAvailability(availabilityData || [])

      // Fetch bookings for the selected date
      const { data: bookingsData, error: bookingsError } = await getHostBookings(hostId)
      if (bookingsError) {
        throw new Error(bookingsError)
      }
      const filteredBookings = (bookingsData || []).filter(
        (b) => format(new Date(b.booking_date), "yyyy-MM-dd") === (formattedDate || format(new Date(), "yyyy-MM-dd")),
      )
      setBookingsForSelectedDate(filteredBookings)
    } catch (err: any) {
      console.error("Failed to fetch calendar data:", err)
      setError(err.message || "Failed to load calendar data.")
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <BusinessLayout>
        <div className="container mx-auto py-8 px-4 flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
          <span className="ml-2 text-gray-500">Loading calendar...</span>
        </div>
      </BusinessLayout>
    )
  }

  if (error) {
    return (
      <BusinessLayout>
        <div className="container mx-auto py-8 px-4 text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Calendar</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => user?.id && fetchCalendarData(user.id, selectedDate)}>Try Again</Button>
        </div>
      </BusinessLayout>
    )
  }

  return (
    <BusinessLayout>
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-6">Bookings Calendar</h1>
        <Card>
          <CardHeader>
            <CardTitle>View Your Booked Experiences & Availability</CardTitle>
            <CardDescription>Select a date to see details of bookings and manage your availability.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col md:flex-row gap-8">
            <div className="flex-shrink-0">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-md border"
              />
            </div>
            <div className="flex-grow">
              <h2 className="text-xl font-semibold mb-4">
                Details for {selectedDate ? format(selectedDate, "PPP") : "Selected Date"}
              </h2>

              <h3 className="text-lg font-semibold mb-2">Bookings</h3>
              {bookingsForSelectedDate.length > 0 ? (
                <ul className="space-y-2 mb-6">
                  {bookingsForSelectedDate.map((booking) => (
                    <li key={booking.id} className="p-3 border rounded-md bg-gray-50">
                      <p className="font-medium">{booking.experiences?.title || "N/A"}</p>
                      <p className="text-sm text-gray-600">
                        Customer: {booking.users?.first_name} {booking.users?.last_name} ({booking.number_of_guests}{" "}
                        guests)
                      </p>
                      <p className="text-sm text-gray-500">Time: {booking.departure_time || "N/A"}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 mb-6">No bookings for this date.</p>
              )}

              <h3 className="text-lg font-semibold mb-2">Availability Slots</h3>
              {hostAvailability.length > 0 ? (
                <ul className="space-y-2">
                  {hostAvailability.map((slot) => (
                    <li key={slot.id} className="p-3 border rounded-md bg-blue-50">
                      <p className="font-medium">
                        {slot.start_time} - {slot.end_time} (Capacity: {slot.available_capacity})
                      </p>
                      {slot.price_override && (
                        <p className="text-sm text-gray-600">Price Override: €{slot.price_override.toFixed(2)}</p>
                      )}
                      {slot.notes && <p className="text-sm text-gray-500">Notes: {slot.notes}</p>}
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-500 mb-2">No availability set for this date.</p>
                  <Link href="/business/experiences/new" passHref>
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-2" /> Add Availability
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </BusinessLayout>
  )
}
