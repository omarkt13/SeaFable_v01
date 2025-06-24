"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CalendarCheck, CalendarDays } from "lucide-react"

interface UpcomingAppointmentsCardProps {
  upcomingBookingsCount: number
}

export function UpcomingAppointmentsCard({ upcomingBookingsCount }: UpcomingAppointmentsCardProps) {
  const hasUpcomingAppointments = upcomingBookingsCount > 0

  return (
    <Card className="h-full flex flex-col shadow-sm rounded-lg">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-gray-500 flex items-center justify-between">
          Upcoming appointments
          <span className="text-xs text-gray-400">Next 7 days</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col items-center justify-center p-6">
        {hasUpcomingAppointments ? (
          <div className="text-center">
            <CalendarCheck className="h-10 w-10 text-blue-500 mb-2" />
            <p className="text-3xl font-bold">{upcomingBookingsCount}</p>
            <p className="text-sm text-gray-600">appointments scheduled</p>
          </div>
        ) : (
          <div className="text-center text-gray-500">
            <CalendarDays className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p className="text-sm">Your schedule is empty</p>
            <p className="text-xs text-gray-400">Make some appointments for schedule data to appear</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
