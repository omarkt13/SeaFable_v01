"use client"

import React, { useState, useCallback, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { BusinessProtectedRoute } from "@/components/auth/BusinessProtectedRoute"
import { BusinessLayout } from "@/components/layouts/BusinessLayout"
import { createExperience } from "@/lib/supabase-business"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
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
  AlertCircle
} from "lucide-react"

// Types
interface ExperienceFormData {
  // Basic Info
  title: string
  description: string
  short_description: string
  activity_type: string
  category: string[]

  // Location
  location: string
  specific_location: string
  country: string

  // Details
  duration_hours: number
  duration_display: string
  max_guests: number
  min_guests: number
  price_per_person: number
  difficulty_level: string

  // Media
  primary_image_url: string
  additional_images: string[]

  // Inclusions & Requirements
  included_amenities: string[]
  what_to_bring: string[]
  min_age: number
  max_age: number
  age_restriction_details: string

  // Additional
  weather_contingency: string
  seasonal_availability: string[]
  tags: string[]
}

interface FormErrors {
  [key: string]: string
}

const STEPS = [
  { id: 1, title: 'Basic Info', description: 'Title, description, and activity type', icon: FileText },
  { id: 2, title: 'Location', description: 'Where the experience takes place', icon: MapPin },
  { id: 3, title: 'Details', description: 'Pricing, duration, and specifications', icon: Clock },
  { id: 4, title: 'Media', description: 'Photos and visual content', icon: Camera },
  { id: 5, title: 'Inclusions', description: 'What\'s included and requirements', icon: Shield },
  { id: 6, title: 'Review', description: 'Preview and publish', icon: Check }
]

const ACTIVITY_TYPES = [
  { value: 'sailing', label: 'Sailing', icon: '⛵', description: 'Sailing tours and yacht experiences' },
  { value: 'surfing', label: 'Surfing', icon: '🏄', description: 'Surfing lessons and surf tours' },
  { value: 'diving', label: 'Diving', icon: '🤿', description: 'Scuba diving and snorkeling' },
  { value: 'kayaking', label: 'Kayaking', icon: '🚣', description: 'Kayak tours and rentals' },
  { value: 'fishing', label: 'Fishing', icon: '🎣', description: 'Fishing charters and tours' },
  { value: 'jet-skiing', label: 'Jet Skiing', icon: '🏄‍♂️', description: 'Jet ski rentals and tours' },
  { value: 'whale-watching', label: 'Whale Watching', icon: '🐋', description: 'Marine wildlife observation' },
  { value: 'paddleboarding', label: 'Paddleboarding', icon: '🏄‍♀️', description: 'SUP rentals and lessons' }
]

const DIFFICULTY_LEVELS = [
  { value: 'beginner', label: 'Beginner', description: 'No experience required' },
  { value: 'intermediate', label: 'Intermediate', description: 'Some experience helpful' },
  { value: 'advanced', label: 'Advanced', description: 'Experienced participants only' },
  { value: 'expert', label: 'Expert', description: 'Professional level required' }
]

const CATEGORIES = [
  'Water Sports', 'Marine Wildlife', 'Sailing', 'Adventure', 'Relaxation', 
  'Family-Friendly', 'Luxury', 'Educational', 'Photography', 'Romantic'
]

