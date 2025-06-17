"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  BarChart3,
  Calendar,
  DollarSign,
  Users,
  Star,
  TrendingUp,
  TrendingDown,
  Clock,
  Phone,
  Bell,
  Settings,
  Plus,
  Eye,
  Edit,
  CheckCircle,
  Waves,
  Ship,
  Anchor,
  Menu,
  X,
  Cloud,
  Sun,
  CloudRain,
  Wind,
  ChevronRight,
  Globe,
  MessageSquare,
  Target,
  Award,
  Building,
  Activity,
  CreditCard,
  Filter,
  Download,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useAuth } from "@/lib/auth-context"

// Mock data
const mockBusinessData = {
  businessProfile: {
    name: "Ocean Adventures LLC",
    type: "Tour Operator",
    location: "San Diego, CA",
    rating: 4.8,
    totalReviews: 247,
    yearsInBusiness: 8,
    verified: true,
  },
  overview: {
    totalRevenue: 127500,
    activeBookings: 24,
    totalExperiences: 12,
    averageRating: 4.8,
    revenueGrowth: 12.5,
    bookingGrowth: 8.2,
  },
  recentBookings: [
    {
      id: "bk_001",
      customerName: "Sarah Miller",
      experienceTitle: "Sunset Sailing Adventure",
      date: "2025-01-20",
      status: "confirmed",
      amount: 189,
      guests: 2,
      avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      id: "bk_002",
      customerName: "Mike & Jennifer Chen",
      experienceTitle: "Deep Sea Fishing",
      date: "2025-01-22",
      status: "pending",
      amount: 350,
      guests: 4,
      avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      id: "bk_003",
      customerName: "Rodriguez Family",
      experienceTitle: "Snorkeling Tour",
      date: "2025-01-18",
      status: "completed",
      amount: 280,
      guests: 5,
      avatar: "/placeholder.svg?height=40&width=40",
    },
  ],
  upcomingBookings: [
    {
      id: "bk_004",
      customerName: "Emma Thompson",
      experienceTitle: "Morning Kayak Tour",
      date: "2025-01-19",
      time: "09:00",
      guests: 2,
      specialRequests: "Beginner friendly, needs life jackets",
      phone: "+1 (555) 123-4567",
    },
    {
      id: "bk_005",
      customerName: "David Park",
      experienceTitle: "Sunset Sailing",
      date: "2025-01-20",
      time: "18:00",
      guests: 6,
      specialRequests: "Celebrating anniversary",
      phone: "+1 (555) 987-6543",
    },
  ],
  earnings: {
    thisMonth: 8750,
    lastMonth: 7200,
    pending: 1240,
    nextPayout: {
      amount: 3200,
      date: "2025-01-25",
    },
  },
  analytics: {
    conversionRate: 68,
    customerSatisfaction: 92,
    repeatCustomerRate: 34,
    marketplaceVsDirectRatio: 75,
  },
  experiences: [
    {
      id: "exp_001",
      title: "Sunset Sailing Adventure",
      status: "active",
      bookings: 15,
      revenue: 2835,
      rating: 4.9,
      lastBooked: "2025-01-18",
    },
    {
      id: "exp_002",
      title: "Deep Sea Fishing",
      status: "active",
      bookings: 8,
      revenue: 2800,
      rating: 4.7,
      lastBooked: "2025-01-17",
    },
    {
      id: "exp_003",
      title: "Snorkeling Tour",
      status: "active",
      bookings: 12,
      revenue: 1680,
      rating: 4.8,
      lastBooked: "2025-01-16",
    },
  ],
  weather: {
    current: {
      temp: 72,
      condition: "sunny",
      windSpeed: 8,
      waveHeight: 2.1,
      visibility: 10,
    },
    forecast: [
      { date: "Today", condition: "sunny", high: 75, low: 62, windSpeed: 8 },
      { date: "Tomorrow", condition: "partly_cloudy", high: 73, low: 59, windSpeed: 12 },
      { date: "Sunday", condition: "cloudy", high: 68, low: 55, windSpeed: 15 },
    ],
  },
}

