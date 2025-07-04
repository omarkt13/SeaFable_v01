"use client"

import { DollarSign, Calendar, Ship, Star, TrendingUp, TrendingDown } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

interface StatsOverviewProps {
  overview: {
    totalRevenue: number
    activeBookings: number
    totalExperiences: number
    averageRating: number
    revenueGrowth: number
    bookingGrowth: number
  }
}

export function StatsOverview({ overview }: StatsOverviewProps) {
  const stats = [
    {
      name: "Total Revenue",
      value: `$${overview.totalRevenue.toLocaleString()}`,
      change: `${overview.revenueGrowth >= 0 ? "+" : ""}${overview.revenueGrowth}%`,
      changeType: overview.revenueGrowth >= 0 ? "increase" : "decrease",
      icon: DollarSign,
    },
    {
      name: "Active Bookings",
      value: overview.activeBookings,
      change: `${overview.bookingGrowth >= 0 ? "+" : ""}${overview.bookingGrowth}%`,
      changeType: overview.bookingGrowth >= 0 ? "increase" : "decrease",
      icon: Calendar,
    },
    {
      name: "Total Experiences",
      value: overview.totalExperiences,
      change: "", // This was hardcoded, now empty as it's not directly from DB
      changeType: "increase", // Defaulting to increase
      icon: Ship,
    },
    {
      name: "Average Rating",
      value: overview.averageRating.toFixed(1),
      change: "", // This was hardcoded, now empty as it's not directly from DB
      changeType: "increase", // Defaulting to increase
      icon: Star,
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat) => (
        <Card key={stat.name}>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <stat.icon className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">{stat.name}</dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">{stat.value}</div>
                    {stat.change && ( // Only show change if it exists
                      <div
                        className={`ml-2 flex items-baseline text-sm font-semibold ${
                          stat.changeType === "increase" ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {stat.changeType === "increase" ? (
                          <TrendingUp className="self-center flex-shrink-0 h-4 w-4 text-green-500" />
                        ) : (
                          <TrendingDown className="self-center flex-shrink-0 h-4 w-4 text-red-500" />
                        )}
                        <span className="ml-1">{stat.change}</span>
                      </div>
                    )}
                  </dd>
                </dl>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
