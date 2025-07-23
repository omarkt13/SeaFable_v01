"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { BusinessProtectedRoute } from "@/components/auth/BusinessProtectedRoute"
import { BusinessLayoutWrapper } from "@/components/layouts/BusinessLayoutWrapper"
import { useAuth } from "@/lib/auth-context"
import { getHostDashboardData } from "@/lib/database"
import type { BusinessDashboardData } from "@/lib/database"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  CalendarDays,
  DollarSign,
  Star,
  TrendingUp,
  Users,
  Activity,
  Clock,
  MapPin,
  Plus,
  Eye,
  Calendar,
  BarChart3,
  MessageSquare,
  Settings,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react"
import Link from "next/link"

export default function BusinessHomePage() {
  const { user, userType, loading: authLoading } = useAuth()
  const [dashboardData, setDashboardData] = useState<BusinessDashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user || userType !== "business") return

      try {
        setLoading(true)
        const result = await getHostDashboardData(user.id)

        if (result.success && result.data) {
          setDashboardData(result.data)
        } else {
          setError(result.error || "Failed to load dashboard data")
        }
      } catch (err) {
        console.error("Error fetching dashboard data:", err)
        setError("An unexpected error occurred")
      } finally {
        setLoading(false)
      }
    }

    if (!authLoading) {
      fetchDashboardData()
    }
  }, [user, userType, authLoading])

  if (authLoading || loading) {
    return (
      <BusinessProtectedRoute>
        <BusinessLayoutWrapper title="Dashboard">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <Skeleton className="h-4 w-[100px]" />
                    <Skeleton className="h-4 w-4" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-8 w-[60px] mb-2" />
                    <Skeleton className="h-3 w-[120px]" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </BusinessLayoutWrapper>
      </BusinessProtectedRoute>
    )
  }

  if (error) {
    return (
      <BusinessProtectedRoute>
        <BusinessLayoutWrapper title="Dashboard">
          <div className="px-4 sm:px-6 lg:px-8">
            <Card className="border-red-200 bg-red-50">
              <CardHeader>
                <CardTitle className="text-red-800">Error Loading Dashboard</CardTitle>
                <CardDescription className="text-red-600">{error}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={() => window.location.reload()}>Try Again</Button>
              </CardContent>
            </Card>
          </div>
        </BusinessLayoutWrapper>
      </BusinessProtectedRoute>
    )
  }

  const overview = dashboardData?.overview || {
    totalRevenue: 0,
    revenueGrowth: 0,
    activeBookings: 0,
    bookingGrowth: 0,
    totalExperiences: 0,
    averageRating: 0
  }

  const quickActions = [
    {
      title: "New Adventure",
      description: "Create a new adventure offering",
      icon: Plus,
      href: "/business/adventures/new",
      color: "bg-blue-500 hover:bg-blue-600",
    },
    {
      title: "View Calendar",
      description: "Manage your schedule",
      icon: Calendar,
      href: "/business/calendar",
      color: "bg-green-500 hover:bg-green-600",
    },
    {
      title: "Manage Clients",
      description: "View and contact customers",
      icon: Users,
      href: "/business/clients",
      color: "bg-purple-500 hover:bg-purple-600",
    },
    {
      title: "Analytics",
      description: "View performance metrics",
      icon: BarChart3,
      href: "/business/reports",
      color: "bg-orange-500 hover:bg-orange-600",
    },
    {
      title: "Messages",
      description: "Customer communications",
      icon: MessageSquare,
      href: "/business/messages",
      color: "bg-pink-500 hover:bg-pink-600",
    },
    {
      title: "Settings",
      description: "Business configuration",
      icon: Settings,
      href: "/business/settings",
      color: "bg-gray-500 hover:bg-gray-600",
    },
  ]

  return (
    <BusinessProtectedRoute>
      <BusinessLayoutWrapper title="Dashboard">
        <div className="px-4 sm:px-6 lg:px-8 space-y-6">
          {/* Welcome Header */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Welcome Back!</h1>
              <p className="text-muted-foreground">
                Here's what's happening with your business today.
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" asChild>
                <Link href="/business/adventures/new">Add Experience</Link>
              </Button>
              <Button asChild>
                <Link href="/business/bookings">View Bookings</Link>
              </Button>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">€{overview.totalRevenue.toLocaleString()}</div>
                <div className="flex items-center text-xs text-muted-foreground">
                  {overview.revenueGrowth >= 0 ? (
                    <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
                  ) : (
                    <ArrowDownRight className="h-3 w-3 text-red-500 mr-1" />
                  )}
                  {Math.abs(overview.revenueGrowth)}% from last month
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Bookings</CardTitle>
                <CalendarDays className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{overview.activeBookings}</div>
                <div className="flex items-center text-xs text-muted-foreground">
                  {overview.bookingGrowth >= 0 ? (
                    <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
                  ) : (
                    <ArrowDownRight className="h-3 w-3 text-red-500 mr-1" />
                  )}
                  {Math.abs(overview.bookingGrowth)}% from last month
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Experiences</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{overview.totalExperiences}</div>
                <p className="text-xs text-muted-foreground">Active listings</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
                <Star className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{overview.averageRating}/5.0</div>
                <p className="text-xs text-muted-foreground">Based on all reviews</p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common tasks to manage your business</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {quickActions.map((action) => (
                  <Link
                    key={action.title}
                    href={action.href}
                    className="group flex items-center p-4 border rounded-lg hover:shadow-md transition-shadow"
                  >
                    <div className={`p-2 rounded-lg ${action.color} text-white mr-4`}>
                      <action.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-medium group-hover:text-blue-600">{action.title}</h3>
                      <p className="text-sm text-muted-foreground">{action.description}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          {dashboardData?.recentBookings && dashboardData.recentBookings.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Recent Bookings</CardTitle>
                <CardDescription>Latest customer bookings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {dashboardData.recentBookings.slice(0, 5).map((booking) => (
                  <div key={booking.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <Users className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium">{booking.customerName}</p>
                        <p className="text-sm text-muted-foreground">{booking.experienceTitle}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">€{booking.amount}</p>
                      <Badge variant={booking.status === "confirmed" ? "default" : "secondary"}>
                        {booking.status}
                      </Badge>
                    </div>
                  </div>
                ))}
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/business/bookings">View All Bookings</Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </BusinessLayoutWrapper>
    </BusinessProtectedRoute>
  )
}