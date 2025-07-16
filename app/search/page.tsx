"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Search, MapPin, Calendar, Filter, Star, Heart, Clock, Users, Euro, Sailboat, ChevronDown, SlidersHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"

// Mock data for experiences
const mockExperiences = [
  {
    id: 1,
    title: "Sunset Sailing Adventure in Santorini",
    host: "Captain Maria's Sailing",
    location: "Santorini, Greece",
    activityType: "Sailing",
    price: 85,
    duration: "3 hours",
    rating: 4.8,
    reviews: 124,
    image: "/placeholder.jpg",
    description: "Experience the magic of a Santorini sunset from the sea",
    highlights: ["Professional captain", "Drinks included", "Swimming stops"],
    maxGuests: 8
  },
  {
    id: 2,
    title: "Scuba Diving Discovery in Crystal Waters",
    host: "Deep Blue Diving Center",
    location: "Mallorca, Spain",
    activityType: "Diving",
    price: 120,
    duration: "4 hours",
    rating: 4.9,
    reviews: 89,
    image: "/placeholder.jpg",
    description: "Discover the underwater world with certified instructors",
    highlights: ["Equipment included", "Certified instructors", "Underwater photos"],
    maxGuests: 6
  },
  {
    id: 3,
    title: "Kitesurfing Lesson for Beginners",
    host: "Wind & Waves School",
    location: "Tarifa, Spain",
    activityType: "Kitesurfing",
    price: 95,
    duration: "2 hours",
    rating: 4.7,
    reviews: 67,
    image: "/placeholder.jpg",
    description: "Learn kitesurfing from professional instructors",
    highlights: ["Equipment included", "Safety briefing", "Progress guarantee"],
    maxGuests: 4
  },
  {
    id: 4,
    title: "Surfing Adventure for All Levels",
    host: "Atlantic Surf School",
    location: "Ericeira, Portugal",
    activityType: "Surfing",
    price: 65,
    duration: "2.5 hours",
    rating: 4.6,
    reviews: 156,
    image: "/placeholder.jpg",
    description: "Catch waves at one of Europe's best surf spots",
    highlights: ["Wetsuit included", "All levels welcome", "Video analysis"],
    maxGuests: 10
  },
  {
    id: 5,
    title: "Sea Kayaking Through Hidden Coves",
    host: "Coastal Adventures",
    location: "Costa Brava, Spain",
    activityType: "Kayaking",
    price: 55,
    duration: "3 hours",
    rating: 4.5,
    reviews: 92,
    image: "/placeholder.jpg",
    description: "Explore hidden coves and crystal-clear waters",
    highlights: ["Scenic route", "Snorkeling gear", "Local guide"],
    maxGuests: 12
  },
  {
    id: 6,
    title: "Stand-Up Paddleboarding Tour",
    host: "SUP Adventures",
    location: "Nice, France",
    activityType: "Paddleboarding",
    price: 45,
    duration: "2 hours",
    rating: 4.4,
    reviews: 78,
    image: "/placeholder.jpg",
    description: "Perfect introduction to stand-up paddleboarding",
    highlights: ["Beginner friendly", "Equipment included", "Scenic coastline"],
    maxGuests: 8
  }
]

const activityTypes = ["Sailing", "Diving", "Kitesurfing", "Surfing", "Kayaking", "Paddleboarding"]

