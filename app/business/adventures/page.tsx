
"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { BusinessLayout } from "@/components/layouts/BusinessLayout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Eye, Trash2, MapPin, Users, Star, DollarSign } from "lucide-react"
import Link from "next/link"
import { getExperiences } from "@/lib/database"

interface Adventure {
  id: string
  title: string
  description: string
  location: string
  price_per_person: number
  max_guests: number
  activity_type: string
  difficulty_level: string
  rating: number
  total_reviews: number
  is_active: boolean
  created_at: string
}

export default function BusinessAdventuresPage() {
  const { user, businessProfile, userType, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const [adventures, setAdventures] = useState<Adventure[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push("/business/login")
        return
      }
      if (userType !== "business") {
        router.push("/login")
        return
      }
      loadAdventures()
    }
  }, [user, userType, authLoading, router, businessProfile])

  const loadAdventures = async () => {
    if (!businessProfile?.id) return

    try {
      setIsLoading(true)
      setError(null)
      
      const result = await getExperiences(businessProfile.id)
      if (result.success && Array.isArray(result.data)) {
        setAdventures(result.data)
      } else {
        setError("Failed to load adventures")
      }
    } catch (err) {
      console.error("Error loading adventures:", err)
      setError("Failed to load adventures")
    } finally {
      setIsLoading(false)
    }
  }

  if (authLoading || isLoading) {
    return (
      <BusinessLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </BusinessLayout>
    )
  }

  return (
    <BusinessLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Adventures</h1>
            <p className="text-gray-600 mt-1">Manage your adventure offerings</p>
          </div>
          <Button asChild>
            <Link href="/business/adventures/new">
              <Plus className="h-4 w-4 mr-2" />
              Add New Adventure
            </Link>
          </Button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">Total Adventures</p>
                  <p className="text-2xl font-bold text-gray-900">{adventures.length}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <MapPin className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">Active Adventures</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {adventures.filter(a => a.is_active).length}
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <Eye className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">Avg Rating</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {adventures.length > 0 
                      ? (adventures.reduce((sum, a) => sum + (a.rating || 0), 0) / adventures.length).toFixed(1)
                      : "0.0"
                    }
                  </p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-full">
                  <Star className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">Total Reviews</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {adventures.reduce((sum, a) => sum + (a.total_reviews || 0), 0)}
                  </p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Adventures List */}
        <Card>
          <CardHeader>
            <CardTitle>Your Adventures</CardTitle>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="text-red-600 bg-red-50 p-4 rounded-lg mb-4">
                {error}
              </div>
            )}

            {adventures.length === 0 ? (
              <div className="text-center py-12">
                <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No adventures yet</h3>
                <p className="text-gray-600 mb-4">Get started by creating your first adventure</p>
                <Button asChild>
                  <Link href="/business/adventures/new">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Adventure
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {adventures.map((adventure) => (
                  <div key={adventure.id} className="border rounded-lg p-6 hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {adventure.title}
                          </h3>
                          <Badge variant={adventure.is_active ? "default" : "secondary"}>
                            {adventure.is_active ? "Active" : "Inactive"}
                          </Badge>
                          <Badge variant="outline">
                            {adventure.activity_type}
                          </Badge>
                        </div>
                        
                        <p className="text-gray-600 mb-3 line-clamp-2">
                          {adventure.description}
                        </p>
                        
                        <div className="flex items-center gap-6 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {adventure.location}
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            Max {adventure.max_guests} guests
                          </div>
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-4 w-4" />
                            ${adventure.price_per_person}/person
                          </div>
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4" />
                            {adventure.rating?.toFixed(1) || "0.0"} ({adventure.total_reviews || 0})
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 ml-6">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/experience/${adventure.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/business/adventures/${adventure.id}/edit`}>
                            <Edit className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button variant="outline" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </BusinessLayout>
  )
}
