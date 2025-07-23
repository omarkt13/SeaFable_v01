"use client"

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { BusinessProtectedRoute } from "@/components/auth/BusinessProtectedRoute"
import { BusinessLayoutWrapper } from "@/components/layouts/BusinessLayoutWrapper"
import { useAuth } from "@/lib/auth-context"
import { createClient } from "@/lib/supabase/client"
import Link from 'next/link'
import { 
  Plus, 
  MapPin, 
  Calendar, 
  Euro, 
  Eye, 
  Settings, 
  MoreVertical,
  Filter,
  Search,
  Clock,
  Users,
  Activity,
  Star,
  Edit2,
  BarChart3,
  Camera
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface Experience {
  id: string
  title: string
  description: string
  short_description?: string
  location: string
  activity_type: string
  category: string[]
  duration_hours: number
  max_guests: number
  price_per_person: number
  difficulty_level: string
  primary_image_url?: string
  rating: number
  total_reviews: number
  total_bookings: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export default function BusinessAdventuresPage() {
  const { user, userType, loading: authLoading } = useAuth()
  const [experiences, setExperiences] = useState<Experience[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const router = useRouter()

  useEffect(() => {
    const fetchExperiences = async () => {
      if (!user || userType !== "business") return

      try {
        setLoading(true)
        const supabase = createClient()

        const { data, error: fetchError } = await supabase
          .from("experiences")
          .select("*")
          .eq("host_id", user.id)
          .order("created_at", { ascending: false })

        if (fetchError) {
          throw fetchError
        }

        setExperiences(data || [])
      } catch (err) {
        console.error("Error fetching experiences:", err)
        setError("Failed to load experiences")
      } finally {
        setLoading(false)
      }
    }

    if (!authLoading) {
      fetchExperiences()
    }
  }, [user, userType, authLoading])

  const filteredExperiences = experiences.filter(exp =>
    exp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    exp.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
    exp.activity_type.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleToggleStatus = async (experienceId: string, currentStatus: boolean) => {
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from("experiences")
        .update({ is_active: !currentStatus })
        .eq("id", experienceId)

      if (error) throw error

      setExperiences(prev =>
        prev.map(exp =>
          exp.id === experienceId ? { ...exp, is_active: !currentStatus } : exp
        )
      )
    } catch (err) {
      console.error("Error updating experience status:", err)
    }
  }

  if (authLoading || loading) {
    return (
      <BusinessProtectedRoute>
        <BusinessLayoutWrapper title="Adventures">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-32 w-full mb-4" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-2/3" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </BusinessLayoutWrapper>
      </BusinessProtectedRoute>
    )
  }

  if (error) {
    return (
      <BusinessProtectedRoute>
        <BusinessLayoutWrapper title="Adventures">
          <div className="px-4 sm:px-6 lg:px-8">
            <Card className="border-red-200 bg-red-50">
              <CardHeader>
                <CardTitle className="text-red-800">Error Loading Adventures</CardTitle>
                <CardDescription className="text-red-600">{error}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={() => window.location.reload()}>Try Again</Button>
              </CardContent>
            </Card>
          </div>
        </BusinessLayoutWrapper>
      </BusinessProtectedRoute>
    )
  }

  return (
    <BusinessProtectedRoute>
      <BusinessLayoutWrapper title="Adventures">
        <div className="px-4 sm:px-6 lg:px-8 space-y-6">
          {/* Header */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Your Adventures</h1>
              <p className="text-muted-foreground">
                Manage your adventure offerings and track their performance.
              </p>
            </div>
            <Button asChild>
              <Link href="/business/adventures/new">
                <Plus className="mr-2 h-4 w-4" />
                Add New Adventure
              </Link>
            </Button>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search adventures..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              Filters
            </Button>
          </div>

          {/* Adventures Grid */}
          {filteredExperiences.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Activity className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No Adventures Yet</h3>
                <p className="text-muted-foreground mb-4">
                  Start by creating your first adventure offering.
                </p>
                <Button asChild>
                  <Link href="/business/adventures/new">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Your First Adventure
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredExperiences.map((experience) => (
                <Card key={experience.id} className="overflow-hidden">
                  <div className="relative">
                    {experience.primary_image_url ? (
                      <img
                        src={experience.primary_image_url}
                        alt={experience.title}
                        className="w-full h-48 object-cover"
                      />
                    ) : (
                      <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
                        <Camera className="h-12 w-12 text-gray-400" />
                      </div>
                    )}
                    <div className="absolute top-2 right-2">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="secondary" size="sm" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/experience/${experience.id}`}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Public Page
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/business/adventures/${experience.id}/edit`}>
                              <Edit2 className="mr-2 h-4 w-4" />
                              Edit
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/business/adventures/${experience.id}/analytics`}>
                              <BarChart3 className="mr-2 h-4 w-4" />
                              Analytics
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleToggleStatus(experience.id, experience.is_active)}
                          >
                            <Settings className="mr-2 h-4 w-4" />
                            {experience.is_active ? 'Deactivate' : 'Activate'}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <div className="absolute top-2 left-2">
                      <Badge variant={experience.is_active ? "default" : "secondary"}>
                        {experience.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </div>

                  <CardHeader>
                    <CardTitle className="line-clamp-1">{experience.title}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {experience.short_description || experience.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center">
                        <MapPin className="mr-1 h-4 w-4" />
                        {experience.location}
                      </div>
                      <div className="flex items-center">
                        <Clock className="mr-1 h-4 w-4" />
                        {experience.duration_hours}h
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center">
                        <Users className="mr-1 h-4 w-4" />
                        Max {experience.max_guests} guests
                      </div>
                      <div className="flex items-center">
                        <Star className="mr-1 h-4 w-4 fill-current text-yellow-400" />
                        {experience.rating.toFixed(1)} ({experience.total_reviews})
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="text-lg font-bold">
                        €{experience.price_per_person}
                        <span className="text-sm font-normal text-muted-foreground">/person</span>
                      </div>
                      <Badge variant="outline">
                        {experience.total_bookings} bookings
                      </Badge>
                    </div>

                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1" asChild>
                        <Link href={`/business/adventures/${experience.id}/edit`}>
                          <Edit2 className="mr-1 h-3 w-3" />
                          Edit
                        </Link>
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1" asChild>
                        <Link href={`/experience/${experience.id}`}>
                          <Eye className="mr-1 h-3 w-3" />
                          View
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </BusinessLayoutWrapper>
    </BusinessProtectedRoute>
  )
}