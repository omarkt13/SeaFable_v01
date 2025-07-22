"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/useAuth"
import { BusinessLayout } from "@/components/layouts/BusinessLayout"
import { getHostBookings } from "@/lib/database"
import type { Booking } from "@/lib/database"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Search,
  Calendar,
  Users,
  MapPin,
  Clock,
  Phone,
  Mail,
  MessageSquare,
  Filter,
  Download,
} from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"

export default function BusinessBookings() {
  const { user, userType, loading: authLoading } = useAuth()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sortBy, setSortBy] = useState("newest")

  useEffect(() => {
    const fetchBookings = async () => {
      if (!user || userType !== "business") return

      try {
        setLoading(true)
        const result = await getHostBookings(user.id)
        setBookings(result)
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

  // Filter and sort bookings
  const filteredBookings = bookings
    .filter((booking) => {
      const matchesSearch = booking.users?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          booking.users?.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          booking.experiences?.title?.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = statusFilter === "all" || booking.booking_status === statusFilter
      return matchesSearch && matchesStatus
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.booking_date).getTime() - new Date(a.booking_date).getTime()
        case "oldest":
          return new Date(a.booking_date).getTime() - new Date(b.booking_date).getTime()
        case "price-high":
          return b.total_price - a.total_price
        case "price-low":
          return a.total_price - b.total_price
        default:
          return 0
      }
    })

  const upcomingBookings = filteredBookings.filter(booking => 
    new Date(booking.booking_date) >= new Date() && 
    (booking.booking_status === "confirmed" || booking.booking_status === "pending")
  )

  const pastBookings = filteredBookings.filter(booking => 
    new Date(booking.booking_date) < new Date() || 
    booking.booking_status === "completed" || 
    booking.booking_status === "cancelled"
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "default"
      case "pending":
        return "secondary"
      case "completed":
        return "outline"
      case "cancelled":
        return "destructive"
      default:
        return "secondary"
    }
  }

  const BookingCard = ({ booking }: { booking: Booking }) => (
    <Card className="mb-4">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">
              {booking.users?.first_name} {booking.users?.last_name}
            </CardTitle>
            <CardDescription className="flex items-center mt-1">
              <Calendar className="mr-1 h-3 w-3" />
              {new Date(booking.booking_date).toLocaleDateString()}
              {booking.departure_time && (
                <>
                  <Clock className="ml-2 mr-1 h-3 w-3" />
                  {booking.departure_time}
                </>
              )}
            </CardDescription>
          </div>
          <Badge variant={getStatusColor(booking.booking_status)}>
            {booking.booking_status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Experience Info */}
        <div className="flex items-start space-x-3">
          <img
            src={booking.experiences?.primary_image_url || "/placeholder.svg?height=60&width=80"}
            alt={booking.experiences?.title || "Experience"}
            className="w-20 h-15 object-cover rounded"
          />
          <div className="flex-1">
            <h4 className="font-medium">{booking.experiences?.title}</h4>
            <div className="flex items-center text-sm text-muted-foreground mt-1">
              <MapPin className="mr-1 h-3 w-3" />
              <span>{booking.experiences?.location}</span>
            </div>
            <div className="flex items-center text-sm text-muted-foreground mt-1">
              <Users className="mr-1 h-3 w-3" />
              <span>{booking.number_of_guests} guest{booking.number_of_guests !== 1 ? 's' : ''}</span>
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center">
            <Mail className="mr-1 h-3 w-3 text-muted-foreground" />
            <span>{booking.users?.email}</span>
          </div>
        </div>

        {/* Special Requests */}
        {booking.special_requests && (
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="flex items-start">
              <MessageSquare className="mr-2 h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium">Special Requests:</p>
                <p className="text-sm text-muted-foreground">{booking.special_requests}</p>
              </div>
            </div>
          </div>
        )}

        {/* Price */}
        <div className="flex items-center justify-between pt-2 border-t">
          <span className="text-sm text-muted-foreground">Total Amount</span>
          <span className="text-lg font-semibold">€{booking.total_price}</span>
        </div>
      </CardContent>
    </Card>
  )

  if (authLoading || loading) {
    return (
      <BusinessLayout>
        <div className="p-6 space-y-6">
          <Skeleton className="h-8 w-[200px]" />
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <div className="flex justify-between">
                    <Skeleton className="h-6 w-[150px]" />
                    <Skeleton className="h-5 w-[80px]" />
                  </div>
                  <Skeleton className="h-4 w-[200px]" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-20 w-full" />
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
              <CardTitle className="text-red-800">Error Loading Bookings</CardTitle>
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

  return (
    <BusinessLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Bookings</h1>
            <p className="text-muted-foreground">
              Manage your customer bookings and schedules
            </p>
          </div>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:space-x-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search bookings..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-[150px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full md:w-[150px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="oldest">Oldest</SelectItem>
              <SelectItem value="price-high">Price High</SelectItem>
              <SelectItem value="price-low">Price Low</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Bookings Tabs */}
        <Tabs defaultValue="upcoming" className="space-y-4">
          <TabsList>
            <TabsTrigger value="upcoming">Upcoming ({upcomingBookings.length})</TabsTrigger>
            <TabsTrigger value="past">Past ({pastBookings.length})</TabsTrigger>
            <TabsTrigger value="all">All ({filteredBookings.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="space-y-4">
            {upcomingBookings.length > 0 ? (
              upcomingBookings.map((booking) => (
                <BookingCard key={booking.id} booking={booking} />
              ))
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No upcoming bookings</h3>
                  <p className="text-muted-foreground text-center">
                    You don't have any upcoming bookings at the moment.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="past" className="space-y-4">
            {pastBookings.length > 0 ? (
              pastBookings.map((booking) => (
                <BookingCard key={booking.id} booking={booking} />
              ))
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No past bookings</h3>
                  <p className="text-muted-foreground text-center">
                    You don't have any past bookings to show.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="all" className="space-y-4">
            {filteredBookings.length > 0 ? (
              filteredBookings.map((booking) => (
                <BookingCard key={booking.id} booking={booking} />
              ))
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No bookings found</h3>
                  <p className="text-muted-foreground text-center">
                    {searchTerm || statusFilter !== "all" 
                      ? "Try adjusting your search or filters"
                      : "You don't have any bookings yet."
                    }
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </BusinessLayout>
  )
}