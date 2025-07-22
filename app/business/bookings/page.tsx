
"use client"

import React, { useState, useEffect } from 'react'
import { BusinessProtectedRoute } from "@/components/auth/BusinessProtectedRoute"
import { BusinessLayout } from "@/components/layouts/BusinessLayout"
import { useAuth } from "@/lib/auth-context"
import { createClient } from "@/lib/supabase/client"
import { 
  Calendar, 
  Clock, 
  Users, 
  MapPin, 
  Phone, 
  Mail, 
  MessageCircle,
  CheckCircle,
  XCircle,
  Filter,
  Search,
  MoreVertical,
  Eye,
  Edit,
  Download
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useResponsive, getResponsiveClasses } from '@/hooks/use-responsive'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

// Types
interface Booking {
  id: string
  customer_name: string
  customer_email: string
  customer_phone: string
  experience_title: string
  experience_location: string
  booking_date: string
  start_time: string
  duration: number
  group_size: number
  total_price: number
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
  special_requests: string
  created_at: string
}

export default function BookingsPage() {
  const { user, businessProfile } = useAuth()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [selectedDate, setSelectedDate] = useState<string>('all')
  const [loading, setLoading] = useState(true)

  const supabase = createClient()
  const { isMobile, isTablet, screenSize } = useResponsive()
  const classes = getResponsiveClasses(screenSize)

  useEffect(() => {
    if (user && businessProfile) {
      fetchBookings()
    }
  }, [user, businessProfile])

  const fetchBookings = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          customer_profiles (
            first_name,
            last_name,
            email,
            phone_number
          ),
          experiences (
            title,
            location
          )
        `)
        .eq('host_id', user.id)
        .order('start_date', { ascending: false })

      if (error) throw error

      const bookingsData = data?.map(booking => ({
        id: booking.id,
        customer_name: booking.customer_profiles 
          ? `${booking.customer_profiles.first_name || ''} ${booking.customer_profiles.last_name || ''}`.trim()
          : 'Unknown Customer',
        customer_email: booking.customer_profiles?.email || 'No email',
        customer_phone: booking.customer_profiles?.phone_number || 'No phone',
        experience_title: booking.experiences?.title || 'Unknown Experience',
        experience_location: booking.experiences?.location || 'Unknown Location',
        booking_date: booking.start_date,
        start_time: new Date(booking.start_date).toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        duration: 4,
        group_size: booking.group_size || 1,
        total_price: booking.total_price || 0,
        status: booking.status as Booking['status'],
        special_requests: booking.special_requests || '',
        created_at: booking.created_at
      })) || []

      setBookings(bookingsData)
    } catch (error) {
      console.error('Error fetching bookings:', error)
    } finally {
      setLoading(false)
    }
  }

  // Filter and search functionality
  useEffect(() => {
    let filtered = bookings

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(booking =>
        booking.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        booking.experience_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        booking.experience_location.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Status filter
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(booking => booking.status === selectedStatus)
    }

    // Date filter
    if (selectedDate !== 'all') {
      const today = new Date()
      const filterDate = new Date()
      
      switch (selectedDate) {
        case 'today':
          filtered = filtered.filter(booking => 
            new Date(booking.booking_date).toDateString() === today.toDateString()
          )
          break
        case 'week':
          filterDate.setDate(today.getDate() + 7)
          filtered = filtered.filter(booking => 
            new Date(booking.booking_date) >= today && new Date(booking.booking_date) <= filterDate
          )
          break
        case 'month':
          filterDate.setDate(today.getDate() + 30)
          filtered = filtered.filter(booking => 
            new Date(booking.booking_date) >= today && new Date(booking.booking_date) <= filterDate
          )
          break
      }
    }

    setFilteredBookings(filtered)
  }, [bookings, searchQuery, selectedStatus, selectedDate])

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

  const getStatusBadge = (status: Booking['status']) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      confirmed: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      completed: { color: 'bg-blue-100 text-blue-800', icon: CheckCircle },
      cancelled: { color: 'bg-red-100 text-red-800', icon: XCircle }
    }

    const config = statusConfig[status]
    const Icon = config.icon

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="w-3 h-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    )
  }

  if (loading) {
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
        <div className={classes.spacing}>
          {/* Header */}
          <div className={`flex ${isMobile ? 'flex-col gap-4' : 'flex-row items-center justify-between gap-4'}`}>
            <div>
              <h1 className={`${classes.heading} font-bold text-gray-900`}>Bookings</h1>
              <p className={`${classes.text} text-gray-600 mt-1`}>Manage your customer bookings and reservations</p>
            </div>
            <div className={`flex gap-2 ${isMobile ? 'flex-col' : 'flex-row'}`}>
              <Button 
                variant="outline"
                className={`flex items-center gap-2 ${classes.button}`}
              >
                <Download className="w-4 h-4" />
                Export
              </Button>
              <Button 
                className={`flex items-center gap-2 bg-blue-600 text-white hover:bg-blue-700 ${classes.button}`}
              >
                <Calendar className="w-4 h-4" />
                Calendar View
              </Button>
            </div>
          </div>

          {/* Summary Cards */}
          <div className={`grid ${isMobile ? 'grid-cols-2' : isTablet ? 'grid-cols-2' : 'grid-cols-4'} gap-4 md:gap-6`}>
            <Card>
              <CardContent className={classes.card}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`${classes.text} text-gray-600`}>Total Bookings</p>
                    <p className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold text-gray-900`}>{bookings.length}</p>
                  </div>
                  <Calendar className={`${classes.iconSize} text-blue-600`} />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className={classes.card}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`${classes.text} text-gray-600`}>Confirmed</p>
                    <p className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold text-green-600`}>
                      {bookings.filter(b => b.status === 'confirmed').length}
                    </p>
                  </div>
                  <CheckCircle className={`${classes.iconSize} text-green-600`} />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className={classes.card}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`${classes.text} text-gray-600`}>Pending</p>
                    <p className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold text-yellow-600`}>
                      {bookings.filter(b => b.status === 'pending').length}
                    </p>
                  </div>
                  <Clock className={`${classes.iconSize} text-yellow-600`} />
                </div>
              </CardContent>
            </Card>
            <Card className={`${isMobile ? 'col-span-2' : ''}`}>
              <CardContent className={classes.card}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`${classes.text} text-gray-600`}>Total Revenue</p>
                    <p className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold text-blue-600`}>
                      {formatCurrency(bookings.reduce((sum, b) => sum + b.total_price, 0))}
                    </p>
                  </div>
                  <Users className={`${classes.iconSize} text-blue-600`} />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <div className={`bg-white rounded-lg border border-gray-200 ${classes.card}`}>
            <div className={`flex ${isMobile ? 'flex-col gap-4' : 'flex-row gap-4 items-center justify-between'}`}>
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 md:w-5 md:h-5" />
                <input
                  type="text"
                  placeholder="Search bookings..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`pl-8 md:pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${classes.text}`}
                />
              </div>

              {/* Filters */}
              <div className={`flex ${isMobile ? 'flex-col gap-3' : 'flex-row gap-4'} items-stretch md:items-center`}>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className={`border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${classes.text}`}
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>

                <select
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className={`border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${classes.text}`}
                >
                  <option value="all">All Dates</option>
                  <option value="today">Today</option>
                  <option value="week">Next 7 Days</option>
                  <option value="month">Next 30 Days</option>
                </select>
              </div>
            </div>
          </div>

          {/* Bookings List */}
          <div className="space-y-4">
            {filteredBookings.length > 0 ? (
              filteredBookings.map((booking) => (
                <Card key={booking.id} className="hover:shadow-md transition-shadow">
                  <CardContent className={classes.card}>
                    <div className={`flex ${isMobile ? 'flex-col gap-4' : 'flex-row items-center justify-between gap-4'}`}>
                      {/* Main Info */}
                      <div className="flex-1 min-w-0">
                        <div className={`flex ${isMobile ? 'flex-col gap-2' : 'items-center gap-4'} mb-3`}>
                          <h3 className={`${classes.text} font-semibold text-gray-900 truncate`}>
                            {booking.customer_name}
                          </h3>
                          {getStatusBadge(booking.status)}
                        </div>
                        
                        <div className={`${classes.text} text-gray-600 mb-2 font-medium truncate`}>
                          {booking.experience_title}
                        </div>
                        
                        <div className={`grid ${isMobile ? 'grid-cols-1 gap-2' : 'grid-cols-2 lg:grid-cols-4 gap-4'} text-sm text-gray-500`}>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 flex-shrink-0" />
                            <span>{formatDate(booking.booking_date)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 flex-shrink-0" />
                            <span>{booking.start_time}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 flex-shrink-0" />
                            <span>{booking.group_size} guests</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 flex-shrink-0" />
                            <span className="truncate">{booking.experience_location}</span>
                          </div>
                        </div>

                        {booking.special_requests && (
                          <div className={`mt-2 ${classes.text} text-gray-600`}>
                            <strong>Special requests:</strong> {booking.special_requests}
                          </div>
                        )}
                      </div>

                      {/* Price and Actions */}
                      <div className={`${isMobile ? 'w-full' : ''} flex ${isMobile ? 'flex-row' : 'flex-col'} items-center gap-4`}>
                        <div className={`text-right ${isMobile ? 'flex-1' : ''}`}>
                          <div className={`${isMobile ? 'text-lg' : 'text-xl'} font-bold text-gray-900`}>
                            {formatCurrency(booking.total_price)}
                          </div>
                          <div className={`${classes.text} text-gray-500`}>Total</div>
                        </div>

                        <div className={`flex gap-2 ${isMobile ? 'flex-row' : 'flex-col'}`}>
                          <Button
                            size={isMobile ? "sm" : "default"}
                            variant="outline"
                            className={`flex items-center gap-2 ${isMobile ? 'flex-1' : ''}`}
                          >
                            <MessageCircle className="w-4 h-4" />
                            {!isMobile && 'Contact'}
                          </Button>
                          
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button 
                                size={isMobile ? "sm" : "default"}
                                variant="outline"
                                className={`${isMobile ? 'px-3' : ''}`}
                              >
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Eye className="w-4 h-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Edit className="w-4 h-4 mr-2" />
                                Edit Booking
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem>
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Confirm
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-red-600">
                                <XCircle className="w-4 h-4 mr-2" />
                                Cancel
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className={`${classes.card} text-center py-12`}>
                  <Calendar className={`${classes.iconSize} text-gray-400 mx-auto mb-4`} />
                  <h3 className={`${classes.subheading} font-medium text-gray-900 mb-2`}>No bookings found</h3>
                  <p className={`text-gray-500 ${classes.text}`}>
                    {searchQuery || selectedStatus !== 'all' || selectedDate !== 'all'
                      ? 'Try adjusting your filters to see more bookings.'
                      : 'Your bookings will appear here when customers make reservations.'
                    }
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </BusinessLayout>
    </BusinessProtectedRoute>
  )
}
