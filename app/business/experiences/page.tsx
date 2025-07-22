"use client"

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { EmptyState } from '@/components/ui/empty-state'
import { 
  Plus, 
  Edit, 
  Trash2, 
  Users, 
  Clock, 
  DollarSign,
  MapPin,
  Star
} from 'lucide-react'
import { Experience } from '@/types/business'
import { supabase } from '@/lib/supabase'

export default function BusinessExperiencesPage() {
  const { user, userProfile } = useAuth()
  const [loading, setLoading] = useState(true)
  const [experiences, setExperiences] = useState<Experience[]>([])

  useEffect(() => {
    if (user && userProfile) {
      fetchExperiences()
    }
  }, [user, userProfile])

  async function fetchExperiences() {
    if (!userProfile?.id) return

    try {
      setLoading(true)

      const { data, error } = await supabase
        .from('experiences')
        .select(`
          *,
          host_profiles (
            name,
            role
          )
        `)
        .eq('business_id', userProfile.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setExperiences(data || [])
    } catch (error) {
      console.error('Error fetching experiences:', error)
    } finally {
      setLoading(false)
    }
  }

  async function deleteExperience(id: string) {
    if (!confirm('Are you sure you want to delete this experience?')) return

    try {
      const { error } = await supabase
        .from('experiences')
        .delete()
        .eq('id', id)

      if (error) throw error

      setExperiences(experiences.filter(exp => exp.id !== id))
    } catch (error) {
      console.error('Error deleting experience:', error)
    }
  }

  function formatDuration(minutes: number): string {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60

    if (hours > 0 && mins > 0) {
      return `${hours}h ${mins}m`
    } else if (hours > 0) {
      return `${hours}h`
    } else {
      return `${mins}m`
    }
  }

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Experiences</h1>
          <div className="h-10 w-32 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-64 bg-gray-200 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Experiences</h1>
          <p className="text-gray-600">Manage your marine experiences and activities</p>
        </div>
        <Button asChild>
          <a href="/business/experiences/new">
            <Plus className="h-4 w-4 mr-2" />
            Add Experience
          </a>
        </Button>
      </div>

      {experiences.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {experiences.map((experience) => (
            <Card key={experience.id} className="group hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg line-clamp-2">{experience.title}</CardTitle>
                  <Badge variant="secondary" className="capitalize">
                    {experience.activityType.replace('-', ' ')}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600 text-sm line-clamp-3">
                  {experience.description}
                </p>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center text-gray-600">
                    <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span className="truncate">{experience.location}</span>
                  </div>

                  <div className="flex items-center text-gray-600">
                    <Clock className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span>{formatDuration(experience.duration)}</span>
                  </div>

                  <div className="flex items-center text-gray-600">
                    <DollarSign className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span>${experience.price}</span>
                  </div>

                  <div className="flex items-center text-gray-600">
                    <Users className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span>Max {experience.maxParticipants} guests</span>
                  </div>

                  {experience.average_rating && (
                    <div className="flex items-center text-gray-600">
                      <Star className="h-4 w-4 mr-2 flex-shrink-0 text-yellow-400" />
                      <span>{experience.average_rating.toFixed(1)}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-2 pt-2">
                  <Badge variant="outline" className="capitalize">
                    {experience.difficultyLevel}
                  </Badge>
                  {experience.instantBooking && (
                    <Badge variant="default">Instant Booking</Badge>
                  )}
                </div>

                <div className="flex space-x-2 pt-4">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    asChild
                  >
                    <a href={`/business/experiences/${experience.id}/edit`}>
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </a>
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-red-600 hover:text-red-700"
                    onClick={() => deleteExperience(experience.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<Plus className="h-16 w-16" />}
          title="No experiences yet"
          description="Start by creating your first marine experience. You can add sailing trips, diving tours, fishing expeditions, and more."
          action={{
            label: "Create Your First Experience",
            onClick: () => window.location.href = "/business/experiences/new"
          }}
        />
      )}
    </div>
  )
}