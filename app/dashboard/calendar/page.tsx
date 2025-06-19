import Link from "next/link"
import { ChevronLeft, CalendarDays } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function DashboardCalendarPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-2xl text-center">
        <CardHeader>
          <CardTitle className="flex items-center justify-center text-3xl font-bold text-gray-900">
            <CalendarDays className="h-8 w-8 mr-3 text-blue-600" />
            Your Adventure Calendar
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 py-8">
          <p className="text-lg text-gray-700">
            This page will display a comprehensive calendar view of all your upcoming and past bookings.
          </p>
          <p className="text-gray-600">
            You'll be able to manage your schedule, view details, and plan your next great escape here.
          </p>
          <div className="h-64 w-full bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 text-sm">
            Calendar View Placeholder
          </div>
          <Button asChild className="mt-6">
            <Link href="/dashboard">
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
