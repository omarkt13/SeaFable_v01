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
import Link from "next/link"

// Enhanced mock data with realistic content
const mockExperiences = [
  {
    id: "exp_001",
    title: "Luxury Sunset Sailing Adventure",
    shortDescription: "Experience the magic of San Francisco Bay aboard our premium catamaran with champagne service",
    fullDescription:
      "Set sail on an unforgettable journey across the stunning San Francisco Bay as the sun paints the sky in brilliant colors. Our luxury catamaran offers the perfect platform for an intimate sunset experience, complete with premium champagne, artisanal appetizers, and professional photography to capture your magical moments.",
    location: "San Francisco Bay, CA",
    specificLocation: "Pier 39 Marina",
    activityType: "sailing",
    category: ["luxury", "relaxation", "romantic"],
    durationHours: 3,
    durationDisplay: "3 hours",
    maxGuests: 12,
    pricePerPerson: 189,
    originalPrice: 229,
    difficultyLevel: "beginner",
    rating: 4.9,
    totalReviews: 324,
    recentReviews: [
      { text: "Absolutely magical experience! The sunset was breathtaking.", author: "Sarah M.", rating: 5 },
      { text: "Perfect romantic evening, highly recommend!", author: "Mike & Jessica", rating: 5 },
    ],
    hostProfile: {
      name: "Captain Maria Rodriguez",
      avatar: "/placeholder.svg?height=50&width=50",
      rating: 4.9,
      yearsExperience: 15,
      hostType: "captain",
      responseRate: 100,
      responseTime: "within an hour",
    },
    primaryImage: "/placeholder.svg?height=350&width=500&text=Sunset+Sailing",
    imageGallery: [
      "/placeholder.svg?height=350&width=500&text=Sunset+Sailing",
      "/placeholder.svg?height=350&width=500&text=Catamaran+Deck",
      "/placeholder.svg?height=350&width=500&text=Bay+Views",
    ],
    tags: ["sunset", "luxury", "romantic", "photography", "champagne"],
    includedAmenities: [
      "Premium beverages",
      "Gourmet appetizers",
      "Professional photos",
      "Sunset guarantee",
      "Blankets provided",
    ],
    isInstantBook: true,
    isSuperhost: true,
    isPremium: true,
    lastBooked: "2 hours ago",
    availableToday: true,
    cancellationPolicy: "flexible",
    weatherDependent: true,
    provides: ["Life jackets", "Safety equipment", "Restroom facilities"],
    meetingPoint: "Pier 39, Dock J",
    bookingCount: 156,
    isPopular: true,
    discount: 17,
  },
  {
    id: "exp_002",
    title: "Professional Surf Lesson & Board Rental",
    shortDescription: "Master the waves with certified instructors on Malibu's world-famous Surfrider Beach",
    fullDescription:
      "Join our expert surf instructors for an exhilarating lesson on one of California's most iconic beaches. Whether you're a complete beginner or looking to improve your technique, our personalized approach ensures you'll be catching waves and building confidence in no time.",
    location: "Malibu Beach, CA",
    specificLocation: "Surfrider Beach",
    activityType: "surfing",
    category: ["lesson", "adventure", "sports"],
    durationHours: 2.5,
    durationDisplay: "2.5 hours",
    maxGuests: 8,
    pricePerPerson: 85,
    originalPrice: 95,
    difficultyLevel: "beginner",
    rating: 4.8,
    totalReviews: 456,
    recentReviews: [
      { text: "Amazing instructors! Got me standing on the first day.", author: "Tom R.", rating: 5 },
      { text: "Perfect waves and great teaching method.", author: "Lisa K.", rating: 5 },
    ],
    hostProfile: {
      name: "Jake Thompson",
      avatar: "/placeholder.svg?height=50&width=50",
      rating: 4.8,
      yearsExperience: 8,
      hostType: "instructor",
      responseRate: 95,
      responseTime: "within 2 hours",
    },
    primaryImage: "/placeholder.svg?height=350&width=500&text=Surf+Lesson",
    imageGallery: [
      "/placeholder.svg?height=350&width=500&text=Surf+Lesson",
      "/placeholder.svg?height=350&width=500&text=Malibu+Beach",
    ],
    tags: ["beginner-friendly", "lesson", "surfboard", "wetsuit", "malibu"],
    includedAmenities: [
      "Surfboard rental",
      "Wetsuit",
      "Professional instruction",
      "Safety briefing",
      "Photos included",
    ],
    isInstantBook: true,
    isSuperhost: false,
    isPremium: false,
    lastBooked: "1 day ago",
    availableToday: true,
    cancellationPolicy: "moderate",
    weatherDependent: true,
    provides: ["All equipment", "Changing rooms", "Fresh water rinse"],
    meetingPoint: "Surfrider Beach Parking Lot",
    bookingCount: 89,
    isPopular: false,
    discount: 11,
  },
  {
    id: "exp_003",
    title: "Deep Sea Fishing Charter",
    shortDescription: "Full-day fishing adventure targeting salmon and rockfish with experienced crew",
    fullDescription:
      "Embark on an epic deep-sea fishing adventure in the rich waters off Half Moon Bay. Our experienced captain and crew will guide you to the best fishing spots while you target salmon, lingcod, and various rockfish species in this productive fishing ground.",
    location: "Half Moon Bay, CA",
    specificLocation: "Pillar Point Harbor",
    activityType: "fishing",
    category: ["adventure", "sports", "full-day"],
    durationHours: 8,
    durationDisplay: "Full Day",
    maxGuests: 15,
    pricePerPerson: 295,
    originalPrice: 295,
    difficultyLevel: "intermediate",
    rating: 4.7,
    totalReviews: 189,
    recentReviews: [
      { text: "Caught my biggest salmon ever! Great crew.", author: "David P.", rating: 5 },
      { text: "Well organized trip, lots of fish!", author: "Fishing Group", rating: 4 },
    ],
    hostProfile: {
      name: "Captain Mike Chen",
      avatar: "/placeholder.svg?height=50&width=50",
      rating: 4.9,
      yearsExperience: 22,
      hostType: "captain",
      responseRate: 98,
      responseTime: "within 3 hours",
    },
    primaryImage: "/placeholder.svg?height=350&width=500&text=Deep+Sea+Fishing",
    imageGallery: [
      "/placeholder.svg?height=350&width=500&text=Deep+Sea+Fishing",
      "/placeholder.svg?height=350&width=500&text=Fishing+Boat",
    ],
    tags: ["fishing", "salmon", "rockfish", "full-day", "deep-sea"],
    includedAmenities: [
      "Fishing equipment",
      "Bait & tackle",
      "Lunch provided",
      "Fish cleaning service",
      "Ice for catch",
    ],
    isInstantBook: false,
    isSuperhost: true,
    isPremium: false,
    lastBooked: "3 hours ago",
    availableToday: false,
    cancellationPolicy: "strict",
    weatherDependent: true,
    provides: ["Fishing licenses", "Safety gear", "Refreshments"],
    meetingPoint: "Pillar Point Harbor, Slip 24",
    bookingCount: 67,
    isPopular: true,
    discount: 0,
  },
  {
    id: "exp_004",
    title: "Kayak & Snorkel Marine Sanctuary",
    shortDescription: "Explore Monterey Bay's underwater kelp forests and observe diverse marine wildlife",
    fullDescription:
      "Discover the underwater wonders of Monterey Bay National Marine Sanctuary. Paddle through pristine waters in a stable kayak, then snorkel among the famous kelp forests where sea otters, seals, and countless fish species make their home.",
    location: "Monterey Bay, CA",
    specificLocation: "Lovers Point",
    activityType: "kayaking",
    category: ["eco_tour", "adventure", "snorkeling"],
    durationHours: 4,
    durationDisplay: "4 hours",
    maxGuests: 10,
    pricePerPerson: 125,
    originalPrice: 140,
    difficultyLevel: "intermediate",
    rating: 4.8,
    totalReviews: 267,
    recentReviews: [
      { text: "Saw sea otters up close! Incredible experience.", author: "Nature Lover", rating: 5 },
      { text: "Beautiful kelp forests, great guide.", author: "Marine Biology Student", rating: 5 },
    ],
    hostProfile: {
      name: "Ocean Explorer Tours",
      avatar: "/placeholder.svg?height=50&width=50",
      rating: 4.7,
      yearsExperience: 12,
      hostType: "company",
      responseRate: 92,
      responseTime: "within 4 hours",
    },
    primaryImage: "/placeholder.svg?height=350&width=500&text=Kayak+Snorkel",
    imageGallery: [
      "/placeholder.svg?height=350&width=500&text=Kayak+Snorkel",
      "/placeholder.svg?height=350&width=500&text=Kelp+Forest",
    ],
    tags: ["kayaking", "snorkeling", "marine-life", "kelp-forest", "eco-tour"],
    includedAmenities: ["Kayak rental", "Snorkel gear", "Wetsuit", "Marine life guide", "Waterproof bag"],
    isInstantBook: true,
    isSuperhost: false,
    isPremium: false,
    lastBooked: "5 hours ago",
    availableToday: true,
    cancellationPolicy: "flexible",
    weatherDependent: true,
    provides: ["All equipment", "Safety briefing", "Hot drinks after"],
    meetingPoint: "Lovers Point Beach Parking",
    bookingCount: 134,
    isPopular: false,
    discount: 11,
  },
  {
    id: "exp_005",
    title: "PADI Scuba Diving Certification",
    shortDescription: "Complete your PADI Open Water certification in the crystal-clear waters of Catalina Island",
    fullDescription:
      "Take the plunge into the underwater world with our comprehensive PADI Open Water Diver certification course. Conducted in the pristine waters around Catalina Island, you'll learn essential diving skills while exploring vibrant marine ecosystems.",
    location: "Catalina Island, CA",
    specificLocation: "Avalon Bay",
    activityType: "diving",
    category: ["lesson", "adventure", "certification"],
    durationHours: 16,
    durationDisplay: "2 Days",
    maxGuests: 6,
    pricePerPerson: 450,
    originalPrice: 495,
    difficultyLevel: "beginner",
    rating: 4.9,
    totalReviews: 134,
    recentReviews: [
      { text: "Professional instruction, now I'm certified!", author: "New Diver", rating: 5 },
      { text: "Amazing underwater visibility at Catalina.", author: "Sarah T.", rating: 5 },
    ],
    hostProfile: {
      name: "Catalina Dive Academy",
      avatar: "/placeholder.svg?height=50&width=50",
      rating: 4.9,
      yearsExperience: 18,
      hostType: "company",
      responseRate: 100,
      responseTime: "within an hour",
    },
    primaryImage: "/placeholder.svg?height=350&width=500&text=Scuba+Diving",
    imageGallery: [
      "/placeholder.svg?height=350&width=500&text=Scuba+Diving",
      "/placeholder.svg?height=350&width=500&text=Underwater+Scene",
    ],
    tags: ["scuba", "certification", "PADI", "underwater", "two-day"],
    includedAmenities: ["All equipment", "PADI materials", "Certification fee", "Underwater photos", "Logbook"],
    isInstantBook: false,
    isSuperhost: true,
    isPremium: true,
    lastBooked: "1 day ago",
    availableToday: false,
    cancellationPolicy: "moderate",
    weatherDependent: false,
    provides: ["Complete gear set", "Theory materials", "Certification processing"],
    meetingPoint: "Catalina Dive Shop, Avalon",
    bookingCount: 89,
    isPopular: true,
    discount: 9,
  },
  {
    id: "exp_006",
    title: "Whale Watching Expedition",
    shortDescription: "Spot majestic gray whales, playful dolphins, and sea lions in their natural habitat",
    fullDescription:
      "Join us for an unforgettable wildlife encounter in the rich waters of Monterey Bay. Our experienced marine naturalists will help you spot migrating gray whales, acrobatic dolphins, and curious sea lions while sharing fascinating insights about marine ecosystems.",
    location: "Monterey Bay, CA",
    specificLocation: "Fisherman's Wharf",
    activityType: "whale_watching",
    category: ["eco_tour", "family_friendly", "wildlife"],
    durationHours: 3,
    durationDisplay: "3 hours",
    maxGuests: 45,
    pricePerPerson: 65,
    originalPrice: 75,
    difficultyLevel: "all_levels",
    rating: 4.6,
    totalReviews: 892,
    recentReviews: [
      { text: "Saw 3 whales and tons of dolphins!", author: "Family Adventure", rating: 5 },
      { text: "Great for kids, very educational.", author: "Parent", rating: 4 },
    ],
    hostProfile: {
      name: "Monterey Bay Whale Watch",
      avatar: "/placeholder.svg?height=50&width=50",
      rating: 4.6,
      yearsExperience: 25,
      hostType: "company",
      responseRate: 88,
      responseTime: "within 6 hours",
    },
    primaryImage: "/placeholder.svg?height=350&width=500&text=Whale+Watching",
    imageGallery: [
      "/placeholder.svg?height=350&width=500&text=Whale+Watching",
      "/placeholder.svg?height=350&width=500&text=Marine+Wildlife",
    ],
    tags: ["whale-watching", "dolphins", "family", "photography", "marine-wildlife"],
    includedAmenities: [
      "Marine naturalist guide",
      "Whale sighting guarantee",
      "Light snacks",
      "Binoculars provided",
      "Educational materials",
    ],
    isInstantBook: true,
    isSuperhost: false,
    isPremium: false,
    lastBooked: "30 minutes ago",
    availableToday: true,
    cancellationPolicy: "flexible",
    weatherDependent: true,
    provides: ["Comfortable seating", "Restroom facilities", "Seasickness remedies"],
    meetingPoint: "Fisherman's Wharf, Ticket Booth",
    bookingCount: 267,
    isPopular: true,
    discount: 13,
  },
]

