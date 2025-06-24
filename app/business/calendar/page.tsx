"use client"

import { BusinessLayout } from "@/components/layouts/BusinessLayout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
import { useState } from "react"
import { format } from "date-fns"

export default function BusinessCalendarPage() {
  const [date, setDate] = useState<Date | undefined>(new Date())

  // In a real app, you'd fetch bookings for the selected month/year
  const mockBookings = [
    { date: new Date(2025, 6, 10), title: "Sunset Kayaking - John Doe" },
    { date: new Date(2025, 6, 15), title: "City Food Tour - Jane Smith" },
    { date: new Date(2025, 7, 1), title: "Mountain Hike - Alex Lee" },
  ]

  return (
    <BusinessLayout>
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-6">Bookings Calendar</h1>
        <Card>
          <CardHeader>
            <CardTitle>View Your Booked Experiences</CardTitle>
            <CardDescription>Select a date to see details of bookings.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col md:flex-row gap-8">
            <div className="flex-shrink-0">
              <Calendar mode="single" selected={date} onSelect={setDate} className="rounded-md border" />
            </div>
            <div className="flex-grow">
              <h2 className="text-xl font-semibold mb-4">
                Bookings for {date ? format(date, "PPP") : "Selected Date"}
              </h2>
              {date &&
              mockBookings.filter((b) => format(b.date, "yyyy-MM-dd") === format(date, "yyyy-MM-dd")).length > 0 ? (
                <ul className="space-y-2">
                  {mockBookings
                    .filter((b) => format(b.date, "yyyy-MM-dd") === format(date, "yyyy-MM-dd"))
                    .map((booking, index) => (
                      <li key={index} className="p-3 border rounded-md bg-gray-50">
                        {booking.title}
                      </li>
                    ))}
                </ul>
              ) : (
                <p className="text-gray-500">No bookings for this date.</p>
              )}
              <p className="mt-4 text-sm text-gray-500">
                (Note: This is a placeholder. Actual booking data will be fetched from the database.)
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </BusinessLayout>
  )
}
