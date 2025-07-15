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
  ChevronRight,
  Play,
  Award,
  Anchor,
  Users,
  Fish,
  Camera,
  Eye,
  Wind,
  TrendingUp,
  Heart,
  ArrowRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
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
    {
      name: "Sailing",
      icon: Anchor,
      description: "Yacht charters, sailing lessons, and racing",
      image: "https://images.unsplash.com/photo-1547036967-23d11aacaee0?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
      color: "from-blue-600 to-blue-700",
      count: "2,400+ experiences",
    },
    {
      name: "Surfing",
      icon: Waves,
      description: "Surf lessons, guided tours, and coaching",
      image:
        "https://images.unsplash.com/photo-1502680390469-be75c86b636f?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
      color: "from-cyan-600 to-cyan-700",
      count: "1,800+ experiences",
    },
    {
      name: "Diving",
      icon: Camera,
      description: "Scuba diving and underwater exploration",
      image: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
      color: "from-emerald-600 to-emerald-700",
      count: "1,200+ experiences",
    },
    {
      name: "Kayaking",
      icon: Ship,
      description: "Sea kayaking and wildlife tours",
      image:
        "https://images.unsplash.com/photo-1516906736502-8bd121a3e0df?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
      color: "from-teal-600 to-teal-700",
      count: "3,100+ experiences",
    },
    {
      name: "Fishing",
      icon: Fish,
      description: "Deep sea fishing and charters",
      image: "https://images.unsplash.com/photo-1545450660-60e60cabcb2f?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
      color: "from-orange-600 to-orange-700",
      count: "900+ experiences",
    },
    {
      name: "Jet Skiing",
      icon: Zap,
      description: "High-speed water adventures",
      image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
      color: "from-purple-600 to-purple-700",
      count: "600+ experiences",
    },
    {
      name: "Whale Watching",
      icon: Eye,
      description: "Marine wildlife observation",
      image: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
      color: "from-indigo-600 to-indigo-700",
      count: "800+ experiences",
    },
    {
      name: "Windsurfing",
      icon: Wind,
      description: "Wind-powered water sports",
      image: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
      color: "from-pink-600 to-pink-700",
      count: "750+ experiences",
    },
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
      activity_type: "sailing",
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
      activity_type: "surfing",
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
      activity_type: "fishing",
    },
  ]

  const stats = [
    {
      icon: Users,
      value: "100K+",
      label: "Happy Customers",
      description: "Adventurers who've found their perfect experience",
    },
    {
      icon: MapPin,
      value: "50+",
      label: "Global Destinations",
      description: "From tropical islands to coastal cities",
    },
    {
      icon: Star,
      value: "4.9",
      label: "Average Rating",
      description: "Consistently excellent experiences",
    },
    {
      icon: Award,
      value: "99%",
      label: "Verified Hosts",
      description: "Background checked and certified",
    },
    {
      icon: TrendingUp,
      value: "10K+",
      label: "Experiences Available",
      description: "From beginner to expert level",
    },
    {
      icon: Shield,
      value: "24/7",
      label: "Safety Support",
      description: "Always here when you need us",
    },
  ]

  return (
    <AuthProvider>
      <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50">
        {/* Enhanced Navigation */}
        <nav className="absolute top-0 left-0 right-0 z-50 px-4 sm:px-6 lg:px-8 py-6">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg">
                <Anchor className="h-6 w-6 text-white" />
              </div>
              <span className="text-white text-2xl font-bold">SeaFable</span>
              <Badge variant="secondary" className="text-xs bg-white/20 text-white border-white/30">
                v2.0
              </Badge>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <Link href="/search" className="text-white/90 hover:text-white transition-colors font-medium">
                Experiences
              </Link>
              <Link href="#about" className="text-white/90 hover:text-white transition-colors font-medium">
                About
              </Link>
              <Link href="/business/login" className="text-white/90 hover:text-white transition-colors font-medium">
                Business
              </Link>
              <Button
                variant="outline"
                className="border-white/30 bg-white/10 backdrop-blur-sm hover:bg-white hover:text-teal-600 text-white font-medium"
                asChild
              >
                <Link href="/login">Sign In</Link>
              </Button>
            </div>
          </div>
        </nav>

        {/* Enhanced Hero Section */}
        <section className="relative bg-gradient-to-br from-blue-900/95 via-cyan-900/90 to-blue-800/95 overflow-hidden min-h-screen flex items-center">
          {/* Background Image */}
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1544551763-46a013bb70d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')`,
            }}
          />

          {/* Animated water effect */}
          <div className="absolute inset-0 opacity-30">
            <svg className="w-full h-full" viewBox="0 0 1200 800" preserveAspectRatio="none">
              <path
                d="M0,300 C300,250 600,350 900,300 C1050,275 1150,325 1200,300 L1200,800 L0,800 Z"
                fill="url(#wave-gradient)"
                className="animate-pulse"
              />
              <defs>
                <linearGradient id="wave-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="rgba(59, 130, 246, 0.3)" />
                  <stop offset="50%" stopColor="rgba(6, 182, 212, 0.3)" />
                  <stop offset="100%" stopColor="rgba(59, 130, 246, 0.3)" />
                </linearGradient>
              </defs>
            </svg>
          </div>

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
                Discover Your Next
                <span className="block bg-gradient-to-r from-cyan-300 via-blue-300 to-emerald-300 bg-clip-text text-transparent">
                  Water Adventure
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-blue-100 mb-12 max-w-3xl mx-auto">
                Connect with certified hosts for unforgettable sailing, surfing, diving, and water sports experiences
                worldwide
              </p>

              {/* Enhanced Search Bar */}
              <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-2xl max-w-5xl mx-auto mb-16">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <div className="relative md:col-span-2">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      type="text"
                      placeholder="What water adventure are you looking for?"
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
                    className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-8 py-4 h-auto rounded-xl transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {isSearching ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      </div>
                    ) : (
                      <>
                        <Search className="w-5 h-5 mr-2" />
                        Search
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Enhanced Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-white">
                <div className="transform hover:scale-105 transition-transform duration-300">
                  <div className="text-3xl md:text-4xl font-bold">12,000+</div>
                  <div className="text-blue-200">Experiences</div>
                </div>
                <div className="transform hover:scale-105 transition-transform duration-300">
                  <div className="text-3xl md:text-4xl font-bold">5,000+</div>
                  <div className="text-blue-200">Expert Hosts</div>
                </div>
                <div className="transform hover:scale-105 transition-transform duration-300">
                  <div className="text-3xl md:text-4xl font-bold">50+</div>
                  <div className="text-blue-200">Destinations</div>
                </div>
                <div className="transform hover:scale-105 transition-transform duration-300">
                  <div className="text-3xl md:text-4xl font-bold">4.9★</div>
                  <div className="text-blue-200">Average Rating</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Enhanced Activity Categories */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Choose Your Adventure</h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                From sailing to surfing, diving to fishing - discover the perfect water activity for your next adventure
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {activities.map((activity, index) => (
                <Link href={`/search?activity=${activity.name.toLowerCase()}`} key={index} className="group">
                  <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer">
                    <div className="relative h-48">
                      <img
                        src={activity.image || "/placeholder.svg"}
                        alt={activity.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div
                        className={`absolute inset-0 bg-gradient-to-t ${activity.color} opacity-80 group-hover:opacity-70 transition-opacity duration-300`}
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center text-white">
                          <activity.icon className="w-12 h-12 mx-auto mb-2" />
                          <h3 className="text-xl font-bold">{activity.name}</h3>
                        </div>
                      </div>
                    </div>
                    <CardContent className="p-6">
                      <p className="text-gray-600 text-sm mb-2">{activity.description}</p>
                      <p className="text-blue-600 font-medium text-sm">{activity.count}</p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Enhanced Featured Experiences */}
        <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Featured Experiences</h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Handpicked adventures from our top-rated hosts around the world
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {featuredExperiences.map((experience) => (
                <Link href={`/experience/${experience.id}`} key={experience.id}>
                  <Card className="rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group">
                    <div className="relative aspect-video bg-gray-100 overflow-hidden">
                      <img
                        src={experience.image || "/placeholder.svg"}
                        alt={experience.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-4 right-4">
                        <Button size="icon" variant="ghost" className="bg-white/80 hover:bg-white">
                          <Heart className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="absolute bottom-4 left-4">
                        <Badge className="bg-white/90 text-gray-900 hover:bg-white capitalize">
                          {experience.activity_type?.replace("-", " ")}
                        </Badge>
                      </div>
                    </div>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                          {experience.title}
                        </h3>
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
                        <div>
                          <span className="text-2xl font-bold text-gray-900">${experience.price}</span>
                          <span className="text-gray-600"> per person</span>
                        </div>
                        <Button className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700">
                          View Details
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>

            <div className="text-center mt-12">
              <Button
                size="lg"
                variant="outline"
                className="border-blue-600 text-blue-600 hover:bg-blue-50 font-semibold bg-transparent"
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

        {/* Enhanced Stats Section */}
        <section className="py-20 bg-gradient-to-br from-blue-50 to-cyan-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Choose SeaFable?</h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Join the world's most trusted platform for water adventures
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center group">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <stat.icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                  <div className="text-xl font-semibold text-gray-900 mb-2">{stat.label}</div>
                  <p className="text-gray-600">{stat.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Enhanced Trust & Safety */}
        <section className="py-20 bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-600">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-white mb-4">Your Safety is Our Priority</h2>
              <p className="text-xl text-blue-100 max-w-3xl mx-auto">
                All hosts are verified, insured, and committed to providing safe, memorable experiences
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center group">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">Verified Hosts</h3>
                <p className="text-blue-100">Background checked and certified professionals</p>
              </div>

              <div className="text-center group">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Award className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">Safety Standards</h3>
                <p className="text-blue-100">Rigorous safety protocols and equipment standards</p>
              </div>

              <div className="text-center group">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <TrendingUp className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">24/7 Support</h3>
                <p className="text-blue-100">Round-the-clock customer support for peace of mind</p>
              </div>
            </div>
          </div>
        </section>

        {/* Enhanced About Section */}
        <section id="about" className="py-20 bg-white">
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

        {/* Enhanced Business Section */}
        <section id="business-section" className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">For Businesses & Hosts</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Expand your reach and grow your water adventure business with SeaFable.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 group">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Reach More Customers</h3>
                <p className="text-gray-600">
                  Access a global audience of adventure seekers looking for unique water experiences.
                </p>
              </div>
              <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 group">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Zap className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Streamlined Management</h3>
                <p className="text-gray-600">
                  Effortlessly manage bookings, availability, and payments through our intuitive dashboard.
                </p>
              </div>
              <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 group">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Award className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Build Your Brand</h3>
                <p className="text-gray-600">
                  Showcase your expertise and build a trusted reputation within the SeaFable community.
                </p>
              </div>
            </div>
            <div className="text-center mt-12">
              <Button
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 font-semibold"
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

        {/* Enhanced CTA Section */}
        <section className="bg-gradient-to-r from-blue-600 via-cyan-500 to-emerald-500 py-20">
          <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
            <h2 className="text-4xl font-bold text-white mb-6">Ready to Make Waves?</h2>
            <p className="text-xl text-blue-100 mb-8">
              Join thousands of adventurers who have discovered their perfect water experience
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-white text-teal-600 px-8 py-4 rounded-xl hover:bg-gray-100 transition-colors font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
                onClick={handleSearch}
              >
                <Search className="w-5 h-5 mr-2" />
                Start Exploring
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-white px-8 py-4 rounded-xl hover:bg-white hover:text-teal-600 transition-colors font-semibold text-white shadow-lg hover:shadow-xl transform hover:scale-105 bg-transparent"
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
