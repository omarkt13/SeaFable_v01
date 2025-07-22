
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
  AlertCircle,
  Star,
  Settings,
  Eye,
  Waves,
  Mountain,
  Camera as CameraIcon,
  Utensils,
  Binoculars
} from "lucide-react"

// Types
interface ExperienceFormData {
  title: string
  shortDescription: string
  fullDescription: string
  location: string
  specificLocation: string
  activityType: string
  difficultyLevel: string
  categories: string[]
  pricePerPerson: number
  minGuests: number
  maxGuests: number
  durationHours: number
  durationDisplay: string
  itinerary: ItineraryItem[]
  availabilitySlots: string[]
  primaryImageUrl: string
  weatherContingency: string
  includedAmenities: string[]
  whatToBring: string[]
  minAge: number
  maxAge: number
  ageRestrictionDetails: string
  isActive: boolean
}

interface ItineraryItem {
  id: string
  title: string
  description: string
  duration: number
  order: number
}

interface FormErrors {
  [key: string]: string
}

const initialFormData: ExperienceFormData = {
  title: '',
  shortDescription: '',
  fullDescription: '',
  location: '',
  specificLocation: '',
  activityType: '',
  difficultyLevel: 'beginner',
  categories: [],
  pricePerPerson: 0,
  minGuests: 1,
  maxGuests: 1,
  durationHours: 1,
  durationDisplay: '',
  itinerary: [],
  availabilitySlots: [],
  primaryImageUrl: '',
  weatherContingency: '',
  includedAmenities: [],
  whatToBring: [],
  minAge: 0,
  maxAge: 100,
  ageRestrictionDetails: '',
  isActive: true
}

const activityTypes = [
  { id: 'water_sport', label: 'Water Sport', icon: <Waves className="h-5 w-5" /> },
  { id: 'land_adventure', label: 'Land Adventure', icon: <Mountain className="h-5 w-5" /> },
  { id: 'cultural', label: 'Cultural', icon: <CameraIcon className="h-5 w-5" /> },
  { id: 'food_tour', label: 'Food Tour', icon: <Utensils className="h-5 w-5" /> },
  { id: 'wildlife', label: 'Wildlife', icon: <Binoculars className="h-5 w-5" /> }
]

const categoryOptions = {
  water_sport: ['Kayaking', 'Snorkeling', 'Diving', 'Sailing', 'Surfing', 'Fishing', 'Stand-up Paddleboard'],
  land_adventure: ['Hiking', 'Rock Climbing', 'Cycling', 'ATV Tours', 'Zip-lining'],
  cultural: ['City Tour', 'Museum Visit', 'Historical Sites', 'Art Workshop'],
  food_tour: ['Cooking Class', 'Wine Tasting', 'Local Markets', 'Street Food'],
  wildlife: ['Bird Watching', 'Marine Life', 'Safari', 'Nature Photography']
}

const amenityOptions = ['Equipment', 'Snacks', 'Drinks', 'Guide', 'Transportation', 'Photos', 'Insurance']
const bringOptions = ['Swimsuit', 'Towel', 'Sunscreen', 'Water Bottle', 'Camera', 'Comfortable Shoes', 'Hat']

const difficultyLevels = [
  { value: 'beginner', label: 'Beginner', description: 'No experience required' },
  { value: 'intermediate', label: 'Intermediate', description: 'Some experience helpful' },
  { value: 'advanced', label: 'Advanced', description: 'Experienced participants only' },
  { value: 'expert', label: 'Expert', description: 'Professional level required' }
]

const steps = [
  { id: 1, title: 'Experience Basics', icon: <Activity className="h-5 w-5" /> },
  { id: 2, title: 'Activity Details', icon: <Star className="h-5 w-5" /> },
  { id: 3, title: 'Pricing & Capacity', icon: <Users className="h-5 w-5" /> },
  { id: 4, title: 'Itinerary', icon: <Clock className="h-5 w-5" /> },
  { id: 5, title: 'Logistics', icon: <Settings className="h-5 w-5" /> },
  { id: 6, title: 'Preview & Publish', icon: <Eye className="h-5 w-5" /> }
]

