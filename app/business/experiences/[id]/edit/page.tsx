
"use client"

import React, { useState, useCallback, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { BusinessProtectedRoute } from "@/components/auth/BusinessProtectedRoute"
import { BusinessLayout } from "@/components/layouts/BusinessLayout"
import { getExperienceById, updateExperience } from "@/lib/database"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  X,
  ChevronRight,
  ChevronLeft,
  Check,
  MapPin,
  Clock,
  Users,
  DollarSign,
  Plus,
  Trash2,
  Upload,
  FileText,
  Camera,
  Shield,
  Activity,
  AlertCircle,
  Star,
  Settings,
  Eye,
  Save,
  Loader2
} from "lucide-react"

// Types for form data
interface ExperienceFormData {
  title: string
  description: string
  short_description: string
  location: string
  specific_location: string
  country: string
  activity_type: string
  category: string[]
  duration_hours: number
  duration_display: string
  max_guests: number
  min_guests: number
  price_per_person: number
  difficulty_level: string
  primary_image_url: string
  weather_contingency: string
  included_amenities: string[]
  what_to_bring: string[]
  min_age: number | null
  max_age: number | null
  age_restriction_details: string
  activity_specific_details: any
  tags: string[]
  seasonal_availability: string[]
  is_active: boolean
  itinerary: Array<{ time: string; activity: string; description?: string }>
}

interface FormErrors {
  [key: string]: string
}

// Activity types and categories
const ACTIVITY_TYPES = [
  'sailing', 'kayaking', 'snorkeling', 'diving', 'surfing', 'fishing',
  'boat_tours', 'yacht_charter', 'jet_skiing', 'paddleboarding',
  'windsurfing', 'kite_surfing', 'swimming', 'beach_activities', 'other'
]

const CATEGORIES = [
  'adventure', 'relaxation', 'family-friendly', 'romantic', 'luxury',
  'budget-friendly', 'group-activity', 'solo-friendly', 'beginner-friendly',
  'advanced', 'seasonal', 'wildlife', 'cultural', 'photography'
]

const DIFFICULTY_LEVELS = ['beginner', 'intermediate', 'advanced', 'expert']

const SEASONAL_AVAILABILITY = ['spring', 'summer', 'autumn', 'winter', 'year-round']

const steps = [
  { id: 1, title: 'Experience Basics', icon: <Activity className="h-5 w-5" /> },
  { id: 2, title: 'Activity Details', icon: <Star className="h-5 w-5" /> },
  { id: 3, title: 'Pricing & Capacity', icon: <Users className="h-5 w-5" /> },
  { id: 4, title: 'Itinerary', icon: <Clock className="h-5 w-5" /> },
  { id: 5, title: 'Logistics', icon: <Settings className="h-5 w-5" /> },
  { id: 6, title: 'Preview & Save', icon: <Save className="h-5 w-5" /> }
]

