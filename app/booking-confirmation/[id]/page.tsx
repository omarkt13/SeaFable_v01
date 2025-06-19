"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { CheckCircle, Calendar, Users, MapPin, Clock, DollarSign, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { supabase } from "@/lib/supabase" // Client-side Supabase instance
import type { Booking } from "@/lib/database"

export default function BookingConfirmationPage() {
  const params = useParams()
  const router = useRouter()
  const bookingId = params.id as string
  const [booking, setBooking] = useState<Booking | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchBookingDetails = async () => {
      if (!bookingId) {
        setError("Booking ID is missing.")
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      setError(null)
      try {
        const { data, error: fetchError } = await supabase
          .from("bookings")
          .select(
            `
            *,
            experiences!bookings_experience_id_fkey (
              title,
              location,
              primary_image_url,
              duration_display,
              activity_type
            ),
            host_profiles!bookings_host_id_fkey (
              name,
              avatar_url
            )
          `,
          )
          .eq("id", bookingId)
          .single()

        if (fetchError) {
          throw fetchError
        }

        if (data) {
          setBooking(data)
        } else {
          setError("Booking not found.")
        }
      } catch (err: any) {
        console.error("Error fetching booking details:", err)
        setError(err.message || "Failed to load booking details.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchBookingDetails()
  }, [bookingId])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="ml-4 text-gray-600">Loading booking details...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="text-center p-8">
          <CardContent>
            <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <Button asChild>
              <Link href="/dashboard">Go to Dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!booking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="text-center p-8">
          <CardContent>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Booking Not Found</h2>
            <p className="text-gray-600 mb-6">The booking you're looking for doesn't exist.</p>
            <Button asChild>
              <Link href="/dashboard">Go to Dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <Button variant="ghost" size="sm" onClick={() => router.back()} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <Card className="shadow-lg">
          <CardHeader className="text-center bg-green-500 text-white rounded-t-lg py-6">
            <CheckCircle className="h-16 w-16 mx-auto mb-4" />
            <CardTitle className="text-3xl font-bold">Booking Confirmed!</CardTitle>
            <CardDescription className="text-green-100 mt-2">
              Your adventure is booked. We've sent a confirmation email to your inbox.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Booking Details</h3>
                <div className="space-y-2 text-gray-700">
                  <p className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-blue-500" />
                    Date: {new Date(booking.booking_date).toLocaleDateString()}
                  </p>
                  <p className="flex items-center">
                    <Clock className="h-4 w-4 mr-2 text-blue-500" />
                    Time: {booking.departure_time || "Flexible"}
                  </p>
                  <p className="flex items-center">
                    <Users className="h-4 w-4 mr-2 text-blue-500" />
                    Guests: {booking.number_of_guests}
                  </p>
                  <p className="flex items-center">
                    <DollarSign className="h-4 w-4 mr-2 text-blue-500" />
                    Total Price: €{booking.total_price}
                  </p>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Experience Details</h3>
                <div className="space-y-2 text-gray-700">
                  <p className="font-medium">{booking.experiences?.title}</p>
                  <p className="flex items-center">
                    <MapPin className="h-4 w-4 mr-2 text-blue-500" />
                    Location: {booking.experiences?.location}
                  </p>
                  <p className="flex items-center">
                    <Clock className="h-4 w-4 mr-2 text-blue-500" />
                    Duration: {booking.experiences?.duration_display}
                  </p>
                  <p className="flex items-center">
                    <Users className="h-4 w-4 mr-2 text-blue-500" />
                    Activity Type: {booking.experiences?.activity_type.replace("_", " ")}
                  </p>
                </div>
              </div>
            </div>

            {booking.special_requests && (
              <>
                <Separator />
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Special Requests</h3>
                  <p className="text-gray-700">{booking.special_requests}</p>
                </div>
              </>
            )}

            {booking.dietary_requirements && booking.dietary_requirements.length > 0 && (
              <>
                <Separator />
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Dietary Requirements</h3>
                  <ul className="list-disc list-inside text-gray-700">
                    {booking.dietary_requirements.map((req, index) => (
                      <li key={index}>{req}</li>
                    ))}
                  </ul>
                </div>
              </>
            )}

            <Separator />

            <div className="text-center space-y-4">
              <Button asChild size="lg" className="w-full md:w-auto">
                <Link href="/dashboard">Go to My Dashboard</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="w-full md:w-auto">
                <Link href={`/experience/${booking.experience_id}`}>View Experience Details</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
