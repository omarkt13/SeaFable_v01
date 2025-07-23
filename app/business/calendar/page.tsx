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