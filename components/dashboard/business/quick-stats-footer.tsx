"use client"

import { Users, TrendingUp, DollarSign } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

interface QuickStatsFooterProps {
  overview: {
    totalRevenue: number
    activeBookings: number
    totalExperiences: number
    revenueGrowth: number
    bookingGrowth: number
  }
}

export function QuickStatsFooter({ overview }: QuickStatsFooterProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
      <Card>
        <CardContent className="p-6 flex items-center">
          <Users className="h-6 w-6 text-gray-500 mr-4" />
          <div>
            <p className="text-sm text-gray-500">Total Bookings</p>
            <p className="text-xl font-bold">{overview.activeBookings}</p>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-6 flex items-center">
          <TrendingUp className="h-6 w-6 text-green-500 mr-4" />
          <div>
            <p className="text-sm text-gray-500">Revenue Growth (MoM)</p>
            <p className="text-xl font-bold text-green-600">
              {overview.revenueGrowth >= 0 ? "+" : ""}
              {overview.revenueGrowth}%
            </p>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-6 flex items-center">
          <DollarSign className="h-6 w-6 text-blue-500 mr-4" />
          <div>
            <p className="text-sm text-gray-500">Total Revenue</p>
            <p className="text-xl font-bold">${overview.totalRevenue.toLocaleString()}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
