"use client"

import { useState, useCallback, useMemo } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
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
  Users,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"

// Memoized components to prevent unnecessary re-renders
const StatItem = ({ value, label }: { value: string; label: string }) => (
  <div className="transform hover:scale-105 transition-transform duration-300">
    <div className="text-3xl md:text-4xl font-bold">{value}</div>
    <div className="text-blue-200 text-sm sm:text-base">{label}</div>
  </div>
)

const ActivityCard = ({ activity, index }: { activity: any; index: number }) => (
  <div
    key={index}
    className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg card-hover cursor-pointer group flex flex-col items-center text-center"
  >
    <div className="text-4xl sm:text-5xl mb-3 sm:mb-4 group-hover:scale-110 smooth-transition">
      {activity.icon}
    </div>
    <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-1">{activity.name}</h3>
    <p className="text-gray-600 text-xs sm:text-sm">{activity.count}</p>
  </div>
)

const ExperienceCard = ({ experience }: { experience: any }) => (
  <Link href={`/experience/${experience.id}`} key={experience.id} className="group">
    <Card className="rounded-2xl shadow-lg overflow-hidden card-hover focus-within:ring-2 focus-within:ring-teal-500 focus-within:ring-offset-2">
      <div className="aspect-[4/3] bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden relative">
        <Image
          src={experience.image}
          alt={experience.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          priority={false}
        />
      </div>
      <CardContent className="p-5 lg:p-6 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-lg lg:text-xl font-bold text-gray-900 line-clamp-2 group-hover:text-teal-600 smooth-transition">
            {experience.title}
          </h3>
          <div className="flex items-center space-x-1 flex-shrink-0">
            <Star className="h-4 w-4 text-yellow-400 fill-current" />
            <span className="text-sm font-medium">{experience.rating}</span>
          </div>
        </div>

        <p className="text-gray-600 flex items-center text-sm">
          <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
          <span className="truncate">{experience.location}</span>
        </p>

        <div className="flex items-center justify-between text-sm text-gray-500 pt-2 border-t border-gray-100">
          <span className="truncate">By {experience.host}</span>
          <span className="flex items-center flex-shrink-0">
            <Clock className="h-4 w-4 mr-1" />
            {experience.duration}
          </span>
        </div>

        <div className="flex items-center justify-between pt-2">
          <div className="flex flex-col">
            <span className="text-2xl font-bold text-gray-900">${experience.price}</span>
            <span className="text-xs text-gray-500">per person</span>
          </div>
          <span className="text-sm text-gray-500 bg-gray-50 px-2 py-1 rounded">
            {experience.reviews} reviews
          </span>
        </div>
      </CardContent>
    </Card>
  </Link>
)

export default function LandingPage() {
  const router = useRouter()
  const [searchData, setSearchData] = useState({
    service: "",
    location: "",
    date: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSearching, setIsSearching] = useState(false)

  const validateSearch = useCallback(() => {
    const newErrors: Record<string, string> = {}
    if (!searchData.service.trim()) newErrors.service = "Please select an activity"
    if (!searchData.location.trim()) newErrors.location = "Please enter a location"
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [searchData])

  const handleSearch = useCallback(async () => {
    if (!validateSearch()) return

    setIsSearching(true)
    
    try {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 800))

      const params = new URLSearchParams()
      if (searchData.service) params.set("service", searchData.service)
      if (searchData.location) params.set("location", searchData.location)
      if (searchData.date) params.set("date", searchData.date)

      router.push(`/search?${params.toString()}`)
    } catch (error) {
      console.error("Search error:", error)
    } finally {
      setIsSearching(false)
    }
  }, [validateSearch, searchData, router])

  const updateSearchField = useCallback((field: string, value: string) => {
    setSearchData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }))
    }
  }, [errors])

  // Memoize static data to prevent unnecessary re-renders
  const activities = useMemo(() => [
    { name: "Sailing", icon: "⛵", count: "2,400+ experiences" },
    { name: "Surfing", icon: "🏄", count: "1,800+ experiences" },
    { name: "Diving", icon: "🤿", count: "1,200+ experiences" },
    { name: "Kayaking", icon: "🚣", count: "3,100+ experiences" },
    { name: "Fishing", icon: "🎣", count: "900+ experiences" },
    { name: "Yacht Charter", icon: "🛥️", count: "600+ experiences" },
  ], [])

  const featuredExperiences = useMemo(() => [
    {
      id: 1,
      title: "Luxury Sunset Sailing",
      location: "San Francisco Bay",
      price: 89,
      rating: 4.9,
      reviews: 324,
      host: "Captain Maria",
      duration: "3 hours",
      image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=300&fit=crop",
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
      image: "https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=400&h=300&fit=crop",
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
      image: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=400&h=300&fit=crop",
    },
  ], [])

  const stats = useMemo(() => [
    { value: "12,000+", label: "Experiences" },
    { value: "5,000+", label: "Expert Hosts" },
    { value: "50+", label: "Destinations" },
    { value: "4.9★", label: "Average Rating" },
  ], [])

  return (
    <main className="flex-1">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 via-teal-500 to-emerald-500 overflow-hidden min-h-screen flex items-center py-20 sm:py-24 lg:py-32">
        {/* Background decorative elements */}
        <div className="absolute inset-0 opacity-10" aria-hidden="true">
          <Waves className="absolute top-20 left-10 h-32 w-32 text-white/20 animate-pulse" />
          <Ship className="absolute top-40 right-20 h-24 w-24 text-white/20 animate-bounce" />
          <Compass
            className="absolute bottom-20 left-20 h-28 w-28 text-white/20 animate-spin"
            style={{ animationDuration: "10s" }}
          />
        </div>

        <div className="relative max-w-7xl mx-auto container-padding text-center">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight text-balance">
            Dive into
            <span className="block bg-gradient-to-r from-cyan-300 to-emerald-300 bg-clip-text text-transparent">
              Adventure
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-blue-100 mb-12 max-w-3xl mx-auto text-balance">
            Connect with experienced captains, instructors, and guides for unforgettable water adventures worldwide
          </p>

          {/* Search Bar */}
          <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-2xl max-w-6xl mx-auto mb-16">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
              {/* Service Input - Takes 2 columns on larger screens */}
              <div className="lg:col-span-2 xl:col-span-2 space-y-1">
                <label htmlFor="service" className="sr-only">
                  What water adventure?
                </label>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="service"
                    type="text"
                    placeholder="What water adventure?"
                    value={searchData.service}
                    onChange={(e) => updateSearchField("service", e.target.value)}
                    className={`w-full pl-12 pr-4 py-3 h-12 border rounded-xl focus-ring smooth-transition ${
                      errors.service ? "border-red-500 ring-1 ring-red-500" : "border-gray-200"
                    }`}
                    aria-describedby={errors.service ? "service-error" : undefined}
                  />
                </div>
                {errors.service && (
                  <p id="service-error" className="text-red-500 text-xs mt-1 text-left" role="alert">
                    {errors.service}
                  </p>
                )}
              </div>

              {/* Location Input */}
              <div className="space-y-1">
                <label htmlFor="location" className="sr-only">
                  Where?
                </label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="location"
                    type="text"
                    placeholder="Where?"
                    value={searchData.location}
                    onChange={(e) => updateSearchField("location", e.target.value)}
                    className={`w-full pl-12 pr-4 py-3 h-12 border rounded-xl focus-ring smooth-transition ${
                      errors.location ? "border-red-500 ring-1 ring-red-500" : "border-gray-200"
                    }`}
                    aria-describedby={errors.location ? "location-error" : undefined}
                  />
                </div>
                {errors.location && (
                  <p id="location-error" className="text-red-500 text-xs mt-1 text-left" role="alert">
                    {errors.location}
                  </p>
                )}
              </div>

              {/* Date Input */}
              <div className="space-y-1">
                <label htmlFor="date" className="sr-only">
                  When?
                </label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="date"
                    type="date"
                    value={searchData.date}
                    onChange={(e) => updateSearchField("date", e.target.value)}
                    className="w-full pl-12 pr-4 py-3 h-12 border border-gray-200 rounded-xl focus-ring smooth-transition"
                  />
                </div>
              </div>

              {/* Search Button */}
              <div className="sm:col-span-2 lg:col-span-1">
                <Button
                  onClick={handleSearch}
                  disabled={isSearching}
                  className="w-full bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 h-12 rounded-xl smooth-transition font-semibold shadow-lg hover:shadow-xl focus-ring disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSearching ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span className="sr-only">Searching...</span>
                    </div>
                  ) : (
                    "Search"
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-white">
            {stats.map((stat, index) => (
              <StatItem key={index} value={stat.value} label={stat.label} />
            ))}
          </div>
        </div>
      </section>

      {/* Activity Categories */}
      <section className="section-spacing bg-gray-50">
        <div className="max-w-7xl mx-auto container-padding">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Explore by Activity</h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
              Choose your adventure from our wide range of water activities
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
            {activities.map((activity, index) => (
              <ActivityCard key={activity.name} activity={activity} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* Featured Experiences */}
      <section id="featured-experiences" className="section-spacing">
        <div className="max-w-7xl mx-auto container-padding">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Featured Experiences</h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
              Handpicked adventures from our top-rated hosts
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {featuredExperiences.map((experience) => (
              <ExperienceCard key={experience.id} experience={experience} />
            ))}
          </div>

          <div className="text-center mt-12">
            <Button
              size="lg"
              className="bg-black text-white px-8 py-4 rounded-xl hover:bg-gray-800 smooth-transition font-semibold"
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
      <section className="section-spacing bg-gray-50">
        <div className="max-w-7xl mx-auto container-padding">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Safety First</h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
              Your safety and satisfaction are our top priorities
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center card-hover p-6 rounded-2xl bg-white shadow-lg">
              <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2 text-lg">Verified Hosts</h3>
              <p className="text-gray-600 text-sm">All hosts are background checked and certified</p>
            </div>
            <div className="text-center card-hover p-6 rounded-2xl bg-white shadow-lg">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Zap className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2 text-lg">Instant Booking</h3>
              <p className="text-gray-600 text-sm">Secure, fast bookings with instant confirmation</p>
            </div>
            <div className="text-center card-hover p-6 rounded-2xl bg-white shadow-lg">
              <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Globe className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2 text-lg">Global Coverage</h3>
              <p className="text-gray-600 text-sm">Experiences available in 50+ destinations worldwide</p>
            </div>
            <div className="text-center card-hover p-6 rounded-2xl bg-white shadow-lg">
              <div className="bg-orange-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Award className="h-8 w-8 text-orange-600" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2 text-lg">Quality Guarantee</h3>
              <p className="text-gray-600 text-sm">100% satisfaction guarantee or your money back</p>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="section-spacing">
        <div className="max-w-7xl mx-auto container-padding">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">About SeaFable</h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto text-balance">
              SeaFable is dedicated to connecting adventurers with unique and unforgettable water experiences worldwide.
              Our platform ensures safety, quality, and seamless booking for every journey.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="space-y-6">
              <h3 className="text-2xl sm:text-3xl font-bold text-gray-900">Our Mission</h3>
              <p className="text-base sm:text-lg text-gray-700">
                To empower individuals to explore the world's waters responsibly and joyfully, by providing access to a
                diverse range of high-quality, safe, and sustainable marine adventures.
              </p>
              <p className="text-base sm:text-lg text-gray-700">
                We believe in fostering a community of passionate hosts and curious travelers, creating memories that
                last a lifetime while respecting our oceans.
              </p>
            </div>
            <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden shadow-xl">
              <div className="w-full h-full bg-gradient-to-br from-blue-100 to-teal-100 flex items-center justify-center">
                <Waves className="h-24 w-24 text-teal-400" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Business Section */}
      <section id="business-section" className="section-spacing bg-gray-50">
        <div className="max-w-7xl mx-auto container-padding">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">For Businesses & Hosts</h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto text-balance">
              Expand your reach and grow your water adventure business with SeaFable.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 text-center">
            <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg card-hover">
              <Users className="h-10 w-10 sm:h-12 sm:w-12 text-teal-600 mx-auto mb-4 sm:mb-6" />
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">Reach More Customers</h3>
              <p className="text-gray-600 text-sm">
                Access a global audience of adventure seekers looking for unique water experiences.
              </p>
            </div>
            <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg card-hover">
              <Zap className="h-10 w-10 sm:h-12 sm:w-12 text-teal-600 mx-auto mb-4 sm:mb-6" />
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">Streamlined Management</h3>
              <p className="text-gray-600 text-sm">
                Effortlessly manage bookings, availability, and payments through our intuitive dashboard.
              </p>
            </div>
            <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg card-hover">
              <Award className="h-10 w-10 sm:h-12 sm:w-12 text-teal-600 mx-auto mb-4 sm:mb-6" />
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">Build Your Brand</h3>
              <p className="text-gray-600 text-sm">
                Showcase your expertise and build a trusted reputation within the SeaFable community.
              </p>
            </div>
          </div>
          <div className="text-center mt-12">
            <Button
              size="lg"
              className="bg-black text-white px-8 py-4 rounded-xl hover:bg-gray-800 smooth-transition font-semibold"
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
      <section className="bg-gradient-to-r from-blue-600 via-teal-500 to-emerald-500 section-spacing">
        <div className="max-w-4xl mx-auto text-center container-padding">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6 text-balance">Ready to Make Waves?</h2>
          <p className="text-lg sm:text-xl text-blue-100 mb-8 text-balance">
            Join thousands of adventurers who have discovered their perfect water experience
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-white text-teal-600 px-8 py-4 rounded-xl hover:bg-gray-100 smooth-transition font-semibold"
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
              className="border-2 border-white px-8 py-4 rounded-xl hover:bg-white hover:text-teal-600 smooth-transition font-semibold text-white"
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