// Enhanced search filters
const initialFilters = {
  search: "",
  location: "",
  date: "",
  guests: 1,
  activityTypes: [],
  priceRange: [0, 500],
  durationRange: [1, 12],
  difficultyLevels: [],
  categories: [],
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

// Enhanced Experience Card Component
const ExperienceCard = ({ experience, viewMode, isWishlisted, onToggleWishlist }) => {
  const discountPercentage = experience.discount || 0
  const hasDiscount = discountPercentage > 0

  if (viewMode === "list") {
    return (
      <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group">
        <div className="flex">
          <div className="relative w-80 h-48 flex-shrink-0">
            <img
              src={experience.primaryImage || "/placeholder.svg"}
              alt={experience.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute top-3 left-3 flex flex-col space-y-2">
              {experience.isPremium && (
                <Badge className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-yellow-900 border-yellow-300">
                  <Award className="h-3 w-3 mr-1" />
                  Premium
                </Badge>
              )}
              {experience.isSuperhost && <Badge variant="secondary">Superhost</Badge>}
              {experience.isInstantBook && (
                <Badge variant="default" className="bg-green-600">
                  <Zap className="h-3 w-3 mr-1" />
                  Instant Book
                </Badge>
              )}
              {hasDiscount && <Badge variant="destructive">{discountPercentage}% OFF</Badge>}
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation()
                onToggleWishlist()
              }}
              className="absolute top-3 right-3 p-2 bg-white/90 rounded-full hover:bg-white transition-colors shadow-md"
            >
              <Heart className={`h-4 w-4 ${isWishlisted ? "text-red-500 fill-current" : "text-gray-600"}`} />
            </button>
            {experience.availableToday && (
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
                    {experience.activityType.replace("_", " ")}
                  </Badge>
                  <Badge variant="secondary" className="text-xs capitalize">
                    {experience.difficultyLevel}
                  </Badge>
                  {experience.isPopular && <Badge className="bg-orange-100 text-orange-800 text-xs">Popular</Badge>}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{experience.title}</h3>
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">{experience.shortDescription}</p>

                <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    {experience.location}
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    {experience.durationDisplay}
                  </div>
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-1" />
                    Up to {experience.maxGuests} guests
                  </div>
                </div>

                <div className="flex items-center space-x-4 mb-4">
                  <div className="flex items-center space-x-2">
                    <img
                      src={experience.hostProfile.avatar || "/placeholder.svg"}
                      alt={experience.hostProfile.name}
                      className="w-8 h-8 rounded-full"
                    />
                    <div>
                      <span className="text-sm font-medium text-gray-900">{experience.hostProfile.name}</span>
                      <div className="flex items-center text-xs text-gray-500">
                        <span>{experience.hostProfile.responseRate}% response rate</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                    <span className="font-medium">{experience.rating}</span>
                    <span className="text-gray-500 ml-1">({experience.totalReviews})</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1 mb-4">
                  {experience.tags.slice(0, 4).map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>

                <div className="text-xs text-gray-500 mb-2">
                  <span className="font-medium">Includes:</span> {experience.includedAmenities.slice(0, 3).join(", ")}
                  {experience.includedAmenities.length > 3 && "..."}
                </div>
              </div>

              <div className="text-right ml-6">
                <div className="mb-2">
                  {hasDiscount && <div className="text-sm text-gray-500 line-through">${experience.originalPrice}</div>}
                  <div className="text-2xl font-bold text-gray-900">${experience.pricePerPerson}</div>
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

                {experience.availableToday && (
                  <p className="text-xs text-green-600 mt-2 font-medium">Available today</p>
                )}
                {experience.lastBooked && (
                  <p className="text-xs text-gray-500 mt-1">Last booked {experience.lastBooked}</p>
                )}
              </div>
            </div>
          </CardContent>
        </div>
      </Card>
    )
  }

  // Grid view (default)
  return (
    <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group">
      <div className="relative">
        <img
          src={experience.primaryImage || "/placeholder.svg"}
          alt={experience.title}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-3 left-3 flex flex-col space-y-1">
          {experience.isPremium && (
            <Badge className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-yellow-900 border-yellow-300 text-xs">
              <Award className="h-3 w-3 mr-1" />
              Premium
            </Badge>
          )}
          {experience.isSuperhost && (
            <Badge variant="secondary" className="text-xs">
              Superhost
            </Badge>
          )}
          {experience.isInstantBook && (
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
            e.stopPropagation()
            onToggleWishlist()
          }}
          className="absolute top-3 right-3 p-2 bg-white/90 rounded-full hover:bg-white transition-colors shadow-md"
        >
          <Heart className={`h-4 w-4 ${isWishlisted ? "text-red-500 fill-current" : "text-gray-600"}`} />
        </button>
        {experience.availableToday && (
          <div className="absolute bottom-3 left-3">
            <Badge className="bg-green-500 text-white text-xs">Available Today</Badge>
          </div>
        )}
        {experience.isPopular && (
          <div className="absolute bottom-3 right-3">
            <Badge className="bg-orange-100 text-orange-800 text-xs">Popular</Badge>
          </div>
        )}
      </div>

      <CardContent className="p-4">
        <div className="flex items-center space-x-2 mb-2">
          <Badge variant="outline" className="text-xs">
            {experience.activityType.replace("_", " ")}
          </Badge>
          <Badge variant="secondary" className="text-xs capitalize">
            {experience.difficultyLevel}
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
            {experience.durationDisplay}
          </div>
        </div>

        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <img
              src={experience.hostProfile.avatar || "/placeholder.svg"}
              alt={experience.hostProfile.name}
              className="w-6 h-6 rounded-full"
            />
            <span className="text-sm text-gray-600 truncate">{experience.hostProfile.name}</span>
          </div>
          <div className="flex items-center">
            <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
            <span className="font-medium">{experience.rating}</span>
            <span className="text-gray-500 ml-1 text-sm">({experience.totalReviews})</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div>
            {hasDiscount && <div className="text-xs text-gray-500 line-through">${experience.originalPrice}</div>}
            <span className="text-lg font-bold text-gray-900">${experience.pricePerPerson}</span>
            <span className="text-sm text-gray-500"> / person</span>
          </div>
          <Button size="sm">
            <Eye className="h-4 w-4 mr-1" />
            View
          </Button>
        </div>

        {experience.lastBooked && <p className="text-xs text-gray-500 mt-2">Last booked {experience.lastBooked}</p>}
      </CardContent>
    </Card>
  )
}

// Main Search Page Component
export default function EnhancedExperiencesSearchPage() {
  const [filters, setFilters] = useState(initialFilters)
  const [experiences] = useState(mockExperiences)
  const [viewMode, setViewMode] = useState("grid")
  const [sortBy, setSortBy] = useState("recommended")
  const [showFilters, setShowFilters] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [wishlistItems, setWishlistItems] = useState(new Set())
  const { user } = useAuth()
  const searchParams = useSearchParams()

  // Initialize filters from URL params
  useEffect(() => {
    const service = searchParams.get("service")
    const location = searchParams.get("location")
    const date = searchParams.get("date")

    if (service || location || date) {
      setFilters((prev) => ({
        ...prev,
        search: service || "",
        location: location || "",
        date: date || "",
      }))
    }
  }, [searchParams])

  // Memoized filtered and sorted experiences for better performance
  const filteredExperiences = useMemo(() => {
    let filtered = [...experiences]

    // Apply all filters
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase()
      filtered = filtered.filter(
        (exp) =>
          exp.title.toLowerCase().includes(searchTerm) ||
          exp.shortDescription.toLowerCase().includes(searchTerm) ||
          exp.tags.some((tag) => tag.toLowerCase().includes(searchTerm)) ||
          exp.location.toLowerCase().includes(searchTerm),
      )
    }

    if (filters.location) {
      filtered = filtered.filter((exp) => exp.location.toLowerCase().includes(filters.location.toLowerCase()))
    }

    if (filters.activityTypes.length > 0) {
      filtered = filtered.filter((exp) => filters.activityTypes.includes(exp.activityType))
    }

    filtered = filtered.filter(
      (exp) => exp.pricePerPerson >= filters.priceRange[0] && exp.pricePerPerson <= filters.priceRange[1],
    )

    filtered = filtered.filter(
      (exp) => exp.durationHours >= filters.durationRange[0] && exp.durationHours <= filters.durationRange[1],
    )

    if (filters.difficultyLevels.length > 0) {
      filtered = filtered.filter((exp) => filters.difficultyLevels.includes(exp.difficultyLevel))
    }

    if (filters.categories.length > 0) {
      filtered = filtered.filter((exp) => exp.category.some((cat) => filters.categories.includes(cat)))
    }

    if (filters.instantBookOnly) {
      filtered = filtered.filter((exp) => exp.isInstantBook)
    }

    if (filters.superhostOnly) {
      filtered = filtered.filter((exp) => exp.isSuperhost)
    }

    if (filters.premiumOnly) {
      filtered = filtered.filter((exp) => exp.isPremium)
    }

    if (filters.availableToday) {
      filtered = filtered.filter((exp) => exp.availableToday)
    }

    if (filters.rating > 0) {
      filtered = filtered.filter((exp) => exp.rating >= filters.rating)
    }

    filtered = filtered.filter((exp) => exp.maxGuests >= filters.guests)

    // Apply sorting
    switch (sortBy) {
      case "price_low":
        filtered.sort((a, b) => a.pricePerPerson - b.pricePerPerson)
        break
      case "price_high":
        filtered.sort((a, b) => b.pricePerPerson - a.pricePerPerson)
        break
      case "rating":
        filtered.sort((a, b) => b.rating - a.rating)
        break
      case "reviews":
        filtered.sort((a, b) => b.totalReviews - a.totalReviews)
        break
      case "newest":
        filtered.sort((a, b) => b.bookingCount - a.bookingCount)
        break
      case "popular":
        filtered.sort((a, b) => (b.isPopular ? 1 : 0) - (a.isPopular ? 1 : 0))
        break
      default:
        // Keep original order as "recommended"
        break
    }

    return filtered
  }, [filters, experiences, sortBy])

  const handleFilterChange = useCallback((key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }, [])

  const clearAllFilters = useCallback(() => {
    setFilters(initialFilters)
  }, [])

  const toggleWishlist = useCallback((experienceId) => {
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

  const handleSearch = () => {
    setIsLoading(true)
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
    }, 1000)
  }

  const activeFilterCount = Object.entries(filters).filter(([key, value]) => {
    if (key === "priceRange") return value[0] !== 0 || value[1] !== 500
    if (key === "durationRange") return value[0] !== 1 || value[1] !== 12
    if (Array.isArray(value)) return value.length > 0
    if (typeof value === "boolean") return value
    return value !== initialFilters[key]
  }).length

  return (
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
                {isLoading ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Search className="h-4 w-4 mr-2" />}
                Search
              </Button>
            </div>
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap gap-2 mt-4">
            {quickFilters.map((filter) => (
              <Button
                key={filter.key}
                variant={filters[filter.key] ? "default" : "outline"}
                size="sm"
                onClick={() => handleFilterChange(filter.key, !filters[filter.key])}
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
                          onValueChange={(value) => handleFilterChange("priceRange", value)}
                          min={0}
                          max={500}
                          step={25}
                          className="w-full"
                        />
                        <div className="flex justify-between text-sm text-gray-600">
                          <span>${filters.priceRange[0]}</span>
                          <span>${filters.priceRange[1]}+</span>
                        </div>
                      </div>
                    </div>

                    {/* Duration */}
                    <div>
                      <h4 className="font-medium mb-3">Duration (hours)</h4>
                      <div className="space-y-2">
                        <Slider
                          value={filters.durationRange}
                          onValueChange={(value) => handleFilterChange("durationRange", value)}
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
              <Card className="text-center py-12">
                <CardContent>
                  <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No experiences found</h3>
                  <p className="text-gray-600 mb-6">Try adjusting your search criteria or clearing some filters</p>
                  <Button onClick={clearAllFilters}>Clear All Filters</Button>
                </CardContent>
              </Card>
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
  )
}
