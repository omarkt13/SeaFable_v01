"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown, Users, Calendar, Star, Euro } from "lucide-react"

export function StatsOverview() {
  // Mock data - replace with real data from your API
  const stats = [
    {
      title: "Total Revenue",
      value: "€12,450",
      change: "+12.5%",
      trend: "up",
      icon: Euro,
    },
    {
      title: "Active Bookings",
      value: "24",
      change: "+5.2%",
      trend: "up",
      icon: Calendar,
    },
    {
      title: "Total Adventures",
      value: "8",
      change: "+2",
      trend: "up",
      icon: Users,
    },
    {
      title: "Average Rating",
      value: "4.8",
      change: "+0.2",
      trend: "up",
      icon: Star,
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {stat.title}
            </CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              {stat.trend === "up" ? (
                <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
              ) : (
                <TrendingDown className="h-3 w-3 mr-1 text-red-500" />
              )}
              <span className={stat.trend === "up" ? "text-green-500" : "text-red-500"}>
                {stat.change}
              </span>
              <span className="ml-1">from last month</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}