
"use client"

import React, { useState } from 'react'
import {
  X,
  ChevronRight,
  ChevronLeft,
  Check,
  Camera,
  MapPin,
  Clock,
  Users,
  DollarSign,
  Tag,
  FileText,
  Calendar,
  Shield,
  Star,
  Plus,
  Trash2,
  Upload,
  Globe,
  Heart,
  Activity,
  AlertCircle
} from 'lucide-react'

interface AdventureForm {
  // Basic Information
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
  
  // Booking & Safety
  weather_contingency: string
  seasonal_availability: string[]
  tags: string[]
}

const initialForm: AdventureForm = {
  title: '',
  description: '',
  short_description: '',
  activity_type: '',
  category: [],
  location: '',
  specific_location: '',
  country: '',
  duration_hours: 0,
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
}

const activityTypes = [
  { value: 'sailing', label: 'Sailing', icon: '⛵' },
  { value: 'surfing', label: 'Surfing', icon: '🏄' },
  { value: 'diving', label: 'Diving', icon: '🤿' },
  { value: 'kayaking', label: 'Kayaking', icon: '🚣' },
  { value: 'fishing', label: 'Fishing', icon: '🎣' },
  { value: 'yacht_charter', label: 'Yacht Charter', icon: '🛥️' },
  { value: 'snorkeling', label: 'Snorkeling', icon: '🤽' },
  { value: 'windsurfing', label: 'Windsurfing', icon: '🏄‍♂️' },
  { value: 'paddleboarding', label: 'Paddleboarding', icon: '🏄‍♀️' },
  { value: 'jet_skiing', label: 'Jet Skiing', icon: '🛥️' },
]

const difficultyLevels = [
  { value: 'beginner', label: 'Beginner', description: 'No experience required' },
  { value: 'intermediate', label: 'Intermediate', description: 'Some experience helpful' },
  { value: 'advanced', label: 'Advanced', description: 'Experienced participants only' },
  { value: 'all_levels', label: 'All Levels', description: 'Suitable for everyone' }
]

interface CreateAdventureWizardProps {
  isOpen: boolean
  onClose: () => void
}

