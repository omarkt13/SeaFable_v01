
"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { BusinessLayout } from "@/components/layouts/BusinessLayout"
import { BusinessProtectedRoute } from "@/components/auth/BusinessProtectedRoute"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { 
  Plus, 
  Calendar, 
  Users, 
  TrendingUp, 
  DollarSign,
  Anchor,
  CheckCircle,
  Shield,
  CreditCard,
  MessageCircle,
  Edit2,
  Eye,
  User,
  ChevronLeft,
  ChevronRight,
  Clock
} from "lucide-react"

// Types
interface Booking {
  id: string
  title: string
  client_name: string
  date: string
  time: string
  duration: number
  group_size: number
  max_group_size: number
  total_sales: number
  status: 'confirmed' | 'pending' | 'cancelled'
  created_at: string
}

interface Stats {
  revenue: number
  active_bookings: number
  total_clients: number
  total_experiences: number
}

interface WeeklyBookings {
  [key: string]: Booking[]
}

export default function BusinessHomePage() {
  const { user, businessProfile } = useAuth()
  const router = useRouter()
  
  const [stats, setStats] = useState<Stats>({
    revenue: 0,
    active_bookings: 0,
    total_clients: 0,
    total_experiences: 0
  })
  const [recentBookings, setRecentBookings] = useState<Booking[]>([])
  const [weeklyBookings, setWeeklyBookings] = useState<WeeklyBookings>({})
  const [loading, setLoading] = useState(true)
  const [currentWeek, setCurrentWeek] = useState('March 18 - 24')

  const supabase = createClient()

  // Fetch dashboard data
  useEffect(() => {
    if (user && businessProfile) {
      fetchDashboardData()
    }
  }, [user, businessProfile])

  const fetchDashboardData = async () => {
    setLoading(true)
    try {
      await Promise.all([
        fetchStats(),
        fetchRecentBookings(),
        fetchWeeklyBookings()
      ])
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      // Revenue for current month
      const { data: revenueData } = await supabase
        .from('bookings')
        .select('total_price')
        .eq('host_id', user.id)
        .gte('created_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString())

      // Active bookings count
      const { data: activeBookingsData, count: activeBookingsCount } = await supabase
        .from('bookings')
        .select('*', { count: 'exact', head: true })
        .eq('host_id', user.id)
        .eq('status', 'confirmed')
        .gte('start_date', new Date().toISOString())

      // Total clients count
      const { data: clientsData, count: clientsCount } = await supabase
        .from('bookings')
        .select('customer_id', { count: 'exact', head: true })
        .eq('host_id', user.id)

      // Total experiences count
      const { data: experiencesData, count: experiencesCount } = await supabase
        .from('experiences')
        .select('*', { count: 'exact', head: true })
        .eq('host_id', user.id)

      const totalRevenue = revenueData?.reduce((sum, booking) => sum + (booking.total_price || 0), 0) || 0

      setStats({
        revenue: totalRevenue,
        active_bookings: activeBookingsCount || 0,
        total_clients: clientsCount || 0,
        total_experiences: experiencesCount || 0
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const fetchRecentBookings = async () => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          customer_profiles (
            first_name,
            last_name
          ),
          experiences (
            title
          )
        `)
        .eq('host_id', user.id)
        .order('created_at', { ascending: false })
        .limit(3)

      if (error) throw error

      const bookingsWithClientNames = data?.map(booking => ({
        ...booking,
        client_name: booking.customer_profiles?.first_name && booking.customer_profiles?.last_name 
          ? `${booking.customer_profiles.first_name} ${booking.customer_profiles.last_name}`
          : 'Unknown Client',
        title: booking.experiences?.title || 'Unknown Experience',
        date: booking.start_date,
        time: new Date(booking.start_date).toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        duration: 4,
        group_size: booking.group_size || 1,
        max_group_size: 10,
        total_sales: booking.total_price || 0
      })) || []

      setRecentBookings(bookingsWithClientNames)
    } catch (error) {
      console.error('Error fetching recent bookings:', error)
    }
  }

  const fetchWeeklyBookings = async () => {
    try {
      // Get current week's bookings
      const startOfWeek = new Date()
      startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay())
      const endOfWeek = new Date(startOfWeek)
      endOfWeek.setDate(startOfWeek.getDate() + 6)

      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          experiences (
            title
          )
        `)
        .eq('host_id', user.id)
        .gte('start_date', startOfWeek.toISOString())
        .lte('start_date', endOfWeek.toISOString())
        .order('start_date', { ascending: true })

      if (error) throw error

      // Group bookings by day of week
      const groupedBookings: WeeklyBookings = {
        Monday: [],
        Tuesday: [],
        Wednesday: [],
        Thursday: [],
        Friday: [],
        Saturday: [],
        Sunday: []
      }

      data?.forEach(booking => {
        const bookingDate = new Date(booking.start_date)
        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
        const dayName = dayNames[bookingDate.getDay()]
        if (groupedBookings[dayName]) {
          groupedBookings[dayName].push({
            ...booking,
            title: booking.experiences?.title || 'Unknown Experience',
            client_name: 'Client',
            date: booking.start_date,
            time: new Date(booking.start_date).toLocaleTimeString('en-US', { 
              hour: '2-digit', 
              minute: '2-digit' 
            }),
            duration: 4,
            group_size: booking.group_size || 1,
            max_group_size: 10,
            total_sales: booking.total_price || 0
          })
        }
      })

      setWeeklyBookings(groupedBookings)
    } catch (error) {
      console.error('Error fetching weekly bookings:', error)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const EmptyState = ({ icon: Icon, title, description }: { icon: any, title: string, description: string }) => (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <Icon className="w-12 h-12 text-gray-400 mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-500 max-w-sm">{description}</p>
    </div>
  )

  const renderWeeklyBookings = () => {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    
    return (
      <div className="flex gap-4 overflow-x-auto pb-4">
        {days.map(day => (
          <div key={day} className="flex-shrink-0 w-80 bg-white border border-gray-200 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-3">{day}</h4>
            <div className="space-y-3">
              {loading ? (
                <div className="space-y-2">
                  <div className="animate-pulse bg-gray-200 rounded h-20 w-full" />
                  <div className="animate-pulse bg-gray-200 rounded h-20 w-full" />
                </div>
              ) : weeklyBookings[day]?.length > 0 ? (
                weeklyBookings[day].map(booking => (
                  <div key={booking.id} className="border border-gray-200 rounded-lg p-3">
                    <div className="space-y-1">
                      <h5 className="font-medium text-gray-900 text-sm">{booking.title}</h5>
                      <p className="text-xs text-gray-500">
                        {formatDate(booking.date)} - {booking.time}
                      </p>
                      <p className="text-xs text-gray-500">
                        Duration: {booking.duration} hours
                      </p>
                      <p className="text-xs text-gray-500">
                        Group size: {booking.group_size}/{booking.max_group_size}
                      </p>
                      <p className="text-xs text-gray-500">
                        Total sales: {formatCurrency(booking.total_sales)}
                      </p>
                      <div className="flex gap-2 mt-2">
                        <button className="flex items-center gap-1 px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded">
                          <MessageCircle className="w-3 h-3" />
                          Message Group
                        </button>
                        <button className="flex items-center gap-1 px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded">
                          <Edit2 className="w-3 h-3" />
                          Edit
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500 text-sm">
                  No bookings for {day}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (loading && (!stats || stats.revenue === 0)) {
    return (
      <BusinessProtectedRoute>
        <BusinessLayout>
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </BusinessLayout>
      </BusinessProtectedRoute>
    )
  }

  return (
    <BusinessProtectedRoute>
      <BusinessLayout>
        <div className="space-y-8">
          {/* Welcome Banner */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 lg:p-8 rounded-xl shadow-lg">
            <div className="flex flex-col gap-3">
              <h1 className="text-xl lg:text-2xl font-bold">
                Welcome back, {businessProfile?.contact_name || businessProfile?.name || 'Business Owner'}! 🌊
              </h1>
              <p className="text-base lg:text-lg opacity-90">
                You have {stats.active_bookings} bookings today. Weather conditions are perfect for water adventures!
              </p>
              <div className="flex items-center gap-4 lg:gap-6 mt-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 lg:w-5 lg:h-5" />
                  <span className="text-sm lg:text-base">Profile Complete</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 lg:w-5 lg:h-5" />
                  <span className="text-sm lg:text-base">Verified Business</span>
                </div>
              </div>
            </div>
          </div>

          {/* Monthly Stats */}
          <div>
            <h2 className="text-lg lg:text-xl font-semibold text-gray-900 mb-6">Monthly Stats</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
              <Card className="shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-4 lg:p-6">
                  <div className="w-10 h-10 lg:w-12 lg:h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-3 lg:mb-4">
                    <CreditCard className="w-5 h-5 lg:w-6 lg:h-6 text-blue-600" />
                  </div>
                  <div className="text-2xl lg:text-3xl font-bold text-gray-900">{formatCurrency(stats.revenue)}</div>
                  <div className="text-sm lg:text-base text-gray-500 mt-1">Revenue</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                    <Calendar className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="text-3xl font-bold text-gray-900">{stats.active_bookings}</div>
                  <div className="text-gray-500">Active Bookings</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                    <Users className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="text-3xl font-bold text-gray-900">{stats.total_clients}</div>
                  <div className="text-gray-500">Total Clients</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                    <Anchor className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="text-3xl font-bold text-gray-900">{stats.total_experiences}</div>
                  <div className="text-gray-500">Total Adventures</div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Quick Action Cards */}
          <div>
            <h2 className="text-lg lg:text-xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
              <Card className="hover:shadow-md transition-all duration-200 cursor-pointer hover:scale-[1.02]" onClick={() => router.push('/business/adventures/new')}>
                <CardContent className="p-4 lg:p-6 text-center">
                  <Plus className="h-6 w-6 lg:h-8 lg:w-8 mx-auto mb-3 text-green-600" />
                  <h3 className="font-semibold text-gray-900 mb-2 text-sm lg:text-base">Create Adventure</h3>
                  <p className="text-xs lg:text-sm text-gray-600">Add new adventure offerings</p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => router.push('/business/adventures')}>
                <CardContent className="p-6 text-center">
                  <TrendingUp className="h-8 w-8 mx-auto mb-3 text-blue-600" />
                  <h3 className="font-semibold text-gray-900 mb-2">Manage Adventures</h3>
                  <p className="text-sm text-gray-600">Edit your adventure offerings</p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => router.push('/business/bookings')}>
                <CardContent className="p-6 text-center">
                  <Users className="h-8 w-8 mx-auto mb-3 text-purple-600" />
                  <h3 className="font-semibold text-gray-900 mb-2">View Bookings</h3>
                  <p className="text-sm text-gray-600">Manage customer bookings</p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => router.push('/business/calendar')}>
                <CardContent className="p-6 text-center">
                  <Calendar className="h-8 w-8 mx-auto mb-3 text-orange-600" />
                  <h3 className="font-semibold text-gray-900 mb-2">Calendar</h3>
                  <p className="text-sm text-gray-600">Manage availability</p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* This Week's Bookings */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">This Week's Bookings</h2>
              <div className="flex items-center gap-2">
                <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="font-medium text-gray-900">{currentWeek}</span>
                <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
            {renderWeeklyBookings()}
          </div>

          {/* Recent Bookings */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Recent Bookings</h2>
                <Button 
                  onClick={() => router.push('/business/bookings')}
                  className="bg-blue-600 text-white hover:bg-blue-700"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View all
                </Button>
              </div>
              {recentBookings.length > 0 ? (
                <div className="space-y-4">
                  {recentBookings.map((booking, index) => (
                    <div key={booking.id} className={`flex items-center gap-4 p-4 ${index !== recentBookings.length - 1 ? 'border-b border-gray-200' : ''}`}>
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <User className="w-6 h-6 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900">{booking.client_name}</div>
                        <div className="text-gray-500">{booking.title}</div>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>{formatDate(booking.date)}</span>
                          <span>{booking.group_size} guests</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-gray-900">{formatCurrency(booking.total_sales)}</div>
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                          booking.status === 'confirmed' 
                            ? 'bg-green-100 text-green-800' 
                            : booking.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState 
                  icon={Calendar}
                  title="No Recent Bookings"
                  description="When you receive new bookings, they'll appear here."
                />
              )}
            </CardContent>
          </Card>

          {/* Getting Started Section */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Getting Started</h2>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-gray-700">Complete your business profile</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                  <span className="text-gray-700">Add your first adventure offering</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                  <span className="text-gray-700">Set up your availability calendar</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                  <span className="text-gray-700">Configure payment settings</span>
                </div>
              </div>
              <Button className="mt-4" onClick={() => router.push('/business/adventures/new')}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Adventure
              </Button>
            </CardContent>
          </Card>
        </div>
      </BusinessLayout>
    </BusinessProtectedRoute>
  )
}
