"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  Calendar,
  MapPin,
  Star,
  Users,
  Clock,
  Heart,
  Camera,
  Award,
  Compass,
  Ship,
  Anchor,
  Bell,
  Settings,
  User,
  Edit,
  Eye,
  Search,
  Plus,
  MessageSquare,
  Target,
  Sun,
  Bookmark,
  Share2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { useAuth } from "@/lib/auth-context"

// Mock customer data
const mockCustomerData = {
  user: {
    id: "user_123",
    firstName: "Emma",
    lastName: "Wilson",
    email: "emma.wilson@email.com",
    avatarUrl: "/placeholder.svg?height=150&width=150",
    joinDate: "2023-05-15",
    membershipLevel: "Explorer",
    totalSpent: 2850,
    totalBookings: 8,
    favoriteActivities: ["Sailing", "Diving", "Kayaking"],
    preferences: {
      difficulty: "intermediate",
      groupSize: "small",
      timeOfDay: "sunset",
    },
  },
  stats: {
    totalAdventures: 8,
    destinationsVisited: 5,
    favoriteHosts: 3,
    averageRating: 4.7,
    upcomingBookings: 2,
    completedBookings: 6,
  },
  upcomingBookings: [
    {
      id: "booking_001",
      experienceTitle: "Sunset Sailing Adventure",
      host: "Captain Maria Rodriguez",
      hostAvatar: "/placeholder.svg?height=50&width=50",
      date: "2025-01-22",
      time: "18:00",
      duration: "3 hours",
      location: "San Francisco Bay",
      guests: 2,
      totalPrice: 189,
      status: "confirmed",
      weatherForecast: {
        condition: "sunny",
        temp: 68,
        windSpeed: 12,
      },
      image: "/placeholder.svg?height=200&width=300",
    },
    {
      id: "booking_002",
      experienceTitle: "Morning Kayak Exploration",
      host: "Sarah Thompson",
      hostAvatar: "/placeholder.svg?height=50&width=50",
      date: "2025-01-25",
      time: "09:00",
      duration: "4 hours",
      location: "Monterey Bay",
      guests: 1,
      totalPrice: 125,
      status: "pending",
      weatherForecast: {
        condition: "partly_cloudy",
        temp: 62,
        windSpeed: 8,
      },
      image: "/placeholder.svg?height=200&width=300",
    },
  ],
  recentBookings: [
    {
      id: "booking_003",
      experienceTitle: "Deep Sea Fishing Adventure",
      host: "Captain Mike Chen",
      date: "2025-01-10",
      location: "Half Moon Bay",
      rating: 5,
      status: "completed",
      image: "/placeholder.svg?height=200&width=300",
      review: "Amazing experience! Caught a 20lb salmon and learned so much from Captain Mike.",
    },
    {
      id: "booking_004",
      experienceTitle: "Scuba Diving Certification",
      host: "Ocean Dive Academy",
      date: "2025-01-05",
      location: "Catalina Island",
      rating: 5,
      status: "completed",
      image: "/placeholder.svg?height=200&width=300",
      review: "Professional instructors and incredible underwater visibility. Highly recommend!",
    },
  ],
  recommendations: [
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
      image: "/placeholder.svg?height=200&width=300",
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
      image: "/placeholder.svg?height=200&width=300",
      matchReason: "Popular in your area",
      isNew: true,
    },
  ],
  wishlist: [
    {
      id: "wish_001",
      title: "Luxury Yacht Charter",
      location: "Miami Beach",
      price: 1200,
      rating: 4.9,
      image: "/placeholder.svg?height=200&width=300",
      priceAlert: true,
    },
    {
      id: "wish_002",
      title: "Surfing Lessons Hawaii",
      location: "Waikiki Beach",
      price: 150,
      rating: 4.7,
      image: "/placeholder.svg?height=200&width=300",
      available: true,
    },
  ],
  achievements: [
    { name: "First Adventure", icon: "🏆", earned: true, date: "2023-05-20" },
    { name: "Ocean Explorer", icon: "🌊", earned: true, date: "2023-08-15" },
    { name: "Review Master", icon: "⭐", earned: true, date: "2023-12-01" },
    { name: "Safety First", icon: "🛡️", earned: false, progress: 75 },
    { name: "Global Traveler", icon: "🌍", earned: false, progress: 60 },
  ],
}

