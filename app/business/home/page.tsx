"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { BusinessProtectedRoute } from "@/components/auth/BusinessProtectedRoute"
import { BusinessLayoutWrapper } from "@/components/layouts/BusinessLayoutWrapper"
import { useAuth } from "@/lib/auth-context"
import { getHostDashboardData } from "@/lib/database"
import { createClient } from "@/lib/supabase/client"
import type { BusinessDashboardData } from "@/lib/database"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  AlertCircle,
  XCircle,
  Phone,
  Mail,
} from "lucide-react"
import Link from "next/link"

// Types for weekly bookings
interface WeeklyBooking {
  id: string
  title: string
  client_name: string
  client_email: string
  client_phone: string
  date: string
  time: string
  duration: number
  group_size: number
  max_group_size: number
  total_sales: number
  status: 'confirmed' | 'pending' | 'cancelled'
  created_at: string
  special_requests?: string
}

interface WeeklyBookings {
  [key: string]: WeeklyBooking[]
}

export default function BusinessHomePage() {
  const { user, userType, isLoading: authLoading } = useAuth()
  const [dashboardData, setDashboardData] = useState<BusinessDashboardData | null>(null)
  const [weeklyBookings, setWeeklyBookings] = useState<WeeklyBookings>({})
  const [currentWeekStart, setCurrentWeekStart] = useState(new Date())
  const [loading, setLoading] = useState(true)
  const [bookingsLoading, setBookingsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  // Helper function to get week dates
  const getWeekDates = (startDate: Date) => {
    const dates = []
    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate)
      date.setDate(startDate.getDate() + i)
      dates.push(date)
    }
    return dates
  }

  // Helper function to format date key
  const getDateKey = (date: Date) => {
    return date.toISOString().split('T')[0]
  }

  // Navigate week
  const navigateWeek = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentWeekStart)
    newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7))
    setCurrentWeekStart(newDate)
  }

  // Check and create profile if needed
  const ensureBusinessProfile = async () => {
    if (!user) return false

    try {
      const supabase = createClient()

      // Check if host profile exists
      const { data: hostProfile, error } = await supabase
        .from('host_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (error && error.code === 'PGRST116') {
        // Profile doesn't exist, create it
        const { createBusinessProfileAfterConfirmation } = await import('@/app/actions/auth')
        const result = await createBusinessProfileAfterConfirmation(user.id)

        if (!result.success) {
          setError("Failed to set up business profile. Please contact support.")
          return false
        }

        // Refresh the page to load the new profile
        window.location.reload()
        return false
      } else if (error) {
        console.error("Error checking profile:", error)
        setError("Error loading business profile")
        return false
      }

      return true
    } catch (error) {
      console.error("Error ensuring profile:", error)
      setError("Error setting up business profile")
      return false
    }
  }

  // Fetch weekly bookings
  const fetchWeeklyBookings = async () => {
    if (!user || userType !== "business") return

    // Ensure profile exists first
    const profileExists = await ensureBusinessProfile()
    if (!profileExists) return

    try {
      setBookingsLoading(true)
      const supabase = createClient()

      const weekStart = new Date(currentWeekStart)
      weekStart.setHours(0, 0, 0, 0)
      const weekEnd = new Date(weekStart)
      weekEnd.setDate(weekEnd.getDate() + 6)
      weekEnd.setHours(23, 59, 59, 999)

      const { data, error: fetchError } = await supabase
        .from("bookings")
        .select(`
          *,
          experiences!bookings_experience_id_fkey(title, location, duration),
          users!bookings_user_id_fkey(first_name, last_name, email, phone)
        `)
        .eq("host_id", user.id)
        .gte("booking_date", weekStart.toISOString())
        .lte("booking_date", weekEnd.toISOString())
        .order("booking_date", { ascending: true })

      if (fetchError) {
        console.error("Error fetching weekly bookings:", fetchError)
        return
      }

      // Group bookings by date
      const groupedBookings: WeeklyBookings = {}
      data?.forEach((booking) => {
        const dateKey = getDateKey(new Date(booking.booking_date))
        if (!groupedBookings[dateKey]) {
          groupedBookings[dateKey] = []
        }

        groupedBookings[dateKey].push({
          id: booking.id,
          title: booking.experiences?.title || "Adventure",
          client_name: `${booking.users?.first_name || "Unknown"} ${booking.users?.last_name || "Guest"}`,
          client_email: booking.users?.email || "",
          client_phone: booking.users?.phone || "",
          date: booking.booking_date,
          time: booking.departure_time || "TBD",
          duration: booking.experiences?.duration || 120,
          group_size: booking.number_of_guests || 1,
          max_group_size: 8, // Default max
          total_sales: booking.total_price || 0,
          status: booking.booking_status as 'confirmed' | 'pending' | 'cancelled',
          created_at: booking.created_at,
          special_requests: booking.special_requests
        })
      })

      setWeeklyBookings(groupedBookings)
    } catch (err) {
      console.error("Error fetching weekly bookings:", err)
    } finally {
      setBookingsLoading(false)
    }
  }

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

  useEffect(() => {
    if (!authLoading && user && userType === "business") {
      fetchWeeklyBookings()
    }
  }, [user, userType, authLoading, currentWeekStart])

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

  const weekDates = getWeekDates(currentWeekStart)
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'pending':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

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

          {/* Weekly Booking View */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Weekly Schedule</CardTitle>
                  <CardDescription>
                    Your bookings for the week of {currentWeekStart.toLocaleDateString()}
                  </CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm" onClick={() => navigateWeek('prev')}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => navigateWeek('next')}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {bookingsLoading ? (
                <div className="grid grid-cols-7 gap-4">
                  {[...Array(7)].map((_, i) => (
                    <div key={i} className="space-y-2">
                      <Skeleton className="h-4 w-12" />
                      <Skeleton className="h-20 w-full" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-7 gap-4">
                  {weekDates.map((date, index) => {
                    const dateKey = getDateKey(date)
                    const dayBookings = weeklyBookings[dateKey] || []
                    const isToday = date.toDateString() === new Date().toDateString()

                    return (
                      <div key={dateKey} className={`space-y-2 ${isToday ? 'bg-blue-50 p-2 rounded-lg' : ''}`}>
                        <div className="text-center">
                          <div className="text-xs text-muted-foreground">{dayNames[index]}</div>
                          <div className={`text-sm font-medium ${isToday ? 'text-blue-600' : ''}`}>
                            {date.getDate()}
                          </div>
                        </div>
                        <div className="space-y-1">
                          {dayBookings.length === 0 ? (
                            <div className="text-xs text-muted-foreground text-center py-4">
                              No bookings
                            </div>
                          ) : (
                            dayBookings.map((booking) => (
                              <div
                                key={booking.id}
                                className={`p-2 rounded border text-xs ${getStatusColor(booking.status)} cursor-pointer hover:shadow-sm transition-shadow`}
                              >
                                <div className="flex items-center justify-between mb-1">
                                  <span className="font-medium truncate">{booking.time}</span>
                                  {getStatusIcon(booking.status)}
                                </div>
                                <div className="truncate font-medium">{booking.title}</div>
                                <div className="truncate text-muted-foreground">{booking.client_name}</div>
                                <div className="flex items-center justify-between mt-1">
                                  <span className="flex items-center">
                                    <Users className="h-3 w-3 mr-1" />
                                    {booking.group_size}
                                  </span>
                                  <span className="font-medium">€{booking.total_sales}</span>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Enhanced Upcoming Bookings */}
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Bookings</CardTitle>
              <CardDescription>Next 5 scheduled adventures</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {dashboardData?.recentBookings && dashboardData.recentBookings.length > 0 ? (
                dashboardData.recentBookings.slice(0, 5).map((booking) => (
                  <div key={booking.id} className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-shadow">
                    <div className="flex items-center space-x-4">
                      <Avatar>
                        <AvatarImage src={booking.avatar || undefined} />
                        <AvatarFallback>{booking.customerName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div className="space-y-1">
                        <p className="font-medium">{booking.customerName}</p>
                        <p className="text-sm text-muted-foreground">{booking.experienceTitle}</p>
                        <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                          <span className="flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            {booking.date}
                          </span>
                          <span className="flex items-center">
                            <Users className="h-3 w-3 mr-1" />
                            {booking.guests} guests
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="text-right">
                        <p className="font-medium">€{booking.amount}</p>
                        <Badge variant={booking.status === "confirmed" ? "default" : "secondary"}>
                          {booking.status}
                        </Badge>
                      </div>
                      <div className="flex space-x-1">
                        <Button size="sm" variant="outline">
                          <Phone className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Mail className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Eye className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <CalendarDays className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                  <p>No upcoming bookings</p>
                  <p className="text-sm">New bookings will appear here</p>
                </div>
              )}
              <Button variant="outline" className="w-full" asChild>
                <Link href="/business/bookings">View All Bookings</Link>
              </Button>
            </CardContent>
          </Card>

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
        </div>
      </BusinessLayoutWrapper>
    </BusinessProtectedRoute>
  )
}