"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Search, MapPin, CalendarIcon, Star, Clock, Waves, Ship, Compass, Zap, Shield, Globe, ChevronRight, Play, Award, Anchor, Users } from "lucide-react"
import { DatePicker } from "@/components/ui/date-picker"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"

export default function LandingPage() {
  const router = useRouter()
  const [searchData, setSearchData] = useState<{
    service: string;
    location: string;
    date: string;
  }>({
    service: "",
    location: "",
    date: "", // Let user select date manually
  })
  const [errors, setErrors] = useState<{[key: string]: string}>({})
  const [isSearching, setIsSearching] = useState(false)

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
    }

    setIsSearching(false)
  }

  // Handle popular search suggestion clicks
  const handlePopularSearchClick = (activity: string, location: string) => {
    setSearchData({ 
      service: activity, 
      location: location, 
      date: searchData.date 
    })
    // Clear any existing errors
    setErrors({})
  }

  // Handle activity card clicks
  const handleActivityClick = (activityName: string) => {
    const params = new URLSearchParams()
    params.set("service", activityName)
    router.push(`/search?${params.toString()}`)
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
            <Button variant="outline" className="border-white hover:bg-white hover:text-teal-600 text-white bg-transparent" asChild>
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
              Dive into your next
              <span className="block bg-gradient-to-r from-cyan-300 to-emerald-300 bg-clip-text text-transparent">
                Sea Adventure
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-12 max-w-3xl mx-auto">
              Book amazing sailing, diving, kitesurfing, surfing, kayaking, and paddleboarding experiences worldwide
            </p>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="bg-white rounded-2xl p-6 shadow-2xl max-w-5xl mx-auto mb-16">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="relative md:col-span-2">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Select 
                    value={searchData.service} 
                    onValueChange={(value) => {
                      setSearchData(prev => ({ ...prev, service: value }))
                      if (errors.service) setErrors({ ...errors, service: "" })
                    }}
                  >
                    <SelectTrigger className={`w-full pl-12 pr-4 py-4 h-auto border rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none text-gray-700 ${
                      errors.service ? "border-red-500" : "border-gray-200"
                    }`}>
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
                  <DatePicker
                    date={searchData.date ? new Date(searchData.date + 'T00:00:00') : undefined}
                    onDateChange={(selectedDate: Date | undefined) => {
                      setSearchData({ ...searchData, date: selectedDate ? selectedDate.toISOString().split('T')[0] : '' })
                    }}
                    placeholder="When?"
                    className="w-full"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isSearching}
                  className="bg-teal-600 text-white px-8 py-4 h-auto rounded-xl hover:bg-teal-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {isSearching ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    </div>
                  ) : (
                    "Search Adventures"
                  )}
                </Button>
              </div>

              {/* Popular Search Suggestions */}
              <div className="mt-4 md:mt-6">
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
                      className="px-3 py-2 bg-gray-100 hover:bg-blue-50 hover:text-blue-700 text-gray-700 rounded-lg text-sm font-medium transition-all duration-200 border border-gray-200 hover:border-blue-200"
                    >
                      {suggestion.activity} in {suggestion.location}
                    </button>
                  ))}
                </div>
              </div>
            </form>

            {/* Popular Activities */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6 mb-20">
              {activities.map((activity, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl p-4 md:p-6 text-center group cursor-pointer border border-gray-100 hover:border-blue-200 hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                  onClick={() => handleActivityClick(activity.name)}
                >
                  <div className="text-3xl md:text-4xl mb-3 md:mb-4 group-hover:scale-110 transition-transform duration-200">
                    {activity.icon}
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2 text-sm md:text-base">{activity.name}</h3>
                  <p className="text-xs md:text-sm text-gray-600 font-medium">{activity.count}</p>
                </div>
              ))}
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

      {/* Featured Experiences */}
      <section id="featured-experiences" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Featured Adventures</h2>
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
              className="bg-teal-600 text-white px-8 py-4 rounded-xl hover:bg-teal-700 transition-colors font-semibold"
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Verified Businesses</h3>
              <p className="text-gray-600 text-sm">All hosts are verified businesses with proper certifications</p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Globe className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Insurance Included</h3>
              <p className="text-gray-600 text-sm">All experiences come with comprehensive insurance coverage</p>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Award className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Perfect Match</h3>
              <p className="text-gray-600 text-sm">Join thousands who have discovered their perfect water experience</p>
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
              className="bg-teal-600 text-white px-8 py-4 rounded-xl hover:bg-teal-700 transition-colors font-semibold"
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
            Join thousands of adventurers who have discovered their perfect water adventure
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-white text-teal-600 px-8 py-4 rounded-xl hover:bg-gray-100 transition-colors font-semibold"
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
              className="border-2 border-white text-white px-8 py-4 rounded-xl hover:bg-white hover:text-teal-600 transition-colors font-semibold"
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