function SearchResultsContent() {
  const searchParams = useSearchParams()
  const [experiences, setExperiences] = useState(mockExperiences)
  const [filteredExperiences, setFilteredExperiences] = useState(mockExperiences)
  const [searchQuery, setSearchQuery] = useState(searchParams.get('what') || '')
  const [location, setLocation] = useState(searchParams.get('where') || '')
  const [date, setDate] = useState(searchParams.get('when') || '')
  const [showFilters, setShowFilters] = useState(false)

  // Filter states
  const [selectedActivityTypes, setSelectedActivityTypes] = useState<string[]>([])
  const [priceRange, setPriceRange] = useState([0, 200])
  const [sortBy, setSortBy] = useState('relevance')
  const [minRating, setMinRating] = useState(0)

  // Initialize filters from URL parameters
  useEffect(() => {
    const whatParam = searchParams.get('what')
    if (whatParam) {
      // Map search query to activity type if it matches
      const matchingActivity = activityTypes.find(type => 
        type.toLowerCase() === whatParam.toLowerCase()
      )
      if (matchingActivity) {
        setSelectedActivityTypes([matchingActivity])
      }
    }
  }, [searchParams])

  // Apply filters
  useEffect(() => {
    let filtered = experiences

    // Filter by activity type
    if (selectedActivityTypes.length > 0) {
      filtered = filtered.filter(exp => selectedActivityTypes.includes(exp.activityType))
    }

    // Filter by price range
    filtered = filtered.filter(exp => exp.price >= priceRange[0] && exp.price <= priceRange[1])

    // Filter by rating
    filtered = filtered.filter(exp => exp.rating >= minRating)

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(exp => 
        exp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        exp.activityType.toLowerCase().includes(searchQuery.toLowerCase()) ||
        exp.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Filter by location
    if (location) {
      filtered = filtered.filter(exp => 
        exp.location.toLowerCase().includes(location.toLowerCase())
      )
    }

    // Sort results
    switch (sortBy) {
      case 'price_low':
        filtered.sort((a, b) => a.price - b.price)
        break
      case 'price_high':
        filtered.sort((a, b) => b.price - a.price)
        break
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating)
        break
      case 'reviews':
        filtered.sort((a, b) => b.reviews - a.reviews)
        break
      default:
        // Keep original order for relevance
        break
    }

    setFilteredExperiences(filtered)
  }, [experiences, selectedActivityTypes, priceRange, sortBy, minRating, searchQuery, location])

  const handleActivityTypeChange = (activityType: string, checked: boolean) => {
    if (checked) {
      setSelectedActivityTypes([...selectedActivityTypes, activityType])
    } else {
      setSelectedActivityTypes(selectedActivityTypes.filter(type => type !== activityType))
    }
  }

  const FilterSidebar = () => (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold text-gray-900 mb-3">Activity Type</h3>
        <div className="space-y-2">
          {activityTypes.map(type => (
            <div key={type} className="flex items-center space-x-2">
              <Checkbox
                id={type}
                checked={selectedActivityTypes.includes(type)}
                onCheckedChange={(checked) => handleActivityTypeChange(type, checked as boolean)}
              />
              <label htmlFor={type} className="text-sm text-gray-700 cursor-pointer">
                {type}
              </label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-semibold text-gray-900 mb-3">Price Range</h3>
        <div className="px-2">
          <Slider
            value={priceRange}
            onValueChange={setPriceRange}
            max={200}
            min={0}
            step={5}
            className="w-full"
          />
          <div className="flex justify-between text-sm text-gray-600 mt-2">
            <span>€{priceRange[0]}</span>
            <span>€{priceRange[1]}</span>
          </div>
        </div>
      </div>

      <div>
        <h3 className="font-semibold text-gray-900 mb-3">Minimum Rating</h3>
        <div className="space-y-2">
          {[4.5, 4.0, 3.5, 0].map(rating => (
            <div key={rating} className="flex items-center space-x-2">
              <input
                type="radio"
                id={`rating-${rating}`}
                name="rating"
                checked={minRating === rating}
                onChange={() => setMinRating(rating)}
                className="text-blue-600"
              />
              <label htmlFor={`rating-${rating}`} className="text-sm text-gray-700 cursor-pointer flex items-center">
                {rating > 0 ? (
                  <>
                    <Star className="w-4 h-4 text-yellow-400 mr-1" />
                    {rating}+
                  </>
                ) : (
                  'Any rating'
                )}
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

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
        {/* Search Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                placeholder="What water adventure?"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12 border-gray-300 focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Where?"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="pl-10 h-12 border-gray-300 focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="relative">
              <Calendar className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="pl-10 h-12 border-gray-300 focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <Button className="h-12 bg-blue-600 hover:bg-blue-700">
              Update Search
            </Button>
          </div>
        </div>

        {/* Results Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {searchQuery ? `"${searchQuery}"` : selectedActivityTypes.length > 0 ? selectedActivityTypes.join(', ') : 'Water Adventures'} - {filteredExperiences.length} results found
            </h1>
            {location && (
              <p className="text-gray-600 mt-1">in {location}</p>
            )}
            {selectedActivityTypes.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {selectedActivityTypes.map(type => (
                  <Badge key={type} variant="secondary" className="bg-blue-100 text-blue-700">
                    {type}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center space-x-4">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="relevance">Most Relevant</SelectItem>
                <SelectItem value="price_low">Price: Low to High</SelectItem>
                <SelectItem value="price_high">Price: High to Low</SelectItem>
                <SelectItem value="rating">Highest Rated</SelectItem>
                <SelectItem value="reviews">Most Reviews</SelectItem>
              </SelectContent>
            </Select>

            {/* Mobile Filter Button */}
            <Sheet open={showFilters} onOpenChange={setShowFilters}>
              <SheetTrigger asChild>
                <Button variant="outline" className="md:hidden">
                  <SlidersHorizontal className="w-4 h-4 mr-2" />
                  Filters
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Filters</SheetTitle>
                </SheetHeader>
                <div className="mt-6">
                  <FilterSidebar />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Desktop Filter Sidebar */}
          <div className="hidden lg:block">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Filters</h2>
              <FilterSidebar />
            </div>
          </div>

          {/* Results Grid */}
          <div className="lg:col-span-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredExperiences.map((experience) => (
                <Card key={experience.id} className="hover:shadow-lg transition-shadow overflow-hidden">
                  <div className="relative">
                    <img
                      src={experience.image}
                      alt={experience.title}
                      className="w-full h-48 object-cover"
                    />
                    <Badge className="absolute top-3 left-3 bg-blue-600 text-white">
                      {experience.activityType}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute top-3 right-3 bg-white/80 hover:bg-white"
                    >
                      <Heart className="w-4 h-4" />
                    </Button>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-2">
                      {experience.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">{experience.host}</p>
                    <div className="flex items-center text-sm text-gray-600 mb-2">
                      <MapPin className="w-4 h-4 mr-1" />
                      {experience.location}
                    </div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-yellow-400 mr-1" />
                        <span className="text-sm font-medium">{experience.rating}</span>
                        <span className="text-sm text-gray-500 ml-1">({experience.reviews} reviews)</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Clock className="w-4 h-4 mr-1" />
                        {experience.duration}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-lg font-semibold text-gray-900">
                        <Euro className="w-4 h-4 mr-1" />
                        {experience.price}
                        <span className="text-sm font-normal text-gray-500 ml-1">per person</span>
                      </div>
                      <Link href={`/experience/${experience.id}`}>
                        <Button className="bg-blue-600 hover:bg-blue-700">
                          View Details
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredExperiences.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <Search className="w-12 h-12 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900">No experiences found</h3>
                  <p className="text-gray-600">Try adjusting your search or filters</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function SearchResultsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SearchResultsContent />
    </Suspense>
  )
}