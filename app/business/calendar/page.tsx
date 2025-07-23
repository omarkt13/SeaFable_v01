"use client"

import { Button } from "@/components/ui/button"

import { useState, useEffect } from "react"
import { BusinessLayout } from "@/components/layouts/BusinessLayout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Loader2, AlertCircle } from "lucide-react"
import { format, startOfWeek, addDays, isSameDay, parseISO } from "date-fns"
import { getHostBookings } from "@/lib/database"
import { useAuth } from "@/lib/auth-context"
import type { Booking } from "@/types/database"

export default function BusinessCalendarPage() {
  const { user, businessProfile, isLoading: authLoading } = useAuth()
  const [currentWeek, setCurrentWeek] = useState<Date[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const start = startOfWeek(new Date(), { weekStartsOn: 1 }) // Monday
    const weekDays = Array.from({ length: 7 }).map((_, i) => addDays(start, i))
    setCurrentWeek(weekDays)
  }, [])

  useEffect(() => {
    const fetchBookings = async () => {
      if (!authLoading && user?.id && businessProfile?.id) {
        setIsLoading(true)
        setError(null)
        try {
          const fetchedBookings = await getHostBookings(businessProfile.id)
          setBookings(fetchedBookings)
        } catch (err: any) {
          console.error("Error fetching host bookings:", err)
          setError(err.message || "Failed to load bookings.")
        } finally {
          setIsLoading(false)
        }
      } else if (!authLoading && !user) {
        setError("You must be logged in as a business user to view the calendar.")
        setIsLoading(false)
      } else if (!authLoading && user?.id && !businessProfile?.id) {
        setError("Business profile not found for the logged-in user.")
        setIsLoading(false)
      }
    }

    fetchBookings()
  }, [user, businessProfile, authLoading])

  if (isLoading) {
    return (
      <BusinessLayout>
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
          <span className="ml-2 text-gray-500">Loading calendar...</span>
        </div>
      </BusinessLayout>
    )
  }

  if (error) {
    return (
      <BusinessLayout>
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Calendar</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button
            onClick={() => {
              if (user?.id && businessProfile?.id) {
                // Re-fetch bookings
                setIsLoading(true)
                setError(null)
                getHostBookings(businessProfile.id)
                  .then(setBookings)
                  .catch((err) => {
                    console.error("Error re-fetching host bookings:", err)
                    setError(err.message || "Failed to re-load bookings.")
                  })
                  .finally(() => setIsLoading(false))
              }
            }}
          >
            Try Again
          </Button>
        </div>
      </BusinessLayout>
    )
  }

  return (
    <BusinessLayout>
      <div className="space-y-6 lg:space-y-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Calendar & Availability</h1>
            <p className="text-sm lg:text-base text-gray-600 mt-1">Manage your availability and schedule</p>
          </div>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Weekly Overview</CardTitle>
            <CardDescription>Your confirmed bookings and deadlines for the current week.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-2 text-center font-medium text-gray-700 mb-4">
              {currentWeek.map((day, index) => (
                <div key={index} className="flex flex-col items-center">
                  <span>{format(day, "EEE")}</span>
                  <span className="text-lg font-bold">{format(day, "d")}</span>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-2 min-h-[400px]">
              {currentWeek.map((day, dayIndex) => (
                <div key={dayIndex} className="border rounded-md p-2 flex flex-col space-y-2">
                  {bookings
                    .filter((booking) => isSameDay(parseISO(booking.booking_date), day))
                    .map((booking) => (
                      <div key={booking.id} className="bg-blue-100 text-blue-800 text-xs p-1 rounded-sm">
                        <p className="font-semibold">{booking.experiences?.title}</p>
                        <p>{format(parseISO(booking.booking_date), "p")}</p>
                        <p className="text-gray-700">
                          Customer: {booking.users?.first_name} {booking.users?.last_name}
                        </p>
                      </div>
                    ))}
                  {/* Placeholder for deadlines if they were to be implemented */}
                  {/* Example:
                  {deadlines
                    .filter(deadline => isSameDay(parseISO(deadline.date), day))
                    .map((deadline) => (
                      <div key={deadline.id} className="bg-red-100 text-red-800 text-xs p-1 rounded-sm">
                        <p className="font-semibold">Deadline: {deadline.title}</p>
                        <p>{format(parseISO(deadline.date), "p")}</p>
                      </div>
                    ))}
                  */}
                  {bookings.filter((booking) => isSameDay(parseISO(booking.booking_date), day)).length === 0 && (
                    <p className="text-gray-400 text-sm text-center mt-4">No events</p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </BusinessLayout>
  )
}
"use client"

import { BusinessProtectedRoute } from "@/components/auth/BusinessProtectedRoute"
import { BusinessLayoutWrapper } from "@/components/layouts/BusinessLayoutWrapper"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
import { useState } from "react"

export default function BusinessCalendarPage() {
  const [date, setDate] = useState<Date | undefined>(new Date())

  return (
    <BusinessProtectedRoute>
      <BusinessLayoutWrapper title="Calendar">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Calendar</h1>
              <p className="text-gray-600 mt-1">Manage your availability and bookings</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Availability Calendar</CardTitle>
                  <CardDescription>
                    Select dates to manage your availability
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    className="rounded-md border"
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Upcoming Bookings</CardTitle>
                  <CardDescription>
                    Your scheduled adventures
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500">
                    No bookings scheduled for the selected date.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </BusinessLayoutWrapper>
    </BusinessProtectedRoute>
  )
}
