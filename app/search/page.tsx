"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { useSearchParams } from "next/navigation"
import {
  Search,
  MapPin,
  Calendar,
  Users,
  Star,
  Clock,
  SlidersHorizontal,
  Heart,
  Share2,
  Eye,
  X,
  Map,
  List,
  Grid3X3,
  Anchor,
  Award,
  Zap,
  RefreshCw,
  MessageCircle,
  ShieldCheck,
  FilterX,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/lib/auth-context"
import { getExperiences, type Experience } from "@/lib/database"
import Link from "next/link"
import { ErrorBoundary } from "@/components/error-boundary"

// Enhanced search filters
const initialFilters = {
  search: "",
  location: "",
  date: "",
  guests: 1,
  activityTypes: [] as string[],
  priceRange: [0, 500] as [number, number],
  durationRange: [1, 12] as [number, number],
  difficultyLevels: [] as string[],
  categories: [] as string[],
  instantBookOnly: false,
  superhostOnly: false,
  rating: 0,
  premiumOnly: false,
  availableToday: false,
}

// Activity type options
const activityTypes = [
  { value: "sailing", label: "Sailing", icon: "⛵" },
  { value: "surfing", label: "Surfing", icon: "🏄" },
  { value: "diving", label: "Diving", icon: "🤿" },
  { value: "kayaking", label: "Kayaking", icon: "🚣" },
  { value: "fishing", label: "Fishing", icon: "🎣" },
  { value: "whale_watching", label: "Whale Watching", icon: "🐋" },
]

const categories = [
  { value: "adventure", label: "Adventure" },
  { value: "relaxation", label: "Relaxation" },
  { value: "eco_tour", label: "Eco Tour" },
  { value: "lesson", label: "Lesson" },
  { value: "luxury", label: "Luxury" },
  { value: "family_friendly", label: "Family Friendly" },
  { value: "sports", label: "Sports" },
  { value: "romantic", label: "Romantic" },
  { value: "certification", label: "Certification" },
  { value: "wildlife", label: "Wildlife" },
]

const difficultyLevels = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
  { value: "all_levels", label: "All Levels" },
]

// Quick filter options
const quickFilters = [
  { label: "Available Today", key: "availableToday", icon: Calendar },
  { label: "Instant Book", key: "instantBookOnly", icon: Zap },
  { label: "Premium", key: "premiumOnly", icon: Award },
  { label: "Superhost", key: "superhostOnly", icon: ShieldCheck },
]

interface ExperienceCardProps {
  experience: Experience
  viewMode: "grid" | "list" | "map"
  isWishlisted: boolean
  onToggleWishlist: () => void
}

