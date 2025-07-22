"use client"

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { EmptyState } from '@/components/ui/empty-state'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Calendar, 
  Users, 
  Clock, 
  DollarSign,
  MapPin,
  Phone,
  Mail,
  Filter
} from 'lucide-react'
import { Booking } from '@/types/business'
import { supabase } from '@/lib/supabase'

interface BookingWithDetails extends Booking {
  experiences?: {
    title: string
    location: string
    duration: number
  }
  users?: {
    first_name: string
    last_name: string
    email: string
    phone: string
  }
}

export default function BusinessBookingsPage() {
  const { user, userProfile } = useAuth()
  const [loading, setLoading] = useState(true)
  const [bookings, setBookings] = useState<BookingWithDetails[]>([])
  const [activeTab, setActiveTab] = useState('all')

  useEffect(() => {
    if (user && userProfile) {
      fetchBookings()
    }
  }, [user, userProfile])

  async function fetchBookings() {
    if (!userProfile?.id) return

    try {
      setLoading(true)

      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          experiences (
            title,
            location,
            duration,
            host_profiles!inner (
              business_id
            )
          ),
          users (
            first_name,
            last_name,
            email,
            phone
          )
        `)
        .eq('experiences.host_profiles.business_id', userProfile.id)
        .order('booking_date', { ascending: false })

      if (error) throw error
      setBookings(data || [])
    } catch (error) {
      console.error('Error fetching bookings:', error)
    } finally {
      setLoading(false)
    }
  }

  async function updateBookingStatus(bookingId: string, status: string) {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status })
        .eq('id', bookingId)

      if (error) throw error

      setBookings(bookings.map(booking => 
        booking.id === bookingId 
          ? { ...booking, status: status as any }
          : booking
      ))
    } catch (error) {
      console.error('Error updating booking status:', error)
    }
  }

  function getStatusColor(status: string) {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      case 'completed': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  function formatDuration(minutes: number): string {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60

    if (hours > 0 && mins > 0) {
      return `${hours}h ${mins}m`
    } else if (hours > 0) {
      return `${hours}h`
    } else {
      return `${mins}m`
    }
  }

  function getFilteredBookings() {
    const now = new Date()

    switch (activeTab) {
      case 'upcoming':
        return bookings.filter(booking => 
          new Date(booking.booking_date) > now && booking.status !== 'cancelled'
        )
      case 'pending':
        return bookings.filter(booking => booking.status === 'pending')
      case 'completed':
        return bookings.filter(booking => booking.status === 'completed')
      default:
        return bookings
    }
  }

  const filteredBookings = getFilteredBookings()

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <h1 className="text-3xl font-bold">Bookings</h1>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  const BookingCard = ({ booking }: { booking: BookingWithDetails }) => (
    <Card className="mb-4">
      <CardContent className="p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex-1 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold">{booking.experiences?.title}</h3>
                <div className="flex items-center text-gray-600 text-sm mt-1">
                  <MapPin className="h-4 w-4 mr-1" />
                  {booking.experiences?.location}
                </div>
              </div>
              <Badge className={getStatusColor(booking.status)}>
                {booking.status}
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <div className="flex items-center text-gray-600">
                  <Calendar className="h-4 w-4 mr-2" />
                  {new Date(booking.booking_date).toLocaleDateString()}
                </div>
                <div className="flex items-center text-gray-600">
                  <Clock className="h-4 w-4 mr-2" />
                  {booking.start_time} - {booking.end_time}
                </div>
                {booking.experiences?.duration && (
                  <div className="flex items-center text-gray-600">
                    <Clock className="h-4 w-4 mr-2" />
                    Duration: {formatDuration(booking.experiences.duration)}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center text-gray-600">
                  <Users className="h-4 w-4 mr-2" />
                  {booking.num_guests} guest{booking.num_guests !== 1 ? 's' : ''}
                </div>
                <div className="flex items-center text-gray-600">
                  <DollarSign className="h-4 w-4 mr-2" />
                  ${booking.total_price}
                </div>
                {booking.users && (
                  <div className="space-y-1">
                    <div className="flex items-center text-gray-600">
                      <Mail className="h-4 w-4 mr-2" />
                      {booking.users.email}
                    </div>
                    {booking.users.phone && (
                      <div className="flex items-center text-gray-600">
                        <Phone className="h-4 w-4 mr-2" />
                        {booking.users.phone}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {booking.notes && (
              <div className="bg-gray-50 p-3 rounded text-sm">
                <strong>Notes:</strong> {booking.notes}
              </div>
            )}
          </div>

          {booking.status === 'pending' && (
            <div className="flex space-x-2 lg:ml-4">
              <Button 
                size="sm" 
                onClick={() => updateBookingStatus(booking.id, 'confirmed')}
              >
                Confirm
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => updateBookingStatus(booking.id, 'cancelled')}
              >
                Cancel
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Bookings</h1>
          <p className="text-gray-600">Manage your customer bookings</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All Bookings</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {filteredBookings.length > 0 ? (
            <div>
              {filteredBookings.map((booking) => (
                <BookingCard key={booking.id} booking={booking} />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<Calendar className="h-16 w-16" />}
              title={
                activeTab === 'all' ? 'No bookings yet' :
                activeTab === 'upcoming' ? 'No upcoming bookings' :
                activeTab === 'pending' ? 'No pending bookings' :
                'No completed bookings'
              }
              description={
                activeTab === 'all' 
                  ? "When customers book your experiences, they'll appear here."
                  : `No ${activeTab} bookings at the moment.`
              }
              action={
                activeTab === 'all' ? {
                  label: "Add Experience",
                  onClick: () => window.location.href = "/business/experiences/new"
                } : undefined
              }
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}