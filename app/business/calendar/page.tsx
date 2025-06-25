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
      <div>
        <h1 className="text-3xl font-bold mb-6">Business Calendar</h1>
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
