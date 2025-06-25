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
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { CustomerLayout } from "@/components/layouts/CustomerLayout"
import { useAuth } from "@/lib/auth-context"
import { getUserDashboardData, type Booking, type Review } from "@/lib/database"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarTrigger,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { signOutAndRedirect } from "@/lib/auth-utils"
import type { UserProfile } from "@/types/auth"

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
        <CardContent className="p-6 sm:p-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex-1">
              <h2 className="text-2xl sm:text-3xl font-bold mb-2">
                Welcome back, {userProfile?.first_name || userEmail}! 🌊
              </h2>
              <p className="text-blue-100 text-base mb-4">
                Ready for your next adventure? You have {upcomingBookings.length} upcoming experiences.
              </p>
              <div className="flex items-center space-x-4 text-sm">
                <Badge className="bg-white/30 text-white hover:bg-white/40 border-white/50">Explorer Member</Badge>
                <span className="flex items-center text-blue-100">
                  <Calendar className="h-4 w-4 mr-1 opacity-80" />
                  Member since {userProfile?.created_at ? new Date(userProfile.created_at).getFullYear() : "N/A"}
                </span>
              </div>
            </div>
            <div className="hidden md:block flex-shrink-0">
              <Anchor className="h-20 w-20 text-blue-300 opacity-50" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.name}>
            <CardContent className="p-5">
              <div className="flex items-center space-x-4">
                <div className={`p-3 rounded-xl ${stat.bg}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
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
                    <div key={booking.id} className="flex flex-col sm:flex-row gap-4 p-4 border rounded-lg shadow-sm">
                      <img
                        src={
                          booking.experiences?.primary_image_url ||
                          "/placeholder.svg?height=200&width=300&text=Experience" ||
                          "/placeholder.svg" ||
                          "/placeholder.svg"
                        }
                        alt={booking.experiences?.title || "Experience Image"}
                        className="w-full sm:w-32 h-32 sm:h-24 rounded-lg object-cover flex-shrink-0"
                      />
                      <div className="flex-1 flex flex-col justify-between">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="font-semibold text-lg text-gray-900">{booking.experiences?.title}</h4>
                            <p className="text-sm text-gray-600 flex items-center mt-1">
                              <MapPin className="h-3 w-3 mr-1 text-gray-500" />
                              {booking.experiences?.location}
                            </p>
                          </div>
                          <Badge
                            variant={booking.booking_status === "confirmed" ? "default" : "secondary"}
                            className="capitalize"
                          >
                            {booking.booking_status}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm mb-3">
                          <div className="flex items-center text-gray-700">
                            <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                            {new Date(booking.booking_date).toLocaleDateString()}
                          </div>
                          <div className="flex items-center text-gray-700">
                            <Clock className="h-4 w-4 mr-2 text-gray-500" />
                            {booking.departure_time}
                          </div>
                          <div className="flex items-center text-gray-700">
                            <Users className="h-4 w-4 mr-2 text-gray-500" />
                            {booking.number_of_guests} guests
                          </div>
                          <div className="flex items-center text-gray-700">
                            <Sun className="h-4 w-4 mr-2 text-gray-500" />
                            68°F (Placeholder)
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 mt-2">
                          <div className="flex items-center space-x-2">
                            <Avatar className="w-7 h-7">
                              <AvatarImage src={booking.host_profiles?.avatar_url || "/placeholder.svg"} />
                              <AvatarFallback className="text-xs">
                                {booking.host_profiles?.name?.charAt(0)}
                              </AvatarFallback>
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
                      className="w-full h-36 rounded-lg object-cover mb-3"
                    />
                    <div className="space-y-2 px-1">
                      <div className="flex items-center justify-between">
                        <h5 className="font-semibold text-base text-gray-900">{rec.title}</h5>
                        {rec.isNew && (
                          <Badge variant="default" className="bg-blue-500 hover:bg-blue-600">
                            New
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 flex items-center">
                        <MapPin className="h-3.5 w-3.5 mr-1 text-gray-500" />
                        {rec.location}
                      </p>
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center">
                          <Star className="h-4 w-4 mr-1 text-yellow-400 fill-current" />
                          <span className="font-medium">{rec.rating}</span> ({rec.reviews})
                        </div>
                        <span className="font-bold text-lg">${rec.price}</span>
                      </div>
                      <p className="text-xs text-blue-600 mt-2">{rec.matchReason}</p>
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
                  <div key={index} className="flex items-center space-x-4">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        achievement.earned ? "bg-yellow-100 text-yellow-600" : "bg-gray-100 text-gray-500"
                      } flex-shrink-0`}
                    >
                      <span className="text-lg">{achievement.icon}</span>
                    </div>
                    <div className="flex-1">
                      <p className={`text-base font-medium ${achievement.earned ? "text-gray-900" : "text-gray-700"}`}>
                        {achievement.name}
                      </p>
                      {achievement.earned ? (
                        <p className="text-sm text-gray-500">Earned {achievement.date}</p>
                      ) : (
                        <div className="mt-1">
                          <Progress value={achievement.progress} className="h-2" />
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
                  <div className="flex flex-col sm:flex-row gap-4 p-4 border rounded-lg shadow-sm" key={booking.id}>
                    <img
                      src={
                        booking.experiences?.primary_image_url ||
                        "/placeholder.svg?height=200&width=300&text=Experience" ||
                        "/placeholder.svg" ||
                        "/placeholder.svg"
                      }
                      alt={booking.experiences?.title || "Experience Image"}
                      className="w-full sm:w-32 h-32 sm:h-24 rounded-lg object-cover flex-shrink-0"
                    />
                    <div className="flex-1 flex flex-col justify-between">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-semibold text-lg text-gray-900 mb-1">{booking.experiences?.title}</h4>
                          <p className="text-sm text-gray-600 flex items-center mb-1">
                            <MapPin className="h-3 w-3 mr-1 text-gray-500" />
                            {booking.experiences?.location}
                          </p>
                          <div className="flex items-center space-x-2 mt-1">
                            <Avatar className="w-6 h-6">
                              <AvatarImage src={booking.host_profiles?.avatar_url || "/placeholder.svg"} />
                              <AvatarFallback className="text-xs">
                                {booking.host_profiles?.name?.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm text-gray-600">{booking.host_profiles?.name}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge
                            variant={booking.booking_status === "confirmed" ? "default" : "secondary"}
                            className="capitalize"
                          >
                            {booking.booking_status}
                          </Badge>
                          <p className="text-xl font-bold text-gray-900 mt-2">${booking.total_price}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm mb-4">
                        <div className="flex items-center text-gray-700">
                          <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                          {new Date(booking.booking_date).toLocaleDateString()}
                        </div>
                        <div className="flex items-center text-gray-700">
                          <Clock className="h-4 w-4 mr-2 text-gray-500" />
                          {booking.departure_time} ({booking.experiences?.duration_display})
                        </div>
                        <div className="flex items-center text-gray-700 col-span-2">
                          <Users className="h-4 w-4 mr-2 text-gray-500" />
                          {booking.number_of_guests} guests
                        </div>
                      </div>

                      {review && (
                        <div className="bg-gray-50 rounded-lg p-3 mb-3 border border-gray-100">
                          <div className="flex items-center mb-2">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < review.rating ? "text-yellow-400 fill-current" : "text-gray-300"
                                }`}
                              />
                            ))}
                            <span className="text-sm font-semibold ml-2 text-gray-800">{review.title}</span>
                          </div>
                          <p className="text-sm text-gray-700 line-clamp-2">"{review.comment}"</p>
                        </div>
                      )}

                      <div className="flex flex-wrap gap-2 mt-2">
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
                <img
                  src={item.image || "/placeholder.svg"}
                  alt={item.title}
                  className="w-full h-52 object-cover rounded-t-lg"
                />
                <div className="absolute top-3 right-3">
                  <Button size="icon" variant="secondary" className="bg-white/90 hover:bg-white shadow-md rounded-full">
                    <Heart className="h-5 w-5 text-red-500 fill-current" />
                  </Button>
                </div>
                {item.priceAlert && (
                  <div className="absolute top-3 left-3">
                    <Badge variant="destructive" className="text-xs px-2 py-1">
                      Price Alert
                    </Badge>
                  </div>
                )}
                {item.available && (
                  <div className="absolute top-3 left-3">
                    <Badge variant="default" className="text-xs px-2 py-1 bg-green-500 hover:bg-green-600">
                      Available
                    </Badge>
                  </div>
                )}
              </div>
              <CardContent className="p-5">
                <h3 className="font-bold text-lg text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-600 flex items-center mb-3">
                  <MapPin className="h-4 w-4 mr-1 text-gray-500" />
                  {item.location}
                </p>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                    <span className="text-base font-medium">{item.rating}</span>
                  </div>
                  <span className="text-xl font-bold">${item.price}</span>
                </div>
                <Button asChild className="w-full" size="default">
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
          <CardContent className="p-6 space-y-6">
            <div className="flex items-center space-x-6">
              <Avatar className="w-24 h-24 border-2 border-gray-200">
                <AvatarImage src={userProfile?.avatar_url || "/placeholder.svg"} />
                <AvatarFallback className="text-2xl font-semibold bg-gray-100 text-gray-700">
                  {userProfile?.first_name?.charAt(0) || userEmail.charAt(0)}
                  {userProfile?.last_name?.charAt(0) || userEmail.charAt(1)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  {userProfile?.first_name} {userProfile?.last_name}
                </h3>
                <p className="text-gray-600 text-sm mb-2">{userProfile?.email || userEmail}</p>
                <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                  {mockCustomerData.membershipLevel} Member
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                  First Name
                </label>
                <input
                  id="firstName"
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  defaultValue={userProfile?.first_name || ""}
                />
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name
                </label>
                <input
                  id="lastName"
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  defaultValue={userProfile?.last_name || ""}
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                defaultValue={userProfile?.email || userEmail}
                disabled // Email is often not directly editable here
              />
            </div>

            <Button onClick={() => console.log("Save Changes clicked")}>Save Changes</Button>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Account Stats</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="flex justify-between items-center py-1">
                <span className="text-gray-600 text-sm">Total Spent</span>
                <span className="font-semibold text-gray-900 text-base">
                  ${mockCustomerData.totalSpent.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-gray-600 text-sm">Total Bookings</span>
                <span className="font-semibold text-gray-900 text-base">{mockCustomerData.totalBookings}</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-gray-600 text-sm">Member Since</span>
                <span className="font-semibold text-gray-900 text-base">
                  {userProfile?.created_at ? new Date(userProfile.created_at).getFullYear() : "N/A"}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Preferences</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div>
                <label htmlFor="difficultyLevel" className="block text-sm font-medium text-gray-700 mb-1">
                  Difficulty Level
                </label>
                <select
                  id="difficultyLevel"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate" selected>
                    Intermediate
                  </option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
              <div>
                <label htmlFor="groupSize" className="block text-sm font-medium text-gray-700 mb-1">
                  Preferred Group Size
                </label>
                <select
                  id="groupSize"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="solo">Solo</option>
                  <option value="small" selected>
                    Small (2-6 people)
                  </option>
                  <option value="large">Large (7+ people)</option>
                </select>
              </div>
              <Button variant="outline" className="w-full" onClick={() => console.log("Update Preferences clicked")}>
                Update Preferences
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

// Settings/Payment Tab Component
const SettingsTab = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Settings & Payment</h2>

      <Card>
        <CardHeader>
          <CardTitle>Account Settings</CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <Button asChild variant="outline">
              <Link href="/forgot-password">Change Password</Link>
            </Button>
          </div>
          <div>
            <label htmlFor="email-notifications" className="block text-sm font-medium text-gray-700 mb-2">
              Email Notifications
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="email-notifications"
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="email-notifications" className="text-sm text-gray-700">
                Receive email updates
              </label>
            </div>
          </div>
          <Button variant="destructive" onClick={() => console.log("Delete Account clicked")}>
            Delete Account
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Payment Methods</CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <p className="text-gray-600 text-sm">No payment methods on file. Add one to simplify future bookings.</p>
          <Button onClick={() => console.log("Add Payment Method clicked")}>
            <Plus className="h-4 w-4 mr-2" />
            Add Payment Method
          </Button>
          <div className="border-t border-gray-200 pt-6 mt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Billing History</h3>
            <p className="text-gray-600 text-sm mb-4">
              No billing history available yet. Your transactions will appear here.
            </p>
            <Button variant="outline" className="w-full" onClick={() => console.log("View All Transactions clicked")}>
              View All Transactions
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Main Customer Dashboard Component
export default function CustomerDashboard() {
  const [activeTab, setActiveTab] = useState("overview")
  const { user, userProfile, isLoading } = useAuth()
  const router = useRouter()
  const [dashboardData, setDashboardData] = useState<{
    user: UserProfile | null
    bookings: Booking[]
    reviews: Review[]
  } | null>(null)
  const [dataLoading, setDataLoading] = useState(true)

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
    }
  }, [isLoading, user, router])

  useEffect(() => {
    const fetchData = async () => {
      if (user?.id) {
        setDataLoading(true)
        const { success, data } = await getUserDashboardData(user.id)
        if (success && data) {
          setDashboardData(data)
        } else {
          // If user profile is not found in DB, use the basic user object from auth
          setDashboardData({ user: userProfile, bookings: [], reviews: [] })
        }
        setDataLoading(false)
      }
    }
    if (!isLoading && user) {
      fetchData()
    }
  }, [isLoading, user, userProfile])

  if (isLoading || dataLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // If user is authenticated but userProfile is null (not found in DB),
  // we still render the dashboard but pass the basic user.email as a fallback.
  // The individual tabs will handle displaying placeholders.
  if (!user) {
    return null // Should be redirected by CustomerLayout
  }

  const renderTabContent = () => {
    // Ensure dashboardData is not null before accessing its properties
    const currentDashboardData = dashboardData || { user: userProfile, bookings: [], reviews: [] }

    switch (activeTab) {
      case "overview":
        return (
          <OverviewTab
            userProfile={currentDashboardData.user}
            bookings={currentDashboardData.bookings}
            reviews={currentDashboardData.reviews}
            userEmail={user.email || "Guest"} // Pass user email as fallback
          />
        )
      case "bookings":
        return <BookingsTab bookings={currentDashboardData.bookings} reviews={currentDashboardData.reviews} />
      case "wishlist":
        return <WishlistTab />
      case "profile":
        return <ProfileTab userProfile={currentDashboardData.user} userEmail={user.email || "Guest"} /> // Pass user email as fallback
      case "settings":
        return <SettingsTab />
      default:
        return (
          <OverviewTab
            userProfile={currentDashboardData.user}
            bookings={currentDashboardData.bookings}
            reviews={currentDashboardData.reviews}
            userEmail={user.email || "Guest"} // Pass user email as fallback
          />
        )
    }
  }

  const handleSignOut = async () => {
    await signOutAndRedirect("customer")
  }

  const navigationItems = [
    { id: "overview", name: "Overview", icon: Compass },
    { id: "bookings", name: "My Bookings", icon: Calendar },
    { id: "wishlist", name: "Wishlist", icon: Heart },
    { id: "profile", name: "Profile", icon: User },
    { id: "settings", name: "Settings & Payment", icon: CreditCard },
  ]

  return (
    <CustomerLayout>
      <SidebarProvider defaultOpen={true}>
        <Sidebar className="hidden md:flex" collapsible="icon">
          <SidebarHeader>
            <div className="flex items-center justify-center p-2">
              <Anchor className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900 group-data-[state=collapsed]:hidden">SeaFable</span>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Navigation</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navigationItems.map((item) => (
                    <SidebarMenuItem key={item.id}>
                      <SidebarMenuButton
                        onClick={() => setActiveTab(item.id)}
                        isActive={activeTab === item.id}
                        tooltip={item.name}
                      >
                        <item.icon />
                        <span>{item.name}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={handleSignOut}>
                  <LogOut />
                  <span>Sign Out</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
          <SidebarRail />
        </Sidebar>

        <div className="flex-1 flex flex-col">
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 md:hidden">
            <SidebarTrigger className="-ml-1" />
            <h1 className="text-xl font-bold text-gray-900">
              {navigationItems.find((item) => item.id === activeTab)?.name}
            </h1>
          </header>
          <div className="flex-1 p-4 sm:p-6 overflow-auto">{renderTabContent()}</div>
        </div>
      </SidebarProvider>
    </CustomerLayout>
  )
}
