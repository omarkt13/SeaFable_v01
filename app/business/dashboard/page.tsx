
"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { BusinessLayout } from "@/components/layouts/BusinessLayout"
import { BusinessProtectedRoute } from "@/components/auth/BusinessProtectedRoute"
import { createClient } from "@/lib/supabase/client"
import {
  Anchor,
  Home,
  Users,
  MessageCircle,
  Calendar,
  Handshake,
  DollarSign,
  Shapes,
  Settings,
  Bell,
  ChevronDown,
  CheckCircle,
  Shield,
  CreditCard,
  Plus,
  Cloud,
  ChevronLeft,
  ChevronRight,
  Edit2,
  Eye,
  User,
  LogOut,
  Search
} from 'lucide-react'

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

export default function BusinessDashboardPage() {
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
  const [searchQuery, setSearchQuery] = useState('')
  const [dropdownOpen, setDropdownOpen] = useState(false)

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

      // Total clients count - using customer_profiles instead of clients
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
        duration: 4, // Default duration
        group_size: booking.group_size || 1,
        max_group_size: 10, // Default max
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

  const Skeleton = ({ className }: { className?: string }) => (
    <div className={`animate-pulse bg-gray-200 rounded ${className}`} />
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
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-20 w-full" />
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
        <div className="flex h-screen bg-gray-50 -m-8">
          {/* Main Content */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 px-8 py-4">
              <div className="flex items-center justify-between">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="flex items-center gap-4">
                  <button className="p-2 text-gray-400 hover:text-gray-600">
                    <Bell className="w-5 h-5" />
                  </button>
                  <div className="relative">
                    <button 
                      onClick={() => setDropdownOpen(!dropdownOpen)}
                      className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      <span>{businessProfile?.business_name || businessProfile?.contact_name || 'Business'}</span>
                      <ChevronDown className="w-4 h-4" />
                    </button>
                    {dropdownOpen && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                        <button 
                          onClick={() => router.push('/business/settings')}
                          className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-50 w-full text-left"
                        >
                          <User className="w-4 h-4" />
                          Profile
                        </button>
                        <button 
                          onClick={() => router.push('/business/settings')}
                          className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-50 w-full text-left"
                        >
                          <Settings className="w-4 h-4" />
                          Settings
                        </button>
                        <hr className="my-1" />
                        <button className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-50 w-full text-left">
                          <LogOut className="w-4 h-4" />
                          Logout
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </header>

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto">
              {/* Welcome Banner */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-8 m-4 rounded-lg">
                <div className="flex flex-col gap-4">
                  <h2 className="text-2xl font-bold">Good Morning! 🌊</h2>
                  <p className="text-lg">
                    You have {stats.active_bookings} bookings today. Weather conditions are perfect for water adventures!
                  </p>
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5" />
                      <span>Profile Complete</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Shield className="w-5 h-5" />
                      <span>Verified Business</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-8 space-y-8">
                {/* Monthly Stats */}
                <section>
                  <h3 className="text-2xl font-semibold text-gray-900 mb-6">Monthly Stats</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-white p-6 rounded-lg border border-gray-200">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                        <CreditCard className="w-6 h-6 text-blue-600" />
                      </div>
                      <div className="text-3xl font-bold text-gray-900">{formatCurrency(stats.revenue)}</div>
                      <div className="text-gray-500">Revenue</div>
                    </div>
                    <div className="bg-white p-6 rounded-lg border border-gray-200">
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                        <Calendar className="w-6 h-6 text-green-600" />
                      </div>
                      <div className="text-3xl font-bold text-gray-900">{stats.active_bookings}</div>
                      <div className="text-gray-500">Active Bookings</div>
                    </div>
                    <div className="bg-white p-6 rounded-lg border border-gray-200">
                      <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                        <Users className="w-6 h-6 text-purple-600" />
                      </div>
                      <div className="text-3xl font-bold text-gray-900">{stats.total_clients}</div>
                      <div className="text-gray-500">Total Clients</div>
                    </div>
                    <div className="bg-white p-6 rounded-lg border border-gray-200">
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                        <Anchor className="w-6 h-6 text-green-600" />
                      </div>
                      <div className="text-3xl font-bold text-gray-900">{stats.total_experiences}</div>
                      <div className="text-gray-500">Total Adventures</div>
                    </div>
                  </div>
                </section>

                {/* Quick Actions */}
                <section>
                  <h3 className="text-2xl font-semibold text-gray-900 mb-6">Quick Actions</h3>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                      { icon: Plus, label: 'Add Adventures', color: 'bg-gray-100', onClick: () => router.push('/business/adventures/new') },
                      { icon: MessageCircle, label: 'Messages', color: 'bg-gray-100', onClick: () => {} },
                      { icon: Calendar, label: 'Calendar', color: 'bg-gray-100', onClick: () => router.push('/business/calendar') },
                      { icon: Cloud, label: 'Check Weather', color: 'bg-gray-100', onClick: () => {} }
                    ].map(({ icon: Icon, label, color, onClick }) => (
                      <button 
                        key={label} 
                        onClick={onClick}
                        className={`${color} p-6 rounded-lg text-center hover:bg-gray-200 transition-colors`}
                      >
                        <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center mx-auto mb-3">
                          <Icon className="w-6 h-6 text-gray-600" />
                        </div>
                        <div className="font-medium text-gray-900">{label}</div>
                      </button>
                    ))}
                  </div>
                </section>

                {/* This Week's Bookings */}
                <section>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-semibold text-gray-900">This Week's Bookings</h3>
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
                </section>

                {/* Recent Bookings */}
                <section>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-semibold text-gray-900">Recent Bookings</h3>
                    <button 
                      onClick={() => router.push('/business/bookings')}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      <Eye className="w-4 h-4" />
                      View all
                    </button>
                  </div>
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
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
                  </div>
                </section>
              </div>
            </main>
          </div>
        </div>
      </BusinessLayout>
    </BusinessProtectedRoute>
  )
}
