"use client"

import { useState, useEffect } from 'react'
import { BusinessProtectedRoute } from "@/components/auth/BusinessProtectedRoute"
import { BusinessLayoutWrapper } from "@/components/layouts/BusinessLayoutWrapper"
import { useAuth } from "@/lib/auth-context"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { 
  Calendar,
  Clock,
  Users,
  MapPin,
  Euro,
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Mail,
  Phone,
  CheckCircle,
  XCircle
} from 'lucide-react'

interface Booking {
  id: string
  customer_name: string
  customer_email: string
  experience_title: string
  booking_date: string
  guests: number
  total_amount: number
  status: string
  created_at: string
  experience_location?: string
}

export default function BusinessBookingsPage() {
  const { user, userType, loading: authLoading } = useAuth()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    const fetchBookings = async () => {
      if (!user || userType !== "business") return

      try {
        setLoading(true)
        const supabase = createClient()

        const { data, error: fetchError } = await supabase
          .from("bookings")
          .select(`
            *,
            experiences!bookings_experience_id_fkey(title, location),
            customer_profiles!bookings_customer_id_fkey(first_name, last_name, email)
          `)
          .eq("host_id", user.id)
          .order("created_at", { ascending: false })

        if (fetchError) {
          console.error("Error fetching bookings:", fetchError)
          // For now, let's show empty state instead of throwing
          setBookings([])
        } else {
          // Transform the data to match our interface
          const transformedBookings = data?.map((booking: any) => ({
            id: booking.id,
            customer_name: booking.customer_profiles 
              ? `${booking.customer_profiles.first_name} ${booking.customer_profiles.last_name}`.trim()
              : 'Unknown Customer',
            customer_email: booking.customer_profiles?.email || 'No email',
            experience_title: booking.experiences?.title || 'Unknown Experience',
            experience_location: booking.experiences?.location || '',
            booking_date: booking.booking_date,
            guests: booking.guests || 1,
            total_amount: booking.total_amount || 0,
            status: booking.status || 'pending',
            created_at: booking.created_at
          })) || []

          setBookings(transformedBookings)
        }
      } catch (err) {
        console.error("Error fetching bookings:", err)
        setError("Failed to load bookings")
      } finally {
        setLoading(false)
      }
    }

    if (!authLoading) {
      fetchBookings()
    }
  }, [user, userType, authLoading])

  const filteredBookings = bookings.filter(booking =>
    booking.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    booking.experience_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    booking.customer_email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed': return 'default'
      case 'pending': return 'secondary'
      case 'cancelled': return 'destructive'
      case 'completed': return 'outline'
      default: return 'secondary'
    }
  }

  const updateBookingStatus = async (bookingId: string, newStatus: string) => {
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from("bookings")
        .update({ status: newStatus })
        .eq("id", bookingId)

      if (error) throw error

      setBookings(prev =>
        prev.map(booking =>
          booking.id === bookingId ? { ...booking, status: newStatus } : booking
        )
      )
    } catch (err) {
      console.error("Error updating booking status:", err)
    }
  }

  if (authLoading || loading) {
    return (
      <BusinessProtectedRoute>
        <BusinessLayoutWrapper title="Bookings">
          <div className="px-4 sm:px-6 lg:px-8">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-64" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex items-center space-x-4">
                      <Skeleton className="h-12 w-12 rounded-full" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-[200px]" />
                        <Skeleton className="h-4 w-[150px]" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </BusinessLayoutWrapper>
      </BusinessProtectedRoute>
    )
  }

  return (
    <BusinessProtectedRoute>
      <BusinessLayoutWrapper title="Bookings Management">
        <div className="px-4 sm:px-6 lg:px-8 space-y-6">
          {/* Header */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Bookings</h1>
              <p className="text-muted-foreground">
                Manage all your customer bookings and reservations.
              </p>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search bookings..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              Filters
            </Button>
          </div>

          {/* Bookings Table */}
          <Card>
            <CardHeader>
              <CardTitle>All Bookings</CardTitle>
              <CardDescription>
                A list of all bookings for your experiences.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredBookings.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Bookings Yet</h3>
                  <p className="text-muted-foreground">
                    {bookings.length === 0 
                      ? "When customers book your experiences, they'll appear here."
                      : "No bookings match your search criteria."
                    }
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Customer</TableHead>
                      <TableHead>Experience</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Guests</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-[70px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredBookings.map((booking) => (
                      <TableRow key={booking.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{booking.customer_name}</div>
                            <div className="text-sm text-muted-foreground">{booking.customer_email}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{booking.experience_title}</div>
                            {booking.experience_location && (
                              <div className="text-sm text-muted-foreground flex items-center">
                                <MapPin className="mr-1 h-3 w-3" />
                                {booking.experience_location}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                            {new Date(booking.booking_date).toLocaleDateString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Users className="mr-2 h-4 w-4 text-muted-foreground" />
                            {booking.guests}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center font-medium">
                            <Euro className="mr-1 h-4 w-4 text-muted-foreground" />
                            {booking.total_amount}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusColor(booking.status)}>
                            {booking.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Mail className="mr-2 h-4 w-4" />
                                Email Customer
                              </DropdownMenuItem>
                              {booking.status === 'pending' && (
                                <>
                                  <DropdownMenuItem 
                                    onClick={() => updateBookingStatus(booking.id, 'confirmed')}
                                  >
                                    <CheckCircle className="mr-2 h-4 w-4" />
                                    Confirm Booking
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    onClick={() => updateBookingStatus(booking.id, 'cancelled')}
                                  >
                                    <XCircle className="mr-2 h-4 w-4" />
                                    Cancel Booking
                                  </DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </BusinessLayoutWrapper>
    </BusinessProtectedRoute>
  )
}