// Navigation Component
const DashboardNav = ({ activeTab, setActiveTab }: { activeTab: string; setActiveTab: (tab: string) => void }) => {
  const navigation = [
    { id: "overview", name: "Overview", icon: Compass },
    { id: "bookings", name: "My Bookings", icon: Calendar },
    { id: "wishlist", name: "Wishlist", icon: Heart },
    { id: "profile", name: "Profile", icon: User },
  ]

  return (
    <nav className="space-y-1">
      {navigation.map((item) => (
        <button
          key={item.id}
          onClick={() => setActiveTab(item.id)}
          className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
            activeTab === item.id ? "bg-blue-100 text-blue-700" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
          }`}
        >
          <item.icon className="mr-3 h-5 w-5" />
          {item.name}
        </button>
      ))}
    </nav>
  )
}

// Overview Tab Component
const OverviewTab = () => {
  const stats = [
    {
      name: "Total Adventures",
      value: mockCustomerData.stats.totalAdventures,
      icon: Ship,
      color: "text-blue-600",
      bg: "bg-blue-100",
    },
    {
      name: "Destinations",
      value: mockCustomerData.stats.destinationsVisited,
      icon: MapPin,
      color: "text-green-600",
      bg: "bg-green-100",
    },
    {
      name: "Favorite Hosts",
      value: mockCustomerData.stats.favoriteHosts,
      icon: Users,
      color: "text-purple-600",
      bg: "bg-purple-100",
    },
    {
      name: "Avg Rating",
      value: mockCustomerData.stats.averageRating,
      icon: Star,
      color: "text-yellow-600",
      bg: "bg-yellow-100",
    },
  ]

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <Card className="bg-gradient-to-r from-blue-600 to-teal-600 text-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">Welcome back, {mockCustomerData.user.firstName}! 🌊</h2>
              <p className="text-blue-100 mb-4">
                Ready for your next adventure? You have {mockCustomerData.stats.upcomingBookings} upcoming experiences.
              </p>
              <div className="flex items-center space-x-4 text-sm">
                <Badge variant="secondary" className="bg-white/20 text-white">
                  {mockCustomerData.user.membershipLevel} Member
                </Badge>
                <span className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  Member since {new Date(mockCustomerData.user.joinDate).getFullYear()}
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
                <Button variant="outline" size="sm">
                  <Calendar className="h-4 w-4 mr-2" />
                  View Calendar
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {mockCustomerData.upcomingBookings.map((booking) => (
                  <div key={booking.id} className="border rounded-lg p-4">
                    <div className="flex space-x-4">
                      <img
                        src={booking.image || "/placeholder.svg"}
                        alt={booking.experienceTitle}
                        className="w-24 h-24 rounded-lg object-cover"
                      />
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="font-semibold text-gray-900">{booking.experienceTitle}</h4>
                            <p className="text-sm text-gray-600 flex items-center">
                              <MapPin className="h-3 w-3 mr-1" />
                              {booking.location}
                            </p>
                          </div>
                          <Badge variant={booking.status === "confirmed" ? "default" : "secondary"}>
                            {booking.status}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                          <div className="flex items-center text-gray-600">
                            <Calendar className="h-4 w-4 mr-2" />
                            {booking.date}
                          </div>
                          <div className="flex items-center text-gray-600">
                            <Clock className="h-4 w-4 mr-2" />
                            {booking.time}
                          </div>
                          <div className="flex items-center text-gray-600">
                            <Users className="h-4 w-4 mr-2" />
                            {booking.guests} guests
                          </div>
                          <div className="flex items-center text-gray-600">
                            <Sun className="h-4 w-4 mr-2" />
                            {booking.weatherForecast.temp}°F
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Avatar className="w-6 h-6">
                              <AvatarImage src={booking.hostAvatar || "/placeholder.svg"} />
                              <AvatarFallback>{booking.host.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <span className="text-sm text-gray-600">{booking.host}</span>
                          </div>
                          <div className="flex space-x-2">
                            <Button size="sm" variant="outline">
                              <MessageSquare className="h-4 w-4 mr-1" />
                              Contact
                            </Button>
                            <Button size="sm">View Details</Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
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
                {mockCustomerData.recommendations.slice(0, 2).map((rec) => (
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
              <Button className="w-full mt-4" size="sm">
                <Search className="h-4 w-4 mr-2" />
                Explore More
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
                {mockCustomerData.achievements.map((achievement, index) => (
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
const BookingsTab = () => {
  const [filter, setFilter] = useState("all")

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

      {/* Upcoming Bookings */}
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Adventures</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockCustomerData.upcomingBookings.map((booking) => (
              <div key={booking.id} className="border rounded-lg p-4">
                <div className="flex space-x-4">
                  <img
                    src={booking.image || "/placeholder.svg"}
                    alt={booking.experienceTitle}
                    className="w-32 h-24 rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">{booking.experienceTitle}</h4>
                        <p className="text-sm text-gray-600 flex items-center mb-1">
                          <MapPin className="h-3 w-3 mr-1" />
                          {booking.location}
                        </p>
                        <div className="flex items-center space-x-2">
                          <Avatar className="w-5 h-5">
                            <AvatarImage src={booking.hostAvatar || "/placeholder.svg"} />
                            <AvatarFallback>{booking.host.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <span className="text-sm text-gray-600">{booking.host}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={booking.status === "confirmed" ? "default" : "secondary"}>
                          {booking.status}
                        </Badge>
                        <p className="text-lg font-bold text-gray-900 mt-2">${booking.totalPrice}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 text-sm mb-4">
                      <div className="flex items-center text-gray-600">
                        <Calendar className="h-4 w-4 mr-2" />
                        {booking.date}
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Clock className="h-4 w-4 mr-2" />
                        {booking.time} ({booking.duration})
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Users className="h-4 w-4 mr-2" />
                        {booking.guests} guests
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline">
                        <MessageSquare className="h-4 w-4 mr-1" />
                        Message Host
                      </Button>
                      <Button size="sm" variant="outline">
                        <Edit className="h-4 w-4 mr-1" />
                        Modify
                      </Button>
                      <Button size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        View Details
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Bookings */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Adventures</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockCustomerData.recentBookings.map((booking) => (
              <div key={booking.id} className="border rounded-lg p-4">
                <div className="flex space-x-4">
                  <img
                    src={booking.image || "/placeholder.svg"}
                    alt={booking.experienceTitle}
                    className="w-24 h-24 rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-semibold text-gray-900">{booking.experienceTitle}</h4>
                        <p className="text-sm text-gray-600 flex items-center">
                          <MapPin className="h-3 w-3 mr-1" />
                          {booking.location} • {booking.date}
                        </p>
                        <p className="text-sm text-gray-600">Hosted by {booking.host}</p>
                      </div>
                      <div className="text-right">
                        <Badge variant="default">Completed</Badge>
                        <div className="flex items-center mt-2">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < booking.rating ? "text-yellow-400 fill-current" : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>

                    {booking.review && (
                      <div className="bg-gray-50 rounded p-3 mb-3">
                        <p className="text-sm text-gray-700">"{booking.review}"</p>
                      </div>
                    )}

                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline">
                        <Camera className="h-4 w-4 mr-1" />
                        View Photos
                      </Button>
                      <Button size="sm" variant="outline">
                        <Share2 className="h-4 w-4 mr-1" />
                        Share
                      </Button>
                      <Button size="sm" variant="outline">
                        <Bookmark className="h-4 w-4 mr-1" />
                        Book Again
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Wishlist Tab Component
const WishlistTab = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">My Wishlist</h2>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Experience
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockCustomerData.wishlist.map((item) => (
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
              <Button className="w-full mt-3" size="sm">
                View Details
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

// Profile Tab Component
const ProfileTab = () => {
  const { user } = useAuth()

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
                <AvatarImage src={mockCustomerData.user.avatarUrl || "/placeholder.svg"} />
                <AvatarFallback>
                  {mockCustomerData.user.firstName.charAt(0)}
                  {mockCustomerData.user.lastName.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-lg font-semibold">
                  {mockCustomerData.user.firstName} {mockCustomerData.user.lastName}
                </h3>
                <p className="text-gray-600">{mockCustomerData.user.email}</p>
                <Badge variant="secondary">{mockCustomerData.user.membershipLevel} Member</Badge>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  defaultValue={mockCustomerData.user.firstName}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  defaultValue={mockCustomerData.user.lastName}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                defaultValue={mockCustomerData.user.email}
              />
            </div>

            <Button>Save Changes</Button>
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
                <span className="font-semibold">${mockCustomerData.user.totalSpent.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Bookings</span>
                <span className="font-semibold">{mockCustomerData.user.totalBookings}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Member Since</span>
                <span className="font-semibold">{new Date(mockCustomerData.user.joinDate).getFullYear()}</span>
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
                    Small (2-6 people)
                  </option>
                  <option value="large">Large (7+ people)</option>
                </select>
              </div>
              <Button variant="outline" className="w-full">
                Update Preferences
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

// Main Customer Dashboard Component
export default function CustomerDashboard() {
  const [activeTab, setActiveTab] = useState("overview")
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login")
    }
  }, [isAuthenticated, router])

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case "overview":
        return <OverviewTab />
      case "bookings":
        return <BookingsTab />
      case "wishlist":
        return <WishlistTab />
      case "profile":
        return <ProfileTab />
      default:
        return <OverviewTab />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Anchor className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">SeaFable</span>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon">
                <Bell className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon">
                <Settings className="h-5 w-5" />
              </Button>
              <Avatar>
                <AvatarImage src={user?.avatarUrl || "/placeholder.svg"} />
                <AvatarFallback>
                  {user?.firstName?.charAt(0)}
                  {user?.lastName?.charAt(0)}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex space-x-8">
          {/* Sidebar */}
          <div className="w-64 flex-shrink-0">
            <Card>
              <CardContent className="p-4">
                <DashboardNav activeTab={activeTab} setActiveTab={setActiveTab} />
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="flex-1">{renderTabContent()}</div>
        </div>
      </div>
    </div>
  )
}
