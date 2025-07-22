"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link" // Import Link
import {
  Calendar,
  MapPin,
  Star,
  Users,
  Clock,
  Heart,
  Award,
  Compass,
  Ship,
  Anchor,
  User,
  Edit,
  Search,
  Plus,
  MessageSquare,
  Target,
  Sun,
  CreditCard,
  LogOut,
  Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { CustomerLayout } from "@/components/layouts/CustomerLayout"
import { useAuth } from "@/lib/auth-context"
import { getUserDashboardData, type Booking, type Review } from "@/lib/database"
// Removed problematic Sidebar imports
import { signOutAndRedirect } from "@/lib/auth-utils"
import type { UserProfile } from "@/types/auth"
import { useActionState } from "react"
import { updateUserProfile } from "@/app/actions/user" // Import the new server action
import { useToast } from "@/hooks/use-toast" // Import useToast
import { Input } from "@/components/ui/input"

// Mock data for recommendations and achievements (since they are not directly from DB yet)
const mockRecommendations = [
  {
    id: "rec_001",
    title: "Advanced Sailing Workshop",
    host: "Captain Rodriguez",
    location: "San Diego",
    price: 275,
    rating: 4.9,
    reviews: 156,
    duration: "Full Day",
    difficulty: "intermediate",
    image: "/placeholder.svg?height=200&width=300&text=Sailing",
    matchReason: "Based on your sailing experience",
    savings: 50,
  },
  {
    id: "rec_002",
    title: "Whale Watching Expedition",
    host: "Marine Wildlife Tours",
    location: "Monterey",
    price: 95,
    rating: 4.8,
    reviews: 89,
    duration: "3 hours",
    difficulty: "beginner",
    image: "/placeholder.svg?height=200&width=300&text=Whale Watching",
    isNew: true,
    matchReason: "Popular in your area",
  },
]

const mockAchievements = [
  { name: "First Adventure", icon: "🏆", earned: true, date: "2023-05-20" },
  { name: "Ocean Explorer", icon: "🌊", earned: true, date: "2023-08-15" },
  { name: "Review Master", icon: "⭐", earned: true, date: "2023-12-01" },
  { name: "Safety First", icon: "🛡️", earned: false, progress: 75 },
  { name: "Global Traveler", icon: "🌍", earned: false, progress: 60 },
]

// Overview Tab Component
interface OverviewTabProps {
  userProfile: UserProfile | null
  bookings: Booking[]
  reviews: Review[]
  userEmail: string // Added userEmail prop
}

const OverviewTab = ({ userProfile, bookings, reviews, userEmail }: OverviewTabProps) => {
  const upcomingBookings = bookings.filter(
    (b) => new Date(b.booking_date) >= new Date() && b.booking_status === "confirmed",
  )
  const completedBookings = bookings.filter(
    (b) => new Date(b.booking_date) < new Date() || b.booking_status === "completed",
  )

  const totalAdventures = completedBookings.length
  const destinationsVisited = new Set(completedBookings.map((b) => b.experiences?.location)).size
  const averageRating =
    reviews.length > 0 ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1) : "N/A"

  const stats = [
    {
      name: "Total Adventures",
      value: totalAdventures,
      icon: Ship,
      color: "text-blue-600",
      bg: "bg-blue-100",
    },
    {
      name: "Destinations",
      value: destinationsVisited,
      icon: MapPin,
      color: "text-green-600",
      bg: "bg-green-100",
    },
    {
      name: "Avg Rating",
      value: averageRating,
      icon: Star,
      color: "text-yellow-600",
      bg: "bg-yellow-100",
    },
    {
      name: "Upcoming",
      value: upcomingBookings.length,
      icon: Calendar,
      color: "text-purple-600",
      bg: "bg-purple-100",
    },
  ]

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <Card className="bg-gradient-to-r from-blue-600 to-teal-600 text-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">Welcome back, {userProfile?.first_name || userEmail}! 🌊</h2>
              <p className="text-blue-100 mb-4">
                Ready for your next adventure? You have {upcomingBookings.length} upcoming experiences.
              </p>
              <div className="flex items-center space-x-4 text-sm">
                <Badge variant="secondary" className="bg-white/20 text-white">
                  Explorer Member
                </Badge>
                <span className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  Member since {userProfile?.created_at ? new Date(userProfile.created_at).getFullYear() : "N/A"}
                </span>
              </div>
            </div>
            <div className="hidden md:block">
              <Anchor className="h-16 w-16 text-blue-300 opacity-50" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.name}>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${stat.bg}`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-sm text-gray-500">{stat.name}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upcoming Bookings */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Upcoming Adventures</CardTitle>
                <Button asChild variant="outline" size="sm">
                  <Link href="/dashboard/calendar">
                    <Calendar className="h-4 w-4 mr-2" />
                    View Calendar
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {upcomingBookings.length > 0 ? (
                  upcomingBookings.map((booking) => (
                    <div key={booking.id} className="border rounded-lg p-4">
                      <div className="flex space-x-4">
                        <img
                          src={
                            booking.experiences?.primary_image_url ||
                            "/placeholder.svg?height=200&width=300&text=Experience" ||
                            "/placeholder.svg" ||
                            "/placeholder.svg" ||
                            "/placeholder.svg"
                          }
                          alt={booking.experiences?.title || "Experience Image"}
                          className="w-24 h-24 rounded-lg object-cover"
                        />
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h4 className="font-semibold text-gray-900">{booking.experiences?.title}</h4>
                              <p className="text-sm text-gray-600 flex items-center">
                                <MapPin className="h-3 w-3 mr-1" />
                                {booking.experiences?.location}
                              </p>
                            </div>
                            <Badge variant={booking.booking_status === "confirmed" ? "default" : "secondary"}>
                              {booking.booking_status}
                            </Badge>
                          </div>

                          <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                            <div className="flex items-center text-gray-600">
                              <Calendar className="h-4 w-4 mr-2" />
                              {booking.booking_date}
                            </div>
                            <div className="flex items-center text-gray-600">
                              <Clock className="h-4 w-4 mr-2" />
                              {booking.departure_time}
                            </div>
                            <div className="flex items-center text-gray-600">
                              <Users className="h-4 w-4 mr-2" />
                              {booking.number_of_guests} guests
                            </div>
                            <div className="flex items-center text-gray-600">
                              <Sun className="h-4 w-4 mr-2" />
                              {/* Placeholder for weather, as it's not in DB */}
                              68°F
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <Avatar className="w-6 h-6">
                                <AvatarImage src={booking.host_profiles?.avatar_url || "/placeholder.svg"} />
                                <AvatarFallback>{booking.host_profiles?.name?.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <span className="text-sm text-gray-600">{booking.host_profiles?.name}</span>
                            </div>
                            <div className="flex space-x-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => console.log("Contact Host clicked for booking:", booking.id)}
                              >
                                <MessageSquare className="h-4 w-4 mr-1" />
                                Contact
                              </Button>
                              <Button asChild size="sm">
                                <Link href={`/experience/${booking.experience_id}`}>View Details</Link>
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-4">
                    No upcoming bookings. Time to plan your next adventure!
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Target className="h-5 w-5 mr-2" />
                Recommended for You
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockRecommendations.map((rec) => (
                  <div key={rec.id} className="border rounded-lg p-3">
                    <img
                      src={rec.image || "/placeholder.svg"}
                      alt={rec.title}
                      className="w-full h-32 rounded object-cover mb-3"
                    />
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h5 className="font-medium text-sm">{rec.title}</h5>
                        {rec.isNew && <Badge variant="default">New</Badge>}
                      </div>
                      <p className="text-xs text-gray-600 flex items-center">
                        <MapPin className="h-3 w-3 mr-1" />
                        {rec.location}
                      </p>
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center">
                          <Star className="h-3 w-3 mr-1 text-yellow-400" />
                          {rec.rating} ({rec.reviews})
                        </div>
                        <span className="font-semibold">${rec.price}</span>
                      </div>
                      <p className="text-xs text-blue-600">{rec.matchReason}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Button asChild className="w-full mt-4" size="sm">
                <Link href="/search">
                  <Search className="h-4 w-4 mr-2" />
                  Explore More
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Achievements */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Award className="h-5 w-5 mr-2" />
                Achievements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockAchievements.map((achievement, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        achievement.earned ? "bg-yellow-100" : "bg-gray-100"
                      }`}
                    >
                      <span className="text-sm">{achievement.icon}</span>
                    </div>
                    <div className="flex-1">
                      <p className={`text-sm font-medium ${achievement.earned ? "text-gray-900" : "text-gray-500"}`}>
                        {achievement.name}
                      </p>
                      {achievement.earned ? (
                        <p className="text-xs text-gray-500">Earned {achievement.date}</p>
                      ) : (
                        <div className="mt-1">
                          <Progress value={achievement.progress} className="h-1" />
                          <p className="text-xs text-gray-500 mt-1">{achievement.progress}% complete</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

// Bookings Tab Component
interface BookingsTabProps {
  bookings: Booking[]
  reviews: Review[]
}

const BookingsTab = ({ bookings, reviews }: BookingsTabProps) => {
  const [filter, setFilter] = useState("all")

  const filteredBookings = bookings.filter((booking) => {
    if (filter === "all") return true
    if (filter === "upcoming") return new Date(booking.booking_date) >= new Date()
    if (filter === "completed")
      return new Date(booking.booking_date) < new Date() || booking.booking_status === "completed"
    return true
  })

  const getReviewForBooking = (bookingId: string) => {
    return reviews.find((r) => r.booking_id === bookingId)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">My Bookings</h2>
        <div className="flex space-x-2">
          <Button variant={filter === "all" ? "default" : "outline"} size="sm" onClick={() => setFilter("all")}>
            All
          </Button>
          <Button
            variant={filter === "upcoming" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("upcoming")}
          >
            Upcoming
          </Button>
          <Button
            variant={filter === "completed" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("completed")}
          >
            Completed
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {filter === "upcoming"
              ? "Upcoming Adventures"
              : filter === "completed"
                ? "Recent Adventures"
                : "All Adventures"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredBookings.length > 0 ? (
              filteredBookings.map((booking) => {
                const review = getReviewForBooking(booking.id)
                return (
                  <div key={booking.id} className="border rounded-lg p-4">
                    <div className="flex space-x-4">
                      <img
                        src={
                          booking.experiences?.primary_image_url ||
                          "/placeholder.svg?height=200&width=300&text=Experience" ||
                          "/placeholder.svg" ||
                          "/placeholder.svg" ||
                          "/placeholder.svg"
                        }
                        alt={booking.experiences?.title || "Experience Image"}
                        className="w-32 h-24 rounded-lg object-cover"
                      />
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-1">{booking.experiences?.title}</h4>
                            <p className="text-sm text-gray-600 flex items-center mb-1">
                              <MapPin className="h-3 w-3 mr-1" />
                              {booking.experiences?.location}
                            </p>
                            <div className="flex items-center space-x-2">
                              <Avatar className="w-5 h-5">
                                <AvatarImage src={booking.host_profiles?.avatar_url || "/placeholder.svg"} />
                                <AvatarFallback>{booking.host_profiles?.name?.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <span className="text-sm text-gray-600">{booking.host_profiles?.name}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge variant={booking.booking_status === "confirmed" ? "default" : "secondary"}>
                              {booking.booking_status}
                            </Badge>
                            <p className="text-lg font-bold text-gray-900 mt-2">${booking.total_price}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4 text-sm mb-4">
                          <div className="flex items-center text-gray-600">
                            <Calendar className="h-4 w-4 mr-2" />
                            {booking.booking_date}
                          </div>
                          <div className="flex items-center text-gray-600">
                            <Clock className="h-4 w-4 mr-2" />
                            {booking.departure_time} ({booking.experiences?.duration_display})
                          </div>
                          <div className="flex items-center text-gray-600">
                            <Users className="h-4 w-4 mr-2" />
                            {booking.number_of_guests} guests
                          </div>
                        </div>

                        {review && (
                          <div className="bg-gray-50 rounded p-3 mb-3">
                            <div className="flex items-center mb-2">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-4 w-4 ${
                                    i < review.rating ? "text-yellow-400 fill-current" : "text-gray-300"
                                  }`}
                                />
                              ))}
                              <span className="text-sm font-medium ml-2">{review.title}</span>
                            </div>
                            <p className="text-sm text-gray-700">"{review.comment}"</p>
                          </div>
                        )}

                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => console.log("Message Host clicked for booking:", booking.id)}
                          >
                            <MessageSquare className="h-4 w-4 mr-1" />
                            Message Host
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => console.log("Modify Booking clicked for booking:", booking.id)}
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Modify
                          </Button>
                          <Button asChild size="sm">
                            <Link href={`/experience/${booking.experience_id}`}>View Details</Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })
            ) : (
              <p className="text-gray-500 text-center py-4">
                No {filter === "upcoming" ? "upcoming" : "completed"} bookings {filter === "all" ? "yet" : ""}.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Wishlist Tab Component
type WishlistTabProps = {}

const WishlistTab = ({}: WishlistTabProps) => {
  const mockWishlist = [
    {
      id: "wish_001",
      title: "Luxury Yacht Charter",
      location: "Miami Beach",
      price: 1200,
      rating: 4.9,
      image: "/placeholder.svg?height=200&width=300&text=Yacht",
      priceAlert: true,
    },
    {
      id: "wish_002",
      title: "Surfing Lessons Hawaii",
      location: "Waikiki Beach",
      price: 150,
      rating: 4.7,
      image: "/placeholder.svg?height=200&width=300&text=Surfing",
      available: true,
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">My Wishlist</h2>
        <Button asChild>
          <Link href="/search">
            <Plus className="h-4 w-4 mr-2" />
            Add Experience
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockWishlist.length > 0 ? (
          mockWishlist.map((item) => (
            <Card key={item.id} className="overflow-hidden">
              <div className="relative">
                <img src={item.image || "/placeholder.svg"} alt={item.title} className="w-full h-48 object-cover" />
                <div className="absolute top-2 right-2">
                  <Button size="icon" variant="secondary" className="bg-white/80 hover:bg-white">
                    <Heart className="h-4 w-4 text-red-500 fill-current" />
                  </Button>
                </div>
                {item.priceAlert && (
                  <div className="absolute top-2 left-2">
                    <Badge variant="destructive">Price Alert</Badge>
                  </div>
                )}
                {item.available && (
                  <div className="absolute top-2 left-2">
                    <Badge variant="default">Available</Badge>
                  </div>
                )}
              </div>
              <CardContent className="p-4">
                <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-600 flex items-center mb-2">
                  <MapPin className="h-3 w-3 mr-1" />
                  {item.location}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-400 mr-1" />
                    <span className="text-sm">{item.rating}</span>
                  </div>
                  <span className="text-lg font-bold">${item.price}</span>
                </div>
                <Button asChild className="w-full mt-3" size="sm">
                  <Link href={`/experience/${item.id}`}>View Details</Link>
                </Button>
              </CardContent>
            </Card>
          ))
        ) : (
          <p className="text-gray-500 text-center col-span-full py-4">
            Your wishlist is empty. Start adding experiences you dream of!
          </p>
        )}
      </div>
    </div>
  )
}

// Profile Tab Component
interface ProfileTabProps {
  userProfile: UserProfile | null
  userEmail: string // Added userEmail prop
}

const ProfileTab = ({ userProfile, userEmail }: ProfileTabProps) => {
  const { toast } = useToast() // Initialize useToast

  const [firstName, setFirstName] = useState(userProfile?.first_name || "")
  const [lastName, setLastName] = useState(userProfile?.last_name || "")
  const [email, setEmail] = useState(userProfile?.email || userEmail)
  const [phone, setPhone] = useState(userProfile?.phone || "") // Assuming phone might be part of userProfile

  const [state, formAction, isPending] = useActionState(async (prevState: any, formData: FormData) => {
    const updatedFirstName = formData.get("firstName") as string
    const updatedLastName = formData.get("lastName") as string
    const updatedEmail = formData.get("email") as string
    const updatedPhone = formData.get("phone") as string

    if (!userProfile?.id) {
      toast({
        title: "Error",
        description: "User ID not found. Cannot update profile.",
        variant: "destructive",
      })
      return { success: false, error: "User ID not found." }
    }

    const result = await updateUserProfile({
      userId: userProfile.id,
      firstName: updatedFirstName,
      lastName: updatedLastName,
      email: updatedEmail,
      phone: updatedPhone,
    })

    if (result.success) {
      toast({
        title: "Success",
        description: "Profile updated successfully!",
        variant: "default",
      })
      // Update local state to reflect changes immediately
      setFirstName(updatedFirstName)
      setLastName(updatedLastName)
      setEmail(updatedEmail)
      setPhone(updatedPhone)
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to update profile.",
        variant: "destructive",
      })
    }
    return result
  }, null)

  // Mock data for totalSpent, totalBookings, membershipLevel, preferences
  const mockCustomerData = {
    totalSpent: 2850,
    totalBookings: 8,
    membershipLevel: "Explorer",
    preferences: {
      difficulty: "intermediate",
      groupSize: "small",
      timeOfDay: "sunset",
    },
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Profile Settings</h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-4">
              <Avatar className="w-20 h-20">
                <AvatarImage src={userProfile?.avatar_url || "/placeholder.svg"} />
                <AvatarFallback>
                  {firstName?.charAt(0) || userEmail.charAt(0)}
                  {lastName?.charAt(0) || userEmail.charAt(1)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-lg font-semibold">
                  {firstName} {lastName}
                </h3>
                <p className="text-gray-600">{email}</p>
                <Badge variant="secondary">{mockCustomerData.membershipLevel} Member</Badge>
              </div>
            </div>
            <form action={formAction} className="space-y-4">
              {" "}
              {/* Add form tag and action */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                    First Name
                  </label>
                  <Input
                    id="firstName"
                    name="firstName" // Add name attribute for formData
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    disabled={isPending}
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name
                  </label>
                  <Input
                    id="lastName"
                    name="lastName" // Add name attribute for formData
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    disabled={isPending}
                  />
                </div>
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <Input
                  id="email"
                  name="email" // Add name attribute for formData
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isPending}
                />
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <Input
                  id="phone"
                  name="phone" // Add name attribute for formData
                  type="tel"
                  placeholder="Optional"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={isPending}
                />
              </div>
              <Button type="submit" disabled={isPending}>
                {" "}
                {/* Change onClick to type="submit" */}
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </form>{" "}
            {/* Close form tag */}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Account Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Spent</span>
                <span className="font-semibold">${mockCustomerData.totalSpent.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Bookings</span>
                <span className="font-semibold">{mockCustomerData.totalBookings}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Member Since</span>
                <span className="font-semibold">
                  {userProfile?.created_at ? new Date(userProfile.created_at).getFullYear() : "N/A"}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty Level</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-md">
                  <option value="beginner">Beginner</option>
                  <option value="intermediate" selected>
                    Intermediate
                  </option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Group Size</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-md">
                  <option value="solo">Solo</option>
                  <option value="small" selected>
                    Small Group
                  </option>
                  <option value="large">Large Group</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Time of Day                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-md">
                  <option value="morning">Morning</option>
                  <option value="afternoon">Afternoon</option>
                  <option value="sunset" selected>
                    Sunset
                  </option>
                </select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Danger Zone</CardTitle>
            </CardHeader>
            <CardContent>
              <Button variant="destructive" onClick={() => signOutAndRedirect()}>
                <LogOut className="h-4 w-4 mr-2" />
                Log Out
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

// Main Dashboard Page Component
interface DashboardPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

const DashboardPage = ({ searchParams }: DashboardPageProps) => {
  const [resolvedSearchParams, setResolvedSearchParams] = useState<{ [key: string]: string | string[] | undefined }>({})
  const { user, loading } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("overview")
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null) // Define userProfile state
  const [bookings, setBookings] = useState<Booking[]>([])
  const [reviews, setReviews] = useState<Review[]>([])

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (user?.email) {
        try {
          const dashboardData = await getUserDashboardData(user.email)
        if (dashboardData.success && dashboardData.data) {
          setUserProfile(dashboardData.data.user || null)
          setBookings(dashboardData.data.bookings || [])
          setReviews(dashboardData.data.reviews || [])
        }
        } catch (error) {
          console.error("Error fetching dashboard data:", error)
        }
      }
    }

    if (user?.email) {
      fetchDashboardData()
    }
  }, [user?.email])

  useEffect(() => {
    const resolveSearchParams = async () => {
      const params = await searchParams
      setResolvedSearchParams(params)

      const tab = params?.tab
      if (tab && typeof tab === "string") {
        setActiveTab(tab)
      }
    }

    resolveSearchParams()
  }, [searchParams])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null
  }

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "bookings", label: "Bookings" },
    { id: "wishlist", label: "Wishlist" },
    { id: "profile", label: "Profile" },
  ]

  return (
    <CustomerLayout>
      <div className="container mx-auto py-10">
        <div className="flex min-h-screen">
          {/* Desktop Sidebar */}
          <div className="hidden md:block w-64 bg-white border-r border-gray-200">
            <div className="flex flex-col h-full">
              <div className="p-6 border-b">
                <Link href="/">
                  <h1 className="font-semibold text-lg text-gray-900">Dashboard</h1>
                </Link>
              </div>
              <nav className="flex-1 p-4 space-y-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                      activeTab === tab.id
                        ? 'bg-blue-50 text-blue-700 font-medium'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>
              <div className="p-4 border-t">
                <Button variant="destructive" onClick={() => signOutAndRedirect()} className="w-full">
                  <LogOut className="h-4 w-4 mr-2" />
                  Log Out
                </Button>
              </div>
            </div>
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden fixed top-16 left-0 right-0 bg-white border-b z-10">
            <div className="flex overflow-x-auto p-2 space-x-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`whitespace-nowrap px-3 py-2 rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-50 text-blue-700 font-medium'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 md:p-6 p-4 md:mt-0 mt-16">
            {activeTab === "overview" && (
              <OverviewTab
                userProfile={userProfile}
                bookings={bookings}
                reviews={reviews}
                userEmail={user.email || ""}
              />
            )}
            {activeTab === "bookings" && <BookingsTab bookings={bookings} reviews={reviews} />}
            {activeTab === "wishlist" && <WishlistTab />}
            {activeTab === "profile" && <ProfileTab userProfile={userProfile} userEmail={user.email || ""} />}
          </div>
        </div>
      </div>
    </CustomerLayout>
  )
}

export default DashboardPage