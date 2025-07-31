
"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/useAuth"
import { BusinessLayout } from "@/components/layouts/BusinessLayout"
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
  Phone,
  MessageSquare,
  Eye,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react"
import Link from "next/link"

export default function BusinessDashboard() {
  const { user, userType, loading: authLoading } = useAuth()
  const [dashboardData, setDashboardData] = useState<BusinessDashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user || userType !== "business") {
        console.log("Skipping dashboard fetch - no user or not business type:", { user: !!user, userType })
        return
      }

      try {
        setLoading(true)
        setError(null)
        
        console.log("=== Fetching dashboard data for user:", user.id)
        
        // Call the API endpoint
        const response = await fetch('/api/business/dashboard', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        })
        
        if (!response.ok) {
          const errorText = await response.text()
          console.error("Dashboard API HTTP error:", response.status, errorText)
          setError(`Server error: ${response.status}`)
          return
        }
        
        const result = await response.json()
        console.log("Dashboard API response:", { success: result.success, hasProfile: !!result.businessProfile })
        
        if (result.success) {
          // Transform API response to match expected dashboard data structure
          const transformedData = {
            businessProfile: result.businessProfile,
            overview: result.overview || {
              totalRevenue: 0,
              activeBookings: 0,
              totalExperiences: 0,
              averageRating: 0,
              revenueGrowth: 0,
              bookingGrowth: 0
            },
            recentBookings: result.recentBookings || [],
            upcomingBookings: result.upcomingBookings || [],
            earnings: result.earnings || {
              thisMonth: 0,
              lastMonth: 0,
              pending: 0,
              nextPayout: { amount: 0, date: new Date().toISOString() },
              monthlyTrend: []
            },
            analytics: result.analytics || {
              conversionRate: 0,
              customerSatisfaction: 0,
              repeatCustomerRate: 0,
              marketplaceVsDirectRatio: 0,
              metricsTrend: []
            },
            experiences: result.experiences || [],
            recentActivity: result.recentActivity || []
          }
          
          console.log("✅ Dashboard data loaded successfully")
          setDashboardData(transformedData)
        } else {
          const errorMessage = result.error || "Failed to load dashboard data"
          console.error("❌ Dashboard API error:", errorMessage, result.details)
          setError(errorMessage)
        }
      } catch (err) {
        console.error("❌ Network error fetching dashboard data:", err)
        setError("Network error occurred while loading dashboard. Please check your connection.")
      } finally {
        setLoading(false)
      }
    }

    if (!authLoading && user && userType === "business") {
      console.log("Starting dashboard data fetch...")
      fetchDashboardData()
    } else {
      console.log("Waiting for auth or wrong user type:", { authLoading, user: !!user, userType })
    }
  }, [user, userType, authLoading])

  if (authLoading || loading) {
    return (
      <BusinessLayout>
        <div className="p-6 space-y-6">
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
      </BusinessLayout>
    )
  }

  if (error) {
    return (
      <BusinessLayout>
        <div className="p-6">
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
      </BusinessLayout>
    )
  }

  if (!dashboardData) {
    return (
      <BusinessLayout>
        <div className="p-6">
          <Card>
            <CardHeader>
              <CardTitle>No Data Available</CardTitle>
              <CardDescription>Dashboard data could not be loaded.</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </BusinessLayout>
    )
  }

  const { overview, recentBookings, upcomingBookings, earnings, analytics, experiences, recentActivity } = dashboardData

  return (
    <BusinessLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Business Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back, {dashboardData.businessProfile?.contact_name || dashboardData.businessProfile?.name || "Host"}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href="/business/experiences/new">Add Experience</Link>
            </Button>
            <Button asChild>
              <Link href="/business/bookings">View Bookings</Link>
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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

        {/* Recent Bookings & Upcoming */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Bookings */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Bookings</CardTitle>
              <CardDescription>Latest customer bookings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentBookings.length > 0 ? (
                recentBookings.slice(0, 5).map((booking) => (
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
                ))
              ) : (
                <p className="text-muted-foreground text-center py-4">No recent bookings</p>
              )}
              {recentBookings.length > 0 && (
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/business/bookings">View All Bookings</Link>
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Upcoming Bookings */}
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Bookings</CardTitle>
              <CardDescription>Next experiences to deliver</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {upcomingBookings.length > 0 ? (
                upcomingBookings.map((booking) => (
                  <div key={booking.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                        <Clock className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium">{booking.customerName}</p>
                        <p className="text-sm text-muted-foreground">{booking.experienceTitle}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{booking.date}</p>
                      <p className="text-sm text-muted-foreground">{booking.time}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-center py-4">No upcoming bookings</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Experience Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Experience Performance</CardTitle>
            <CardDescription>How your experiences are performing</CardDescription>
          </CardHeader>
          <CardContent>
            {experiences.length > 0 ? (
              <div className="space-y-4">
                {experiences.map((experience) => (
                  <div key={experience.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{experience.title}</p>
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <Badge variant={experience.status === "active" ? "default" : "secondary"}>
                          {experience.status}
                        </Badge>
                        <span>•</span>
                        <span>{experience.bookings} bookings</span>
                        <span>•</span>
                        <span>⭐ {experience.rating}/5</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">€{experience.revenue}</p>
                      <p className="text-sm text-muted-foreground">Revenue</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">No experiences created yet</p>
                <Button asChild>
                  <Link href="/business/experiences/new">Create Your First Experience</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest activity on your account</CardDescription>
          </CardHeader>
          <CardContent>
            {recentActivity.length > 0 ? (
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className={`w-2 h-2 rounded-full mt-2 ${activity.color}`} />
                    <div className="flex-1">
                      <p className="text-sm">{activity.description}</p>
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-4">No recent activity</p>
            )}
          </CardContent>
        </Card>
      </div>
    </BusinessLayout>
  )
}
