"use client"

import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock, MapPin, Users, Star, Shield, Zap, Heart, ArrowRight } from "lucide-react"
import type { Experience } from "@/types/business"

interface ExperienceCardProps {
  experience: Experience
  onBookNow?: (experienceId: string) => void
  onViewDetails?: (experienceId: string) => void
}

const ACTIVITY_ICONS: Record<string, string> = {
  sailing: "⛵",
  surfing: "🏄",
  kayaking: "🛶",
  diving: "🤿",
  "jet-skiing": "🚤",
  fishing: "🎣",
  "whale-watching": "🐋",
  paddleboarding: "🏄‍♂️",
  windsurfing: "🏄‍♀️",
  snorkeling: "🤿",
}

const DIFFICULTY_COLORS: Record<string, string> = {
  beginner: "bg-green-100 text-green-800 border-green-200",
  intermediate: "bg-yellow-100 text-yellow-800 border-yellow-200",
  advanced: "bg-orange-100 text-orange-800 border-orange-200",
  expert: "bg-red-100 text-red-800 border-red-200",
}

export function ExperienceCard({ experience, onBookNow, onViewDetails }: ExperienceCardProps) {
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) {
      return `${hours}h ${mins > 0 ? `${mins}m` : ""}`.trim()
    }
    return `${mins}m`
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price)
  }

  return (
    <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group transform hover:-translate-y-2">
      <div className="relative">
        <div className="h-48 bg-gradient-to-br from-blue-100 to-cyan-100 flex items-center justify-center">
          <span className="text-4xl">{ACTIVITY_ICONS[experience.activityType] || "🌊"}</span>
        </div>

        <div className="absolute top-3 left-3 flex flex-col space-y-2">
          <Badge variant="outline" className="bg-white/90 text-gray-900 border-gray-200 capitalize">
            {experience.activityType.replace("-", " ")}
          </Badge>
          <Badge
            variant="outline"
            className={`capitalize ${DIFFICULTY_COLORS[experience.difficultyLevel]} bg-white/90`}
          >
            {experience.difficultyLevel}
          </Badge>
        </div>

        <button className="absolute top-3 right-3 p-2 bg-white/90 rounded-full hover:bg-white transition-colors shadow-md group">
          <Heart className="h-4 w-4 text-gray-600 group-hover:text-red-500 transition-colors" />
        </button>

        <div className="absolute bottom-3 left-3 flex space-x-2">
          {experience.equipmentProvided && experience.equipmentProvided.length > 0 && (
            <Badge className="bg-green-500 text-white text-xs">
              <Shield className="h-3 w-3 mr-1" />
              Equipment
            </Badge>
          )}
          {experience.instantBooking && (
            <Badge className="bg-blue-500 text-white text-xs">
              <Zap className="h-3 w-3 mr-1" />
              Instant
            </Badge>
          )}
        </div>
      </div>

      <CardContent className="p-6">
        <div className="flex items-center space-x-2 mb-3">
          <div className="flex items-center space-x-1">
            <Star className="h-4 w-4 text-yellow-400 fill-current" />
            <span className="text-sm font-medium">4.8</span>
          </div>
          <span className="text-sm text-gray-500">(24 reviews)</span>
        </div>

        <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
          {experience.title}
        </h3>

        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{experience.description}</p>

        <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
          <div className="flex items-center space-x-1">
            <MapPin className="h-4 w-4" />
            <span>{experience.location}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Clock className="h-4 w-4" />
            <span>{formatDuration(experience.duration)}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Users className="h-4 w-4" />
            <span>Up to {experience.maxParticipants}</span>
          </div>
        </div>

        {/* Highlights */}
        {experience.highlights && experience.highlights.length > 0 && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-1">
              {experience.highlights.slice(0, 3).map((highlight, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {highlight}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Tags */}
        {experience.tags && experience.tags.length > 0 && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-1">
              {experience.tags.slice(0, 4).map((tag, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  #{tag}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Age Requirement */}
        {experience.minAge && experience.minAge > 0 && (
          <div className="flex items-center gap-1 text-xs text-gray-600 mb-4">
            <span>Minimum age: {experience.minAge}+</span>
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-0 px-6 pb-6">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center space-x-2">
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              {formatPrice(experience.price)}
            </span>
            <span className="text-sm text-gray-500">per person</span>
          </div>
          <div className="flex gap-2">
            {onViewDetails && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onViewDetails(experience.id)}
                className="border-blue-600 text-blue-600 hover:bg-blue-50"
              >
                Details
              </Button>
            )}
            {onBookNow && (
              <Button
                size="sm"
                onClick={() => onBookNow(experience.id)}
                disabled={!experience.instantBooking}
                className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
              >
                {experience.instantBooking ? (
                  <>
                    <Zap className="h-4 w-4 mr-1" />
                    Book Now
                  </>
                ) : (
                  "Inquire"
                )}
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            )}
          </div>
        </div>
      </CardFooter>
    </Card>
  )
}