const CreateAdventureWizard: React.FC<CreateAdventureWizardProps> = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<AdventureForm>(initialForm)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const totalSteps = 6

  const steps = [
    { id: 1, title: 'Basic Info', icon: FileText },
    { id: 2, title: 'Location', icon: MapPin },
    { id: 3, title: 'Details', icon: Clock },
    { id: 4, title: 'Media', icon: Camera },
    { id: 5, title: 'Inclusions', icon: Shield },
    { id: 6, title: 'Review', icon: Check }
  ]

  const updateFormData = (field: keyof AdventureForm, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when field is updated
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const addToArray = (field: keyof AdventureForm, item: string) => {
    if (item.trim()) {
      const currentArray = formData[field] as string[]
      if (!currentArray.includes(item)) {
        updateFormData(field, [...currentArray, item])
      }
    }
  }

  const removeFromArray = (field: keyof AdventureForm, index: number) => {
    const currentArray = formData[field] as string[]
    updateFormData(field, currentArray.filter((_, i) => i !== index))
  }

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {}

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
      setCurrentStep(prev => Math.min(prev + 1, totalSteps))
    }
  }

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1))
  }

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return

    setIsSubmitting(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      console.log('Adventure created:', formData)
      onClose()
      // Reset form
      setFormData(initialForm)
      setCurrentStep(1)
    } catch (error) {
      console.error('Error creating adventure:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Adventure Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => updateFormData('title', e.target.value)}
                placeholder="e.g., Sunset Sailing Adventure in Santorini"
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.title ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Activity Type *
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {activityTypes.map((type) => (
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
                  </button>
                ))}
              </div>
              {errors.activity_type && <p className="text-red-500 text-sm mt-1">{errors.activity_type}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Short Description
              </label>
              <textarea
                value={formData.short_description}
                onChange={(e) => updateFormData('short_description', e.target.value)}
                placeholder="Brief, engaging summary (2-3 sentences)"
                rows={2}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => updateFormData('description', e.target.value)}
                placeholder="Detailed description of the adventure, what guests will experience, highlights..."
                rows={5}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.description ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Country *
                </label>
                <input
                  type="text"
                  value={formData.country}
                  onChange={(e) => updateFormData('country', e.target.value)}
                  placeholder="e.g., Greece"
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.country ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.country && <p className="text-red-500 text-sm mt-1">{errors.country}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City/Location *
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => updateFormData('location', e.target.value)}
                  placeholder="e.g., Santorini"
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.location ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.location && <p className="text-red-500 text-sm mt-1">{errors.location}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Specific Meeting Location
              </label>
              <input
                type="text"
                value={formData.specific_location}
                onChange={(e) => updateFormData('specific_location', e.target.value)}
                placeholder="e.g., Marina Port, Dock 12"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-sm text-gray-500 mt-1">Where guests should meet you for the adventure</p>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duration (Hours) *
                </label>
                <input
                  type="number"
                  value={formData.duration_hours}
                  onChange={(e) => updateFormData('duration_hours', parseFloat(e.target.value) || 0)}
                  min="0.5"
                  step="0.5"
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.duration_hours ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.duration_hours && <p className="text-red-500 text-sm mt-1">{errors.duration_hours}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duration Display
                </label>
                <input
                  type="text"
                  value={formData.duration_display}
                  onChange={(e) => updateFormData('duration_display', e.target.value)}
                  placeholder="e.g., Half day, Full day, 3 hours"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Maximum Guests *
                </label>
                <input
                  type="number"
                  value={formData.max_guests}
                  onChange={(e) => updateFormData('max_guests', parseInt(e.target.value) || 0)}
                  min="1"
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.max_guests ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.max_guests && <p className="text-red-500 text-sm mt-1">{errors.max_guests}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Minimum Guests
                </label>
                <input
                  type="number"
                  value={formData.min_guests}
                  onChange={(e) => updateFormData('min_guests', parseInt(e.target.value) || 1)}
                  min="1"
                  max={formData.max_guests}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price per Person *
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="number"
                  value={formData.price_per_person}
                  onChange={(e) => updateFormData('price_per_person', parseFloat(e.target.value) || 0)}
                  min="0"
                  step="0.01"
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.price_per_person ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
              </div>
              {errors.price_per_person && <p className="text-red-500 text-sm mt-1">{errors.price_per_person}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Difficulty Level
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {difficultyLevels.map((level) => (
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
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Primary Image *
              </label>
              <div className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                errors.primary_image_url ? 'border-red-300' : 'border-gray-300 hover:border-gray-400'
              }`}>
                {formData.primary_image_url ? (
                  <div className="relative">
                    <img
                      src={formData.primary_image_url}
                      alt="Primary"
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => updateFormData('primary_image_url', '')}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div>
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="mt-4">
                      <input
                        type="url"
                        value={formData.primary_image_url}
                        onChange={(e) => updateFormData('primary_image_url', e.target.value)}
                        placeholder="Enter image URL"
                        className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg"
                      />
                      <p className="text-sm text-gray-500 mt-2">
                        Upload your best photo that represents this adventure
                      </p>
                    </div>
                  </div>
                )}
              </div>
              {errors.primary_image_url && <p className="text-red-500 text-sm mt-1">{errors.primary_image_url}</p>}
            </div>
          </div>
        )

      case 5:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                What's Included
              </label>
              <div className="space-y-2">
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
                  <input
                    type="text"
                    placeholder="Add included item (e.g., Equipment, Guide, Refreshments)"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-l-lg"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        const input = e.target as HTMLInputElement
                        if (input.value.trim()) {
                          addToArray('included_amenities', input.value.trim())
                          input.value = ''
                        }
                      }
                    }}
                  />
                  <button
                    type="button"
                    className="px-4 py-2 bg-green-500 text-white rounded-r-lg hover:bg-green-600"
                    onClick={(e) => {
                      const input = (e.target as HTMLButtonElement).previousElementSibling as HTMLInputElement
                      if (input.value.trim()) {
                        addToArray('included_amenities', input.value.trim())
                        input.value = ''
                      }
                    }}
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.tags.map((tag, index) => (
                  <span key={index} className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeFromArray('tags', index)}
                      className="ml-2 text-gray-500 hover:text-red-500"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              <input
                type="text"
                placeholder="Add tags (press Enter)"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    const input = e.target as HTMLInputElement
                    if (input.value.trim()) {
                      addToArray('tags', input.value.trim())
                      input.value = ''
                    }
                  }
                }}
              />
            </div>
          </div>
        )

      case 6:
        return (
          <div className="space-y-8">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Review Your Adventure</h3>
              <p className="text-gray-600">Double-check everything before publishing</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <img
                    src={formData.primary_image_url || 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=300&fit=crop'}
                    alt={formData.title}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                </div>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-xl font-bold text-gray-900">{formData.title || 'Untitled Adventure'}</h4>
                    <p className="text-gray-600 flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      {formData.location}, {formData.country}
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Activity:</span>
                      <div className="font-medium">{formData.activity_type || 'Not specified'}</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Duration:</span>
                      <div className="font-medium">{formData.duration_hours}h</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Max Guests:</span>
                      <div className="font-medium">{formData.max_guests}</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Price:</span>
                      <div className="font-medium text-lg">${formData.price_per_person}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h5 className="font-semibold text-gray-900 mb-2">Description</h5>
                <p className="text-gray-600 text-sm">{formData.description || 'No description provided'}</p>
              </div>

              {formData.included_amenities.length > 0 && (
                <div>
                  <h5 className="font-semibold text-gray-900 mb-2">What's Included</h5>
                  <div className="flex flex-wrap gap-2">
                    {formData.included_amenities.map((item, index) => (
                      <span key={index} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {formData.tags.length > 0 && (
                <div>
                  <h5 className="font-semibold text-gray-900 mb-2">Tags</h5>
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map((tag, index) => (
                      <span key={index} className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start">
                <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 mr-2" />
                <div>
                  <h6 className="font-medium text-yellow-800">Ready to publish?</h6>
                  <p className="text-sm text-yellow-700 mt-1">
                    Your adventure will be saved as a draft. You can publish it later from the adventures page.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Create New Adventure</h2>
            <p className="text-gray-600">Step {currentStep} of {totalSteps}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="px-6 py-4 bg-gray-50">
          <div className="flex items-center justify-between mb-4">
            {steps.map((step, index) => {
              const isActive = currentStep === step.id
              const isCompleted = currentStep > step.id
              const Icon = step.icon

              return (
                <div key={step.id} className="flex items-center">
                  <div
                    className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors ${
                      isCompleted
                        ? 'bg-green-500 border-green-500 text-white'
                        : isActive
                        ? 'bg-blue-500 border-blue-500 text-white'
                        : 'bg-white border-gray-300 text-gray-400'
                    }`}
                  >
                    {isCompleted ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <Icon className="w-5 h-5" />
                    )}
                  </div>
                  <div className="ml-3">
                    <div className={`text-sm font-medium ${isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-500'}`}>
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
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {renderStepContent()}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>

          <div className="flex gap-3">
            {currentStep < totalSteps ? (
              <button
                onClick={handleNext}
                className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    Create Adventure
                  </>
                )}
              </button>
            )}
            
            <button
              onClick={handleSubmit}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Save Draft
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CreateAdventureWizard