export default function NewExperiencePage() {
  const router = useRouter()
  const { user, businessProfile } = useAuth()
  const { toast } = useToast()

  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<ExperienceFormData>(initialFormData)
  const [completedSteps, setCompletedSteps] = useState(new Set<number>())
  const [errors, setErrors] = useState<FormErrors>({})
  const [isLoading, setIsLoading] = useState(false)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

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

  const addItineraryItem = () => {
    const newItem: ItineraryItem = {
      id: Date.now().toString(),
      title: '',
      description: '',
      duration: 30,
      order: formData.itinerary.length + 1
    }
    updateFormData('itinerary', [...formData.itinerary, newItem])
  }

  const updateItineraryItem = (id: string, field: keyof ItineraryItem, value: any) => {
    const updatedItinerary = formData.itinerary.map(item =>
      item.id === id ? { ...item, [field]: value } : item
    )
    updateFormData('itinerary', updatedItinerary)
  }

  const removeItineraryItem = (id: string) => {
    const updatedItinerary = formData.itinerary.filter(item => item.id !== id)
    updateFormData('itinerary', updatedItinerary)
  }

  const validateStep = (step: number): boolean => {
    const newErrors: FormErrors = {}

    switch(step) {
      case 1:
        if (formData.title.length < 5) newErrors.title = 'Title must be at least 5 characters'
        if (!formData.location.trim()) newErrors.location = 'Location is required'
        if (!formData.activityType) newErrors.activityType = 'Activity type is required'
        if (formData.fullDescription.length < 20) newErrors.fullDescription = 'Description must be at least 20 characters'
        break
      case 2:
        if (!formData.difficultyLevel) newErrors.difficultyLevel = 'Difficulty level is required'
        if (formData.categories.length === 0) newErrors.categories = 'At least one category is required'
        break
      case 3:
        if (formData.pricePerPerson <= 0) newErrors.pricePerPerson = 'Price must be greater than 0'
        if (formData.maxGuests <= 0) newErrors.maxGuests = 'Max guests must be greater than 0'
        if (formData.minGuests <= 0) newErrors.minGuests = 'Min guests must be greater than 0'
        if (formData.minGuests > formData.maxGuests) newErrors.minGuests = 'Min guests cannot exceed max guests'
        if (formData.durationHours <= 0) newErrors.durationHours = 'Duration must be greater than 0'
        break
      case 4:
        if (formData.itinerary.length === 0) newErrors.itinerary = 'At least one itinerary item is required'
        formData.itinerary.forEach((item, index) => {
          if (!item.title.trim()) newErrors[`itinerary_${index}_title`] = 'Itinerary title is required'
          if (!item.description.trim()) newErrors[`itinerary_${index}_description`] = 'Itinerary description is required'
        })
        break
      case 5:
        if (!formData.primaryImageUrl.trim()) newErrors.primaryImageUrl = 'Primary image is required'
        break
    }

    setErrors(newErrors)
    const isValid = Object.keys(newErrors).length === 0

    if (isValid) {
      setCompletedSteps(prev => new Set([...prev, step]))
    }

    return isValid
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length))
    }
  }

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1))
  }

  const handlePublish = async () => {
    if (!validateStep(currentStep)) return

    setIsLoading(true)
    try {
      const experienceData = {
        host_id: businessProfile.id,
        title: formData.title,
        description: formData.fullDescription,
        short_description: formData.shortDescription || formData.fullDescription.substring(0, 150) + '...',
        location: formData.location,
        specific_location: formData.specificLocation,
        activity_type: formData.activityType,
        category: formData.categories,
        duration_hours: formData.durationHours,
        duration_display: formData.durationDisplay || `${formData.durationHours} hours`,
        max_guests: formData.maxGuests,
        min_guests: formData.minGuests,
        price_per_person: formData.pricePerPerson,
        difficulty_level: formData.difficultyLevel,
        primary_image_url: formData.primaryImageUrl,
        weather_contingency: formData.weatherContingency,
        included_amenities: formData.includedAmenities,
        what_to_bring: formData.whatToBring,
        min_age: formData.minAge || undefined,
        max_age: formData.maxAge < 100 ? formData.maxAge : undefined,
        age_restriction_details: formData.ageRestrictionDetails,
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
              <Label htmlFor="location">Location *</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => updateFormData('location', e.target.value)}
                  placeholder="e.g., Santorini, Greece"
                  className={`pl-10 ${errors.location ? 'border-red-500' : ''}`}
                />
              </div>
              {errors.location && <p className="text-red-500 text-sm mt-1">{errors.location}</p>}
            </div>

            <div>
              <Label htmlFor="specificLocation">Specific Meeting Point</Label>
              <Input
                id="specificLocation"
                value={formData.specificLocation}
                onChange={(e) => updateFormData('specificLocation', e.target.value)}
                placeholder="e.g., Ammoudi Bay Marina, Dock 3"
              />
            </div>

            <div>
              <Label>Activity Type *</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                {activityTypes.map((type) => (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => updateFormData('activityType', type.id)}
                    className={`p-4 border-2 rounded-lg text-left transition-colors ${
                      formData.activityType === type.id
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      {type.icon}
                      <span className="font-medium">{type.label}</span>
                    </div>
                  </button>
                ))}
              </div>
              {errors.activityType && <p className="text-red-500 text-sm mt-1">{errors.activityType}</p>}
            </div>

            <div>
              <Label htmlFor="shortDescription">Short Description</Label>
              <Textarea
                id="shortDescription"
                value={formData.shortDescription}
                onChange={(e) => updateFormData('shortDescription', e.target.value)}
                placeholder="Brief, engaging summary (2-3 sentences)"
                rows={2}
              />
            </div>

            <div>
              <Label htmlFor="fullDescription">Full Description *</Label>
              <Textarea
                id="fullDescription"
                value={formData.fullDescription}
                onChange={(e) => updateFormData('fullDescription', e.target.value)}
                placeholder="Detailed description of the experience, what guests will enjoy, highlights..."
                rows={5}
                className={errors.fullDescription ? 'border-red-500' : ''}
              />
              {errors.fullDescription && <p className="text-red-500 text-sm mt-1">{errors.fullDescription}</p>}
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <Label>Difficulty Level *</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                {difficultyLevels.map((level) => (
                  <button
                    key={level.value}
                    type="button"
                    onClick={() => updateFormData('difficultyLevel', level.value)}
                    className={`p-4 border-2 rounded-lg text-left transition-colors ${
                      formData.difficultyLevel === level.value
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-medium">{level.label}</div>
                    <div className="text-sm text-gray-500">{level.description}</div>
                  </button>
                ))}
              </div>
              {errors.difficultyLevel && <p className="text-red-500 text-sm mt-1">{errors.difficultyLevel}</p>}
            </div>

            <div>
              <Label>Categories *</Label>
              <div className="mt-2">
                <p className="text-sm text-gray-600 mb-3">
                  Select categories that best describe your experience:
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {(categoryOptions[formData.activityType as keyof typeof categoryOptions] || []).map((category) => (
                    <button
                      key={category}
                      type="button"
                      onClick={() => {
                        if (formData.categories.includes(category)) {
                          updateFormData('categories', formData.categories.filter(c => c !== category))
                        } else {
                          updateFormData('categories', [...formData.categories, category])
                        }
                      }}
                      className={`p-3 border rounded-lg text-sm transition-colors ${
                        formData.categories.includes(category)
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
                {formData.categories.length > 0 && (
                  <div className="mt-3">
                    <p className="text-sm text-gray-600 mb-2">Selected categories:</p>
                    <div className="flex flex-wrap gap-2">
                      {formData.categories.map((category, index) => (
                        <Badge key={index} variant="secondary">
                          {category}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              {errors.categories && <p className="text-red-500 text-sm mt-1">{errors.categories}</p>}
            </div>

            <div>
              <Label htmlFor="weatherContingency">Weather Contingency Plan</Label>
              <Textarea
                id="weatherContingency"
                value={formData.weatherContingency}
                onChange={(e) => updateFormData('weatherContingency', e.target.value)}
                placeholder="What happens if weather conditions are unsuitable?"
                rows={3}
              />
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="pricePerPerson">Price per Person *</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="pricePerPerson"
                    type="number"
                    value={formData.pricePerPerson}
                    onChange={(e) => updateFormData('pricePerPerson', parseFloat(e.target.value) || 0)}
                    min="0"
                    step="0.01"
                    className={`pl-10 ${errors.pricePerPerson ? 'border-red-500' : ''}`}
                  />
                </div>
                {errors.pricePerPerson && <p className="text-red-500 text-sm mt-1">{errors.pricePerPerson}</p>}
              </div>

              <div>
                <Label htmlFor="durationHours">Duration (Hours) *</Label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="durationHours"
                    type="number"
                    value={formData.durationHours}
                    onChange={(e) => updateFormData('durationHours', parseFloat(e.target.value) || 0)}
                    min="0.5"
                    step="0.5"
                    className={`pl-10 ${errors.durationHours ? 'border-red-500' : ''}`}
                  />
                </div>
                {errors.durationHours && <p className="text-red-500 text-sm mt-1">{errors.durationHours}</p>}
              </div>
            </div>

            <div>
              <Label htmlFor="durationDisplay">Duration Display Text</Label>
              <Input
                id="durationDisplay"
                value={formData.durationDisplay}
                onChange={(e) => updateFormData('durationDisplay', e.target.value)}
                placeholder="e.g., Half day, Full day, 3 hours"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="minGuests">Minimum Guests *</Label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="minGuests"
                    type="number"
                    value={formData.minGuests}
                    onChange={(e) => updateFormData('minGuests', parseInt(e.target.value) || 1)}
                    min="1"
                    className={`pl-10 ${errors.minGuests ? 'border-red-500' : ''}`}
                  />
                </div>
                {errors.minGuests && <p className="text-red-500 text-sm mt-1">{errors.minGuests}</p>}
              </div>

              <div>
                <Label htmlFor="maxGuests">Maximum Guests *</Label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="maxGuests"
                    type="number"
                    value={formData.maxGuests}
                    onChange={(e) => updateFormData('maxGuests', parseInt(e.target.value) || 1)}
                    min="1"
                    className={`pl-10 ${errors.maxGuests ? 'border-red-500' : ''}`}
                  />
                </div>
                {errors.maxGuests && <p className="text-red-500 text-sm mt-1">{errors.maxGuests}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="minAge">Minimum Age</Label>
                <Input
                  id="minAge"
                  type="number"
                  value={formData.minAge}
                  onChange={(e) => updateFormData('minAge', parseInt(e.target.value) || 0)}
                  min="0"
                  max="18"
                />
              </div>

              <div>
                <Label htmlFor="maxAge">Maximum Age</Label>
                <Input
                  id="maxAge"
                  type="number"
                  value={formData.maxAge}
                  onChange={(e) => updateFormData('maxAge', parseInt(e.target.value) || 100)}
                  min="18"
                  max="100"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="ageRestrictionDetails">Age Restriction Details</Label>
              <Textarea
                id="ageRestrictionDetails"
                value={formData.ageRestrictionDetails}
                onChange={(e) => updateFormData('ageRestrictionDetails', e.target.value)}
                placeholder="Any specific age-related requirements or restrictions"
                rows={2}
              />
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-4">
                <Label>Itinerary *</Label>
                <Button type="button" onClick={addItineraryItem} size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  Add Step
                </Button>
              </div>

              {formData.itinerary.length === 0 ? (
                <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                  <Clock className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600 mb-4">No itinerary steps yet</p>
                  <Button type="button" onClick={addItineraryItem} variant="outline">
                    Add First Step
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {formData.itinerary.map((item, index) => (
                    <Card key={item.id} className="relative">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="bg-blue-100 text-blue-600 rounded-full w-8 h-8 flex items-center justify-center text-sm font-medium">
                              {index + 1}
                            </div>
                            <h4 className="font-medium">Step {index + 1}</h4>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeItineraryItem(item.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label htmlFor={`title-${item.id}`}>Step Title *</Label>
                          <Input
                            id={`title-${item.id}`}
                            value={item.title}
                            onChange={(e) => updateItineraryItem(item.id, 'title', e.target.value)}
                            placeholder="e.g., Sail to Secret Beach"
                            className={errors[`itinerary_${index}_title`] ? 'border-red-500' : ''}
                          />
                          {errors[`itinerary_${index}_title`] && (
                            <p className="text-red-500 text-sm mt-1">{errors[`itinerary_${index}_title`]}</p>
                          )}
                        </div>

                        <div>
                          <Label htmlFor={`description-${item.id}`}>Description *</Label>
                          <Textarea
                            id={`description-${item.id}`}
                            value={item.description}
                            onChange={(e) => updateItineraryItem(item.id, 'description', e.target.value)}
                            placeholder="Describe what happens in this step"
                            rows={2}
                            className={errors[`itinerary_${index}_description`] ? 'border-red-500' : ''}
                          />
                          {errors[`itinerary_${index}_description`] && (
                            <p className="text-red-500 text-sm mt-1">{errors[`itinerary_${index}_description`]}</p>
                          )}
                        </div>

                        <div>
                          <Label htmlFor={`duration-${item.id}`}>Duration (minutes)</Label>
                          <Input
                            id={`duration-${item.id}`}
                            type="number"
                            value={item.duration}
                            onChange={(e) => updateItineraryItem(item.id, 'duration', parseInt(e.target.value) || 30)}
                            min="5"
                            step="5"
                          />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
              {errors.itinerary && <p className="text-red-500 text-sm mt-1">{errors.itinerary}</p>}
            </div>
          </div>
        )

      case 5:
        return (
          <div className="space-y-6">
            <div>
              <Label htmlFor="primaryImageUrl">Primary Image *</Label>
              <div className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                errors.primaryImageUrl ? 'border-red-300' : 'border-gray-300 hover:border-gray-400'
              }`}>
                {formData.primaryImageUrl ? (
                  <div className="relative">
                    <img
                      src={formData.primaryImageUrl}
                      alt="Primary"
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => updateFormData('primaryImageUrl', '')}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div>
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="mt-4">
                      <Input
                        type="url"
                        value={formData.primaryImageUrl}
                        onChange={(e) => updateFormData('primaryImageUrl', e.target.value)}
                        placeholder="Enter image URL"
                        className="w-full max-w-md mx-auto"
                      />
                      <p className="text-sm text-gray-500 mt-2">
                        Upload your best photo that represents this experience
                      </p>
                    </div>
                  </div>
                )}
              </div>
              {errors.primaryImageUrl && <p className="text-red-500 text-sm mt-1">{errors.primaryImageUrl}</p>}
            </div>

            <div>
              <Label>What's Included</Label>
              <div className="space-y-2 mt-2">
                {formData.includedAmenities.map((item, index) => (
                  <div key={index} className="flex items-center justify-between bg-green-50 px-3 py-2 rounded-lg">
                    <span className="text-green-800">{item}</span>
                    <button
                      type="button"
                      onClick={() => removeFromArray('includedAmenities', index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <div className="flex">
                  <Input
                    placeholder="Add included item (e.g., Equipment, Guide, Refreshments)"
                    className="flex-1 rounded-r-none"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        const input = e.target as HTMLInputElement
                        if (input.value.trim()) {
                          addToArray('includedAmenities', input.value.trim())
                          input.value = ''
                        }
                      }
                    }}
                  />
                  <Button
                    type="button"
                    className="rounded-l-none"
                    onClick={(e) => {
                      const input = (e.target as HTMLButtonElement).previousElementSibling as HTMLInputElement
                      if (input.value.trim()) {
                        addToArray('includedAmenities', input.value.trim())
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
                {formData.whatToBring.map((item, index) => (
                  <div key={index} className="flex items-center justify-between bg-yellow-50 px-3 py-2 rounded-lg">
                    <span className="text-yellow-800">{item}</span>
                    <button
                      type="button"
                      onClick={() => removeFromArray('whatToBring', index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <div className="flex">
                  <Input
                    placeholder="Add item to bring (e.g., Swimsuit, Towel, Sunscreen)"
                    className="flex-1 rounded-r-none"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        const input = e.target as HTMLInputElement
                        if (input.value.trim()) {
                          addToArray('whatToBring', input.value.trim())
                          input.value = ''
                        }
                      }
                    }}
                  />
                  <Button
                    type="button"
                    className="rounded-l-none"
                    onClick={(e) => {
                      const input = (e.target as HTMLButtonElement).previousElementSibling as HTMLInputElement
                      if (input.value.trim()) {
                        addToArray('whatToBring', input.value.trim())
                        input.value = ''
                      }
                    }}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
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
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <img
                      src={formData.primaryImageUrl || 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=300&fit=crop'}
                      alt={formData.title}
                      className="w-full h-48 object-cover rounded-lg"
                    />
                  </div>
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-xl font-bold text-gray-900">{formData.title || 'Untitled Experience'}</h4>
                      <p className="text-gray-600 flex items-center">
                        <MapPin className="w-4 h-4 mr-1" />
                        {formData.location}
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Activity:</span>
                        <div className="font-medium capitalize">{formData.activityType.replace('_', ' ') || 'Not specified'}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Duration:</span>
                        <div className="font-medium">{formData.durationHours}h</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Guests:</span>
                        <div className="font-medium">{formData.minGuests}-{formData.maxGuests}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Price:</span>
                        <div className="font-medium text-green-600">${formData.pricePerPerson}</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <h5 className="font-semibold text-gray-900 mb-2">Description</h5>
                  <p className="text-gray-600 text-sm">{formData.fullDescription || 'No description provided'}</p>
                </div>

                {formData.itinerary.length > 0 && (
                  <div className="mt-6">
                    <h5 className="font-semibold text-gray-900 mb-2">Itinerary</h5>
                    <div className="space-y-2">
                      {formData.itinerary.map((item, index) => (
                        <div key={item.id} className="flex items-start gap-3 text-sm">
                          <div className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center text-xs font-medium flex-shrink-0 mt-0.5">
                            {index + 1}
                          </div>
                          <div>
                            <div className="font-medium">{item.title}</div>
                            <div className="text-gray-600">{item.description}</div>
                            <div className="text-gray-500">{item.duration} minutes</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {formData.includedAmenities.length > 0 && (
                  <div className="mt-6">
                    <h5 className="font-semibold text-gray-900 mb-2">What's Included</h5>
                    <div className="flex flex-wrap gap-2">
                      {formData.includedAmenities.map((item, index) => (
                        <Badge key={index} variant="secondary" className="bg-green-100 text-green-800">
                          {item}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {formData.whatToBring.length > 0 && (
                  <div className="mt-6">
                    <h5 className="font-semibold text-gray-900 mb-2">What to Bring</h5>
                    <div className="flex flex-wrap gap-2">
                      {formData.whatToBring.map((item, index) => (
                        <Badge key={index} variant="outline" className="border-yellow-300 text-yellow-800">
                          {item}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
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
                Step {currentStep} of {steps.length}
              </span>
              <span className="text-sm text-gray-500">
                {Math.round((currentStep / steps.length) * 100)}% Complete
              </span>
            </div>
            <Progress value={(currentStep / steps.length) * 100} className="h-2" />
          </div>

          {/* Steps Navigation */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => {
                const isActive = currentStep === step.id
                const isCompleted = completedSteps.has(step.id)
                const isPast = currentStep > step.id

                return (
                  <div key={step.id} className="flex items-center">
                    <div
                      className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors ${
                        isCompleted || isPast
                          ? 'bg-green-500 border-green-500 text-white'
                          : isActive
                          ? 'bg-blue-500 border-blue-500 text-white'
                          : 'bg-white border-gray-300 text-gray-400'
                      }`}
                    >
                      {isCompleted || isPast ? (
                        <Check className="w-5 h-5" />
                      ) : (
                        step.icon
                      )}
                    </div>
                    <div className="ml-3">
                      <div className={`text-sm font-medium ${isActive ? 'text-blue-600' : isCompleted || isPast ? 'text-green-600' : 'text-gray-500'}`}>
                        {step.title}
                      </div>
                    </div>
                    {index < steps.length - 1 && (
                      <ChevronRight className="w-5 h-5 text-gray-300 mx-4" />
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Step Content */}
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
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 1}
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Previous
            </Button>

            <div className="flex gap-3">
              {currentStep === steps.length ? (
                <Button
                  onClick={handlePublish}
                  disabled={isLoading}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Publishing...
                    </>
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