export default function NewExperiencePage() {
  const router = useRouter()
  const { user, businessProfile } = useAuth()
  const { toast } = useToast()

  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})
  const [isClient, setIsClient] = useState(false)

  // Fix SSR hydration issues
  useEffect(() => {
    setIsClient(true)
  }, [])

  const [formData, setFormData] = useState<ExperienceFormData>({
    title: '',
    description: '',
    short_description: '',
    activity_type: '',
    category: [],
    location: '',
    specific_location: '',
    country: '',
    duration_hours: 1,
    duration_display: '',
    max_guests: 1,
    min_guests: 1,
    price_per_person: 0,
    difficulty_level: 'beginner',
    primary_image_url: '',
    additional_images: [],
    included_amenities: [],
    what_to_bring: [],
    min_age: 0,
    max_age: 100,
    age_restriction_details: '',
    weather_contingency: '',
    seasonal_availability: [],
    tags: []
  })

  const updateFormData = useCallback((field: keyof ExperienceFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear relevant errors when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }, [errors])

  const addToArray = useCallback((field: keyof ExperienceFormData, item: string) => {
    if (item.trim()) {
      const currentArray = formData[field] as string[]
      if (!currentArray.includes(item.trim())) {
        updateFormData(field, [...currentArray, item.trim()])
      }
    }
  }, [formData, updateFormData])

  const removeFromArray = useCallback((field: keyof ExperienceFormData, index: number) => {
    const currentArray = formData[field] as string[]
    updateFormData(field, currentArray.filter((_, i) => i !== index))
  }, [updateFormData])

  const validateStep = (step: number): boolean => {
    const newErrors: FormErrors = {}

    switch (step) {
      case 1:
        if (!formData.title.trim()) newErrors.title = 'Title is required'
        if (!formData.description.trim()) newErrors.description = 'Description is required'
        if (!formData.activity_type) newErrors.activity_type = 'Activity type is required'
        break
      case 2:
        if (!formData.location.trim()) newErrors.location = 'Location is required'
        if (!formData.country.trim()) newErrors.country = 'Country is required'
        break
      case 3:
        if (formData.duration_hours <= 0) newErrors.duration_hours = 'Duration must be greater than 0'
        if (formData.max_guests <= 0) newErrors.max_guests = 'Max guests must be greater than 0'
        if (formData.min_guests <= 0) newErrors.min_guests = 'Min guests must be greater than 0'
        if (formData.min_guests > formData.max_guests) newErrors.min_guests = 'Min guests cannot exceed max guests'
        if (formData.price_per_person <= 0) newErrors.price_per_person = 'Price must be greater than 0'
        break
      case 4:
        if (!formData.primary_image_url.trim()) newErrors.primary_image_url = 'Primary image is required'
        break
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, STEPS.length))
    }
  }

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1))
  }

  const handlePublish = async () => {
    if (!validateStep(currentStep)) return

    if (!user || !businessProfile) {
      toast({
        title: "Authentication Error",
        description: "Please make sure you're logged in as a business user.",
        variant: "destructive"
      })
      return
    }

    setIsLoading(true)
    try {
      // Prepare data for database
      const experienceData = {
        host_id: businessProfile.id,
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
        min_age: formData.min_age || undefined,
        max_age: formData.max_age > 0 && formData.max_age < 100 ? formData.max_age : undefined,
        age_restriction_details: formData.age_restriction_details,
        tags: formData.tags,
        seasonal_availability: formData.seasonal_availability,
        is_active: true
      }

      const newExperience = await createExperience(experienceData)

      toast({
        title: "Success!",
        description: "Your experience has been created successfully.",
      })

      router.push('/business/experiences')
    } catch (error: any) {
      console.error('Error creating experience:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to create experience. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (!isClient) {
    return <div>Loading...</div>
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
              <Label>Activity Type *</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                {ACTIVITY_TYPES.map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => updateFormData('activity_type', type.value)}
                    className={`p-4 border-2 rounded-lg text-left transition-colors ${
                      formData.activity_type === type.value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-2xl mb-2">{type.icon}</div>
                    <div className="font-medium text-gray-900">{type.label}</div>
                    <div className="text-xs text-gray-500 mt-1">{type.description}</div>
                  </button>
                ))}
              </div>
              {errors.activity_type && <p className="text-red-500 text-sm mt-1">{errors.activity_type}</p>}
            </div>

            <div>
              <Label htmlFor="description">Full Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => updateFormData('description', e.target.value)}
                placeholder="Detailed description of the experience, what guests will enjoy..."
                rows={5}
                className={errors.description ? 'border-red-500' : ''}
              />
              {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
            </div>

            <div>
              <Label htmlFor="short_description">Short Description (Optional)</Label>
              <Textarea
                id="short_description"
                value={formData.short_description}
                onChange={(e) => updateFormData('short_description', e.target.value)}
                placeholder="Brief overview for listings (will auto-generate if left empty)"
                rows={2}
              />
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="country">Country *</Label>
                <Input
                  id="country"
                  value={formData.country}
                  onChange={(e) => updateFormData('country', e.target.value)}
                  placeholder="e.g., Greece"
                  className={errors.country ? 'border-red-500' : ''}
                />
                {errors.country && <p className="text-red-500 text-sm mt-1">{errors.country}</p>}
              </div>

              <div>
                <Label htmlFor="location">City/Location *</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => updateFormData('location', e.target.value)}
                  placeholder="e.g., Santorini"
                  className={errors.location ? 'border-red-500' : ''}
                />
                {errors.location && <p className="text-red-500 text-sm mt-1">{errors.location}</p>}
              </div>
            </div>

            <div>
              <Label htmlFor="specific_location">Specific Location (Optional)</Label>
              <Input
                id="specific_location"
                value={formData.specific_location}
                onChange={(e) => updateFormData('specific_location', e.target.value)}
                placeholder="e.g., Oia Marina, Pier 5"
              />
            </div>

            <div>
              <Label>Categories</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {CATEGORIES.map((category) => (
                  <button
                    key={category}
                    type="button"
                    onClick={() => {
                      const categories = formData.category.includes(category)
                        ? formData.category.filter(c => c !== category)
                        : [...formData.category, category]
                      updateFormData('category', categories)
                    }}
                    className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                      formData.category.includes(category)
                        ? 'bg-blue-500 text-white border-blue-500'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="duration_hours">Duration (Hours) *</Label>
                <Input
                  id="duration_hours"
                  type="number"
                  value={formData.duration_hours}
                  onChange={(e) => updateFormData('duration_hours', parseFloat(e.target.value) || 0)}
                  min="0.5"
                  step="0.5"
                  className={errors.duration_hours ? 'border-red-500' : ''}
                />
                {errors.duration_hours && <p className="text-red-500 text-sm mt-1">{errors.duration_hours}</p>}
              </div>

              <div>
                <Label htmlFor="duration_display">Duration Display (Optional)</Label>
                <Input
                  id="duration_display"
                  value={formData.duration_display}
                  onChange={(e) => updateFormData('duration_display', e.target.value)}
                  placeholder="e.g., Half day, 3-4 hours"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <Label htmlFor="min_guests">Minimum Guests *</Label>
                <Input
                  id="min_guests"
                  type="number"
                  value={formData.min_guests}
                  onChange={(e) => updateFormData('min_guests', parseInt(e.target.value) || 0)}
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
                  onChange={(e) => updateFormData('max_guests', parseInt(e.target.value) || 0)}
                  min="1"
                  className={errors.max_guests ? 'border-red-500' : ''}
                />
                {errors.max_guests && <p className="text-red-500 text-sm mt-1">{errors.max_guests}</p>}
              </div>

              <div>
                <Label htmlFor="price_per_person">Price per Person *</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="price_per_person"
                    type="number"
                    value={formData.price_per_person}
                    onChange={(e) => updateFormData('price_per_person', parseFloat(e.target.value) || 0)}
                    min="0"
                    step="0.01"
                    className={`pl-10 ${errors.price_per_person ? 'border-red-500' : ''}`}
                  />
                </div>
                {errors.price_per_person && <p className="text-red-500 text-sm mt-1">{errors.price_per_person}</p>}
              </div>
            </div>

            <div>
              <Label>Difficulty Level</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                {DIFFICULTY_LEVELS.map((level) => (
                  <button
                    key={level.value}
                    type="button"
                    onClick={() => updateFormData('difficulty_level', level.value)}
                    className={`p-4 border-2 rounded-lg text-left transition-colors ${
                      formData.difficulty_level === level.value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-medium text-gray-900">{level.label}</div>
                    <div className="text-sm text-gray-500">{level.description}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="min_age">Minimum Age (Optional)</Label>
                <Input
                  id="min_age"
                  type="number"
                  value={formData.min_age}
                  onChange={(e) => updateFormData('min_age', parseInt(e.target.value) || 0)}
                  min="0"
                  max="100"
                />
              </div>

              <div>
                <Label htmlFor="max_age">Maximum Age (Optional)</Label>
                <Input
                  id="max_age"
                  type="number"
                  value={formData.max_age}
                  onChange={(e) => updateFormData('max_age', parseInt(e.target.value) || 100)}
                  min="0"
                  max="120"
                />
              </div>
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            <div>
              <Label htmlFor="primary_image_url">Primary Image URL *</Label>
              <Input
                id="primary_image_url"
                type="url"
                value={formData.primary_image_url}
                onChange={(e) => updateFormData('primary_image_url', e.target.value)}
                placeholder="https://example.com/your-image.jpg"
                className={errors.primary_image_url ? 'border-red-500' : ''}
              />
              {errors.primary_image_url && <p className="text-red-500 text-sm mt-1">{errors.primary_image_url}</p>}

              {formData.primary_image_url && (
                <div className="mt-4">
                  <img
                    src={formData.primary_image_url}
                    alt="Primary preview"
                    className="w-full max-w-md h-48 object-cover rounded-lg"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.style.display = 'none'
                    }}
                  />
                </div>
              )}
            </div>

            <Alert>
              <Camera className="h-4 w-4" />
              <AlertDescription>
                Use high-quality images that showcase your experience. The primary image will be the main photo displayed in listings.
              </AlertDescription>
            </Alert>
          </div>
        )

      case 5:
        return (
          <div className="space-y-6">
            <div>
              <Label>What's Included</Label>
              <div className="space-y-2 mt-2">
                {formData.included_amenities.map((item, index) => (
                  <div key={index} className="flex items-center justify-between bg-green-50 px-3 py-2 rounded-lg">
                    <span className="text-green-800">{item}</span>
                    <button
                      type="button"
                      onClick={() => removeFromArray('included_amenities', index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <div className="flex">
                  <Input
                    placeholder="Add included item (e.g., Equipment, Guide, Refreshments)"
                    className="rounded-r-none"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        const input = e.target as HTMLInputElement
                        addToArray('included_amenities', input.value)
                        input.value = ''
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    className="rounded-l-none"
                    onClick={(e) => {
                      const input = (e.target as HTMLElement).parentElement?.querySelector('input')
                      if (input?.value.trim()) {
                        addToArray('included_amenities', input.value)
                        input.value = ''
                      }
                    }}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            <div>
              <Label>What to Bring</Label>
              <div className="space-y-2 mt-2">
                {formData.what_to_bring.map((item, index) => (
                  <div key={index} className="flex items-center justify-between bg-yellow-50 px-3 py-2 rounded-lg">
                    <span className="text-yellow-800">{item}</span>
                    <button
                      type="button"
                      onClick={() => removeFromArray('what_to_bring', index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <div className="flex">
                  <Input
                    placeholder="Add required item (e.g., Swimsuit, Sunscreen, Hat)"
                    className="rounded-r-none"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        const input = e.target as HTMLInputElement
                        addToArray('what_to_bring', input.value)
                        input.value = ''
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    className="rounded-l-none"
                    onClick={(e) => {
                      const input = (e.target as HTMLElement).parentElement?.querySelector('input')
                      if (input?.value.trim()) {
                        addToArray('what_to_bring', input.value)
                        input.value = ''
                      }
                    }}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            <div>
              <Label>Tags</Label>
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeFromArray('tags', index)}
                      className="hover:text-red-500"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <Input
                placeholder="Add tags (press Enter)"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    const input = e.target as HTMLInputElement
                    addToArray('tags', input.value)
                    input.value = ''
                  }
                }}
              />
            </div>

            <div>
              <Label htmlFor="weather_contingency">Weather Contingency Plan</Label>
              <Textarea
                id="weather_contingency"
                value={formData.weather_contingency}
                onChange={(e) => updateFormData('weather_contingency', e.target.value)}
                placeholder="What happens in case of bad weather? (e.g., Rescheduling policy, alternative activities)"
                rows={3}
              />
            </div>
          </div>
        )

      case 6:
        return (
          <div className="space-y-8">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Review Your Experience</h3>
              <p className="text-gray-600">Double-check everything before publishing</p>
            </div>

            <Card>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    {formData.primary_image_url ? (
                      <img
                        src={formData.primary_image_url}
                        alt={formData.title}
                        className="w-full h-48 object-cover rounded-lg"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.src = 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=300&fit=crop'
                        }}
                      />
                    ) : (
                      <div className="w-full h-48 bg-gray-200 rounded-lg flex items-center justify-center">
                        <Camera className="w-12 h-12 text-gray-400" />
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h4 className="text-xl font-bold text-gray-900">{formData.title || 'Untitled Experience'}</h4>
                      <p className="text-gray-600 flex items-center">
                        <MapPin className="w-4 h-4 mr-1" />
                        {formData.location}{formData.country && `, ${formData.country}`}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Activity:</span>
                        <div className="font-medium capitalize">{formData.activity_type.replace('-', ' ') || 'Not specified'}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Duration:</span>
                        <div className="font-medium">{formData.duration_hours}h</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Guests:</span>
                        <div className="font-medium">{formData.min_guests}-{formData.max_guests}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Price:</span>
                        <div className="font-medium text-green-600">${formData.price_per_person}</div>
                      </div>
                    </div>

                    <div>
                      <span className="text-gray-500">Description:</span>
                      <p className="text-sm text-gray-700 mt-1">{formData.description.substring(0, 150)}...</p>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {formData.tags.slice(0, 3).map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {formData.tags.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{formData.tags.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Your experience will be created as active and ready to accept bookings. You can always edit it later.
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
            <h1 className="text-3xl font-bold text-gray-900">Create New Experience</h1>
            <p className="text-gray-600 mt-2">Share your amazing water adventures with the world</p>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-gray-700">
                Step {currentStep} of {STEPS.length}
              </span>
              <span className="text-sm text-gray-500">
                {Math.round((currentStep / STEPS.length) * 100)}% Complete
              </span>
            </div>
            <Progress value={(currentStep / STEPS.length) * 100} className="mb-6" />

            {/* Step indicators */}
            <div className="flex justify-between">
              {STEPS.map((step) => {
                const StepIcon = step.icon
                return (
                  <div
                    key={step.id}
                    className={`flex flex-col items-center text-center ${
                      step.id === currentStep
                        ? 'text-blue-600'
                        : step.id < currentStep
                        ? 'text-green-600'
                        : 'text-gray-400'
                    }`}
                  >
                    <divclassName={`w-10 h-10 rounded-full border-2 flex items-center justify-center mb-2 ${
                        step.id === currentStep
                          ? 'border-blue-600 bg-blue-50'
                          : step.id < currentStep
                          ? 'border-green-600 bg-green-50'
                          : 'border-gray-300'
                      }`}
                    >
                      {step.id < currentStep ? (
                        <Check className="w-5 h-5" />
                      ) : (
                        <StepIcon className="w-5 h-5" />
                      )}
                    </div>
                    <span className="text-xs font-medium hidden sm:block">{step.title}</span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Form Content */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {React.createElement(STEPS[currentStep - 1]?.icon, { className: "w-5 h-5" })}
                {STEPS[currentStep - 1]?.title}
              </CardTitle>
              <p className="text-gray-600">{STEPS[currentStep - 1]?.description}</p>
            </CardHeader>
            <CardContent>
              {renderStepContent()}
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex justify-between mt-8">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 1}
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Previous
            </Button>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => router.push('/business/experiences')}
              >
                Save as Draft
              </Button>

              {currentStep === STEPS.length ? (
                <Button
                  onClick={handlePublish}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>Publishing...</>
                  ) : (
                    <>
                      <Check className="w-4 h-4 mr-1" />
                      Publish Experience
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