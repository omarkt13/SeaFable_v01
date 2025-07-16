"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Search, MapPin, Calendar, Sailboat, Users, Shield, Globe, Target } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [location, setLocation] = useState("")
  const [date, setDate] = useState("")
  const [currentActivity, setCurrentActivity] = useState(0)
  const router = useRouter()

  const activities = [
    { name: "sailing", icon: "⛵", count: 124 },
    { name: "diving", icon: "🤿", count: 89 },
    { name: "kitesurfing", icon: "🪁", count: 67 },
    { name: "surfing", icon: "🏄‍♂️", count: 156 },
    { name: "kayaking", icon: "🛶", count: 92 },
    { name: "sea", icon: "🌊", count: 203 }
  ]

  const activityCategories = [
    { type: "Sailing", icon: "⛵", count: 124, description: "Yacht charters & sailing adventures" },
    { type: "Diving", icon: "🤿", count: 89, description: "Scuba diving & underwater exploration" },
    { type: "Kitesurfing", icon: "🪁", count: 67, description: "Kite surfing lessons & rentals" },
    { type: "Surfing", icon: "🏄‍♂️", count: 156, description: "Surf lessons & board rentals" },
    { type: "Kayaking", icon: "🛶", count: 92, description: "Kayak tours & rentals" },
    { type: "Paddleboarding", icon: "🏄‍♀️", count: 78, description: "SUP lessons & adventures" }
  ]

  const handleSearch = () => {
    const params = new URLSearchParams()
    if (searchQuery) params.append('what', searchQuery)
    if (location) params.append('where', location)
    if (date) params.append('when', date)

    router.push(`/search?${params.toString()}`)
  }

  // Dynamic activity text rotation
  const rotateActivity = () => {
    setCurrentActivity((prev) => (prev + 1) % activities.length)
  }

  // Auto-rotate activity text every 3 seconds
  useState(() => {
    const interval = setInterval(rotateActivity, 3000)
    return () => clearInterval(interval)
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Sailboat className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">SeaFable</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <Link href="/business/register" className="text-gray-700 hover:text-blue-600">Become a Host</Link>
              <Link href="/login" className="text-gray-700 hover:text-blue-600">Sign In</Link>
              <Link href="/register" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">Sign Up</Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Dive into your next{" "}
            <span className="text-blue-600 transition-all duration-500">
              {activities[currentActivity].name}
            </span>{" "}
            adventure
          </h1>
          <p className="text-xl text-gray-600 mb-12">
            Discover and book amazing water adventures with verified hosts worldwide
          </p>

          {/* Search Bar */}
          <div className="bg-white rounded-2xl shadow-xl p-6 mb-16">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="What water adventure?"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="pl-10 h-12 border-0 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Where?"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="pl-10 h-12 border-0 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <Input
                  type="date"
                  placeholder="When?"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="pl-10 h-12 border-0 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <Button
                onClick={handleSearch}
                className="h-12 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold"
              >
                Search
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Activity Categories */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Explore by Activity
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {activityCategories.map((activity, index) => (
              <Card 
                key={index} 
                className="hover:shadow-lg transition-shadow cursor-pointer group"
                onClick={() => {
                  const params = new URLSearchParams()
                  params.append('what', activity.type.toLowerCase())
                  router.push(`/search?${params.toString()}`)
                }}
              >
                <CardContent className="p-6 text-center">
                  <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">
                    {activity.icon}
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{activity.type}</h3>
                  <p className="text-sm text-gray-600 mb-2">{activity.description}</p>
                  <p className="text-xs text-blue-600 font-medium">{activity.count} experiences</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Destination Showcase Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Explore by Destination
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { name: "Santorini, Greece", image: "/placeholder.jpg", count: 45, description: "Stunning sunsets and crystal waters" },
              { name: "Mallorca, Spain", image: "/placeholder.jpg", count: 38, description: "Perfect Mediterranean adventures" },
              { name: "Costa Brava, Spain", image: "/placeholder.jpg", count: 29, description: "Hidden coves and rugged coastline" },
              { name: "Algarve, Portugal", image: "/placeholder.jpg", count: 52, description: "Golden beaches and dramatic cliffs" }
            ].map((destination, index) => (
              <Card 
                key={index} 
                className="hover:shadow-lg transition-shadow cursor-pointer group overflow-hidden"
                onClick={() => {
                  const params = new URLSearchParams()
                  params.append('where', destination.name)
                  router.push(`/search?${params.toString()}`)
                }}
              >
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={destination.image} 
                    alt={destination.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-30 group-hover:bg-opacity-20 transition-all"></div>
                  <div className="absolute bottom-4 left-4 text-white">
                    <h3 className="font-semibold text-lg mb-1">{destination.name}</h3>
                    <p className="text-sm opacity-90">{destination.description}</p>
                  </div>
                </div>
                <CardContent className="p-4">
                  <p className="text-sm text-blue-600 font-medium">{destination.count} experiences</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Adventures Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Featured Adventures
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                id: 1,
                title: "Sunset Sailing in Santorini",
                location: "Santorini, Greece",
                price: 85,
                rating: 4.9,
                image: "/placeholder.jpg",
                badge: "Best Seller",
                description: "Experience magical sunsets from the sea"
              },
              {
                id: 2,
                title: "Professional Diving Course",
                location: "Mallorca, Spain", 
                price: 120,
                rating: 4.8,
                image: "/placeholder.jpg",
                badge: "Certified",
                description: "Learn to dive with expert instructors"
              },
              {
                id: 3,
                title: "Kayaking Hidden Coves",
                location: "Costa Brava, Spain",
                price: 55,
                rating: 4.7,
                image: "/placeholder.jpg",
                badge: "Adventure",
                description: "Discover secret coastal spots"
              }
            ].map((experience) => (
              <Card 
                key={experience.id} 
                className="hover:shadow-lg transition-shadow cursor-pointer group overflow-hidden"
                onClick={() => router.push(`/experience/${experience.id}`)}
              >
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={experience.image} 
                    alt={experience.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 left-3">
                    <Badge className="bg-blue-600 text-white">{experience.badge}</Badge>
                  </div>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-lg text-gray-900 mb-2">{experience.title}</h3>
                  <p className="text-sm text-gray-600 mb-2 flex items-center">
                    <MapPin className="w-4 h-4 mr-1" />
                    {experience.location}
                  </p>
                  <p className="text-sm text-gray-600 mb-3">{experience.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <div key={i} className="w-4 h-4 text-yellow-400 mr-1">⭐</div>
                        ))}
                      </div>
                      <span className="text-sm font-medium ml-1">{experience.rating}</span>
                    </div>
                    <div className="text-lg font-semibold text-gray-900">
                      €{experience.price}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Trust & Safety Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Why Choose SeaFable?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-green-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Shield className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Verified Hosts</h3>
              <p className="text-gray-600">All our hosts are verified businesses with proper certifications and insurance coverage</p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Globe className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Global Coverage</h3>
              <p className="text-gray-600">Discover water adventures in amazing destinations worldwide with comprehensive insurance included</p>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Target className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Perfect Match</h3>
              <p className="text-gray-600">Join thousands who have discovered their perfect water experience through our platform</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-cyan-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            Ready for your next water adventure?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Browse thousands of verified water experiences and book instantly
          </p>
          <Button 
            onClick={() => router.push('/search')}
            className="bg-white text-blue-600 hover:bg-gray-100 font-semibold px-8 py-3 text-lg"
          >
            Start Exploring
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <Sailboat className="h-8 w-8 text-blue-400" />
                <span className="ml-2 text-xl font-bold">SeaFable</span>
              </div>
              <p className="text-gray-400">
                Your gateway to unforgettable water adventures worldwide
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Activities</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="#" className="hover:text-white">Sailing</Link></li>
                <li><Link href="#" className="hover:text-white">Diving</Link></li>
                <li><Link href="#" className="hover:text-white">Kitesurfing</Link></li>
                <li><Link href="#" className="hover:text-white">Surfing</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="#" className="hover:text-white">Help Center</Link></li>
                <li><Link href="#" className="hover:text-white">Safety</Link></li>
                <li><Link href="#" className="hover:text-white">Contact Us</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="#" className="hover:text-white">About</Link></li>
                <li><Link href="#" className="hover:text-white">Become a Host</Link></li>
                <li><Link href="#" className="hover:text-white">Careers</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2024 SeaFable. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}