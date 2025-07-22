
"use client"

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { BusinessProtectedRoute } from "@/components/auth/BusinessProtectedRoute"
import { BusinessLayout } from "@/components/layouts/BusinessLayout"
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
  MoreHorizontal,
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
import { useResponsive, getResponsiveClasses, getResponsiveGridCols } from '@/hooks/use-responsive'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

// Types
interface Adventure {
  id: string
  title: string
  description: string
  location: string
  activity_type: string
  duration_hours: number
  max_guests: number
  price_per_person: number
  rating: number
  total_reviews: number
  primary_image_url: string
  status: 'draft' | 'active' | 'paused' | 'archived'
  created_at: string
  updated_at: string
  tags: string[]
  difficulty_level: string
  total_bookings: number
}

export default function AdventuresPage() {
  const { user, businessProfile } = useAuth()
  const router = useRouter()
  const [adventures, setAdventures] = useState<Adventure[]>([])
  const [filteredAdventures, setFilteredAdventures] = useState<Adventure[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [selectedActivityType, setSelectedActivityType] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('updated_at')
  const [loading, setLoading] = useState(true)

  const supabase = createClient()
  const { isMobile, isTablet, screenSize } = useResponsive()
  const classes = getResponsiveClasses(screenSize)

  useEffect(() => {
    if (user && businessProfile) {
      fetchAdventures()
    }
  }, [user, businessProfile])

  const fetchAdventures = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('experiences')
        .select(`
          *,
          bookings!inner(count)
        `)
        .eq('host_id', user.id)
        .order('updated_at', { ascending: false })

      if (error) throw error

      const adventuresWithBookings = data?.map(experience => ({
        id: experience.id,
        title: experience.title,
        description: experience.description,
        location: experience.location,
        activity_type: experience.activity_type || 'adventure',
        duration_hours: experience.duration_hours || 4,
        max_guests: experience.max_guests,
        price_per_person: experience.price_per_person,
        rating: experience.rating || 0,
        total_reviews: 0,
        primary_image_url: experience.primary_image_url || 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=300&fit=crop',
        status: (experience.status || 'draft') as Adventure['status'],
        created_at: experience.created_at,
        updated_at: experience.updated_at,
        tags: experience.tags || [],
        difficulty_level: experience.difficulty_level || 'All Levels',
        total_bookings: 0
      })) || []

      setAdventures(adventuresWithBookings)
    } catch (error) {
      console.error('Error fetching adventures:', error)
    } finally {
      setLoading(false)
    }
  }

  // Filter and search functionality
  useEffect(() => {
    let filtered = adventures

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(adventure =>
        adventure.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        adventure.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        adventure.activity_type.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Status filter
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(adventure => adventure.status === selectedStatus)
    }

    // Activity type filter
    if (selectedActivityType !== 'all') {
      filtered = filtered.filter(adventure => adventure.activity_type === selectedActivityType)
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a.title.localeCompare(b.title)
        case 'price':
          return b.price_per_person - a.price_per_person
        case 'rating':
          return b.rating - a.rating
        case 'bookings':
          return b.total_bookings - a.total_bookings
        default: // updated_at
          return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      }
    })

    setFilteredAdventures(filtered)
  }, [adventures, searchQuery, selectedStatus, selectedActivityType, sortBy])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const formatDuration = (hours: number) => {
    if (hours < 24) {
      return `${hours} ${hours === 1 ? 'hour' : 'hours'}`
    } else {
      const days = Math.floor(hours / 24)
      return `${days} ${days === 1 ? 'day' : 'days'}`
    }
  }

  const getStatusBadge = (status: Adventure['status']) => {
    const statusConfig = {
      active: { color: 'bg-green-100 text-green-800', text: 'Active' },
      draft: { color: 'bg-gray-100 text-gray-800', text: 'Draft' },
      paused: { color: 'bg-yellow-100 text-yellow-800', text: 'Paused' },
      archived: { color: 'bg-red-100 text-red-800', text: 'Archived' }
    }

    return (
      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${statusConfig[status].color}`}>
        {statusConfig[status].text}
      </span>
    )
  }

  const activityTypes = Array.from(new Set(adventures.map(a => a.activity_type)))

  if (loading) {
    return (
      <BusinessProtectedRoute>
        <BusinessLayout>
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </BusinessLayout>
      </BusinessProtectedRoute>
    )
  }

  return (
    <BusinessProtectedRoute>
      <BusinessLayout>
        <div className={classes.spacing}>
          {/* Header */}
          <div className={`flex ${isMobile ? 'flex-col gap-4' : 'flex-row items-center justify-between gap-4'}`}>
            <div>
              <h1 className={`${classes.heading} font-bold text-gray-900`}>Adventures</h1>
              <p className={`${classes.text} text-gray-600 mt-1`}>Manage your adventure offerings</p>
            </div>
            <Button 
              onClick={() => router.push('/business/adventures/new')}
              className={`flex items-center gap-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium ${classes.button}`}
            >
              <Plus className="w-4 h-4 md:w-5 md:h-5" />
              {isMobile ? 'Create Adventure' : 'Create New Adventure'}
            </Button>
          </div>

          {/* Filters and Search */}
          <div className={`bg-white rounded-lg border border-gray-200 ${classes.card}`}>
            <div className={`flex ${isMobile ? 'flex-col gap-4' : 'flex-row gap-4 items-center justify-between'}`}>
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 md:w-5 md:h-5" />
                <input
                  type="text"
                  placeholder="Search adventures..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`pl-8 md:pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${classes.text}`}
                />
              </div>

              {/* Filters */}
              <div className={`flex ${isMobile ? 'flex-col gap-3' : 'flex-row gap-4'} items-stretch md:items-center`}>
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-gray-500" />
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className={`border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${classes.text}`}
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="draft">Draft</option>
                    <option value="paused">Paused</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>

                <select
                  value={selectedActivityType}
                  onChange={(e) => setSelectedActivityType(e.target.value)}
                  className={`border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${classes.text}`}
                >
                  <option value="all">{isMobile ? 'All Types' : 'Filter by Activity Type'}</option>
                  {activityTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className={`border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${classes.text}`}
                >
                  <option value="updated_at">Recently Updated</option>
                  <option value="title">Title A-Z</option>
                  <option value="price">Price High to Low</option>
                  <option value="rating">Rating</option>
                  <option value="bookings">Most Booked</option>
                </select>
              </div>
            </div>
          </div>

          {/* Adventures Grid */}
          <div className={`grid ${getResponsiveGridCols(filteredAdventures.length, screenSize)} gap-4 md:gap-6`}>
            {filteredAdventures.map((adventure) => (
              <div key={adventure.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
                {/* Image */}
                <div className="aspect-video bg-gray-100 relative">
                  <img
                    src={adventure.primary_image_url}
                    alt={adventure.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 md:top-4 left-3 md:left-4">
                    {getStatusBadge(adventure.status)}
                  </div>
                  <div className="absolute top-3 md:top-4 right-3 md:right-4">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="p-1.5 md:p-2 bg-white rounded-full shadow-lg hover:bg-gray-50 transition-colors">
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Edit2 className="w-4 h-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Eye className="w-4 h-4 mr-2" />
                          View
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <BarChart3 className="w-4 h-4 mr-2" />
                          Analytics
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                {/* Content */}
                <div className={classes.card}>
                  <div className={`flex items-start justify-between mb-3 ${isMobile ? 'flex-col gap-2' : ''}`}>
                    <div className="flex-1 min-w-0">
                      <h3 className={`${isMobile ? 'text-lg' : 'text-xl'} font-bold text-gray-900 mb-1 truncate`}>{adventure.title}</h3>
                      <div className={`flex items-center text-gray-600 ${classes.text}`}>
                        <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
                        <span className="truncate">{adventure.location}</span>
                      </div>
                    </div>
                    <div className={`text-right ${isMobile ? 'w-full text-left' : ''}`}>
                      <div className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold text-gray-900`}>
                        {formatCurrency(adventure.price_per_person)}
                      </div>
                      <div className={`${classes.text} text-gray-500`}>per person</div>
                    </div>
                  </div>

                  <p className={`text-gray-600 ${classes.text} mb-4 line-clamp-2`}>{adventure.description}</p>

                  {/* Stats */}
                  <div className={`grid ${isMobile ? 'grid-cols-2' : 'grid-cols-4'} gap-3 md:gap-4 mb-4`}>
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-1">
                        <Activity className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className={`${classes.text} font-medium text-gray-900 truncate`}>{adventure.activity_type}</div>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-1">
                        <Clock className="w-4 h-4 text-green-600" />
                      </div>
                      <div className={`${classes.text} font-medium text-gray-900`}>{formatDuration(adventure.duration_hours)}</div>
                    </div>
                    {!isMobile && (
                      <>
                        <div className="text-center">
                          <div className="flex items-center justify-center mb-1">
                            <Users className="w-4 h-4 text-purple-600" />
                          </div>
                          <div className={`${classes.text} font-medium text-gray-900`}>{adventure.max_guests} Spots</div>
                        </div>
                        <div className="text-center">
                          <div className="flex items-center justify-center mb-1">
                            {adventure.rating > 0 ? (
                              <Star className="w-4 h-4 text-yellow-500 fill-current" />
                            ) : (
                              <Star className="w-4 h-4 text-gray-400" />
                            )}
                          </div>
                          <div className={`${classes.text} font-medium text-gray-900`}>
                            {adventure.rating > 0 ? `${adventure.rating} (${adventure.total_reviews})` : 'No reviews'}
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Additional stats for mobile */}
                  {isMobile && (
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="text-center">
                        <div className="flex items-center justify-center mb-1">
                          <Users className="w-4 h-4 text-purple-600" />
                        </div>
                        <div className={`${classes.text} font-medium text-gray-900`}>{adventure.max_guests} Spots</div>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center mb-1">
                          {adventure.rating > 0 ? (
                            <Star className="w-4 h-4 text-yellow-500 fill-current" />
                          ) : (
                            <Star className="w-4 h-4 text-gray-400" />
                          )}
                        </div>
                        <div className={`${classes.text} font-medium text-gray-900`}>
                          {adventure.rating > 0 ? `${adventure.rating}` : 'No reviews'}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Tags */}
                  <div className="flex gap-2 mb-4 overflow-x-auto">
                    {adventure.tags.slice(0, isMobile ? 2 : 3).map((tag, index) => (
                      <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full whitespace-nowrap">
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className={`flex gap-2 ${isMobile ? 'flex-col' : ''}`}>
                    <button className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors ${classes.text}`}>
                      <Edit2 className="w-4 h-4" />
                      Edit
                    </button>
                    <button className={`${isMobile ? 'flex-1' : ''} flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors ${classes.text}`}>
                      <Eye className="w-4 h-4" />
                      View
                    </button>
                    <button className={`${isMobile ? 'flex-1' : ''} flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors ${classes.text}`}>
                      <BarChart3 className="w-4 h-4" />
                      {!isMobile && 'Analytics'}
                    </button>
                  </div>

                  {/* Stats Footer */}
                  <div className={`flex items-center justify-between mt-4 pt-4 border-t border-gray-100 ${classes.text} text-gray-500`}>
                    <span>{adventure.total_bookings} bookings</span>
                    <span>Updated {new Date(adventure.updated_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {filteredAdventures.length === 0 && (
            <div className={`bg-white rounded-lg border border-gray-200 ${classes.card} text-center`}>
              <Camera className={`${classes.iconSize} text-gray-400 mx-auto mb-4`} />
              <h3 className={`${classes.subheading} font-medium text-gray-900 mb-2`}>No adventures found</h3>
              <p className={`text-gray-500 mb-6 ${classes.text}`}>
                {searchQuery || selectedStatus !== 'all' || selectedActivityType !== 'all'
                  ? 'Try adjusting your filters or search terms.'
                  : 'Create your first adventure to get started.'
                }
              </p>
              {!searchQuery && selectedStatus === 'all' && selectedActivityType === 'all' && (
                <button 
                  onClick={() => router.push('/business/adventures/new')}
                  className={`flex items-center gap-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium mx-auto ${classes.button}`}
                >
                  <Plus className="w-4 h-4 md:w-5 md:h-5" />
                  Create Your First Adventure
                </button>
              )}
            </div>
          )}

          {/* Stats Summary */}
          <div className={`bg-white rounded-lg border border-gray-200 ${classes.card}`}>
            <h3 className={`${classes.subheading} font-semibold text-gray-900 mb-4`}>Adventure Summary</h3>
            <div className={`grid ${isMobile ? 'grid-cols-2' : isTablet ? 'grid-cols-3' : 'grid-cols-6'} gap-4 md:gap-6`}>
              <div className="text-center">
                <div className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold text-blue-600`}>{adventures.length}</div>
                <div className={`${classes.text} text-gray-500`}>Total Adventures</div>
              </div>
              <div className="text-center">
                <div className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold text-green-600`}>
                  {adventures.filter(a => a.status === 'active').length}
                </div>
                <div className={`${classes.text} text-gray-500`}>Active</div>
              </div>
              <div className="text-center">
                <div className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold text-gray-600`}>
                  {adventures.filter(a => a.status === 'draft').length}
                </div>
                <div className={`${classes.text} text-gray-500`}>Drafts</div>
              </div>
              {(!isMobile || isTablet) && (
                <>
                  <div className="text-center">
                    <div className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold text-purple-600`}>
                      {adventures.reduce((sum, a) => sum + a.total_bookings, 0)}
                    </div>
                    <div className={`${classes.text} text-gray-500`}>Total Bookings</div>
                  </div>
                  <div className="text-center">
                    <div className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold text-yellow-600`}>
                      {adventures.filter(a => a.rating > 0).length > 0 
                        ? (adventures.reduce((sum, a) => sum + a.rating, 0) / adventures.filter(a => a.rating > 0).length).toFixed(1)
                        : '0.0'
                      }
                    </div>
                    <div className={`${classes.text} text-gray-500`}>Avg Rating</div>
                  </div>
                  <div className="text-center">
                    <div className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold text-green-600`}>
                      {formatCurrency(adventures.reduce((sum, a) => sum + (a.price_per_person * a.total_bookings), 0))}
                    </div>
                    <div className={`${classes.text} text-gray-500`}>Total Revenue</div>
                  </div>
                </>
              )}
            </div>
            {isMobile && !isTablet && (
              <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-100">
                <div className="text-center">
                  <div className="text-xl font-bold text-purple-600">
                    {adventures.reduce((sum, a) => sum + a.total_bookings, 0)}
                  </div>
                  <div className={`${classes.text} text-gray-500`}>Bookings</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-yellow-600">
                    {adventures.filter(a => a.rating > 0).length > 0 
                      ? (adventures.reduce((sum, a) => sum + a.rating, 0) / adventures.filter(a => a.rating > 0).length).toFixed(1)
                      : '0.0'
                    }
                  </div>
                  <div className={`${classes.text} text-gray-500`}>Rating</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-green-600">
                    {formatCurrency(adventures.reduce((sum, a) => sum + (a.price_per_person * a.total_bookings), 0))}
                  </div>
                  <div className={`${classes.text} text-gray-500`}>Revenue</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </BusinessLayout>
    </BusinessProtectedRoute>
  )
}
