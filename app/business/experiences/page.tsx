"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/useAuth"
import { BusinessLayout } from "@/components/layouts/BusinessLayout"
import { getHostExperiences } from "@/lib/database"
import type { Experience } from "@/lib/database"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Search,
  Plus,
  Eye,
  Edit,
  MoreHorizontal,
  MapPin,
  Clock,
  Users,
  Star,
  Calendar,
  Filter,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import Link from "next/link"

export default function BusinessExperiences() {
  const { user, userType, loading: authLoading } = useAuth()
  const [experiences, setExperiences] = useState<Experience[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sortBy, setSortBy] = useState("newest")

  useEffect(() => {
    const fetchExperiences = async () => {
      if (!user || userType !== "business") return

      try {
        setLoading(true)
        const result = await getHostExperiences(user.id)

        if (result.success && result.data) {
          setExperiences(result.data)
        } else {
          setError(result.error || "Failed to load experiences")
        }
      } catch (err) {
        console.error("Error fetching experiences:", err)
        setError("An unexpected error occurred")
      } finally {
        setLoading(false)
      }
    }

    if (!authLoading) {
      fetchExperiences()
    }
  }, [user, userType, authLoading])

  // Filter and sort experiences
  const filteredExperiences = experiences
    .filter((exp) => {
      const matchesSearch = exp.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          exp.location.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = statusFilter === "all" || 
                          (statusFilter === "active" && exp.is_active) ||
                          (statusFilter === "inactive" && !exp.is_active)
      return matchesSearch && matchesStatus
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        case "oldest":
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        case "price-high":
          return b.price_per_person - a.price_per_person
        case "price-low":
          return a.price_per_person - b.price_per_person
        case "rating":
          return b.rating - a.rating
        case "bookings":
          return b.total_bookings - a.total_bookings
        default:
          return 0
      }
    })

  if (authLoading || loading) {
    return (
      <BusinessLayout>
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <Skeleton className="h-8 w-[200px]" />
            <Skeleton className="h-10 w-[140px]" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i}>
                <Skeleton className="h-48 w-full" />
                <CardHeader>
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </BusinessLayout>
    )
  }

  if (error) {
    return (
      <BusinessLayout>
        <div className="p-6">
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="text-red-800">Error Loading Experiences</CardTitle>
              <CardDescription className="text-red-600">{error}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => window.location.reload()}>Try Again</Button>
            </CardContent>
          </Card>
        </div>
      </BusinessLayout>
    )
  }

  return (
    <BusinessLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">My Experiences</h1>
            <p className="text-muted-foreground">
              Manage your water adventure experiences
            </p>
          </div>
          <Button asChild>
            <Link href="/business/experiences/new">
              <Plus className="mr-2 h-4 w-4" />
              Add Experience
            </Link>
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:space-x-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search experiences..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-[150px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full md:w-[150px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="oldest">Oldest</SelectItem>
              <SelectItem value="price-high">Price High</SelectItem>
              <SelectItem value="price-low">Price Low</SelectItem>
              <SelectItem value="rating">Rating</SelectItem>
              <SelectItem value="bookings">Bookings</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Experiences Grid */}
        {filteredExperiences.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredExperiences.map((experience) => (
              <Card key={experience.id} className="overflow-hidden group hover:shadow-lg transition-shadow">
                {/* Image */}
                <div className="aspect-video relative overflow-hidden bg-gray-100">
                  <img
                    src={experience.primary_image_url || "/placeholder.svg?height=200&width=350"}
                    alt={experience.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2 right-2">
                    <Badge variant={experience.is_active ? "default" : "secondary"}>
                      {experience.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </div>

                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg line-clamp-2">{experience.title}</CardTitle>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem asChild>
                          <Link href={`/experience/${experience.id}`}>
                            <Eye className="mr-2 h-4 w-4" />
                            View
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600">
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="mr-1 h-3 w-3" />
                    <span className="line-clamp-1">{experience.location}</span>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center">
                      <Clock className="mr-1 h-3 w-3 text-muted-foreground" />
                      <span>{experience.duration_hours}h</span>
                    </div>
                    <div className="flex items-center">
                      <Users className="mr-1 h-3 w-3 text-muted-foreground" />
                      <span>Max {experience.max_guests}</span>
                    </div>
                    <div className="flex items-center">
                      <Star className="mr-1 h-3 w-3 text-muted-foreground" />
                      <span>{experience.rating || "No rating"}</span>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="mr-1 h-3 w-3 text-muted-foreground" />
                      <span>{experience.total_bookings} bookings</span>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="flex items-center justify-between pt-2 border-t">
                    <div>
                      <p className="text-2xl font-bold">€{experience.price_per_person}</p>
                      <p className="text-xs text-muted-foreground">per person</p>
                    </div>
                    <Badge variant="outline">
                      {experience.activity_type}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Plus className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No experiences found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || statusFilter !== "all" 
                ? "Try adjusting your search or filters"
                : "Create your first water adventure experience to get started"
              }
            </p>
            <Button asChild>
              <Link href="/business/experiences/new">
                <Plus className="mr-2 h-4 w-4" />
                Add Your First Experience
              </Link>
            </Button>
          </div>
        )}
      </div>
    </BusinessLayout>
  )
}