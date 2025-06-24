"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CalendarCheck, CalendarX } from "lucide-react"
import Link from "next/link"

interface TodaysNextAppointmentsCardProps {
  todaysBookingsCount: number
}

export function TodaysNextAppointmentsCard({ todaysBookingsCount }: TodaysNextAppointmentsCardProps) {
  const hasAppointmentsToday = todaysBookingsCount > 0

  return (
    <Card className="h-full flex flex-col shadow-sm rounded-lg">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-gray-500">Today's next appointments</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col items-center justify-center p-6">
        {hasAppointmentsToday ? (
          <div className="text-center">
            <CalendarCheck className="h-10 w-10 text-green-500 mb-2" />
            <p className="text-3xl font-bold">{todaysBookingsCount}</p>
            <p className="text-sm text-gray-600">appointments today</p>
          </div>
        ) : (
          <div className="text-center text-gray-500">
            <CalendarX className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p className="text-sm">No Appointments Today</p>
            <p className="text-xs text-gray-400">
              Visit the{" "}
              <Link href="/business/bookings" className="text-blue-600 hover:underline">
                Calendar
              </Link>{" "}
              section to add some appointments
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
