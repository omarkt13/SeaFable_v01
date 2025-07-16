"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  Search,
  MapPin,
  Calendar,
  Star,
  Clock,
  Waves,
  Ship,
  Compass,
  Zap,
  Shield,
  Globe,
  ChevronRight,
  Play,
  Award,
  Anchor,
  Users,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { AuthProvider } from "@/lib/auth-context"

export default function LandingPage() {
  const router = useRouter()
  const [searchData, setSearchData] = useState({
    service: "",
    location: "",
    date: "",
  })
  const [errors, setErrors] = useState({})
  const [isSearching, setIsSearching] = useState(false)

  const validateSearch = () => {
    const newErrors = {}
    if (!searchData.service.trim()) newErrors.service = "Please select an activity"
    if (!searchData.location.trim()) newErrors.location = "Please enter a location"
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSearch = async () => {
    if (!validateSearch()) return

    setIsSearching(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const params = new URLSearchParams()
    if (searchData.service) params.set("service", searchData.service)
    if (searchData.location) params.set("location", searchData.location)
    if (searchData.date) params.set("date", searchData.date)

    router.push(`/search?${params.toString()}`)
    setIsSearching(false)
  }

  const activities = [
    { name: "Sailing", icon: "⛵", count: "2,400+ experiences" },
    { name: "Surfing", icon: "🏄", count: "1,800+ experiences" },
    { name: "Diving", icon: "🤿", count: "1,200+ experiences" },
    { name: "Kayaking", icon: "🚣", count: "3,100+ experiences" },
    { name: "Fishing", icon: "🎣", count: "900+ experiences" },
    { name: "Yacht Charter", icon: "🛥️", count: "600+ experiences" },
  ]

  const featuredExperiences = [
    {
      id: 1,
      title: "Luxury Sunset Sailing",
      location: "San Francisco Bay",
      price: 89,
      rating: 4.9,
      reviews: 324,
      host: "Captain Maria",
      duration: "3 hours",
      image: "/placeholder.svg?height=300&width=400",
    },
    {
      id: 2,
      title: "Beginner Surf Lesson",
      location: "Malibu Beach",
      price: 65,
      rating: 4.8,
      reviews: 156,
      host: "Surf Coach Jake",
      duration: "2 hours",
      image: "/placeholder.svg?height=300&width=400",
    },
    {
      id: 3,
      title: "Deep Sea Fishing",
      location: "Key West",
      price: 150,
      rating: 4.9,
      reviews: 89,
      host: "Captain Rodriguez",
      duration: "6 hours",
      image: "/placeholder.svg?height=300&width=400",
    },
  ]

  return (
    <AuthProvider>
      <main className="min-h-screen bg-white">
        {/* Navigation */}
        <nav className="absolute top-0 left-0 right-0 z-50 px-4 sm:px-6 lg:px-8 py-6">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Anchor className="h-8 w-8 text-white" />
              <span className="text-white text-2xl font-bold">SeaFable</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <Link href="/search" className="text-white/90 hover:text-white transition-colors">
                Experiences
              </Link>
              <Link href="#about" className="text-white/90 hover:text-white transition-colors">
                About
              </Link>
              <Link href="/business/login" className="text-white/90 hover:text-white transition-colors">
                Business
              </Link>
              <Button variant="outline" className="border-white hover:bg-white hover:text-teal-600 text-black" asChild>
                <Link href="/login">Sign In</Link>
              </Button>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-blue-600 via-teal-500 to-emerald-500 overflow-hidden min-h-screen flex items-center">
          {/* Background decorative elements */}
          <div className="absolute inset-0 opacity-10" aria-hidden="true">
            <Waves className="absolute top-20 left-10 h-32 w-32 text-white/20 animate-pulse" />
            <Ship className="absolute top-40 right-20 h-24 w-24 text-white/20 animate-bounce" />
            <Compass
              className="absolute bottom-20 left-20 h-28 w-28 text-white/20 animate-spin"
              style={{ animationDuration: "10s" }}
            />
          </div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
            <div className="text-center">
              <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
                Dive into
                <span className="block bg-gradient-to-r from-cyan-300 to-emerald-300 bg-clip-text text-transparent">
                  Adventure
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-blue-100 mb-12 max-w-3xl mx-auto">
                Connect with experienced captains, instructors, and guides for unforgettable water adventures worldwide
              </p>

              {/* Search Bar */}
              <div className="bg-white rounded-2xl p-6 shadow-2xl max-w-5xl mx-auto mb-16">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <div className="relative md:col-span-2">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      type="text"
                      placeholder="What water adventure?"
                      value={searchData.service}
                      onChange={(e) => {
                        setSearchData({ ...searchData, service: e.target.value })
                        if (errors.service) setErrors({ ...errors, service: "" })
                      }}
                      className={`w-full pl-12 pr-4 py-4 h-auto border rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none text-gray-700 placeholder-gray-400 ${
                        errors.service ? "border-red-500" : "border-gray-200"
                      }`}
                    />
                    {errors.service && <p className="text-red-500 text-xs mt-1">{errors.service}</p>}
                  </div>

                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      type="text"
                      placeholder="Where?"
                      value={searchData.location}
                      onChange={(e) => {
                        setSearchData({ ...searchData, location: e.target.value })
                        if (errors.location) setErrors({ ...errors, location: "" })
                      }}
                      className={`w-full pl-12 pr-4 py-4 h-auto border rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none text-gray-700 placeholder-gray-400 ${
                        errors.location ? "border-red-500" : "border-gray-200"
                      }`}
                    />
                    {errors.location && <p className="text-red-500 text-xs mt-1">{errors.location}</p>}
                  </div>

                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      type="date"
                      value={searchData.date}
                      onChange={(e) => setSearchData({ ...searchData, date: e.target.value })}
                      className="w-full pl-12 pr-4 py-4 h-auto border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none text-gray-700"
                    />
                  </div>

                  <Button
                    onClick={handleSearch}
                    disabled={isSearching}
                    className="bg-black text-white px-8 py-4 h-auto rounded-xl hover:bg-gray-800 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {isSearching ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      </div>
                    ) : (
                      "Search"
                    )}
                  </Button>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-white">
                <div className="transform hover:scale-105 transition-transform">
                  <div className="text-3xl md:text-4xl font-bold">12,000+</div>
                  <div className="text-blue-200">Experiences</div>
                </div>
                <div className="transform hover:scale-105 transition-transform">
                  <div className="text-3xl md:text-4xl font-bold">5,000+</div>
                  <div className="text-blue-200">Expert Hosts</div>
                </div>
                <div className="transform hover:scale-105 transition-transform">
                  <div className="text-3xl md:text-4xl font-bold">50+</div>
                  <div className="text-blue-200">Destinations</div>
                </div>
                <div className="transform hover:scale-105 transition-transform">
                  <div className="text-3xl md:text-4xl font-bold">4.9★</div>
                  <div className="text-blue-200">Average Rating</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Activity Categories */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Explore by Activity</h2>
              <p className="text-xl text-gray-600">Choose your adventure from our wide range of water activities</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {activities.map((activity, index) => (
                <div
                  key={index}
                  className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group transform hover:-translate-y-2"
                >
                  <div className="text-5xl mb-4 text-center group-hover:scale-110 transition-transform duration-300">
                    {activity.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 text-center mb-2">{activity.name}</h3>
                  <p className="text-gray-600 text-center text-sm">{activity.count}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Experiences */}
        <section id="featured-experiences" className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Featured Experiences</h2>
              <p className="text-xl text-gray-600">Handpicked adventures from our top-rated hosts</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {featuredExperiences.map((experience) => (
                <Link href={`/experience/${experience.id}`} key={experience.id}>
                  <Card className="rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group">
                    <div className="aspect-video bg-gray-100 overflow-hidden">
                      <img
                        src={experience.image || "/placeholder.svg"}
                        alt={experience.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-xl font-bold text-gray-900">{experience.title}</h3>
                        <div className="flex items-center space-x-1">
                          <Star className="h-4 w-4 text-yellow-400 fill-current" />
                          <span className="text-sm font-medium">{experience.rating}</span>
                        </div>
                      </div>
                      <p className="text-gray-600 mb-2 flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        {experience.location}
                      </p>
                      <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                        <span>By {experience.host}</span>
                        <span className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {experience.duration}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold text-gray-900">${experience.price}</span>
                        <span className="text-sm text-gray-500">({experience.reviews} reviews)</span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>

            <div className="text-center mt-12">
              <Button
                size="lg"
                className="bg-black text-white px-8 py-4 rounded-xl hover:bg-gray-800 transition-colors font-semibold"
                asChild
              >
                <Link href="/search">
                  View All Experiences
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Trust & Safety */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Safety First</h2>
              <p className="text-xl text-gray-600">Your safety and satisfaction are our top priorities</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">Verified Hosts</h3>
                <p className="text-gray-600 text-sm">All hosts are background checked and certified</p>
              </div>
              <div className="text-center">
                <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Zap className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">Instant Booking</h3>
                <p className="text-gray-600 text-sm">Secure, fast bookings with instant confirmation</p>
              </div>
              <div className="text-center">
                <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Globe className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">Global Coverage</h3>
                <p className="text-gray-600 text-sm">Experiences available in 50+ destinations worldwide</p>
              </div>
              <div className="text-center">
                <div className="bg-orange-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Award className="h-8 w-8 text-orange-600" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">Quality Guarantee</h3>
                <p className="text-gray-600 text-sm">100% satisfaction guarantee or your money back</p>
              </div>
            </div>
          </div>
        </section>

        <section id="about" className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">About SeaFable</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                SeaFable is dedicated to connecting adventurers with unique and unforgettable water experiences
                worldwide. Our platform ensures safety, quality, and seamless booking for every journey.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <h3 className="text-3xl font-bold text-gray-900">Our Mission</h3>
                <p className="text-lg text-gray-700">
                  To empower individuals to explore the world's waters responsibly and joyfully, by providing access to
                  a diverse range of high-quality, safe, and sustainable marine adventures.
                </p>
                <p className="text-lg text-gray-700">
                  We believe in fostering a community of passionate hosts and curious travelers, creating memories that
                  last a lifetime while respecting our oceans.
                </p>
              </div>
              <div className="relative w-full h-80 rounded-2xl overflow-hidden shadow-xl">
                <img
                  src="/placeholder.svg?height=400&width=600&text=Our Mission"
                  alt="Our Mission"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        <section id="business-section" className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">For Businesses & Hosts</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Expand your reach and grow your water adventure business with SeaFable.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                <Users className="h-12 w-12 text-teal-600 mx-auto mb-6" />
                <h3 className="text-xl font-bold text-gray-900 mb-3">Reach More Customers</h3>
                <p className="text-gray-600">
                  Access a global audience of adventure seekers looking for unique water experiences.
                </p>
              </div>
              <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                <Zap className="h-12 w-12 text-teal-600 mx-auto mb-6" />
                <h3 className="text-xl font-bold text-gray-900 mb-3">Streamlined Management</h3>
                <p className="text-gray-600">
                  Effortlessly manage bookings, availability, and payments through our intuitive dashboard.
                </p>
              </div>
              <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                <Award className="h-12 w-12 text-teal-600 mx-auto mb-6" />
                <h3 className="text-xl font-bold text-gray-900 mb-3">Build Your Brand</h3>
                <p className="text-gray-600">
                  Showcase your expertise and build a trusted reputation within the SeaFable community.
                </p>
              </div>
            </div>
            <div className="text-center mt-12">
              <Button
                size="lg"
                className="bg-black text-white px-8 py-4 rounded-xl hover:bg-gray-800 transition-colors font-semibold"
                asChild
              >
                <Link href="/business/register">
                  Become a Host
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-gradient-to-r from-blue-600 via-teal-500 to-emerald-500 py-20">
          <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
            <h2 className="text-4xl font-bold text-white mb-6">Ready to Make Waves?</h2>
            <p className="text-xl text-blue-100 mb-8">
              Join thousands of adventurers who have discovered their perfect water experience
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-white text-teal-600 px-8 py-4 rounded-xl hover:bg-gray-100 transition-colors font-semibold"
              >
                Start Exploring
                <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-white px-8 py-4 rounded-xl hover:bg-white hover:text-teal-600 transition-colors font-semibold text-black"
                asChild
              >
                <Link href="/demo">
                  <Play className="mr-2 h-5 w-5" />
                  Watch Demo
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
    </AuthProvider>
  )
}
