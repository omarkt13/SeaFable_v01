"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { getBusinessBookings, getBusinessExperiences, getBusinessStats } from "@/lib/database"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Loader2, DollarSign, Calendar, Users, Package } from "lucide-react"
import BusinessLayout from "@/components/layouts/BusinessLayout"
import { useRouter } from "next/navigation"
import type { Booking, Experience } from "@/types/business"

export default function BusinessHomePage() {
  const { user, businessProfile, isLoading: authLoading, userType } = useAuth()
  const router = useRouter()

  const [bookings, setBookings] = useState<Booking[]>([])
  const [experiences, setExperiences] = useState<Experience[]>([])
  const [stats, setStats] = useState<any>(null)
  const [dataLoading, setDataLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!authLoading && user && userType === "business") {
      if (!businessProfile?.onboarding_completed) {
        router.push("/business/onboarding")
        return
      }
      fetchBusinessData()
    } else if (!authLoading && !user) {
      router.push("/business/login")
    } else if (!authLoading && userType && userType !== "business") {
      setError("Access Denied: You are not authorized to view this page.")
      setDataLoading(false)
    }
  }, [user, authLoading, businessProfile, userType, router])

  const fetchBusinessData = async () => {
    if (!user?.id) {
      setError("User ID not available.")
      setDataLoading(false)
      return
    }

    setDataLoading(true)
    setError(null)

    try {
      const [
        { data: bookingsData, error: bookingsError },
        { data: experiencesData, error: experiencesError },
        { data: statsData, error: statsError },
      ] = await Promise.all([getBusinessBookings(user.id), getBusinessExperiences(user.id), getBusinessStats(user.id)])

      if (bookingsError) throw new Error(bookingsError)
      if (experiencesError) throw new Error(experiencesError)
      if (statsError) throw new Error(statsError)

      setBookings(bookingsData || [])
      setExperiences(experiencesData || [])
      setStats(statsData)
    } catch (err: any) {
      console.error("Failed to fetch business data:", err)
      setError(err.message || "Failed to load business data.")
    } finally {
      setDataLoading(false)
    }
  }

  if (authLoading || dataLoading) {
    return (
      <BusinessLayout>
        <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
          <Loader2 className="h-8 w-8 animate-spin text-teal-500" />
          <p className="ml-2 text-gray-600">Loading dashboard...</p>
        </div>
      </BusinessLayout>
    )
  }

  if (error) {
    return (
      <BusinessLayout>
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] text-red-500">
          <p className="text-lg font-semibold">{error}</p>
          <Button onClick={fetchBusinessData} className="mt-4">
            Try Again
          </Button>
        </div>
      </BusinessLayout>
    )
  }

  return (
    <BusinessLayout>
      <div className="flex flex-col gap-6 p-6 md:p-8">
        <h1 className="text-3xl font-bold">Business Dashboard</h1>

        {/* Quick Stats Overview */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats?.totalRevenue?.toFixed(2) || "0.00"}</div>
              <p className="text-xs text-gray-500">from all bookings</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
              <Calendar className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalBookings || 0}</div>
              <p className="text-xs text-gray-500">across all experiences</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
              <Users className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalClients || 0}</div>
              <p className="text-xs text-gray-500">unique customers</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Experiences</CardTitle>
              <Package className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalExperiences || 0}</div>
              <p className="text-xs text-gray-500">active experiences</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Bookings */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            {bookings.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Experience</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bookings.map((booking) => (
                    <TableRow key={booking.id}>
                      <TableCell className="font-medium">{booking.experience_name}</TableCell>
                      <TableCell>{booking.customer_name}</TableCell>
                      <TableCell>{new Date(booking.booking_date).toLocaleDateString()}</TableCell>
                      <TableCell>{booking.status}</TableCell>
                      <TableCell className="text-right">${booking.experience_price?.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-gray-500">No recent bookings found.</p>
            )}
          </CardContent>
        </Card>

        {/* Your Experiences */}
        <Card>
          <CardHeader>
            <CardTitle>Your Experiences</CardTitle>
          </CardHeader>
          <CardContent>
            {experiences.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {experiences.map((experience) => (
                    <TableRow key={experience.id}>
                      <TableCell className="font-medium">{experience.name}</TableCell>
                      <TableCell>${experience.price?.toFixed(2)}</TableCell>
                      <TableCell>{experience.duration_minutes} mins</TableCell>
                      <TableCell>{experience.status}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-gray-500">
                No experiences found.{" "}
                <Button variant="link" className="p-0 h-auto" onClick={() => router.push("/business/experiences/new")}>
                  Create one?
                </Button>
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </BusinessLayout>
  )
}