export default function EditExperiencePage() {
  const router = useRouter()
  const params = useParams()
  const { user, businessProfile } = useAuth()
  const { toast } = useToast()

  const experienceId = params.id as string

  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<ExperienceFormData>({
    title: '',
    description: '',
    short_description: '',
    location: '',
    specific_location: '',
    country: '',
    activity_type: '',
    category: [],
    duration_hours: 2,
    duration_display: '',
    max_guests: 8,
    min_guests: 1,
    price_per_person: 50,
    difficulty_level: 'beginner',
    primary_image_url: '',
    weather_contingency: '',
    included_amenities: [],
    what_to_bring: [],
    min_age: null,
    max_age: null,
    age_restriction_details: '',
    activity_specific_details: {},
    tags: [],
    seasonal_availability: [],
    is_active: true,
    itinerary: []
  })
  
  const [completedSteps, setCompletedSteps] = useState(new Set<number>())
  const [errors, setErrors] = useState<FormErrors>({})
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingExperience, setIsLoadingExperience] = useState(true)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  // Load experience data
  useEffect(() => {
    const loadExperience = async () => {
      if (!experienceId) return

      try {
        setIsLoadingExperience(true)
        const result = await getExperienceById(experienceId)

        if (result.success && result.data) {
          const exp = result.data
          setFormData({
            title: exp.title || '',
            description: exp.description || '',
            short_description: exp.short_description || '',
            location: exp.location || '',
            specific_location: exp.specific_location || '',
            country: exp.country || '',
            activity_type: exp.activity_type || '',
            category: exp.category || [],
            duration_hours: exp.duration_hours || 2,
            duration_display: exp.duration_display || '',
            max_guests: exp.max_guests || 8,
            min_guests: exp.min_guests || 1,
            price_per_person: exp.price_per_person || 50,
            difficulty_level: exp.difficulty_level || 'beginner',
            primary_image_url: exp.primary_image_url || '',
            weather_contingency: exp.weather_contingency || '',
            included_amenities: exp.included_amenities || [],
            what_to_bring: exp.what_to_bring || [],
            min_age: exp.min_age || null,
            max_age: exp.max_age || null,
            age_restriction_details: exp.age_restriction_details || '',
            activity_specific_details: exp.activity_specific_details || {},
            tags: exp.tags || [],
            seasonal_availability: exp.seasonal_availability || [],
            is_active: exp.is_active ?? true,
            itinerary: exp.itinerary || []
          })
        } else {
          toast({
            title: "Error",
            description: "Failed to load experience data",
            variant: "destructive"
          })
          router.push('/business/experiences')
        }
      } catch (error) {
        console.error('Error loading experience:', error)
        toast({
          title: "Error",
          description: "Failed to load experience data",
          variant: "destructive"
        })
        router.push('/business/experiences')
      } finally {
        setIsLoadingExperience(false)
      }
    }

    loadExperience()
  }, [experienceId, router, toast])

  const updateFormData = useCallback((field: keyof ExperienceFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }, [errors])

  const addToArray = useCallback((field: keyof ExperienceFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: [...(prev[field] as string[]), value]
    }))
  }, [])

  const removeFromArray = useCallback((field: keyof ExperienceFormData, index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: (prev[field] as string[]).filter((_, i) => i !== index)
    }))
  }, [])

  const addItineraryItem = useCallback(() => {
    setFormData(prev => ({
      ...prev,
      itinerary: [...prev.itinerary, { time: '', activity: '', description: '' }]
    }))
  }, [])

  const updateItineraryItem = useCallback((index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      itinerary: prev.itinerary.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      )
    }))
  }, [])

  const removeItineraryItem = useCallback((index: number) => {
    setFormData(prev => ({
      ...prev,
      itinerary: prev.itinerary.filter((_, i) => i !== index)
    }))
  }, [])

  const validateStep = (step: number): boolean => {
    const stepErrors: FormErrors = {}

    switch (step) {
      case 1:
        if (!formData.title.trim()) stepErrors.title = 'Title is required'
        if (!formData.description.trim()) stepErrors.description = 'Description is required'
        if (!formData.location.trim()) stepErrors.location = 'Location is required'
        if (!formData.activity_type) stepErrors.activity_type = 'Activity type is required'
        break
      case 2:
        if (!formData.difficulty_level) stepErrors.difficulty_level = 'Difficulty level is required'
        if (formData.category.length === 0) stepErrors.category = 'At least one category is required'
        break
      case 3:
        if (formData.price_per_person <= 0) stepErrors.price_per_person = 'Price must be greater than 0'
        if (formData.max_guests <= 0) stepErrors.max_guests = 'Max guests must be greater than 0'
        if (formData.min_guests <= 0) stepErrors.min_guests = 'Min guests must be greater than 0'
        if (formData.min_guests > formData.max_guests) stepErrors.min_guests = 'Min guests cannot be greater than max guests'
        if (formData.duration_hours <= 0) stepErrors.duration_hours = 'Duration must be greater than 0'
        break
    }

    setErrors(stepErrors)
    return Object.keys(stepErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCompletedSteps(prev => new Set([...prev, currentStep]))
      setCurrentStep(prev => Math.min(prev + 1, steps.length))
    }
  }

  const handlePrev = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1))
  }

  const handleStepClick = (step: number) => {
    if (step <= currentStep || completedSteps.has(step - 1)) {
      setCurrentStep(step)
    }
  }

  const handleSave = async () => {
    if (!user || !businessProfile) {
      toast({
        title: "Error",
        description: "You must be logged in as a business user to save experiences.",
        variant: "destructive"
      })
      return
    }

    try {
      setIsLoading(true)

      // Validate all steps
      for (let i = 1; i <= 5; i++) {
        if (!validateStep(i)) {
          setCurrentStep(i)
          toast({
            title: "Validation Error",
            description: `Please complete step ${i} before saving.`,
            variant: "destructive"
          })
          return
        }
      }

      const updateData = {
        title: formData.title,
        description: formData.description,
        short_description: formData.short_description || formData.description.substring(0, 150) + '...',
        location: formData.location,
        specific_location: formData.specific_location,
        country: formData.country,
        activity_type: formData.activity_type,
        category: formData.category,
        duration_hours: formData.duration_hours,
        duration_display: formData.duration_display || `${formData.duration_hours} hours`,
        max_guests: formData.max_guests,
        min_guests: formData.min_guests,
        price_per_person: formData.price_per_person,
        difficulty_level: formData.difficulty_level,
        primary_image_url: formData.primary_image_url,
        weather_contingency: formData.weather_contingency,
        included_amenities: formData.included_amenities,
        what_to_bring: formData.what_to_bring,
        min_age: formData.min_age,
        max_age: formData.max_age,
        age_restriction_details: formData.age_restriction_details,
        activity_specific_details: formData.activity_specific_details,
        tags: formData.tags,
        seasonal_availability: formData.seasonal_availability,
        is_active: formData.is_active,
        itinerary: formData.itinerary
      }

      const result = await updateExperience(experienceId, updateData)

      if (!result) {
        throw new Error('Failed to update experience')
      }

      toast({
        title: "Success!",
        description: "Your experience has been updated successfully.",
      })

      router.push('/business/experiences')
    } catch (error: any) {
      console.error('Error updating experience:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to update experience. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (!isClient || isLoadingExperience) {
    return (
      <BusinessProtectedRoute>
        <BusinessLayout>
          <div className="max-w-4xl mx-auto p-6">
            <div className="space-y-6">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-96" />
              <div className="space-y-4">
                <Skeleton className="h-64 w-full" />
                <Skeleton className="h-32 w-full" />
              </div>
            </div>
          </div>
        </BusinessLayout>
      </BusinessProtectedRoute>
    )
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <Label htmlFor="title">Experience Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => updateFormData('title', e.target.value)}
                placeholder="e.g., Sunset Sailing Adventure in Santorini"
                className={errors.title ? 'border-red-500' : ''}
              />
              {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
            </div>

            <div>
              <Label htmlFor="short_description">Short Description</Label>
              <Input
                id="short_description"
                value={formData.short_description}
                onChange={(e) => updateFormData('short_description', e.target.value)}
                placeholder="Brief catchy description (max 150 characters)"
                maxLength={150}
              />
            </div>

            <div>
              <Label htmlFor="description">Full Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => updateFormData('description', e.target.value)}
                placeholder="Detailed description of your experience..."
                rows={5}
                className={errors.description ? 'border-red-500' : ''}
              />
              {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="location">Location *</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => updateFormData('location', e.target.value)}
                  placeholder="e.g., Santorini, Greece"
                  className={errors.location ? 'border-red-500' : ''}
                />
                {errors.location && <p className="text-red-500 text-sm mt-1">{errors.location}</p>}
              </div>

              <div>
                <Label htmlFor="specific_location">Specific Location</Label>
                <Input
                  id="specific_location"
                  value={formData.specific_location}
                  onChange={(e) => updateFormData('specific_location', e.target.value)}
                  placeholder="e.g., Oia Harbor"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="activity_type">Activity Type *</Label>
              <Select 
                value={formData.activity_type} 
                onValueChange={(value) => updateFormData('activity_type', value)}
              >
                <SelectTrigger className={errors.activity_type ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select activity type" />
                </SelectTrigger>
                <SelectContent>
                  {ACTIVITY_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.activity_type && <p className="text-red-500 text-sm mt-1">{errors.activity_type}</p>}
            </div>

            <div>
              <Label htmlFor="primary_image_url">Primary Image URL</Label>
              <Input
                id="primary_image_url"
                value={formData.primary_image_url}
                onChange={(e) => updateFormData('primary_image_url', e.target.value)}
                placeholder="https://example.com/image.jpg"
                type="url"
              />
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <Label>Categories *</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {CATEGORIES.map((cat) => (
                  <Badge
                    key={cat}
                    variant={formData.category.includes(cat) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => {
                      if (formData.category.includes(cat)) {
                        updateFormData('category', formData.category.filter(c => c !== cat))
                      } else {
                        updateFormData('category', [...formData.category, cat])
                      }
                    }}
                  >
                    {cat.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </Badge>
                ))}
              </div>
              {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
            </div>

            <div>
              <Label htmlFor="difficulty_level">Difficulty Level *</Label>
              <Select 
                value={formData.difficulty_level} 
                onValueChange={(value) => updateFormData('difficulty_level', value)}
              >
                <SelectTrigger className={errors.difficulty_level ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select difficulty level" />
                </SelectTrigger>
                <SelectContent>
                  {DIFFICULTY_LEVELS.map((level) => (
                    <SelectItem key={level} value={level}>
                      {level.charAt(0).toUpperCase() + level.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.difficulty_level && <p className="text-red-500 text-sm mt-1">{errors.difficulty_level}</p>}
            </div>

            <div>
              <Label>Seasonal Availability</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {SEASONAL_AVAILABILITY.map((season) => (
                  <Badge
                    key={season}
                    variant={formData.seasonal_availability.includes(season) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => {
                      if (formData.seasonal_availability.includes(season)) {
                        updateFormData('seasonal_availability', formData.seasonal_availability.filter(s => s !== season))
                      } else {
                        updateFormData('seasonal_availability', [...formData.seasonal_availability, season])
                      }
                    }}
                  >
                    {season.charAt(0).toUpperCase() + season.slice(1)}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="weather_contingency">Weather Contingency</Label>
              <Textarea
                id="weather_contingency"
                value={formData.weather_contingency}
                onChange={(e) => updateFormData('weather_contingency', e.target.value)}
                placeholder="What happens if weather conditions are unsuitable?"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="min_age">Minimum Age</Label>
                <Input
                  id="min_age"
                  type="number"
                  value={formData.min_age || ''}
                  onChange={(e) => updateFormData('min_age', e.target.value ? parseInt(e.target.value) : null)}
                  placeholder="e.g., 12"
                />
              </div>

              <div>
                <Label htmlFor="max_age">Maximum Age</Label>
                <Input
                  id="max_age"
                  type="number"
                  value={formData.max_age || ''}
                  onChange={(e) => updateFormData('max_age', e.target.value ? parseInt(e.target.value) : null)}
                  placeholder="e.g., 65"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="age_restriction_details">Age Restriction Details</Label>
              <Textarea
                id="age_restriction_details"
                value={formData.age_restriction_details}
                onChange={(e) => updateFormData('age_restriction_details', e.target.value)}
                placeholder="Any specific age-related requirements or restrictions..."
                rows={2}
              />
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="price_per_person">Price per Person (€) *</Label>
                <Input
                  id="price_per_person"
                  type="number"
                  value={formData.price_per_person}
                  onChange={(e) => updateFormData('price_per_person', parseFloat(e.target.value) || 0)}
                  placeholder="50"
                  min="0"
                  step="0.01"
                  className={errors.price_per_person ? 'border-red-500' : ''}
                />
                {errors.price_per_person && <p className="text-red-500 text-sm mt-1">{errors.price_per_person}</p>}
              </div>

              <div>
                <Label htmlFor="duration_hours">Duration (Hours) *</Label>
                <Input
                  id="duration_hours"
                  type="number"
                  value={formData.duration_hours}
                  onChange={(e) => updateFormData('duration_hours', parseFloat(e.target.value) || 0)}
                  placeholder="2"
                  min="0.5"
                  step="0.5"
                  className={errors.duration_hours ? 'border-red-500' : ''}
                />
                {errors.duration_hours && <p className="text-red-500 text-sm mt-1">{errors.duration_hours}</p>}
              </div>
            </div>

            <div>
              <Label htmlFor="duration_display">Duration Display</Label>
              <Input
                id="duration_display"
                value={formData.duration_display}
                onChange={(e) => updateFormData('duration_display', e.target.value)}
                placeholder="e.g., 2-3 hours or Half day"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="min_guests">Minimum Guests *</Label>
                <Input
                  id="min_guests"
                  type="number"
                  value={formData.min_guests}
                  onChange={(e) => updateFormData('min_guests', parseInt(e.target.value) || 1)}
                  placeholder="1"
                  min="1"
                  className={errors.min_guests ? 'border-red-500' : ''}
                />
                {errors.min_guests && <p className="text-red-500 text-sm mt-1">{errors.min_guests}</p>}
              </div>

              <div>
                <Label htmlFor="max_guests">Maximum Guests *</Label>
                <Input
                  id="max_guests"
                  type="number"
                  value={formData.max_guests}
                  onChange={(e) => updateFormData('max_guests', parseInt(e.target.value) || 1)}
                  placeholder="8"
                  min="1"
                  className={errors.max_guests ? 'border-red-500' : ''}
                />
                {errors.max_guests && <p className="text-red-500 text-sm mt-1">{errors.max_guests}</p>}
              </div>
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Experience Itinerary</h3>
                <p className="text-gray-600">Add timeline details for your experience</p>
              </div>
              <Button onClick={addItineraryItem} variant="outline" size="sm">
                <Plus className="w-4 h-4 mr-1" />
                Add Item
              </Button>
            </div>

            <div className="space-y-4">
              {formData.itinerary.map((item, index) => (
                <Card key={index}>
                  <CardContent className="pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor={`time-${index}`}>Time</Label>
                        <Input
                          id={`time-${index}`}
                          value={item.time}
                          onChange={(e) => updateItineraryItem(index, 'time', e.target.value)}
                          placeholder="e.g., 09:00 AM"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`activity-${index}`}>Activity</Label>
                        <Input
                          id={`activity-${index}`}
                          value={item.activity}
                          onChange={(e) => updateItineraryItem(index, 'activity', e.target.value)}
                          placeholder="e.g., Departure from harbor"
                        />
                      </div>
                      <div className="flex items-end">
                        <Button
                          onClick={() => removeItineraryItem(index)}
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="mt-2">
                      <Label htmlFor={`description-${index}`}>Description</Label>
                      <Textarea
                        id={`description-${index}`}
                        value={item.description || ''}
                        onChange={(e) => updateItineraryItem(index, 'description', e.target.value)}
                        placeholder="Optional details about this part of the experience..."
                        rows={2}
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}

              {formData.itinerary.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Clock className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No itinerary items yet. Add your first item to get started.</p>
                </div>
              )}
            </div>
          </div>
        )

      case 5:
        return (
          <div className="space-y-6">
            <div>
              <Label>Included Amenities</Label>
              <div className="mt-2">
                <div className="flex gap-2 mb-2">
                  <Input
                    placeholder="Add amenity..."
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        const value = (e.target as HTMLInputElement).value.trim()
                        if (value && !formData.included_amenities.includes(value)) {
                          addToArray('included_amenities', value);
                          (e.target as HTMLInputElement).value = ''
                        }
                      }
                    }}
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.included_amenities.map((amenity, index) => (
                    <Badge key={index} variant="secondary">
                      {amenity}
                      <X
                        className="w-3 h-3 ml-1 cursor-pointer"
                        onClick={() => removeFromArray('included_amenities', index)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <Label>What to Bring</Label>
              <div className="mt-2">
                <div className="flex gap-2 mb-2">
                  <Input
                    placeholder="Add item to bring..."
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        const value = (e.target as HTMLInputElement).value.trim()
                        if (value && !formData.what_to_bring.includes(value)) {
                          addToArray('what_to_bring', value);
                          (e.target as HTMLInputElement).value = ''
                        }
                      }
                    }}
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.what_to_bring.map((item, index) => (
                    <Badge key={index} variant="outline">
                      {item}
                      <X
                        className="w-3 h-3 ml-1 cursor-pointer"
                        onClick={() => removeFromArray('what_to_bring', index)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <Label>Tags</Label>
              <div className="mt-2">
                <div className="flex gap-2 mb-2">
                  <Input
                    placeholder="Add tag..."
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        const value = (e.target as HTMLInputElement).value.trim()
                        if (value && !formData.tags.includes(value)) {
                          addToArray('tags', value);
                          (e.target as HTMLInputElement).value = ''
                        }
                      }
                    }}
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag, index) => (
                    <Badge key={index} variant="default">
                      {tag}
                      <X
                        className="w-3 h-3 ml-1 cursor-pointer"
                        onClick={() => removeFromArray('tags', index)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={(e) => updateFormData('is_active', e.target.checked)}
                className="rounded"
              />
              <Label htmlFor="is_active">Experience is active and bookable</Label>
            </div>
          </div>
        )

      case 6:
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Preview Your Experience</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg">{formData.title}</h3>
                  <p className="text-gray-600">{formData.location}</p>
                  <p className="text-sm text-gray-500 mt-2">{formData.short_description || formData.description.substring(0, 150) + '...'}</p>
                </div>

                <div className="flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span>{formData.duration_display || `${formData.duration_hours} hours`}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4 text-gray-400" />
                    <span>{formData.min_guests}-{formData.max_guests} guests</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <DollarSign className="w-4 h-4 text-gray-400" />
                    <span>€{formData.price_per_person}/person</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {formData.category.map((cat, index) => (
                    <Badge key={index} variant="outline">
                      {cat}
                    </Badge>
                  ))}
                </div>

                <div>
                  <Badge variant={formData.is_active ? "default" : "secondary"}>
                    {formData.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Review your experience details above. Click "Save Changes" to update your experience.
              </AlertDescription>
            </Alert>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <BusinessProtectedRoute>
      <BusinessLayout>
        <div className="max-w-4xl mx-auto p-6">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/business/experiences')}
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Back to Experiences
              </Button>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Edit Experience</h1>
            <p className="text-gray-600 mt-2">Update your water adventure experience</p>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-gray-700">
                Step {currentStep} of {steps.length}
              </span>
              <span className="text-sm text-gray-500">
                {Math.round((currentStep / steps.length) * 100)}% Complete
              </span>
            </div>
            <Progress value={(currentStep / steps.length) * 100} className="h-2" />
          </div>

          {/* Step Navigation */}
          <div className="mb-8">
            <div className="flex flex-wrap gap-2">
              {steps.map((step) => (
                <Button
                  key={step.id}
                  variant={currentStep === step.id ? "default" : completedSteps.has(step.id) ? "secondary" : "outline"}
                  size="sm"
                  onClick={() => handleStepClick(step.id)}
                  className="flex items-center gap-2"
                  disabled={step.id > currentStep && !completedSteps.has(step.id - 1)}
                >
                  {step.icon}
                  <span className="hidden sm:inline">{step.title}</span>
                  <span className="sm:hidden">{step.id}</span>
                  {completedSteps.has(step.id) && <Check className="w-3 h-3" />}
                </Button>
              ))}
            </div>
          </div>

          {/* Form Content */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {steps[currentStep - 1].icon}
                {steps[currentStep - 1].title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {renderStepContent()}
            </CardContent>
          </Card>

          {/* Navigation Buttons */}
          <div className="flex justify-between">
            <Button
              onClick={handlePrev}
              variant="outline"
              disabled={currentStep === 1}
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Previous
            </Button>

            <div className="flex gap-3">
              {currentStep === steps.length ? (
                <Button
                  onClick={handleSave}
                  disabled={isLoading}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="animate-spin rounded-full h-4 w-4 mr-2" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-1" />
                      Save Changes
                    </>
                  )}
                </Button>
              ) : (
                <Button onClick={handleNext}>
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </BusinessLayout>
    </BusinessProtectedRoute>
  )
}
