
"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, DollarSign, Users, Calendar, Star } from "lucide-react"

interface StatsOverviewProps {
  overview: {
    totalExperiences: number
    totalBookings: number
    upcomingBookings: number
    totalRevenue: number
    monthlyRevenue: number
  }
  earnings: {
    thisMonth: number
    lastMonth: number
    growth: number
    pendingPayouts: number
  }
}

export function StatsOverview({ overview, earnings }: StatsOverviewProps) {
  const stats = [
    {
      title: "Total Revenue",
      value: `$${overview.totalRevenue.toLocaleString()}`,
      description: "All time earnings",
      icon: DollarSign,
      trend: earnings.growth > 0 ? "up" : "down",
      trendValue: `${Math.abs(earnings.growth)}%`,
      color: "text-green-600"
    },
    {
      title: "Monthly Revenue", 
      value: `$${earnings.thisMonth.toLocaleString()}`,
      description: "This month",
      icon: TrendingUp,
      trend: earnings.thisMonth > earnings.lastMonth ? "up" : "down",
      trendValue: `${Math.round(((earnings.thisMonth - earnings.lastMonth) / earnings.lastMonth) * 100)}%`,
      color: "text-blue-600"
    },
    {
      title: "Total Bookings",
      value: overview.totalBookings.toString(),
      description: "All time bookings", 
      icon: Calendar,
      trend: "up",
      trendValue: "12%",
      color: "text-purple-600"
    },
    {
      title: "Active Adventures",
      value: overview.totalExperiences.toString(),
      description: "Published experiences",
      icon: Star,
      trend: "up", 
      trendValue: "8%",
      color: "text-orange-600"
    }
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => (
        <Card key={index} className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {stat.title}
            </CardTitle>
            <stat.icon className={`h-4 w-4 ${stat.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              <span>{stat.description}</span>
              <Badge variant={stat.trend === "up" ? "default" : "secondary"} className="ml-auto">
                {stat.trend === "up" ? (
                  <TrendingUp className="h-3 w-3 mr-1" />
                ) : (
                  <TrendingDown className="h-3 w-3 mr-1" />
                )}
                {stat.trendValue}
              </Badge>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
