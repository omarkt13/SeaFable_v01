"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RotateCcw } from "lucide-react"
import Link from "next/link"

interface AppointmentsActivityCardProps {
  recentActivityCount: number
}

export function AppointmentsActivityCard({ recentActivityCount }: AppointmentsActivityCardProps) {
  const hasRecentActivity = recentActivityCount > 0

  return (
    <Card className="h-full flex flex-col shadow-sm rounded-lg">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-gray-500">Appointments activity</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col items-center justify-center p-6">
        {hasRecentActivity ? (
          <div className="text-center">
            <RotateCcw className="h-10 w-10 text-purple-500 mb-2" />
            <p className="text-3xl font-bold">{recentActivityCount}</p>
            <p className="text-sm text-gray-600">recent activities</p>
          </div>
        ) : (
          <div className="text-center text-gray-500">
            <RotateCcw className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p className="text-sm">No recent activity</p>
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