// Enhanced Experience Card Component
function ExperienceCard({ experience, viewMode, isWishlisted, onToggleWishlist }: ExperienceCardProps) {
  const transformedExperience = useMemo(() => {
    const hasDiscount = experience.total_bookings > 50 // Simple discount logic
    const discountPercentage = hasDiscount ? 15 : 0

    // Transform database experience to match UI expectations
    return {
      ...experience,
      primaryImage: experience.primary_image_url || "/placeholder.svg?height=350&width=500",
      hostProfile: {
        name: experience.host_profiles?.name || "Host",
        avatar: experience.host_profiles?.avatar_url || "/placeholder.svg?height=50&width=50",
        rating: experience.host_profiles?.rating || 0,
        responseRate: 95, // Default value
        responseTime: "within 2 hours", // Default value
      },
      tags: experience.tags || [],
      includedAmenities: experience.included_amenities || [],
      isInstantBook: true, // Default for demo
      isSuperhost: (experience.host_profiles?.rating || 0) >= 4.8,
      isPremium: experience.category?.includes("luxury") || false,
      availableToday: true, // Default for demo
      isPopular: experience.total_bookings > 20,
      lastBooked: experience.total_bookings > 0 ? "2 hours ago" : null,
      discount: discountPercentage,
    }
  }, [experience])

  const hasDiscount = transformedExperience.discount > 0
  const discountPercentage = transformedExperience.discount

  if (viewMode === "list") {
    return (
      <Link href={`/experience/${experience.id}`} className="block">
        <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group">
          <div className="flex">
            <div className="relative w-80 h-48 flex-shrink-0">
              <img
                src={transformedExperience.primaryImage || "/placeholder.svg"}
                alt={experience.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute top-3 left-3 flex flex-col space-y-2">
                {transformedExperience.isPremium && (
                  <Badge className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-yellow-900 border-yellow-300">
                    <Award className="h-3 w-3 mr-1" />
                    Premium
                  </Badge>
                )}
                {transformedExperience.isSuperhost && <Badge variant="secondary">Superhost</Badge>}
                {transformedExperience.isInstantBook && (
                  <Badge variant="default" className="bg-green-600">
                    <Zap className="h-3 w-3 mr-1" />
                    Instant Book
                  </Badge>
                )}
                {hasDiscount && <Badge variant="destructive">{discountPercentage}% OFF</Badge>}
              </div>
              <button
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  onToggleWishlist()
                }}
                className="absolute top-3 right-3 p-2 bg-white/90 rounded-full hover:bg-white transition-colors shadow-md"
              >
                <Heart className={`h-4 w-4 ${isWishlisted ? "text-red-500 fill-current" : "text-gray-600"}`} />
              </button>
              {transformedExperience.availableToday && (
                <div className="absolute bottom-3 left-3">
                  <Badge className="bg-green-500 text-white">Available Today</Badge>
                </div>
              )}
            </div>

            <CardContent className="flex-1 p-6">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <Badge variant="outline" className="text-xs">
                      {experience.activity_type.replace("_", " ")}
                    </Badge>
                    <Badge variant="secondary" className="text-xs capitalize">
                      {experience.difficulty_level}
                    </Badge>
                    {transformedExperience.isPopular && (
                      <Badge className="bg-orange-100 text-orange-800 text-xs">Popular</Badge>
                    )}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{experience.title}</h3>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">{experience.short_description}</p>

                  <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      {experience.location}
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {experience.duration_display}
                    </div>
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-1" />
                      Up to {experience.max_guests} guests
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 mb-4">
                    <div className="flex items-center space-x-2">
                      <img
                        src={transformedExperience.hostProfile.avatar || "/placeholder.svg"}
                        alt={transformedExperience.hostProfile.name}
                        className="w-8 h-8 rounded-full"
                      />
                      <div>
                        <span className="text-sm font-medium text-gray-900">
                          {transformedExperience.hostProfile.name}
                        </span>
                        <div className="flex items-center text-xs text-gray-500">
                          <span>{transformedExperience.hostProfile.responseRate}% response rate</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                      <span className="font-medium">{experience.rating}</span>
                      <span className="text-gray-500 ml-1">({experience.total_reviews})</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1 mb-4">
                    {transformedExperience.tags.slice(0, 4).map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  <div className="text-xs text-gray-500 mb-2">
                    <span className="font-medium">Includes:</span>{" "}
                    {transformedExperience.includedAmenities.slice(0, 3).join(", ")}
                    {transformedExperience.includedAmenities.length > 3 && "..."}
                  </div>
                </div>

                <div className="text-right ml-6">
                  <div className="mb-2">
                    <div className="text-2xl font-bold text-gray-900">€{experience.price_per_person}</div>
                    <div className="text-sm text-gray-500">per person</div>
                  </div>

                  <div className="space-y-2">
                    <Button className="w-full">
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                    <div className="flex space-x-1">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Share2 className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        <MessageCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {transformedExperience.availableToday && (
                    <p className="text-xs text-green-600 mt-2 font-medium">Available today</p>
                  )}
                  {transformedExperience.lastBooked && (
                    <p className="text-xs text-gray-500 mt-1">Last booked {transformedExperience.lastBooked}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </div>
        </Card>
      </Link>
    )
  }

  // Grid view (default)
  return (
    <Link href={`/experience/${experience.id}`} className="block">
      <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group">
        <div className="relative">
          <img
            src={transformedExperience.primaryImage || "/placeholder.svg"}
            alt={experience.title}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute top-3 left-3 flex flex-col space-y-1">
            {transformedExperience.isPremium && (
              <Badge className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-yellow-900 border-yellow-300 text-xs">
                <Award className="h-3 w-3 mr-1" />
                Premium
              </Badge>
            )}
            {transformedExperience.isSuperhost && (
              <Badge variant="secondary" className="text-xs">
                Superhost
              </Badge>
            )}
            {transformedExperience.isInstantBook && (
              <Badge variant="default" className="bg-green-600 text-xs">
                <Zap className="h-3 w-3 mr-1" />
                Instant
              </Badge>
            )}
            {hasDiscount && (
              <Badge variant="destructive" className="text-xs">
                {discountPercentage}% OFF
              </Badge>
            )}
          </div>
          <button
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onToggleWishlist()
            }}
            className="absolute top-3 right-3 p-2 bg-white/90 rounded-full hover:bg-white transition-colors shadow-md"
          >
            <Heart className={`h-4 w-4 ${isWishlisted ? "text-red-500 fill-current" : "text-gray-600"}`} />
          </button>
          {transformedExperience.availableToday && (
            <div className="absolute bottom-3 left-3">
              <Badge className="bg-green-500 text-white text-xs">Available Today</Badge>
            </div>
          )}
          {transformedExperience.isPopular && (
            <div className="absolute bottom-3 right-3">
              <Badge className="bg-orange-100 text-orange-800 text-xs">Popular</Badge>
            </div>
          )}
        </div>

        <CardContent className="p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Badge variant="outline" className="text-xs">
              {experience.activity_type.replace("_", " ")}
            </Badge>
            <Badge variant="secondary" className="text-xs capitalize">
              {experience.difficulty_level}
            </Badge>
          </div>

          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{experience.title}</h3>

          <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
            <div className="flex items-center">
              <MapPin className="h-3 w-3 mr-1" />
              <span className="truncate">{experience.location}</span>
            </div>
            <div className="flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              {experience.duration_display}
            </div>
          </div>

          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <img
                src={transformedExperience.hostProfile.avatar || "/placeholder.svg"}
                alt={transformedExperience.hostProfile.name}
                className="w-6 h-6 rounded-full"
              />
              <span className="text-sm text-gray-600 truncate">{transformedExperience.hostProfile.name}</span>
            </div>
            <div className="flex items-center">
              <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
              <span className="font-medium">{experience.rating}</span>
              <span className="text-gray-500 ml-1 text-sm">({experience.total_reviews})</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <span className="text-lg font-bold text-gray-900">€{experience.price_per_person}</span>
              <span className="text-sm text-gray-500"> / person</span>
            </div>
            <Button size="sm">
              <Eye className="h-4 w-4 mr-1" />
              View
            </Button>
          </div>

          {transformedExperience.lastBooked && (
            <p className="text-xs text-gray-500 mt-2">Last booked {transformedExperience.lastBooked}</p>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}

// Main Search Page Component
export default function EnhancedExperiencesSearchPage() {
  const searchParams = useSearchParams()

  // Initialize filters from URL params only once
  const initialFiltersFromParams = useMemo(() => {
    const service = searchParams.get("service")
    const location = searchParams.get("location")
    const date = searchParams.get("date")
    return {
      ...initialFilters,
      search: service || "",
      location: location || "",
      date: date || "",
    }
  }, [searchParams])

  const [filters, setFilters] = useState(initialFiltersFromParams)
  const [experiences, setExperiences] = useState<Experience[]>([])
  const [viewMode, setViewMode] = useState("grid")
  const [sortBy, setSortBy] = useState("recommended")
  const [showFilters, setShowFilters] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [wishlistItems, setWishlistItems] = useState(new Set())

  // Load experiences function - stable reference
  const loadExperiences = useCallback(async () => {
    setIsLoading(true)
    try {
      const searchFilters = {
        search: filters.search,
        location: filters.location,
        activityTypes: filters.activityTypes,
        priceRange: filters.priceRange,
        difficultyLevels: filters.difficultyLevels,
        minGuests: filters.guests,
        rating: filters.rating,
        sortBy: sortBy,
      }

      const result = await getExperiences(searchFilters)

      if (result.success) {
        setExperiences(Array.isArray(result.data) ? result.data : [])
      } else {
        console.error("Failed to load experiences:", result.error)
        setExperiences([])
      }
    } catch (error) {
      console.error("Error loading experiences:", error)
      setExperiences([])
    } finally {
      setIsLoading(false)
    }
  }, [
    filters.search,
    filters.location,
    filters.activityTypes,
    filters.priceRange,
    filters.difficultyLevels,
    filters.guests,
    filters.rating,
    sortBy,
  ])

  // Load experiences on initial mount and when filters change
  useEffect(() => {
    loadExperiences()
  }, [filters, sortBy, loadExperiences]) // Depend on filters and sortBy to re-fetch

  // Apply client-side filters that aren't handled by the database
  const filteredExperiences = useMemo(() => {
    if (!Array.isArray(experiences)) {
      return []
    }

    let filtered = [...experiences]

    // Apply category filter
    if (filters.categories.length > 0) {
      filtered = filtered.filter((exp) => {
        if (!exp.category || !Array.isArray(exp.category)) {
          return false
        }
        return exp.category.some((cat) => filters.categories.includes(cat))
      })
    }

    // Apply duration filter
    filtered = filtered.filter((exp) => {
      const duration = exp.duration_hours || 0
      return duration >= filters.durationRange[0] && duration <= filters.durationRange[1]
    })

    return filtered
  }, [experiences, filters.categories, filters.durationRange])

  const handleFilterChange = useCallback((key: string, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }, [])

  const clearAllFilters = useCallback(() => {
    setFilters(initialFilters)
  }, [])

  const toggleWishlist = useCallback((experienceId: string) => {
    setWishlistItems((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(experienceId)) {
        newSet.delete(experienceId)
      } else {
        newSet.add(experienceId)
      }
      return newSet
    })
  }, [])

  const handleSearch = useCallback(() => {
    loadExperiences()
  }, [loadExperiences])

  const activeFilterCount = useMemo(() => {
    return Object.entries(filters).filter(([key, value]) => {
      if (key === "priceRange") return value[0] !== 0 || value[1] !== 500
      if (key === "durationRange") return value[0] !== 1 || value[1] !== 12
      if (Array.isArray(value)) return value.length > 0
      if (typeof value === "boolean") return value
      return value !== initialFilters[key as keyof typeof initialFilters]
    }).length
  }, [filters])

  const { user } = useAuth() // Keep useAuth for client-side user context

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-4">
                <Link href="/" className="flex items-center space-x-2">
                  <Anchor className="h-8 w-8 text-blue-600" />
                  <span className="text-xl font-bold text-gray-900">SeaFable</span>
                </Link>
                <div className="hidden md:block h-6 w-px bg-gray-300" />
                <h1 className="hidden md:block text-lg font-semibold text-gray-900">Discover Water Adventures</h1>
              </div>

              <div className="flex items-center space-x-4">
                <Button variant="ghost">List Your Experience</Button>
                {user ? (
                  <Link href="/dashboard">
                    <Button variant="outline">Dashboard</Button>
                  </Link>
                ) : (
                  <Link href="/login">
                    <Button variant="outline">Sign In</Button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Enhanced Search Bar */}
        <div className="bg-white border-b shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Main search inputs */}
              <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="What adventure?"
                    value={filters.search}
                    onChange={(e) => handleFilterChange("search", e.target.value)}
                    className="pl-10 h-11"
                  />
                </div>

                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Where?"
                    value={filters.location}
                    onChange={(e) => handleFilterChange("location", e.target.value)}
                    className="pl-10 h-11"
                  />
                </div>

                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    type="date"
                    value={filters.date}
                    onChange={(e) => handleFilterChange("date", e.target.value)}
                    className="pl-10 h-11"
                  />
                </div>

                <div className="relative">
                  <Users className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Select
                    value={filters.guests.toString()}
                    onValueChange={(value) => handleFilterChange("guests", Number.parseInt(value))}
                  >
                    <SelectTrigger className="pl-10 h-11">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                        <SelectItem key={num} value={num.toString()}>
                          {num} guest{num > 1 ? "s" : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setShowFilters(!showFilters)} className="lg:px-6 relative">
                  <SlidersHorizontal className="h-4 w-4 mr-2" />
                  Filters
                  {activeFilterCount > 0 && (
                    <Badge className="ml-2 h-5 w-5 p-0 text-xs bg-blue-600 text-white">{activeFilterCount}</Badge>
                  )}
                </Button>

                <Button onClick={handleSearch} disabled={isLoading} className="lg:px-8">
                  {isLoading ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4 mr-2" />
                  )}
                  Search
                </Button>
              </div>
            </div>

            {/* Quick Filters */}
            <div className="flex flex-wrap gap-2 mt-4">
              {quickFilters.map((filter) => (
                <Button
                  key={filter.key}
                  variant={filters[filter.key as keyof typeof filters] ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleFilterChange(filter.key, !filters[filter.key as keyof typeof filters])}
                  className="text-xs"
                >
                  <filter.icon className="h-3 w-3 mr-1" />
                  {filter.label}
                </Button>
              ))}
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex gap-6">
            {/* Enhanced Filters Sidebar */}
            {showFilters && (
              <aside className="w-80 flex-shrink-0">
                <Card className="sticky top-32">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-semibold">Filters</h3>
                      <div className="flex space-x-2">
                        {activeFilterCount > 0 && (
                          <Button variant="ghost" size="sm" onClick={clearAllFilters}>
                            <FilterX className="h-4 w-4 mr-1" />
                            Clear All
                          </Button>
                        )}
                        <Button variant="ghost" size="sm" onClick={() => setShowFilters(false)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-6">
                      {/* Activity Types */}
                      <div>
                        <h4 className="font-medium mb-3">Activity Type</h4>
                        <div className="grid grid-cols-2 gap-2">
                          {activityTypes.map((type) => (
                            <div key={type.value} className="flex items-center space-x-2">
                              <Checkbox
                                id={type.value}
                                checked={filters.activityTypes.includes(type.value)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    handleFilterChange("activityTypes", [...filters.activityTypes, type.value])
                                  } else {
                                    handleFilterChange(
                                      "activityTypes",
                                      filters.activityTypes.filter((t) => t !== type.value),
                                    )
                                  }
                                }}
                              />
                              <Label htmlFor={type.value} className="text-sm cursor-pointer">
                                {type.icon} {type.label}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Price Range */}
                      <div>
                        <h4 className="font-medium mb-3">Price Range</h4>
                        <div className="space-y-2">
                          <Slider
                            value={filters.priceRange}
                            onValueChange={(value) => handleFilterChange("priceRange", value as [number, number])}
                            min={0}
                            max={500}
                            step={25}
                            className="w-full"
                          />
                          <div className="flex justify-between text-sm text-gray-600">
                            <span>€{filters.priceRange[0]}</span>
                            <span>€{filters.priceRange[1]}+</span>
                          </div>
                        </div>
                      </div>

                      {/* Duration */}
                      <div>
                        <h4 className="font-medium mb-3">Duration (hours)</h4>
                        <div className="space-y-2">
                          <Slider
                            value={filters.durationRange}
                            onValueChange={(value) => handleFilterChange("durationRange", value as [number, number])}
                            min={1}
                            max={12}
                            step={1}
                            className="w-full"
                          />
                          <div className="flex justify-between text-sm text-gray-600">
                            <span>{filters.durationRange[0]}h</span>
                            <span>{filters.durationRange[1]}h+</span>
                          </div>
                        </div>
                      </div>

                      {/* Difficulty Level */}
                      <div>
                        <h4 className="font-medium mb-3">Difficulty Level</h4>
                        <div className="space-y-2">
                          {difficultyLevels.map((level) => (
                            <div key={level.value} className="flex items-center space-x-2">
                              <Checkbox
                                id={level.value}
                                checked={filters.difficultyLevels.includes(level.value)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    handleFilterChange("difficultyLevels", [...filters.difficultyLevels, level.value])
                                  } else {
                                    handleFilterChange(
                                      "difficultyLevels",
                                      filters.difficultyLevels.filter((l) => l !== level.value),
                                    )
                                  }
                                }}
                              />
                              <Label htmlFor={level.value} className="text-sm cursor-pointer capitalize">
                                {level.label}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Categories */}
                      <div>
                        <h4 className="font-medium mb-3">Categories</h4>
                        <div className="space-y-2 max-h-40 overflow-y-auto">
                          {categories.map((category) => (
                            <div key={category.value} className="flex items-center space-x-2">
                              <Checkbox
                                id={category.value}
                                checked={filters.categories.includes(category.value)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    handleFilterChange("categories", [...filters.categories, category.value])
                                  } else {
                                    handleFilterChange(
                                      "categories",
                                      filters.categories.filter((c) => c !== category.value),
                                    )
                                  }
                                }}
                              />
                              <Label htmlFor={category.value} className="text-sm cursor-pointer">
                                {category.label}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Rating */}
                      <div>
                        <h4 className="font-medium mb-3">Minimum Rating</h4>
                        <RadioGroup
                          value={filters.rating.toString()}
                          onValueChange={(value) => handleFilterChange("rating", Number.parseFloat(value))}
                        >
                          {[4.5, 4.0, 3.5, 3.0].map((rating) => (
                            <div key={rating} className="flex items-center space-x-2">
                              <RadioGroupItem value={rating.toString()} id={`rating-${rating}`} />
                              <Label htmlFor={`rating-${rating}`} className="flex items-center cursor-pointer">
                                <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                                <span className="text-sm">{rating}+ stars</span>
                              </Label>
                            </div>
                          ))}
                        </RadioGroup>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </aside>
            )}

            {/* Main Content */}
            <main className="flex-1">
              {/* Results Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {isLoading ? "Searching..." : `${filteredExperiences.length} experiences found`}
                  </h2>
                  {filters.location && <p className="text-gray-600">in {filters.location}</p>}
                </div>

                <div className="flex items-center space-x-4">
                  {/* View Mode Toggle */}
                  <div className="flex items-center border rounded-lg p-1">
                    <Button
                      variant={viewMode === "grid" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setViewMode("grid")}
                    >
                      <Grid3X3 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={viewMode === "list" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setViewMode("list")}
                    >
                      <List className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={viewMode === "map" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setViewMode("map")}
                    >
                      <Map className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Sort Dropdown */}
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="recommended">Recommended</SelectItem>
                      <SelectItem value="price_low">Price: Low to High</SelectItem>
                      <SelectItem value="price_high">Price: High to Low</SelectItem>
                      <SelectItem value="rating">Highest Rated</SelectItem>
                      <SelectItem value="reviews">Most Reviewed</SelectItem>
                      <SelectItem value="popular">Most Popular</SelectItem>
                      <SelectItem value="newest">Newest</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Active Filters */}
              {activeFilterCount > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {filters.search && (
                    <Badge variant="secondary" className="px-3 py-1">
                      Search: "{filters.search}"
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-4 w-4 ml-2 p-0"
                        onClick={() => handleFilterChange("search", "")}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  )}

                  {filters.location && (
                    <Badge variant="secondary" className="px-3 py-1">
                      Location: {filters.location}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-4 w-4 ml-2 p-0"
                        onClick={() => handleFilterChange("location", "")}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  )}

                  {filters.activityTypes.map((type) => (
                    <Badge key={type} variant="secondary" className="px-3 py-1">
                      {activityTypes.find((t) => t.value === type)?.label}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-4 w-4 ml-2 p-0"
                        onClick={() =>
                          handleFilterChange(
                            "activityTypes",
                            filters.activityTypes.filter((t) => t !== type),
                          )
                        }
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}

                  {filters.categories.map((category) => (
                    <Badge key={category} variant="secondary" className="px-3 py-1">
                      {categories.find((c) => c.value === category)?.label}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-4 w-4 ml-2 p-0"
                        onClick={() =>
                          handleFilterChange(
                            "categories",
                            filters.categories.filter((c) => c !== category),
                          )
                        }
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              )}

              {/* Experience Cards */}
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <Card key={i} className="animate-pulse">
                      <div className="w-full h-48 bg-gray-200 rounded-t-lg"></div>
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                          <div className="flex justify-between">
                            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : filteredExperiences.length === 0 ? (
                <div className="text-center py-16">
                  <Card className="max-w-md mx-auto">
                    <CardContent className="p-8">
                      <div className="flex flex-col items-center space-y-4">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                          <Search className="h-8 w-8 text-gray-400" />
                        </div>
                        <div className="text-center">
                          <h3 className="text-xl font-semibold text-gray-900 mb-2">No experiences found</h3>
                          <p className="text-gray-600 mb-6">
                            {activeFilterCount > 0
                              ? "No experiences match your current filters. Try adjusting your search criteria."
                              : filters.search || filters.location
                                ? `No experiences found for "${filters.search || filters.location}". Try a different search term.`
                                : "No experiences are currently available. Please check back later."}
                          </p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3">
                          {activeFilterCount > 0 && (
                            <Button onClick={clearAllFilters} variant="outline">
                              <FilterX className="h-4 w-4 mr-2" />
                              Clear All Filters
                            </Button>
                          )}
                          <Button
                            onClick={() => {
                              setFilters(initialFilters)
                              handleSearch()
                            }}
                          >
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Reset Search
                          </Button>
                        </div>

                        {/* Suggestions */}
                        <div className="mt-6 text-left w-full">
                          <h4 className="text-sm font-medium text-gray-900 mb-3">Try searching for:</h4>
                          <div className="flex flex-wrap gap-2">
                            {["Sailing", "Diving", "Kayaking", "Fishing", "Surfing"].map((suggestion) => (
                              <Button
                                key={suggestion}
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  handleFilterChange("search", suggestion.toLowerCase())
                                  handleSearch()
                                }}
                                className="text-xs"
                              >
                                {suggestion}
                              </Button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <div
                  className={`grid gap-6 ${
                    viewMode === "grid"
                      ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
                      : viewMode === "list"
                        ? "grid-cols-1"
                        : "grid-cols-1" // map view placeholder
                  }`}
                >
                  {filteredExperiences.map((experience) => (
                    <ExperienceCard
                      key={experience.id}
                      experience={experience}
                      viewMode={viewMode}
                      isWishlisted={wishlistItems.has(experience.id)}
                      onToggleWishlist={() => toggleWishlist(experience.id)}
                    />
                  ))}
                </div>
              )}

              {/* Load More */}
              {filteredExperiences.length > 0 && !isLoading && (
                <div className="text-center mt-12">
                  <Button variant="outline" size="lg">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Load More Experiences
                  </Button>
                </div>
              )}
            </main>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  )
}
