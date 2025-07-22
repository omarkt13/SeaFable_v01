"use client"

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { EmptyState } from '@/components/ui/empty-state'
import { 
  Calendar, 
  DollarSign, 
  Users, 
  Star, 
  Plus,
  Activity,
  TrendingUp,
  BookOpen,
  Clock
} from 'lucide-react'
import { BusinessProfile, Booking, Experience } from '@/types/business'
import { supabase } from '@/lib/supabase'

interface DashboardStats {
  totalBookings: number
  totalRevenue: number
  averageRating: number
  upcomingBookings: number
}

interface RecentActivity {
  id: string
  type: string
  description: string
  time: string
}

export default function BusinessHomePage() {
  const { user, userProfile } = useAuth()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<DashboardStats>({
    totalBookings: 0,
    totalRevenue: 0,
    averageRating: 0,
    upcomingBookings: 0
  })
  const [recentBookings, setRecentBookings] = useState<Booking[]>([])
  const [upcomingBookings, setUpcomingBookings] = useState<Booking[]>([])
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [experiences, setExperiences] = useState<Experience[]>([])

  useEffect(() => {
    if (user && userProfile) {
      fetchDashboardData()
    }
  }, [user, userProfile])

  async function fetchDashboardData() {
    if (!userProfile?.id) return

    try {
      setLoading(true)

      // Fetch bookings for statistics
      const { data: bookings, error: bookingsError } = await supabase
        .from('bookings')
        .select(`
          *,
          experiences (
            title,
            host_profiles (
              business_id
            )
          )
        `)
        .eq('experiences.host_profiles.business_id', userProfile.id)

      if (bookingsError) throw bookingsError

      // Calculate stats
      const now = new Date()
      const totalBookings = bookings?.length || 0
      const totalRevenue = bookings?.reduce((sum, booking) => sum + (booking.total_price || 0), 0) || 0
      const upcomingBookings = bookings?.filter(booking => 
        new Date(booking.booking_date) > now && booking.status !== 'cancelled'
      ).length || 0

      // Fetch experiences for average rating
      const { data: experiencesData, error: experiencesError } = await supabase
        .from('experiences')
        .select('*')
        .eq('business_id', userProfile.id)

      if (experiencesError) throw experiencesError

      const averageRating = experiencesData?.length > 0 
        ? experiencesData.reduce((sum, exp) => sum + (exp.average_rating || 0), 0) / experiencesData.length
        : 0

      setStats({
        totalBookings,
        totalRevenue,
        averageRating,
        upcomingBookings
      })

      // Set recent and upcoming bookings
      const recent = bookings?.filter(booking => 
        booking.status === 'completed'
      ).slice(0, 5) || []

      const upcoming = bookings?.filter(booking => 
        new Date(booking.booking_date) > now && booking.status !== 'cancelled'
      ).slice(0, 5) || []

      setRecentBookings(recent)
      setUpcomingBookings(upcoming)
      setExperiences(experiencesData || [])

      // Generate recent activity from bookings
      const activities: RecentActivity[] = bookings?.slice(0, 5).map(booking => ({
        id: booking.id,
        type: 'Booking',
        description: `New booking for ${booking.experiences?.title || 'Experience'}`,
        time: formatTimeAgo(booking.created_at)
      })) || []

      setRecentActivity(activities)

    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  function formatTimeAgo(dateString: string): string {
    const now = new Date()
    const date = new Date(dateString)
    const diffMs = now.getTime() - date.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffHours / 24)

    if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
    if (diffHours > 0) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
    return 'Just now'
  }

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-lg animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-64 bg-gray-200 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Welcome back, {userProfile?.business_name || userProfile?.name}</h1>
          <p className="text-gray-600">Here's what's happening with your business today.</p>
        </div>
        <Button asChild>
          <a href="/business/experiences/new">
            <Plus className="h-4 w-4 mr-2" />
            Add Experience
          </a>
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalBookings}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalRevenue}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageRating.toFixed(1)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Bookings</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.upcomingBookings}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="h-5 w-5 mr-2" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentActivity.length > 0 ? (
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{activity.type}</p>
                      <p className="text-sm text-gray-600">{activity.description}</p>
                      <p className="text-xs text-gray-500">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={<Activity className="h-12 w-12" />}
                title="No recent activity"
                description="When you start getting bookings, they'll appear here."
              />
            )}
          </CardContent>
        </Card>

        {/* Recent Bookings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BookOpen className="h-5 w-5 mr-2" />
              Recent Bookings
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentBookings.length > 0 ? (
              <div className="space-y-4">
                {recentBookings.map((booking) => (
                  <div key={booking.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{booking.experiences?.title}</p>
                      <p className="text-sm text-gray-600">
                        {new Date(booking.booking_date).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge variant="secondary">{booking.status}</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={<BookOpen className="h-12 w-12" />}
                title="No recent bookings"
                description="Your completed bookings will appear here."
              />
            )}
          </CardContent>
        </Card>

        {/* Upcoming Bookings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="h-5 w-5 mr-2" />
              Upcoming Bookings
            </CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingBookings.length > 0 ? (
              <div className="space-y-4">
                {upcomingBookings.map((booking) => (
                  <div key={booking.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{booking.experiences?.title}</p>
                      <p className="text-sm text-gray-600">
                        {new Date(booking.booking_date).toLocaleDateString()} at {booking.start_time}
                      </p>
                    </div>
                    <Badge>{booking.status}</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={<Calendar className="h-12 w-12" />}
                title="No upcoming bookings"
                description="Your future bookings will appear here."
                action={{
                  label: "Add Experience",
                  onClick: () => window.location.href = "/business/experiences/new"
                }}
              />
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Button asChild className="w-full justify-start">
                <a href="/business/experiences/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Experience
                </a>
              </Button>
              <Button variant="outline" asChild className="w-full justify-start">
                <a href="/business/bookings">
                  <BookOpen className="h-4 w-4 mr-2" />
                  View All Bookings
                </a>
              </Button>
              <Button variant="outline" asChild className="w-full justify-start">
                <a href="/business/settings">
                  <Users className="h-4 w-4 mr-2" />
                  Manage Settings
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}