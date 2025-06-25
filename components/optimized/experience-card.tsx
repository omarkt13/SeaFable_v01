"use client"

import { memo, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Star, MapPin, Clock, Users } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

interface ExperienceCardProps {
  experience: {
    id: string
    title: string
    description?: string
    location?: string
    price_per_person: number
    duration_hours: number
    max_guests: number
    rating: number
    total_reviews: number
    primary_image_url?: string
    difficulty_level: string
    activity_type: string
  }
  onBookmark?: (id: string) => void
  isBookmarked?: boolean
  priority?: boolean
}

export const ExperienceCard = memo<ExperienceCardProps>(
  ({ experience, onBookmark, isBookmarked = false, priority = false }) => {
    const {
      id,
      title,
      description,
      location,
      price_per_person,
      duration_hours,
      max_guests,
      rating,
      total_reviews,
      primary_image_url,
      difficulty_level,
      activity_type,
    } = experience

    // Memoize expensive calculations
    const formattedPrice = useMemo(
      () =>
        new Intl.NumberFormat("en-EU", {
          style: "currency",
          currency: "EUR",
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }).format(price_per_person),
      [price_per_person],
    )

    const durationText = useMemo(() => {
      if (duration_hours < 1) {
        return `${Math.round(duration_hours * 60)} min`
      }
      if (duration_hours === 1) {
        return "1 hour"
      }
      if (duration_hours % 1 === 0) {
        return `${duration_hours} hours`
      }
      return `${duration_hours} hours`
    }, [duration_hours])

    const ratingDisplay = useMemo(
      () => ({
        stars: Math.round(rating * 2) / 2, // Round to nearest 0.5
        text: rating > 0 ? `${rating.toFixed(1)} (${total_reviews})` : "No reviews",
      }),
      [rating, total_reviews],
    )

    const handleBookmarkClick = useMemo(() => (onBookmark ? () => onBookmark(id) : undefined), [onBookmark, id])

    return (
      <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300 h-full flex flex-col">
        <div className="relative aspect-[4/3] overflow-hidden">
          <Image
            src={primary_image_url || "/placeholder.svg?height=240&width=320"}
            alt={title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            priority={priority}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          <div className="absolute top-2 left-2">
            <Badge variant="secondary" className="bg-white/90 text-gray-800">
              {activity_type.replace("_", " ")}
            </Badge>
          </div>
          <div className="absolute top-2 right-2">
            <Badge
              variant={
                difficulty_level === "easy" ? "default" : difficulty_level === "moderate" ? "secondary" : "destructive"
              }
              className="bg-white/90"
            >
              {difficulty_level}
            </Badge>
          </div>
        </div>

        <CardHeader className="pb-2 flex-shrink-0">
          <CardTitle className="text-lg line-clamp-2 group-hover:text-blue-600 transition-colors">{title}</CardTitle>

          <div className="flex items-center gap-4 text-sm text-gray-600">
            {location && (
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                <span className="truncate">{location}</span>
              </div>
            )}

            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{durationText}</span>
            </div>

            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>Up to {max_guests}</span>
            </div>
          </div>

          {rating > 0 && (
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-medium">{ratingDisplay.text}</span>
            </div>
          )}
        </CardHeader>

        <CardContent className="pt-0 flex-grow flex flex-col justify-between">
          {description && <p className="text-sm text-gray-600 line-clamp-2 mb-4">{description}</p>}

          <div className="flex items-center justify-between mt-auto">
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900">{formattedPrice}</div>
              <div className="text-sm text-gray-500">per person</div>
            </div>

            <div className="flex gap-2">
              {onBookmark && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBookmarkClick}
                  className={isBookmarked ? "bg-blue-50 border-blue-200" : ""}
                >
                  {isBookmarked ? "❤️" : "🤍"}
                </Button>
              )}

              <Button asChild size="sm">
                <Link href={`/experience/${id}`}>View Details</Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  },
)

ExperienceCard.displayName = "ExperienceCard"