// Sidebar Component
const Sidebar = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const navigation = [
    { name: "Dashboard", icon: BarChart3, href: "#", current: true },
    { name: "Bookings", icon: Calendar, href: "#", current: false },
    { name: "Experiences", icon: Ship, href: "#", current: false },
    { name: "Analytics", icon: TrendingUp, href: "#", current: false },
    { name: "Earnings", icon: DollarSign, href: "#", current: false },
    { name: "Messages", icon: MessageSquare, href: "#", current: false },
    { name: "Settings", icon: Settings, href: "#", current: false },
  ]

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={onClose} />
        </div>
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}
      >
        <div className="flex items-center justify-between h-16 px-6 border-b">
          <div className="flex items-center space-x-2">
            <Anchor className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">SeaFable</span>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="lg:hidden">
            <X className="h-5 w-5" />
          </Button>
        </div>

        <nav className="mt-8 px-4">
          <div className="space-y-1">
            {navigation.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                  item.current ? "bg-blue-100 text-blue-700" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.name}
              </a>
            ))}
          </div>
        </nav>

        {/* Business Profile */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <Building className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">{mockBusinessData.businessProfile.name}</p>
              <p className="text-xs text-gray-500">{mockBusinessData.businessProfile.type}</p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

// Stats Overview Component
const StatsOverview = () => {
  const stats = [
    {
      name: "Total Revenue",
      value: `$${mockBusinessData.overview.totalRevenue.toLocaleString()}`,
      change: `+${mockBusinessData.overview.revenueGrowth}%`,
      changeType: "increase",
      icon: DollarSign,
    },
    {
      name: "Active Bookings",
      value: mockBusinessData.overview.activeBookings,
      change: `+${mockBusinessData.overview.bookingGrowth}%`,
      changeType: "increase",
      icon: Calendar,
    },
    {
      name: "Total Experiences",
      value: mockBusinessData.overview.totalExperiences,
      change: "+2 this month",
      changeType: "increase",
      icon: Ship,
    },
    {
      name: "Average Rating",
      value: mockBusinessData.overview.averageRating,
      change: "+0.2 from last month",
      changeType: "increase",
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

// Recent Bookings Component
const RecentBookings = () => {
  const getStatusBadge = (status: string) => {
    const variants = {
      confirmed: "default",
      pending: "secondary",
      completed: "outline",
      cancelled: "destructive",
    }
    return <Badge variant={variants[status] as any}>{status}</Badge>
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Recent Bookings</CardTitle>
          <Button variant="outline" size="sm">
            <Eye className="h-4 w-4 mr-2" />
            View All
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {mockBusinessData.recentBookings.map((booking) => (
            <div key={booking.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-4">
                <img
                  src={booking.avatar || "/placeholder.svg"}
                  alt={booking.customerName}
                  className="w-10 h-10 rounded-full"
                />
                <div>
                  <p className="font-medium text-gray-900">{booking.customerName}</p>
                  <p className="text-sm text-gray-500">{booking.experienceTitle}</p>
                  <p className="text-xs text-gray-400">
                    {booking.date} • {booking.guests} guests
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <p className="font-semibold text-gray-900">${booking.amount}</p>
                  {getStatusBadge(booking.status)}
                </div>
                <Button variant="ghost" size="icon">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

// Weather Widget Component
const WeatherWidget = () => {
  const getWeatherIcon = (condition: string) => {
    const icons = {
      sunny: Sun,
      partly_cloudy: Cloud,
      cloudy: Cloud,
      rain: CloudRain,
      windy: Wind,
    }
    return icons[condition] || Sun
  }

  const weather = mockBusinessData.weather

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Cloud className="h-5 w-5 mr-2" />
          Weather Conditions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold">{weather.current.temp}°F</p>
              <p className="text-sm text-gray-500 capitalize">{weather.current.condition}</p>
            </div>
            {(() => {
              const WeatherIcon = getWeatherIcon(weather.current.condition)
              return <WeatherIcon className="h-8 w-8 text-yellow-500" />
            })()}
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center">
              <Wind className="h-4 w-4 mr-2 text-gray-400" />
              <span>{weather.current.windSpeed} mph</span>
            </div>
            <div className="flex items-center">
              <Waves className="h-4 w-4 mr-2 text-gray-400" />
              <span>{weather.current.waveHeight} ft</span>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">3-Day Forecast</p>
            {weather.forecast.map((day, index) => {
              const DayIcon = getWeatherIcon(day.condition)
              return (
                <div key={index} className="flex items-center justify-between text-sm">
                  <span className="w-20">{day.date}</span>
                  <DayIcon className="h-4 w-4 text-gray-400" />
                  <span>
                    {day.high}°/{day.low}°
                  </span>
                  <span className="text-gray-500">{day.windSpeed} mph</span>
                </div>
              )
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Earnings Summary Component
const EarningsSummary = () => {
  const earnings = mockBusinessData.earnings
  const monthlyGrowth = (((earnings.thisMonth - earnings.lastMonth) / earnings.lastMonth) * 100).toFixed(1)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <DollarSign className="h-5 w-5 mr-2" />
          Earnings Overview
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <p className="text-sm text-gray-500">This Month</p>
            <p className="text-3xl font-bold text-green-600">${earnings.thisMonth.toLocaleString()}</p>
            <p className="text-sm text-green-600 flex items-center">
              <TrendingUp className="h-4 w-4 mr-1" />+{monthlyGrowth}% from last month
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Last Month</p>
              <p className="text-xl font-semibold">${earnings.lastMonth.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Pending</p>
              <p className="text-xl font-semibold text-yellow-600">${earnings.pending.toLocaleString()}</p>
            </div>
          </div>

          <div className="border-t pt-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium">Next Payout</p>
              <Badge variant="secondary">{earnings.nextPayout.date}</Badge>
            </div>
            <p className="text-2xl font-bold text-blue-600">${earnings.nextPayout.amount.toLocaleString()}</p>
            <Button className="w-full mt-3" size="sm">
              <CreditCard className="h-4 w-4 mr-2" />
              View Payout Details
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Performance Metrics Component
const PerformanceMetrics = () => {
  const analytics = mockBusinessData.analytics

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Target className="h-5 w-5 mr-2" />
          Performance Metrics
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Conversion Rate</span>
              <span>{analytics.conversionRate}%</span>
            </div>
            <Progress value={analytics.conversionRate} />
          </div>

          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Customer Satisfaction</span>
              <span>{analytics.customerSatisfaction}%</span>
            </div>
            <Progress value={analytics.customerSatisfaction} />
          </div>

          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Repeat Customer Rate</span>
              <span>{analytics.repeatCustomerRate}%</span>
            </div>
            <Progress value={analytics.repeatCustomerRate} />
          </div>

          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Marketplace vs Direct</span>
              <span>
                {analytics.marketplaceVsDirectRatio}% / {100 - analytics.marketplaceVsDirectRatio}%
              </span>
            </div>
            <Progress value={analytics.marketplaceVsDirectRatio} />
          </div>

          <Button variant="outline" className="w-full" size="sm">
            <BarChart3 className="h-4 w-4 mr-2" />
            View Detailed Analytics
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

// Main Business Dashboard Component
export default function BusinessDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login")
      return
    }

    // Simulate loading
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1500)
    return () => clearTimeout(timer)
  }, [isAuthenticated, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your business dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-64">
        {/* Top bar */}
        <header className="bg-white shadow-sm border-b">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center">
              <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)} className="lg:hidden mr-4">
                <Menu className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Business Dashboard</h1>
                <p className="text-sm text-gray-500">Welcome back, {mockBusinessData.businessProfile.name}</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
              </Button>

              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{mockBusinessData.businessProfile.name}</p>
                  <div className="flex items-center text-xs text-gray-500">
                    <Star className="h-3 w-3 mr-1 text-yellow-400" />
                    {mockBusinessData.businessProfile.rating} • {mockBusinessData.businessProfile.totalReviews} reviews
                  </div>
                </div>
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Building className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main dashboard content */}
        <main className="flex-1 overflow-y-auto p-6">
          {/* Welcome banner */}
          <Card className="mb-8 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Good morning! 🌊</h2>
                  <p className="text-blue-100 mb-4">
                    You have {mockBusinessData.upcomingBookings.length} upcoming bookings today. Weather conditions are
                    perfect for water activities!
                  </p>
                  <div className="flex items-center space-x-4 text-sm">
                    <div className="flex items-center">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Profile Complete
                    </div>
                    <div className="flex items-center">
                      <Award className="h-4 w-4 mr-1" />
                      Verified Business
                    </div>
                  </div>
                </div>
                <div className="hidden md:block">
                  <Ship className="h-20 w-20 text-blue-300 opacity-50" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats Overview */}
          <StatsOverview />

          {/* Quick Actions */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button variant="default" className="h-auto p-4 flex-col">
                  <Plus className="h-6 w-6 mb-2" />
                  <span className="text-sm">Add Experience</span>
                </Button>
                <Button variant="outline" className="h-auto p-4 flex-col">
                  <Calendar className="h-6 w-6 mb-2" />
                  <span className="text-sm">View Calendar</span>
                </Button>
                <Button variant="outline" className="h-auto p-4 flex-col">
                  <Cloud className="h-6 w-6 mb-2" />
                  <span className="text-sm">Check Weather</span>
                </Button>
                <Button variant="outline" className="h-auto p-4 flex-col">
                  <Download className="h-6 w-6 mb-2" />
                  <span className="text-sm">Download Report</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Main content grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left column - Bookings */}
            <div className="lg:col-span-2 space-y-8">
              <RecentBookings />

              {/* Experience Performance */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Experience Performance</CardTitle>
                    <Button variant="outline" size="sm">
                      <Filter className="h-4 w-4 mr-2" />
                      Filter
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockBusinessData.experiences.map((experience) => (
                      <div key={experience.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-gray-900">{experience.title}</h4>
                            <Badge variant={experience.status === "active" ? "default" : "secondary"}>
                              {experience.status}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-3 gap-4 text-sm text-gray-600">
                            <div>
                              <span className="font-medium">{experience.bookings}</span> bookings
                            </div>
                            <div>
                              <span className="font-medium">${experience.revenue}</span> revenue
                            </div>
                            <div className="flex items-center">
                              <Star className="h-3 w-3 mr-1 text-yellow-400" />
                              <span>{experience.rating}</span>
                            </div>
                          </div>
                        </div>
                        <Button variant="ghost" size="icon">
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  <Button variant="outline" className="w-full mt-4">
                    <Plus className="h-4 w-4 mr-2" />
                    Add New Experience
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Right column - Analytics & Widgets */}
            <div className="space-y-8">
              {/* Upcoming Bookings */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Upcoming Bookings</CardTitle>
                    <Button variant="outline" size="sm">
                      <Calendar className="h-4 w-4 mr-2" />
                      Calendar View
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockBusinessData.upcomingBookings.map((booking) => (
                      <div key={booking.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <p className="font-medium text-gray-900">{booking.customerName}</p>
                            <p className="text-sm text-gray-500">{booking.experienceTitle}</p>
                          </div>
                          <Badge variant="secondary">{booking.date}</Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="flex items-center text-gray-600">
                            <Clock className="h-4 w-4 mr-2" />
                            {booking.time}
                          </div>
                          <div className="flex items-center text-gray-600">
                            <Users className="h-4 w-4 mr-2" />
                            {booking.guests} guests
                          </div>
                          <div className="flex items-center text-gray-600">
                            <Phone className="h-4 w-4 mr-2" />
                            {booking.phone}
                          </div>
                        </div>
                        {booking.specialRequests && (
                          <div className="mt-3 p-2 bg-blue-50 rounded text-sm">
                            <p className="text-blue-700">
                              <strong>Special Requests:</strong> {booking.specialRequests}
                            </p>
                          </div>
                        )}
                        <div className="flex space-x-2 mt-3">
                          <Button size="sm" variant="outline">
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Message
                          </Button>
                          <Button size="sm" variant="outline">
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <WeatherWidget />
              <EarningsSummary />
              <PerformanceMetrics />

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Activity className="h-5 w-5 mr-2" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-900">New booking received</p>
                        <p className="text-xs text-gray-500">2 hours ago</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-900">Experience updated</p>
                        <p className="text-xs text-gray-500">4 hours ago</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-900">Weather alert issued</p>
                        <p className="text-xs text-gray-500">6 hours ago</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-900">New review posted</p>
                        <p className="text-xs text-gray-500">8 hours ago</p>
                      </div>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full mt-4" size="sm">
                    View All Activity
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Quick Stats Footer */}
          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <Globe className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                <p className="text-2xl font-bold text-gray-900">50+</p>
                <p className="text-sm text-gray-500">Countries Served</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Users className="h-6 w-6 mx-auto mb-2 text-green-600" />
                <p className="text-2xl font-bold text-gray-900">1,247</p>
                <p className="text-sm text-gray-500">Total Guests</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Award className="h-6 w-6 mx-auto mb-2 text-yellow-600" />
                <p className="text-2xl font-bold text-gray-900">98%</p>
                <p className="text-sm text-gray-500">Success Rate</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <TrendingUp className="h-6 w-6 mx-auto mb-2 text-purple-600" />
                <p className="text-2xl font-bold text-gray-900">+23%</p>
                <p className="text-sm text-gray-500">Growth Rate</p>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}
