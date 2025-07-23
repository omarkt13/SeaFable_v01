"use client"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock, MapPin, Users, Star, Shield, Zap, Cloud } from "lucide-react"
import { Experience } from "@/types/business"

interface ExperienceCardProps {
  experience: Experience
  onBookNow?: (experienceId: string) => void
  onViewDetails?: (experienceId: string) => void
}

const ACTIVITY_ICONS: Record<string, string> = {
  sailing: '⛵',
  surfing: '🏄',
  kayaking: '🛶',
  diving: '🤿',
  'jet-skiing': '🚤',
  fishing: '🎣',
  'whale-watching': '🐋',
  paddleboarding: '🏄‍♂️',
  windsurfing: '🏄‍♀️',
  snorkeling: '🤿',
}

const DIFFICULTY_COLORS: Record<string, string> = {
  beginner: 'bg-green-100 text-green-800 border-green-200',
  intermediate: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  advanced: 'bg-orange-100 text-orange-800 border-orange-200',
  expert: 'bg-red-100 text-red-800 border-red-200',
}

export function ExperienceCard({ experience, onBookNow, onViewDetails }: ExperienceCardProps) {
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) {
      return `${hours}h ${mins > 0 ? `${mins}m` : ''}`.trim()
    }
    return `${mins}m`
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price)
  }

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">{ACTIVITY_ICONS[experience.activityType]}</span>
              <Badge variant="outline" className="capitalize">
                {experience.activityType.replace('-', ' ')}
              </Badge>
              <Badge 
                variant="outline" 
                className={`capitalize ${DIFFICULTY_COLORS[experience.difficultyLevel]}`}
              >
                {experience.difficultyLevel}
              </Badge>
            </div>
            <CardTitle className="text-lg font-semibold line-clamp-2">
              {experience.title}
            </CardTitle>
            <CardDescription className="line-clamp-2 mt-1">
              {experience.description}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pb-3">
        {/* Location and Duration */}
        <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
          <div className="flex items-center gap-1">
            <MapPin className="h-4 w-4" />
            <span>{experience.location}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{formatDuration(experience.duration)}</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>Up to {experience.maxParticipants}</span>
          </div>
        </div>

        {/* Highlights */}
        {experience.highlights && experience.highlights.length > 0 && (
          <div className="mb-3">
            <div className="flex flex-wrap gap-1">
              {experience.highlights.slice(0, 3).map((highlight, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {highlight}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Equipment and Features */}
        <div className="flex items-center gap-2 mb-3">
          {experience.equipmentProvided && experience.equipmentProvided.length > 0 && (
            <Badge variant="outline" className="text-xs flex items-center gap-1">
              <Shield className="h-3 w-3" />
              Equipment
            </Badge>
          )}
          {experience.instantBooking && (
            <Badge variant="outline" className="text-xs flex items-center gap-1">
              <Zap className="h-3 w-3" />
              Instant
            </Badge>
          )}
          {!experience.weatherDependency && (
            <Badge variant="outline" className="text-xs flex items-center gap-1">
              <Cloud className="h-3 w-3" />
              All Weather
            </Badge>
          )}
        </div>

        {/* Tags */}
        {experience.tags && experience.tags.length > 0 && (
          <div className="mb-3">
            <div className="flex flex-wrap gap-1">
              {experience.tags.slice(0, 4).map((tag, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  #{tag}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* What to Bring */}
        {experience.whatToBring && experience.whatToBring.length > 0 && (
          <div className="mb-3">
            <p className="text-xs text-gray-600 font-medium mb-1">What to bring:</p>
            <div className="flex flex-wrap gap-1">
              {experience.whatToBring.slice(0, 3).map((item, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {item}
                </Badge>
              ))}
              {experience.whatToBring.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{experience.whatToBring.length - 3} more
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Age Requirement */}
        {experience.minAge && experience.minAge > 0 && (
          <div className="flex items-center gap-1 text-xs text-gray-600 mb-2">
            <span>Minimum age: {experience.minAge}+</span>
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-0">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-blue-600">
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
              >
                Details
              </Button>
            )}
            {onBookNow && (
              <Button
                size="sm"
                onClick={() => onBookNow(experience.id)}
                disabled={!experience.instantBooking}
              >
                {experience.instantBooking ? 'Book Now' : 'Inquire'}
              </Button>
            )}
          </div>
        </div>
      </CardFooter>
    </Card>
  )
} 