"use client"

import { useState, useEffect, useMemo } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeft,
  Star,
  MapPin,
  Clock,
  Users,
  Heart,
  Share2,
  MessageCircle,
  Shield,
  Award,
  Zap,
  Camera,
  ChevronLeft,
  ChevronRight,
  Anchor,
  AlertTriangle,
  Info,
  CheckCircle,
  CalendarDays,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/lib/auth-context"
import { getExperienceById, getExperienceReviews, type Experience, type Review } from "@/lib/database"
import { createBooking } from "@/app/actions/booking" // Import the new Server Action
import { supabase } from "@/lib/supabase" // Keep for auth.getUser()

export default function ExperienceDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const [experience, setExperience] = useState<Experience | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [showBookingForm, setShowBookingForm] = useState(false)
  const [bookingData, setBookingData] = useState({
    date: "",
    time: "", // New state for selected time
    guests: 1,
    specialRequests: "",
    dietaryRequirements: "",
  })
  const [isBooking, setIsBooking] = useState(false)
  const [bookingError, setBookingError] = useState<string | null>(null)

  useEffect(() => {
    if (params.id) {
      loadExperienceData(params.id as string)
    }
  }, [params.id])

  const loadExperienceData = async (experienceId: string) => {
    setIsLoading(true)
    try {
      // Load experience details
      const experienceResult = await getExperienceById(experienceId)
      if (experienceResult.success) {
        setExperience(experienceResult.data)
      }

      // Load reviews
      const reviewsResult = await getExperienceReviews(experienceId)
      if (reviewsResult.success) {
        setReviews(reviewsResult.data)
      }
    } catch (error) {
      console.error("Error loading experience:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleBooking = async () => {
    if (!user || !experience) {
      router.push("/login")
      return
    }

    if (!bookingData.date || !bookingData.time || bookingData.guests < 1) {
      setBookingError("Please select a date, time, and number of guests.")
      return
    }

    setIsBooking(true)
    setBookingError(null)

    try {
      // Get the current user's ID from Supabase auth
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser()

      if (!authUser) {
        router.push("/login")
        return
      }

      const bookingPayload = {
        user_id: authUser.id,
        experience_id: experience.id,
        host_id: experience.host_id,
        booking_date: bookingData.date,
        departure_time: bookingData.time, // Pass selected time
        number_of_guests: bookingData.guests,
        special_requests: bookingData.specialRequests,
        dietary_requirements: bookingData.dietaryRequirements ? [bookingData.dietaryRequirements] : [],
        total_price: experience.price_per_person * bookingData.guests,
      }

      const result = await createBooking(bookingPayload) // Call the Server Action
      if (result.success) {
        router.push(`/dashboard?booking=${result.data.id}`)
      } else {
        setBookingError(result.error || "Booking failed. Please try again.")
      }
    } catch (error) {
      console.error("Booking error:", error)
      setBookingError("Booking failed. Please try again.")
    } finally {
      setIsBooking(false)
    }
  }

  const toggleWishlist = () => {
    setIsWishlisted(!isWishlisted)
    // TODO: Implement wishlist API call
  }

  // Filter available slots based on selected date
  const availableTimeSlots = useMemo(() => {
    if (!experience?.host_availability || !bookingData.date) return []
    return experience.host_availability
      .filter(
        (slot) =>
          slot.date === bookingData.date &&
          slot.available_capacity >= bookingData.guests &&
          new Date(`${slot.date}T${slot.start_time}`) > new Date(), // Only future slots
      )
      .sort((a, b) => a.start_time.localeCompare(b.start_time))
  }, [experience?.host_availability, bookingData.date, bookingData.guests])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="h-96 bg-gray-200 rounded-lg mb-6"></div>
                <div className="space-y-4">
                  <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-20 bg-gray-200 rounded"></div>
                </div>
              </div>
              <div className="h-96 bg-gray-200 rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!experience) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="text-center p-8">
          <CardContent>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Experience Not Found</h2>
            <p className="text-gray-600 mb-6">The experience you're looking for doesn't exist or has been removed.</p>
            <Button asChild>
              <Link href="/search">Browse All Experiences</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const images = [
    experience.primary_image_url || "/placeholder.svg?height=400&width=600",
    ...(experience.experience_images?.map((img) => img.image_url) || []),
  ].filter(Boolean)

  const averageRating = experience.rating || 0
  const totalReviews = experience.total_reviews || 0
  const hostProfile = experience.host_profiles

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" onClick={() => router.back()}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <Link href="/" className="flex items-center space-x-2">
                <Anchor className="h-6 w-6 text-blue-600" />
                <span className="text-lg font-bold text-gray-900">SeaFable</span>
              </Link>
            </div>

            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" onClick={toggleWishlist}>
                <Heart className={`h-4 w-4 mr-2 ${isWishlisted ? "text-red-500 fill-current" : ""}`} />
                Save
              </Button>
              <Button variant="ghost" size="sm">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
              {user ? (
                <Link href="/dashboard">
                  <Button variant="outline">Dashboard</Button>
                </Link>
              ) : (
                <Link href="/login">
                  <Button variant="outline">Sign In</Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Image Gallery */}
            <div className="relative mb-8">
              <div className="aspect-video rounded-lg overflow-hidden bg-gray-100">
                <img
                  src={images[currentImageIndex] || "/placeholder.svg"}
                  alt={experience.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {images.length > 1 && (
                <>
                  <button
                    onClick={() => setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-2 shadow-lg"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-2 shadow-lg"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>

                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                    {images.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`w-2 h-2 rounded-full ${index === currentImageIndex ? "bg-white" : "bg-white/50"}`}
                      />
                    ))}
                  </div>
                </>
              )}

              <div className="absolute top-4 left-4 flex flex-col space-y-2">
                {hostProfile?.rating >= 4.8 && (
                  <Badge className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-yellow-900">
                    <Award className="h-3 w-3 mr-1" />
                    Superhost
                  </Badge>
                )}
                <Badge variant="default" className="bg-green-600">
                  <Zap className="h-3 w-3 mr-1" />
                  Instant Book
                </Badge>
              </div>

              <Button variant="outline" size="sm" className="absolute top-4 right-4 bg-white/90 hover:bg-white">
                <Camera className="h-4 w-4 mr-2" />
                View All Photos
              </Button>
            </div>

            {/* Experience Details */}
            <div className="space-y-6">
              {/* Title and Basic Info */}
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <Badge variant="outline">{experience.activity_type.replace("_", " ")}</Badge>
                  <Badge variant="secondary" className="capitalize">
                    {experience.difficulty_level}
                  </Badge>
                  {experience.total_bookings > 20 && <Badge className="bg-orange-100 text-orange-800">Popular</Badge>}
                </div>

                <h1 className="text-3xl font-bold text-gray-900 mb-4">{experience.title}</h1>

                <div className="flex items-center space-x-6 text-gray-600 mb-4">
                  <div className="flex items-center">
                    <Star className="h-5 w-5 text-yellow-400 fill-current mr-1" />
                    <span className="font-medium">{averageRating}</span>
                    <span className="ml-1">({totalReviews} reviews)</span>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="h-5 w-5 mr-1" />
                    {experience.location}
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-5 w-5 mr-1" />
                    {experience.duration_display}
                  </div>
                  <div className="flex items-center">
                    <Users className="h-5 w-5 mr-1" />
                    Up to {experience.max_guests} guests
                  </div>
                </div>
              </div>

              {/* Host Profile */}
              {hostProfile && (
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-16 w-16">
                        <AvatarImage src={hostProfile.avatar_url || "/placeholder.svg"} />
                        <AvatarFallback>{hostProfile.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold">{hostProfile.name}</h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <div className="flex items-center">
                            <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                            {hostProfile.rating} rating
                          </div>
                          <span>{hostProfile.years_experience} years experience</span>
                          <span className="capitalize">{hostProfile.host_type}</span>
                        </div>
                        {hostProfile.bio && <p className="text-gray-600 mt-2">{hostProfile.bio}</p>}
                      </div>
                      <Button variant="outline">
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Contact Host
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Description */}
              <div>
                <h2 className="text-xl font-semibold mb-4">About this experience</h2>
                <p className="text-gray-700 leading-relaxed">{experience.description}</p>
              </div>

              {/* What's Included */}
              {experience.included_amenities && experience.included_amenities.length > 0 && (
                <div>
                  <h2 className="text-xl font-semibold mb-4">What's included</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {experience.included_amenities.map((amenity, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <span>{amenity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* What to Bring */}
              {experience.what_to_bring && experience.what_to_bring.length > 0 && (
                <div>
                  <h2 className="text-xl font-semibold mb-4">What to bring</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {experience.what_to_bring.map((item, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <Info className="h-5 w-5 text-blue-500" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Safety & Requirements */}
              <div>
                <h2 className="text-xl font-semibold mb-4">Safety & Requirements</h2>
                <div className="space-y-3">
                  {experience.min_age && (
                    <div className="flex items-center space-x-2">
                      <Shield className="h-5 w-5 text-blue-500" />
                      <span>Minimum age: {experience.min_age} years</span>
                    </div>
                  )}
                  {experience.max_age && (
                    <div className="flex items-center space-x-2">
                      <Shield className="h-5 w-5 text-blue-500" />
                      <span>Maximum age: {experience.max_age} years</span>
                    </div>
                  )}
                  <div className="flex items-center space-x-2">
                    <Shield className="h-5 w-5 text-blue-500" />
                    <span>Difficulty level: {experience.difficulty_level}</span>
                  </div>
                  {experience.weather_contingency && (
                    <div className="flex items-start space-x-2">
                      <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" />
                      <span>{experience.weather_contingency}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Reviews */}
              {reviews.length > 0 && (
                <div>
                  <h2 className="text-xl font-semibold mb-4">
                    Reviews ({totalReviews})
                    <span className="ml-2 text-base font-normal text-gray-600">
                      <Star className="inline h-4 w-4 text-yellow-400 fill-current mr-1" />
                      {averageRating}
                    </span>
                  </h2>
                  <div className="space-y-6">
                    {reviews.slice(0, 3).map((review) => (
                      <div key={review.id} className="border-b border-gray-200 pb-6 last:border-b-0">
                        <div className="flex items-center space-x-3 mb-3">
                          <Avatar>
                            <AvatarImage src={review.users?.avatar_url || "/placeholder.svg"} />
                            <AvatarFallback>
                              {review.users?.first_name?.charAt(0) || "U"}
                              {review.users?.last_name?.charAt(0) || ""}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">
                              {review.users?.first_name} {review.users?.last_name}
                            </div>
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                              <div className="flex">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`h-4 w-4 ${
                                      i < review.rating ? "text-yellow-400 fill-current" : "text-gray-300"
                                    }`}
                                  />
                                ))}
                              </div>
                              <span>•</span>
                              <span>{new Date(review.created_at).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                        {review.title && <h4 className="font-medium mb-2">{review.title}</h4>}
                        <p className="text-gray-700">{review.comment}</p>
                      </div>
                    ))}
                    {totalReviews > 3 && (
                      <Button variant="outline" className="w-full">
                        Show all {totalReviews} reviews
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Booking Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold">€{experience.price_per_person}</div>
                    <div className="text-sm text-gray-600">per person</div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="font-medium">{averageRating}</span>
                    <span className="text-gray-600">({totalReviews})</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {!showBookingForm ? (
                  <Button className="w-full" size="lg" onClick={() => setShowBookingForm(true)}>
                    Book Now
                  </Button>
                ) : (
                  <div className="space-y-4">
                    {bookingError && <div className="text-red-500 text-sm text-center">{bookingError}</div>}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="date">Date</Label>
                        <Input
                          id="date"
                          type="date"
                          value={bookingData.date}
                          onChange={(e) => {
                            setBookingData({ ...bookingData, date: e.target.value, time: "" }) // Reset time on date change
                            setBookingError(null)
                          }}
                          min={new Date().toISOString().split("T")[0]}
                        />
                      </div>
                      <div>
                        <Label htmlFor="guests">Guests</Label>
                        <Select
                          value={bookingData.guests.toString()}
                          onValueChange={(value) => {
                            setBookingData({ ...bookingData, guests: Number.parseInt(value), time: "" }) // Reset time on guests change
                            setBookingError(null)
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.from({ length: experience.max_guests }, (_, i) => i + 1).map((num) => (
                              <SelectItem key={num} value={num.toString()}>
                                {num} guest{num > 1 ? "s" : ""}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {bookingData.date && (
                      <div>
                        <Label htmlFor="time">Available Times</Label>
                        {availableTimeSlots.length > 0 ? (
                          <Select
                            value={bookingData.time}
                            onValueChange={(value) => {
                              setBookingData({ ...bookingData, time: value })
                              setBookingError(null)
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select a time" />
                            </SelectTrigger>
                            <SelectContent>
                              {availableTimeSlots.map((slot) => (
                                <SelectItem key={slot.id} value={slot.start_time}>
                                  {slot.start_time} ({slot.available_capacity} spots left)
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <p className="text-sm text-gray-500 flex items-center mt-2">
                            <CalendarDays className="h-4 w-4 mr-1" /> No available slots for this date and guest count.
                          </p>
                        )}
                      </div>
                    )}

                    <div>
                      <Label htmlFor="special-requests">Special Requests (Optional)</Label>
                      <Input
                        id="special-requests"
                        placeholder="Any special requests?"
                        value={bookingData.specialRequests}
                        onChange={(e) => setBookingData({ ...bookingData, specialRequests: e.target.value })}
                      />
                    </div>

                    <div>
                      <Label htmlFor="dietary">Dietary Requirements (Optional)</Label>
                      <Input
                        id="dietary"
                        placeholder="Any dietary restrictions?"
                        value={bookingData.dietaryRequirements}
                        onChange={(e) => setBookingData({ ...bookingData, dietaryRequirements: e.target.value })}
                      />
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>
                          €{experience.price_per_person} × {bookingData.guests} guests
                        </span>
                        <span>€{experience.price_per_person * bookingData.guests}</span>
                      </div>
                      <div className="flex justify-between font-semibold text-lg">
                        <span>Total</span>
                        <span>€{experience.price_per_person * bookingData.guests}</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Button
                        className="w-full"
                        size="lg"
                        onClick={handleBooking}
                        disabled={
                          !bookingData.date || !bookingData.time || isBooking || availableTimeSlots.length === 0
                        }
                      >
                        {isBooking ? "Booking..." : "Confirm Booking"}
                      </Button>
                      <Button variant="outline" className="w-full" onClick={() => setShowBookingForm(false)}>
                        Cancel
                      </Button>
                    </div>

                    <p className="text-xs text-gray-600 text-center">
                      You won't be charged yet. Complete your booking to confirm.
                    </p>
                  </div>
                )}

                <Separator />

                <div className="space-y-3 text-sm">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Free cancellation up to 24 hours before</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Shield className="h-4 w-4 text-blue-500" />
                    <span>Safety equipment provided</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Zap className="h-4 w-4 text-yellow-500" />
                    <span>Instant confirmation</span>
                  </div>
                </div>

                <Separator />

                <div className="text-center">
                  <Button variant="ghost" size="sm">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Contact Host
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Star, Heart, MapPin, Clock, Users, Euro, Calendar, Shield, Globe, Award, MessageCircle, Share2, Sailboat } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Mock data - replace with actual API call
const mockExperience = {
  id: 1,
  title: "Sunset Sailing Adventure in Santorini",
  host: {
    name: "Captain Maria's Sailing",
    avatar: "/placeholder.jpg",
    rating: 4.9,
    reviews: 124,
    yearsExperience: 8,
    responseTime: "within 1 hour",
    languages: ["English", "Greek", "Italian"]
  },
  location: "Santorini, Greece",
  activityType: "Sailing",
  price: 85,
  originalPrice: 120,
  duration: "3 hours",
  rating: 4.8,
  totalReviews: 124,
  images: [
    "/placeholder.jpg",
    "/placeholder.jpg",
    "/placeholder.jpg",
    "/placeholder.jpg"
  ],
  description: "Experience the magic of a Santorini sunset from the sea on this unforgettable sailing adventure. Cruise through the crystal-clear waters of the Aegean Sea while sipping local wine and watching one of the world's most spectacular sunsets.",
  highlights: [
    "Professional captain and crew",
    "Complimentary drinks and snacks",
    "Swimming stops in secluded bays",
    "Perfect sunset viewing spots",
    "Small group experience (max 8 guests)"
  ],
  included: [
    "Professional sailing instruction",
    "All safety equipment",
    "Welcome drink and snacks",
    "Towels and snorkeling gear",
    "Insurance coverage"
  ],
  notIncluded: [
    "Transportation to marina",
    "Dinner",
    "Gratuities"
  ],
  maxGuests: 8,
  minAge: 12,
  difficulty: "Beginner",
  languages: ["English", "Greek"],
  cancellationPolicy: "Free cancellation up to 24 hours before the experience",
  meetingPoint: "Amoudi Bay Marina, Santorini",
  whatToBring: [
    "Sunscreen and hat",
    "Comfortable clothes",
    "Camera",
    "Swimming attire"
  ],
  itinerary: [
    {
      time: "17:00",
      activity: "Meet at Amoudi Bay Marina",
      description: "Welcome drink and safety briefing"
    },
    {
      time: "17:30",
      activity: "Departure from marina",
      description: "Begin sailing towards sunset viewing spots"
    },
    {
      time: "18:30",
      activity: "Swimming stop",
      description: "Anchor at secluded bay for swimming and snorkeling"
    },
    {
      time: "19:30",
      activity: "Sunset viewing",
      description: "Perfect position for watching the famous Santorini sunset"
    },
    {
      time: "20:00",
      activity: "Return to marina",
      description: "Sail back while enjoying the evening atmosphere"
    }
  ],
  availability: [
    { date: "2024-07-20", available: true, price: 85 },
    { date: "2024-07-21", available: true, price: 85 },
    { date: "2024-07-22", available: false, price: 85 },
    { date: "2024-07-23", available: true, price: 95 },
  ]
}

const mockReviews = [
  {
    id: 1,
    name: "Sarah Johnson",
    avatar: "/placeholder.jpg",
    rating: 5,
    date: "June 2024",
    review: "Absolutely magical experience! Captain Maria was wonderful and the sunset was breathtaking. Highly recommend this to anyone visiting Santorini."
  },
  {
    id: 2,
    name: "Michael Chen",
    avatar: "/placeholder.jpg",
    rating: 5,
    date: "May 2024",
    review: "Perfect evening on the water. The boat was beautiful, crew was friendly, and the swimming stop was a great addition. Worth every penny!"
  },
  {
    id: 3,
    name: "Emma Rodriguez",
    avatar: "/placeholder.jpg",
    rating: 4,
    date: "May 2024",
    review: "Great experience overall. The sunset was incredible and the boat was comfortable. Only minor issue was we left a bit late, but still had a wonderful time."
  }
]

export default function ExperienceDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [selectedDate, setSelectedDate] = useState("")
  const [selectedTime, setSelectedTime] = useState("")
  const [guests, setGuests] = useState(2)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [showAllReviews, setShowAllReviews] = useState(false)
  const [isWishlisted, setIsWishlisted] = useState(false)

  const experience = mockExperience // In real app, fetch based on params.id

  const totalPrice = experience.price * guests
  const serviceFee = Math.round(totalPrice * 0.14)
  const finalTotal = totalPrice + serviceFee

  const handleBooking = () => {
    if (!selectedDate || !selectedTime) {
      alert("Please select a date and time")
      return
    }
    // Navigate to booking confirmation
    router.push(`/booking/confirm?experience=${params.id}&date=${selectedDate}&time=${selectedTime}&guests=${guests}`)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center">
              <Sailboat className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">SeaFable</span>
            </Link>
            <div className="hidden md:flex items-center space-x-8">
              <Link href="/business/register" className="text-gray-700 hover:text-blue-600">Become a Host</Link>
              <Link href="/login" className="text-gray-700 hover:text-blue-600">Sign In</Link>
              <Link href="/register" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">Sign Up</Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
          <Link href="/" className="hover:text-blue-600">Home</Link>
          <span>/</span>
          <Link href="/search" className="hover:text-blue-600">Search</Link>
          <span>/</span>
          <span className="text-gray-900">{experience.title}</span>
        </div>

        {/* Back button */}
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to search
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Title and actions */}
            <div className="flex justify-between items-start mb-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Badge className="bg-blue-600 text-white">{experience.activityType}</Badge>
                  <Badge variant="outline" className="text-green-600 border-green-600">
                    {experience.difficulty}
                  </Badge>
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{experience.title}</h1>
                <div className="flex items-center space-x-4 text-gray-600">
                  <div className="flex items-center">
                    <Star className="w-4 h-4 text-yellow-400 mr-1" />
                    <span className="font-medium">{experience.rating}</span>
                    <span className="ml-1">({experience.totalReviews} reviews)</span>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-1" />
                    {experience.location}
                  </div>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsWishlisted(!isWishlisted)}
                >
                  <Heart className={`w-4 h-4 mr-2 ${isWishlisted ? 'fill-red-500 text-red-500' : ''}`} />
                  Save
                </Button>
                <Button variant="outline" size="sm">
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
              </div>
            </div>

            {/* Image Gallery */}
            <div className="mb-8">
              <div className="grid grid-cols-4 gap-2 h-96">
                <div className="col-span-2 row-span-2">
                  <img
                    src={experience.images[currentImageIndex]}
                    alt={experience.title}
                    className="w-full h-full object-cover rounded-lg cursor-pointer"
                    onClick={() => setCurrentImageIndex(0)}
                  />
                </div>
                {experience.images.slice(1, 5).map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt={`${experience.title} ${index + 2}`}
                    className="w-full h-full object-cover rounded-lg cursor-pointer hover:opacity-80"
                    onClick={() => setCurrentImageIndex(index + 1)}
                  />
                ))}
              </div>
            </div>

            {/* Host Information */}
            <Card className="mb-8">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={experience.host.avatar} />
                      <AvatarFallback>{experience.host.name[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-xl font-semibold">{experience.host.name}</h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <div className="flex items-center">
                          <Star className="w-4 h-4 text-yellow-400 mr-1" />
                          {experience.host.rating} ({experience.host.reviews} reviews)
                        </div>
                        <span>{experience.host.yearsExperience} years experience</span>
                        <span>Responds {experience.host.responseTime}</span>
                      </div>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-sm text-gray-600">Languages:</span>
                        {experience.host.languages.map((lang, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {lang}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  <Button variant="outline">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Contact Host
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Description */}
            <Card className="mb-8">
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-4">About this experience</h3>
                <p className="text-gray-700 leading-relaxed">{experience.description}</p>
              </CardContent>
            </Card>

            {/* What's Included */}
            <Card className="mb-8">
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-xl font-semibold mb-4 text-green-600">What's included</h3>
                    <ul className="space-y-2">
                      {experience.included.map((item, index) => (
                        <li key={index} className="flex items-center">
                          <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-4 text-red-600">Not included</h3>
                    <ul className="space-y-2">
                      {experience.notIncluded.map((item, index) => (
                        <li key={index} className="flex items-center">
                          <div className="w-2 h-2 bg-red-500 rounded-full mr-3"></div>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Itinerary */}
            <Card className="mb-8">
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-4">Itinerary</h3>
                <div className="space-y-4">
                  {experience.itinerary.map((item, index) => (
                    <div key={index} className="flex">
                      <div className="flex flex-col items-center mr-4">
                        <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                          {index + 1}
                        </div>
                        {index < experience.itinerary.length - 1 && (
                          <div className="w-px h-8 bg-gray-300 mt-2"></div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-medium text-blue-600">{item.time}</span>
                          <span className="font-medium">{item.activity}</span>
                        </div>
                        <p className="text-gray-600 text-sm">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Reviews */}
            <Card className="mb-8">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold">
                    Reviews ({experience.totalReviews})
                  </h3>
                  <div className="flex items-center space-x-2">
                    <Star className="w-5 h-5 text-yellow-400" />
                    <span className="font-medium text-lg">{experience.rating}</span>
                  </div>
                </div>
                <div className="space-y-6">
                  {(showAllReviews ? mockReviews : mockReviews.slice(0, 2)).map((review) => (
                    <div key={review.id} className="border-b border-gray-200 pb-6 last:border-b-0">
                      <div className="flex items-center space-x-3 mb-3">
                        <Avatar>
                          <AvatarImage src={review.avatar} />
                          <AvatarFallback>{review.name[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{review.name}</div>
                          <div className="flex items-center space-x-2">
                            <div className="flex">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`w-4 h-4 ${
                                    star <= review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-sm text-gray-500">{review.date}</span>
                          </div>
                        </div>
                      </div>
                      <p className="text-gray-700">{review.review}</p>
                    </div>
                  ))}
                </div>
                {!showAllReviews && mockReviews.length > 2 && (
                  <Button
                    variant="outline"
                    onClick={() => setShowAllReviews(true)}
                    className="mt-4"
                  >
                    Show all {experience.totalReviews} reviews
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Booking Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl font-bold">€{experience.price}</span>
                        {experience.originalPrice && (
                          <span className="text-lg text-gray-500 line-through">€{experience.originalPrice}</span>
                        )}
                      </div>
                      <span className="text-gray-600">per person</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-yellow-400" />
                      <span className="font-medium">{experience.rating}</span>
                    </div>
                  </div>

                  <div className="space-y-4 mb-6">
                    <div>
                      <Label htmlFor="date">Date</Label>
                      <Select value={selectedDate} onValueChange={setSelectedDate}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a date" />
                        </SelectTrigger>
                        <SelectContent>
                          {experience.availability.map((slot) => (
                            <SelectItem
                              key={slot.date}
                              value={slot.date}
                              disabled={!slot.available}
                            >
                              {new Date(slot.date).toLocaleDateString()} 
                              {!slot.available && " (Unavailable)"}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="time">Time</Label>
                      <Select value={selectedTime} onValueChange={setSelectedTime}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select time" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="17:00">5:00 PM</SelectItem>
                          <SelectItem value="17:30">5:30 PM</SelectItem>
                          <SelectItem value="18:00">6:00 PM</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="guests">Guests</Label>
                      <Select value={guests.toString()} onValueChange={(value) => setGuests(parseInt(value))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                            <SelectItem key={num} value={num.toString()}>
                              {num} {num === 1 ? 'guest' : 'guests'}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-3 mb-6 text-sm">
                    <div className="flex justify-between">
                      <span>€{experience.price} x {guests} guests</span>
                      <span>€{totalPrice}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Service fee</span>
                      <span>€{serviceFee}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-semibold">
                      <span>Total</span>
                      <span>€{finalTotal}</span>
                    </div>
                  </div>

                  <Button
                    onClick={handleBooking}
                    className="w-full bg-blue-600 hover:bg-blue-700 mb-4"
                    size="lg"
                  >
                    Reserve
                  </Button>

                  <p className="text-center text-sm text-gray-600 mb-6">
                    You won't be charged yet
                  </p>

                  <div className="space-y-3 text-sm text-gray-600">
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-2" />
                      Duration: {experience.duration}
                    </div>
                    <div className="flex items-center">
                      <Users className="w-4 h-4 mr-2" />
                      Max {experience.maxGuests} guests
                    </div>
                    <div className="flex items-center">
                      <Shield className="w-4 h-4 mr-2" />
                      Minimum age: {experience.minAge}
                    </div>
                    <div className="flex items-center">
                      <Globe className="w-4 h-4 mr-2" />
                      Languages: {experience.languages.join(", ")}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Cancellation Policy */}
              <Card className="mt-6">
                <CardContent className="p-6">
                  <h4 className="font-semibold mb-2">Cancellation policy</h4>
                  <p className="text-sm text-gray-600">{experience.cancellationPolicy}</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
