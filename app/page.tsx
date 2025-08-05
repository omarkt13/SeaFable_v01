
"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  Search,
  MapPin,
  CalendarIcon,
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
  Menu,
  X
} from "lucide-react"
import { DatePicker } from "@/components/ui/date-picker"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"

export default function LandingPage() {
  const router = useRouter()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [searchData, setSearchData] = useState<{
    service: string;
    location: string;
    date: string;
  }>({
    service: "",
    location: "",
    date: "",
  })
  const [errors, setErrors] = useState<{[key: string]: string}>({})
  const [isSearching, setIsSearching] = useState(false)

  // Close mobile menu when screen size changes
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false)
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isMobileMenuOpen])

  const validateSearch = () => {
    const newErrors: {[key: string]: string} = {}
    if (!searchData.service?.trim()) newErrors.service = "Please select an activity"
    if (!searchData.location?.trim()) newErrors.location = "Please enter a location"
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()

    if (!validateSearch()) return

    setIsSearching(true)

    try {
      // Simulate search delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const params = new URLSearchParams()
      if (searchData.service) params.set("service", searchData.service)
      if (searchData.location) params.set("location", searchData.location)
      if (searchData.date) params.set("date", searchData.date)

      router.push(`/search?${params.toString()}`)
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setIsSearching(false)
    }
  }

  // Handle popular search suggestion clicks
  const handlePopularSearchClick = (activity: string, location: string) => {
    setSearchData({
      service: activity,
      location: location,
      date: searchData.date
    })
    setErrors({})
  }

  // Handle activity card clicks
  const handleActivityClick = (activityName: string) => {
    const params = new URLSearchParams()
    params.set("service", activityName)
    router.push(`/search?${params.toString()}`)
  }

  // Handle keyboard navigation for activity cards
  const handleActivityKeyDown = (e: React.KeyboardEvent, activityName: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleActivityClick(activityName)
    }
  }

  const activities = [
    { name: "Sailing", icon: "⛵", count: "2,400+ experiences" },
    { name: "Diving", icon: "🤿", count: "1,200+ experiences" },
    { name: "Kitesurfing", icon: "🪁", count: "850+ experiences" },
    { name: "Surfing", icon: "🏄‍♂️", count: "1,800+ experiences" },
    { name: "Kayaking", icon: "🛶", count: "3,100+ experiences" },
    { name: "Paddleboarding", icon: "🏄‍♀️", count: "1,500+ experiences" },
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
    <main className="min-h-screen bg-white">
      {/* Navigation - Fixed z-index and mobile menu */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-blue-600/90 via-teal-500/90 to-emerald-500/90 backdrop-blur-md px-4 sm:px-6 lg:px-8 py-4 transition-all duration-300">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group" aria-label="SeaFable Home">
            <Anchor className="h-8 w-8 text-white group-hover:scale-110 transition-transform" />
            <span className="text-white text-2xl font-bold">SeaFable</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              href="/search" 
              className="text-white/90 hover:text-white transition-colors py-2 px-3 rounded-md hover:bg-white/10"
            >
              Experiences
            </Link>
            <Link 
              href="#about" 
              className="text-white/90 hover:text-white transition-colors py-2 px-3 rounded-md hover:bg-white/10"
            >
              About
            </Link>
            <Link 
              href="/business/login" 
              className="text-white/90 hover:text-white transition-colors py-2 px-3 rounded-md hover:bg-white/10"
            >
              Business
            </Link>
            <Button 
              variant="outline" 
              className="border-white hover:bg-white hover:text-teal-600 text-white bg-transparent transition-all duration-200" 
              asChild
            >
              <Link href="/login">Sign In</Link>
            </Button>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 text-white hover:bg-white/10 rounded-md transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-gradient-to-r from-blue-600 via-teal-500 to-emerald-500 border-t border-white/20 shadow-lg">
            <div className="px-4 py-6 space-y-4">
              <Link 
                href="/search" 
                className="block text-white hover:text-white/80 transition-colors py-3 border-b border-white/10"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Experiences
              </Link>
              <Link 
                href="#about" 
                className="block text-white hover:text-white/80 transition-colors py-3 border-b border-white/10"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                About
              </Link>
              <Link 
                href="/business/login" 
                className="block text-white hover:text-white/80 transition-colors py-3 border-b border-white/10"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Business
              </Link>
              <Button 
                variant="outline" 
                className="w-full border-white hover:bg-white hover:text-teal-600 text-white bg-transparent mt-4" 
                asChild
              >
                <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>Sign In</Link>
              </Button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section - Added padding-top for fixed nav */}
      <section className="relative bg-gradient-to-br from-blue-600 via-teal-500 to-emerald-500 overflow-hidden min-h-screen flex items-center pt-20">
        {/* Background decorative elements - Fixed z-index */}
        <div className="absolute inset-0 opacity-10 pointer-events-none" aria-hidden="true">
          <Waves className="absolute top-20 left-4 sm:left-10 h-24 w-24 sm:h-32 sm:w-32 text-white/20 animate-pulse" />
          <Ship className="absolute top-40 right-4 sm:right-20 h-20 w-20 sm:h-24 sm:w-24 text-white/20 animate-bounce" />
          <Compass
            className="absolute bottom-20 left-4 sm:left-20 h-24 w-24 sm:h-28 sm:w-28 text-white/20 animate-spin"
            style={{ animationDuration: "10s" }}
          />
        </div>

        <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-32 z-10">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
              Dive into your next
              <span className="block bg-gradient-to-r from-cyan-300 to-emerald-300 bg-clip-text text-transparent">
                Sea Adventure
              </span>
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl text-blue-100 mb-8 sm:mb-12 max-w-3xl mx-auto px-4">
              Book amazing sailing, diving, kitesurfing, surfing, kayaking, and paddleboarding experiences worldwide
            </p>

            {/* Search Bar - Improved mobile layout */}
            <form 
              onSubmit={handleSearch} 
              className="relative bg-white rounded-2xl p-4 sm:p-6 shadow-2xl max-w-5xl mx-auto mb-12 sm:mb-16"
              role="search"
              aria-label="Search for water adventures"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {/* Activity Selection */}
                <div className="relative sm:col-span-2 lg:col-span-2">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" aria-hidden="true" />
                  <Select 
                    value={searchData.service} 
                    onValueChange={(value) => {
                      setSearchData(prev => ({ ...prev, service: value }))
                      if (errors.service) setErrors({ ...errors, service: "" })
                    }}
                  >
                    <SelectTrigger 
                      className={`w-full pl-12 pr-4 py-3 sm:py-4 h-auto border rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none text-gray-700 ${
                        errors.service ? "border-red-500" : "border-gray-200"
                      }`}
                      aria-label="Select water adventure activity"
                    >
                      <SelectValue placeholder="What water adventure?" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Sailing">Sailing</SelectItem>
                      <SelectItem value="Boat Rental">Boat Rental</SelectItem>
                      <SelectItem value="Fishing Charter">Fishing Charter</SelectItem>
                      <SelectItem value="Kayaking">Kayaking</SelectItem>
                      <SelectItem value="Yacht Charter">Yacht Charter</SelectItem>
                      <SelectItem value="Jet Ski Rental">Jet Ski Rental</SelectItem>
                      <SelectItem value="Scuba Diving">Scuba Diving</SelectItem>
                      <SelectItem value="Snorkeling">Snorkeling</SelectItem>
                      <SelectItem value="Paddleboard">Paddleboard</SelectItem>
                      <SelectItem value="Water Sports">Water Sports</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.service && (
                    <p className="text-red-500 text-xs mt-1" role="alert" aria-live="polite">
                      {errors.service}
                    </p>
                  )}
                </div>

                {/* Location Input */}
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" aria-hidden="true" />
                  <Input
                    type="text"
                    placeholder="Where?"
                    value={searchData.location}
                    onChange={(e) => {
                      setSearchData({ ...searchData, location: e.target.value })
                      if (errors.location) setErrors({ ...errors, location: "" })
                    }}
                    className={`w-full pl-12 pr-4 py-3 sm:py-4 h-auto border rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none text-gray-700 placeholder-gray-400 ${
                      errors.location ? "border-red-500" : "border-gray-200"
                    }`}
                    aria-label="Enter location"
                  />
                  {errors.location && (
                    <p className="text-red-500 text-xs mt-1" role="alert" aria-live="polite">
                      {errors.location}
                    </p>
                  )}
                </div>

                {/* Date Picker */}
                <div className="relative">
                  <DatePicker
                    value={searchData.date ? new Date(searchData.date + 'T00:00:00') : null}
                    onChange={(selectedDate) => {
                      setSearchData(prev => ({ 
                        ...prev, 
                        date: selectedDate ? selectedDate.toISOString().split('T')[0] : '' 
                      }))
                      if (errors.date) setErrors({ ...errors, date: "" })
                    }}
                    placeholder="When?"
                    className="w-full"
                  />
                  {errors.date && (
                    <p className="text-red-500 text-xs mt-1" role="alert" aria-live="polite">
                      {errors.date}
                    </p>
                  )}
                </div>

                {/* Search Button */}
                <Button
                  type="submit"
                  disabled={isSearching}
                  className="bg-teal-600 text-white px-6 sm:px-8 py-3 sm:py-4 h-auto rounded-xl hover:bg-teal-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  aria-label={isSearching ? "Searching..." : "Search for adventures"}
                >
                  {isSearching ? (
                    <div className="flex items-center justify-center" aria-hidden="true">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span className="sr-only">Searching...</span>
                    </div>
                  ) : (
                    "Search Adventures"
                  )}
                </Button>
              </div>

              {/* Popular Search Suggestions - Improved mobile layout */}
              <div className="mt-4 sm:mt-6">
                <p className="text-sm text-gray-600 mb-3 font-medium">Popular searches:</p>
                <div className="flex flex-wrap gap-2">
                  {[
                    { activity: "Sailing", location: "San Francisco" },
                    { activity: "Surfing", location: "Malibu" },
                    { activity: "Kayaking", location: "Lake Tahoe" },
                    { activity: "Diving", location: "Key West" },
                    { activity: "Paddleboarding", location: "Miami" }
                  ].map((suggestion, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handlePopularSearchClick(suggestion.activity, suggestion.location)}
                      className="px-3 py-2 bg-gray-100 hover:bg-blue-50 hover:text-blue-700 text-gray-700 rounded-lg text-sm font-medium transition-all duration-200 border border-gray-200 hover:border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                      aria-label={`Search for ${suggestion.activity} in ${suggestion.location}`}
                    >
                      {suggestion.activity} in {suggestion.location}
                    </button>
                  ))}
                </div>
              </div>
            </form>

            {/* Popular Activities - Improved accessibility and mobile layout */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 md:gap-6 mb-12 sm:mb-20">
              {activities.map((activity, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl p-3 sm:p-4 md:p-6 text-center group cursor-pointer border border-gray-100 hover:border-blue-200 hover:shadow-lg transition-all duration-300 transform hover:scale-105 focus-within:scale-105 focus-within:border-blue-500 focus-within:shadow-lg"
                  onClick={() => handleActivityClick(activity.name)}
                  onKeyDown={(e) => handleActivityKeyDown(e, activity.name)}
                  tabIndex={0}
                  role="button"
                  aria-label={`Search for ${activity.name} activities - ${activity.count}`}
                >
                  <div className="text-2xl sm:text-3xl md:text-4xl mb-2 sm:mb-3 md:mb-4 group-hover:scale-110 transition-transform duration-200" aria-hidden="true">
                    {activity.icon}
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1 sm:mb-2 text-xs sm:text-sm md:text-base">{activity.name}</h3>
                  <p className="text-xs md:text-sm text-gray-600 font-medium">{activity.count}</p>
                </div>
              ))}
            </div>

            {/* Stats - Improved mobile layout */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 text-white">
              <div className="transform hover:scale-105 transition-transform">
                <div className="text-2xl sm:text-3xl md:text-4xl font-bold">12,000+</div>
                <div className="text-blue-200 text-sm sm:text-base">Experiences</div>
              </div>
              <div className="transform hover:scale-105 transition-transform">
                <div className="text-2xl sm:text-3xl md:text-4xl font-bold">5,000+</div>
                <div className="text-blue-200 text-sm sm:text-base">Expert Hosts</div>
              </div>
              <div className="transform hover:scale-105 transition-transform">
                <div className="text-2xl sm:text-3xl md:text-4xl font-bold">50+</div>
                <div className="text-blue-200 text-sm sm:text-base">Destinations</div>
              </div>
              <div className="transform hover:scale-105 transition-transform">
                <div className="text-2xl sm:text-3xl md:text-4xl font-bold">4.9★</div>
                <div className="text-blue-200 text-sm sm:text-base">Average Rating</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Experiences - Improved accessibility */}
      <section id="featured-experiences" className="py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Featured Adventures</h2>
            <p className="text-lg sm:text-xl text-gray-600">Handpicked adventures from our top-rated hosts</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {featuredExperiences.map((experience) => (
              <Link 
                href={`/experience/${experience.id}`} 
                key={experience.id}
                className="group focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 rounded-2xl"
                aria-label={`View ${experience.title} experience in ${experience.location}`}
              >
                <Card className="rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group-hover:scale-105 group-focus:scale-105">
                  <div className="aspect-video bg-gray-100 overflow-hidden">
                    <img
                      src={experience.image || "/placeholder.svg"}
                      alt={`${experience.title} in ${experience.location}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  </div>
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-lg sm:text-xl font-bold text-gray-900 group-hover:text-teal-600 transition-colors">
                        {experience.title}
                      </h3>
                      <div className="flex items-center space-x-1 flex-shrink-0 ml-2">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" aria-hidden="true" />
                        <span className="text-sm font-medium">{experience.rating}</span>
                      </div>
                    </div>
                    <p className="text-gray-600 mb-2 flex items-center">
                      <MapPin className="h-4 w-4 mr-1 flex-shrink-0" aria-hidden="true" />
                      {experience.location}
                    </p>
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <span>By {experience.host}</span>
                      <span className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" aria-hidden="true" />
                        {experience.duration}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xl sm:text-2xl font-bold text-gray-900">${experience.price}</span>
                      <span className="text-sm text-gray-500">({experience.reviews} reviews)</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          <div className="text-center mt-8 sm:mt-12">
            <Button
              size="lg"
              className="bg-teal-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl hover:bg-teal-700 transition-colors font-semibold"
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

      {/* Trust & Safety - Improved mobile layout */}
      <section className="py-16 sm:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Safety First</h2>
            <p className="text-lg sm:text-xl text-gray-600">Your safety and satisfaction are our top priorities</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            <div className="text-center">
              <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-green-600" aria-hidden="true" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Verified Businesses</h3>
              <p className="text-gray-600 text-sm">All hosts are verified businesses with proper certifications</p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Globe className="h-8 w-8 text-blue-600" aria-hidden="true" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Insurance Included</h3>
              <p className="text-gray-600 text-sm">All experiences come with comprehensive insurance coverage</p>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Award className="h-8 w-8 text-purple-600" aria-hidden="true" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Perfect Match</h3>
              <p className="text-gray-600 text-sm">Join thousands who have discovered their perfect water experience</p>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">About SeaFable</h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
              SeaFable is dedicated to connecting adventurers with unique and unforgettable water experiences
              worldwide. Our platform ensures safety, quality, and seamless booking for every journey.
            </p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 items-center">
            <div className="space-y-4 sm:space-y-6">
              <h3 className="text-2xl sm:text-3xl font-bold text-gray-900">Our Mission</h3>
              <p className="text-base sm:text-lg text-gray-700">
                To empower individuals to explore the world's waters responsibly and joyfully, by providing access to
                a diverse range of high-quality, safe, and sustainable marine adventures.
              </p>
              <p className="text-base sm:text-lg text-gray-700">
                We believe in fostering a community of passionate hosts and curious travelers, creating memories that
                last a lifetime while respecting our oceans.
              </p>
            </div>
            <div className="relative w-full h-64 sm:h-80 rounded-2xl overflow-hidden shadow-xl">
              <img
                src="/placeholder.svg?height=400&width=600&text=Our Mission"
                alt="Our Mission"
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Business Section */}
      <section id="business-section" className="py-16 sm:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">For Businesses & Hosts</h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
              Expand your reach and grow your water adventure business with SeaFable.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 text-center">
            <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
              <Users className="h-10 sm:h-12 w-10 sm:w-12 text-teal-600 mx-auto mb-4 sm:mb-6" />
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">Reach More Customers</h3>
              <p className="text-gray-600 text-sm sm:text-base">
                Access a global audience of adventure seekers looking for unique water experiences.
              </p>
            </div>
            <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
              <Zap className="h-10 sm:h-12 w-10 sm:w-12 text-teal-600 mx-auto mb-4 sm:mb-6" />
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">Streamlined Management</h3>
              <p className="text-gray-600 text-sm sm:text-base">
                Effortlessly manage bookings, availability, and payments through our intuitive dashboard.
              </p>
            </div>
            <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
              <Award className="h-10 sm:h-12 w-10 sm:w-12 text-teal-600 mx-auto mb-4 sm:mb-6" />
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">Build Your Brand</h3>
              <p className="text-gray-600 text-sm sm:text-base">
                Showcase your expertise and build a trusted reputation within the SeaFable community.
              </p>
            </div>
          </div>
          <div className="text-center mt-8 sm:mt-12">
            <Button
              size="lg"
              className="bg-teal-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl hover:bg-teal-700 transition-colors font-semibold"
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
      <section className="bg-gradient-to-r from-blue-600 via-teal-500 to-emerald-500 py-16 sm:py-20">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 sm:mb-6">Ready to Make Waves?</h2>
          <p className="text-lg sm:text-xl text-blue-100 mb-6 sm:mb-8">
            Join thousands of adventurers who have discovered their perfect water adventure
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-white text-teal-600 px-6 sm:px-8 py-3 sm:py-4 rounded-xl hover:bg-gray-100 transition-colors font-semibold"
              asChild
            >
              <Link href="/search">
                Start Exploring
                <ChevronRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-2 border-white text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl hover:bg-white hover:text-teal-600 transition-colors font-semibold"
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
  )
}
