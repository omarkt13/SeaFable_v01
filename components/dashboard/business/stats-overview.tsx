
"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"
import { TrendingUp, TrendingDown, DollarSign, Users, Calendar, Star } from "lucide-react"

interface StatsOverviewProps {
  className?: string
}

const revenueData = [
  { month: "Jan", revenue: 2400, bookings: 12 },
  { month: "Feb", revenue: 1398, bookings: 8 },
  { month: "Mar", revenue: 9800, bookings: 24 },
  { month: "Apr", revenue: 3908, bookings: 16 },
  { month: "May", revenue: 4800, bookings: 20 },
  { month: "Jun", revenue: 3800, bookings: 18 },
]

const chartConfig = {
  revenue: {
    label: "Revenue",
    color: "hsl(var(--chart-1))",
  },
  bookings: {
    label: "Bookings",
    color: "hsl(var(--chart-2))",
  },
}

export function StatsOverview({ className }: StatsOverviewProps) {
  const currentMonthRevenue = revenueData[revenueData.length - 1]?.revenue || 0
  const previousMonthRevenue = revenueData[revenueData.length - 2]?.revenue || 0
  const revenueChange = ((currentMonthRevenue - previousMonthRevenue) / previousMonthRevenue * 100).toFixed(1)
  const isRevenueUp = currentMonthRevenue > previousMonthRevenue

  const currentMonthBookings = revenueData[revenueData.length - 1]?.bookings || 0
  const previousMonthBookings = revenueData[revenueData.length - 2]?.bookings || 0
  const bookingsChange = ((currentMonthBookings - previousMonthBookings) / previousMonthBookings * 100).toFixed(1)
  const isBookingsUp = currentMonthBookings > previousMonthBookings

  return (
    <div className={`grid gap-4 md:grid-cols-2 lg:grid-cols-4 ${className}`}>
      {/* Revenue Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${currentMonthRevenue.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground flex items-center">
            {isRevenueUp ? (
              <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
            ) : (
              <TrendingDown className="h-3 w-3 mr-1 text-red-500" />
            )}
            <span className={isRevenueUp ? "text-green-500" : "text-red-500"}>
              {Math.abs(Number(revenueChange))}%
            </span>
            <span className="ml-1">from last month</span>
          </p>
        </CardContent>
      </Card>

      {/* Bookings Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{currentMonthBookings}</div>
          <p className="text-xs text-muted-foreground flex items-center">
            {isBookingsUp ? (
              <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
            ) : (
              <TrendingDown className="h-3 w-3 mr-1 text-red-500" />
            )}
            <span className={isBookingsUp ? "text-green-500" : "text-red-500"}>
              {Math.abs(Number(bookingsChange))}%
            </span>
            <span className="ml-1">from last month</span>
          </p>
        </CardContent>
      </Card>

      {/* Active Customers Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Customers</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">573</div>
          <p className="text-xs text-muted-foreground flex items-center">
            <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
            <span className="text-green-500">12.5%</span>
            <span className="ml-1">from last month</span>
          </p>
        </CardContent>
      </Card>

      {/* Average Rating Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
          <Star className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">4.8</div>
          <p className="text-xs text-muted-foreground flex items-center">
            <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
            <span className="text-green-500">2.1%</span>
            <span className="ml-1">from last month</span>
          </p>
        </CardContent>
      </Card>

      {/* Revenue Chart */}
      <Card className="col-span-full lg:col-span-2">
        <CardHeader>
          <CardTitle>Revenue Overview</CardTitle>
          <CardDescription>Monthly revenue for the past 6 months</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="var(--color-revenue)"
                  fill="var(--color-revenue)"
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Bookings Chart */}
      <Card className="col-span-full lg:col-span-2">
        <CardHeader>
          <CardTitle>Bookings Trend</CardTitle>
          <CardDescription>Monthly bookings for the past 6 months</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar
                  dataKey="bookings"
                  fill="var(--color-bookings)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  )
}
