
"use client"

import { useState, useCallback, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Slider } from "@/components/ui/slider"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { createExperience } from "@/lib/database"
import { useAuth } from "@/hooks/useAuth"
import { BusinessProtectedRoute } from "@/components/auth/BusinessProtectedRoute"
import { 
  Home,
  Users,
  Anchor,
  MessageCircle,
  Calendar,
  Handshake,
  User,
  Settings,
  DollarSign,
  Shapes,
  Bell,
  ChevronDown,
  LogOut,
  UserPlus,
  UserMinus,
  Check,
  MapPin,
  Clock,
  X,
  ChevronLeft,
  Save,
  ChevronRight,
  Plus,
  Upload
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface ExperienceFormData {
  // Basic Info
  title: string
  description: string
  location: string
  category: string

  // Details
  price: number
  groupSize: number
  duration: number
  durationType: 'hours' | 'days'
  difficultyLevel: string
  tags: string[]

  // Inclusions
  included: string[]
  notIncluded: string[]
  thingsToBring: string[]

  // Dates & Availability
  availableDates: string[]

  // Media
  images: string[]
  videos: string[]

  // Social Media
  socialMedia: {
    instagram: string
    facebook: string
    youtube: string
    tiktok: string
  }

  // FAQ
  faq: Array<{ question: string; answer: string }>

  // Policy
  cancellationPolicy: string
}

interface FormErrors {
  [key: string]: string
}

const STEPS = [
  { id: 1, title: 'Basic Info', description: 'Title, description, and category' },
  { id: 2, title: 'Details', description: 'Pricing, duration, and specifications' },
  { id: 3, title: 'Content', description: 'Inclusions, FAQ, and policies' },
  { id: 4, title: 'Media', description: 'Photos and videos' },
  { id: 5, title: 'Social', description: 'Social media integration' },
  { id: 6, title: 'Review', description: 'Preview and publish' }
]

const CATEGORIES = [
  'Sailing Tour', 'Diving Tour', 'Wildlife Tour', 'Beach Vacation', 
  'Road Trip', 'Hiking Tour', 'Cultural Experience', 'Food & Wine',
  'Adventure Sports', 'Photography Tour'
]

const DIFFICULTY_LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'All Levels']

export default function NewExperiencePage() {
  return (
    <BusinessProtectedRoute>
      <CreateNewExperience />
    </BusinessProtectedRoute>
  )
}

function CreateNewExperience() {
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})
  const [isClient, setIsClient] = useState(false)
  const router = useRouter()
  const { user } = useAuth()

  // Fix SSR hydration issues
  useEffect(() => {
    setIsClient(true)
  }, [])

  const [formData, setFormData] = useState<ExperienceFormData>({
    title: '',
    description: '',
    location: '',
    category: '',
    price: 0,
    groupSize: 1,
    duration: 1,
    durationType: 'hours',
    difficultyLevel: '',
    tags: [],
    included: [],
    notIncluded: [],
    thingsToBring: [],
    availableDates: [],
    images: [],
    videos: [],
    socialMedia: {
      instagram: '',
      facebook: '',
      youtube: '',
      tiktok: ''
    },
    faq: [],
    cancellationPolicy: ''
  })

  const updateFormData = useCallback((updates: Partial<ExperienceFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }))
    // Clear relevant errors when user starts typing
    const updatedFields = Object.keys(updates)
    setErrors(prev => {
      const newErrors = { ...prev }
      updatedFields.forEach(field => delete newErrors[field])
      return newErrors
    })
  }, [])

  const validateStep = (step: number): boolean => {
    const newErrors: FormErrors = {}

    switch (step) {
      case 1:
        if (!formData.title.trim()) newErrors.title = 'Title is required'
        if (!formData.description.trim()) newErrors.description = 'Description is required'
        if (!formData.location.trim()) newErrors.location = 'Location is required'
        if (!formData.category) newErrors.category = 'Category is required'
        break

      case 2:
        if (formData.price <= 0) newErrors.price = 'Price must be greater than 0'
        if (formData.groupSize <= 0) newErrors.groupSize = 'Group size must be greater than 0'
        if (formData.duration <= 0) newErrors.duration = 'Duration must be greater than 0'
        if (!formData.difficultyLevel) newErrors.difficultyLevel = 'Difficulty level is required'
        break

      case 3:
        if (formData.included.length === 0) newErrors.included = 'At least one inclusion is required'
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

  const handleSaveDraft = async () => {
    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      console.log('Draft saved:', formData)
    } finally {
      setIsLoading(false)
    }
  }

  const handlePublish = async () => {
    if (!validateStep(1) || !validateStep(2) || !validateStep(3)) {
      alert('Please complete all required fields before publishing')
      return
    }

    if (!user?.id) {
      alert("User not found. Please log in again.")
      return
    }

    setIsLoading(true)
    try {
      const experienceData = {
        host_id: user.id,
        title: formData.title,
        description: formData.description,
        short_description: formData.description.substring(0, 150),
        location: formData.location,
        activity_type: formData.category.toLowerCase().replace(/\s+/g, '-'),
        category: [formData.category],
        duration_hours: formData.durationType === 'days' ? formData.duration * 24 : formData.duration,
        max_guests: formData.groupSize,
        min_guests: 1,
        price_per_person: formData.price,
        difficulty_level: formData.difficultyLevel.toLowerCase(),
        included_amenities: formData.included,
        what_to_bring: formData.thingsToBring,
        tags: formData.tags,
        seasonal_availability: ['year-round'],
        is_active: true,
        itinerary: formData.faq.map((faqItem, index) => ({
          time: `${index + 1}:00`,
          activity: faqItem.question,
          description: faqItem.answer
        }))
      }

      const result = await createExperience(experienceData)

      if (result.success) {
        alert('Experience published successfully!')
        router.push('/business/experiences')
      } else {
        alert(result.error || 'Failed to create experience')
      }
    } catch (error: any) {
      alert(error.message || 'An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const addItem = (field: keyof Pick<ExperienceFormData, 'tags' | 'included' | 'notIncluded' | 'thingsToBring' | 'availableDates'>, item: string) => {
    if (item.trim()) {
      updateFormData({
        [field]: [...formData[field], item.trim()]
      })
    }
  }

  const removeItem = (field: keyof Pick<ExperienceFormData, 'tags' | 'included' | 'notIncluded' | 'thingsToBring' | 'availableDates'>, index: number) => {
    updateFormData({
      [field]: formData[field].filter((_, i) => i !== index)
    })
  }

  const addFAQ = () => {
    updateFormData({
      faq: [...formData.faq, { question: '', answer: '' }]
    })
  }

  const updateFAQ = (index: number, field: 'question' | 'answer', value: string) => {
    const newFaq = [...formData.faq]
    newFaq[index][field] = value
    updateFormData({ faq: newFaq })
  }

  const removeFAQ = (index: number) => {
    updateFormData({
      faq: formData.faq.filter((_, i) => i !== index)
    })
  }

  const renderProgressBar = () => (
    <div className="w-full mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-gray-900">
          Create New Experience
        </h2>
        <div className="text-sm text-gray-500">
          Step {currentStep} of {STEPS.length}
        </div>
      </div>

      <div className="flex items-center space-x-4 mb-6">
        {STEPS.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <div className={`
              flex items-center justify-center w-8 h-8 rounded-full border-2 transition-colors
              ${currentStep > step.id 
                ? 'bg-blue-600 border-blue-600 text-white' 
                : currentStep === step.id 
                  ? 'border-blue-600 text-blue-600 bg-white' 
                  : 'border-gray-300 text-gray-400 bg-white'
              }
            `}>
              {currentStep > step.id ? (
                <Check size={16} />
              ) : (
                <span className="text-xs font-bold">{step.id}</span>
              )}
            </div>
            {index < STEPS.length - 1 && (
              <div className={`
                w-12 h-0.5 mx-2 transition-colors
                ${currentStep > step.id ? 'bg-blue-600' : 'bg-gray-300'}
              `} />
            )}
          </div>
        ))}
      </div>

      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">
          {STEPS[currentStep - 1].title}
        </h3>
        <p className="text-sm text-gray-600">
          {STEPS[currentStep - 1].description}
        </p>
      </div>
    </div>
  )

  const renderBasicInfoStep = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="lg:col-span-2">
          <Label htmlFor="title">Experience Title *</Label>
          <Input
            id="title"
            placeholder="e.g., Mediterranean Yacht Cruise"
            value={formData.title}
            onChange={(e) => updateFormData({ title: e.target.value })}
            className={errors.title ? "border-red-500" : ""}
          />
          {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
          <p className="text-gray-500 text-sm mt-1">Give your experience a catchy, descriptive name</p>
        </div>

        <div>
          <Label htmlFor="location">Location *</Label>
          <Input
            id="location"
            placeholder="e.g., Antigua, Caribbean"
            value={formData.location}
            onChange={(e) => updateFormData({ location: e.target.value })}
            className={errors.location ? "border-red-500" : ""}
          />
          {errors.location && <p className="text-red-500 text-sm mt-1">{errors.location}</p>}
          <p className="text-gray-500 text-sm mt-1">Where does this experience take place?</p>
        </div>

        <div>
          <Label htmlFor="category">Category *</Label>
          <Select value={formData.category} onValueChange={(value) => updateFormData({ category: value })}>
            <SelectTrigger className={errors.category ? "border-red-500" : ""}>
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
        </div>
      </div>

      <div>
        <Label htmlFor="description">Description *</Label>
        <Textarea
          id="description"
          placeholder="Tell potential guests about the amazing experience they'll have..."
          value={formData.description}
          onChange={(e) => updateFormData({ description: e.target.value })}
          className={`h-32 ${errors.description ? "border-red-500" : ""}`}
        />
        {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
        <p className="text-gray-500 text-sm mt-1">Describe what makes this experience special</p>
      </div>
    </div>
  )

  const renderDetailsStep = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="price">Price per Person * (USD)</Label>
          <Input
            id="price"
            type="number"
            placeholder="0"
            value={formData.price || ''}
            onChange={(e) => updateFormData({ price: Number(e.target.value) })}
            className={errors.price ? "border-red-500" : ""}
          />
          {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
        </div>

        <div>
          <Label htmlFor="groupSize">Maximum Group Size *</Label>
          <Input
            id="groupSize"
            type="number"
            placeholder="1"
            min="1"
            value={formData.groupSize || ''}
            onChange={(e) => updateFormData({ groupSize: Number(e.target.value) })}
            className={errors.groupSize ? "border-red-500" : ""}
          />
          {errors.groupSize && <p className="text-red-500 text-sm mt-1">{errors.groupSize}</p>}
          <p className="text-gray-500 text-sm mt-1">How many people can join?</p>
        </div>

        <div>
          <Label>Duration *</Label>
          <div className="flex gap-2">
            <Input
              type="number"
              placeholder="1"
              min="1"
              value={formData.duration || ''}
              onChange={(e) => updateFormData({ duration: Number(e.target.value) })}
              className={`flex-1 ${errors.duration ? "border-red-500" : ""}`}
            />
            <div className="flex">
              <Button
                variant={formData.durationType === 'hours' ? 'default' : 'outline'}
                onClick={() => updateFormData({ durationType: 'hours' })}
                className="rounded-r-none"
                type="button"
              >
                Hours
              </Button>
              <Button
                variant={formData.durationType === 'days' ? 'default' : 'outline'}
                onClick={() => updateFormData({ durationType: 'days' })}
                className="rounded-l-none"
                type="button"
              >
                Days
              </Button>
            </div>
          </div>
          {errors.duration && <p className="text-red-500 text-sm mt-1">{errors.duration}</p>}
          <p className="text-gray-500 text-sm mt-1">How long does it last?</p>
        </div>

        <div>
          <Label>Difficulty Level *</Label>
          <div className="flex flex-wrap gap-2 mt-2">
            {DIFFICULTY_LEVELS.map((level) => (
              <Button
                key={level}
                variant={formData.difficultyLevel === level ? 'default' : 'outline'}
                onClick={() => updateFormData({ difficultyLevel: level })}
                size="sm"
                type="button"
              >
                {level}
              </Button>
            ))}
          </div>
          {errors.difficultyLevel && <p className="text-red-500 text-sm mt-1">{errors.difficultyLevel}</p>}
        </div>
      </div>

      <div>
        <Label>Tags</Label>
        <p className="text-gray-500 text-sm mb-3">Add tags to help guests find your experience</p>
        <div className="flex flex-wrap gap-2 mb-3">
          {formData.tags.map((tag, index) => (
            <Badge key={index} variant="secondary" className="flex items-center gap-2">
              {tag}
              <button
                onClick={() => removeItem('tags', index)}
                className="text-gray-600 hover:text-gray-700"
                type="button"
              >
                <X size={12} />
              </button>
            </Badge>
          ))}
        </div>
        <div className="flex gap-2">
          <Input
            placeholder="Add a tag..."
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                addItem('tags', e.currentTarget.value)
                e.currentTarget.value = ''
              }
            }}
            className="flex-1"
          />
          <Button
            variant="outline"
            onClick={(e) => {
              const input = e.currentTarget.parentElement?.querySelector('input')
              if (input?.value) {
                addItem('tags', input.value)
                input.value = ''
              }
            }}
            type="button"
          >
            <Plus size={16} />
            Add
          </Button>
        </div>
      </div>
    </div>
  )

  const renderContentStep = () => (
    <div className="space-y-6">
      {/* What's Included */}
      <div>
        <Label>What's Included *</Label>
        <p className="text-gray-500 text-sm mb-3">List what guests will receive as part of the experience</p>
        {errors.included && <p className="text-red-500 text-sm mb-2">{errors.included}</p>}
        <div className="space-y-2 mb-3">
          {formData.included.map((item, index) => (
            <div key={index} className="flex items-center gap-2 p-2 bg-green-50 rounded-md">
              <Check className="text-green-600" size={16} />
              <span className="flex-1">{item}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeItem('included', index)}
                type="button"
              >
                <X size={16} />
              </Button>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <Input
            placeholder="e.g., Professional guide, Equipment rental"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                addItem('included', e.currentTarget.value)
                e.currentTarget.value = ''
              }
            }}
            className="flex-1"
          />
          <Button
            variant="outline"
            onClick={(e) => {
              const input = e.currentTarget.parentElement?.querySelector('input')
              if (input?.value) {
                addItem('included', input.value)
                input.value = ''
              }
            }}
            type="button"
          >
            <Plus size={16} />
            Add
          </Button>
        </div>
      </div>

      {/* What's Not Included */}
      <div>
        <Label>What's Not Included</Label>
        <div className="space-y-2 mb-3">
          {formData.notIncluded.map((item, index) => (
            <div key={index} className="flex items-center gap-2 p-2 bg-red-50 rounded-md">
              <X className="text-red-600" size={16} />
              <span className="flex-1">{item}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeItem('notIncluded', index)}
                type="button"
              >
                <X size={16} />
              </Button>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <Input
            placeholder="e.g., Transportation, Personal insurance"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                addItem('notIncluded', e.currentTarget.value)
                e.currentTarget.value = ''
              }
            }}
            className="flex-1"
          />
          <Button
            variant="outline"
            onClick={(e) => {
              const input = e.currentTarget.parentElement?.querySelector('input')
              if (input?.value) {
                addItem('notIncluded', input.value)
                input.value = ''
              }
            }}
            type="button"
          >
            <Plus size={16} />
            Add
          </Button>
        </div>
      </div>

      {/* Things to Bring */}
      <div>
        <Label>Things to Bring</Label>
        <div className="flex flex-wrap gap-2 mb-3">
          {formData.thingsToBring.map((item, index) => (
            <Badge key={index} variant="outline" className="flex items-center gap-2">
              {item}
              <button
                onClick={() => removeItem('thingsToBring', index)}
                className="text-gray-600 hover:text-gray-700"
                type="button"
              >
                <X size={12} />
              </button>
            </Badge>
          ))}
        </div>
        <div className="flex gap-2">
          <Input
            placeholder="e.g., Sunscreen, Water bottle"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                addItem('thingsToBring', e.currentTarget.value)
                e.currentTarget.value = ''
              }
            }}
            className="flex-1"
          />
          <Button
            variant="outline"
            onClick={(e) => {
              const input = e.currentTarget.parentElement?.querySelector('input')
              if (input?.value) {
                addItem('thingsToBring', input.value)
                input.value = ''
              }
            }}
            type="button"
          >
            <Plus size={16} />
            Add
          </Button>
        </div>
      </div>

      {/* Cancellation Policy */}
      <div>
        <Label htmlFor="policy">Cancellation Policy</Label>
        <Textarea
          id="policy"
          placeholder="e.g., Moderate: cancel 14 days before arrival with 50% refund"
          value={formData.cancellationPolicy}
          onChange={(e) => updateFormData({ cancellationPolicy: e.target.value })}
          className="h-24"
        />
        <p className="text-gray-500 text-sm mt-1">Describe your cancellation and refund policy</p>
      </div>
    </div>
  )

  const renderMediaStep = () => (
    <div className="space-y-6">
      <div>
        <Label>Photos & Videos</Label>
        <p className="text-gray-500 text-sm mb-4">Add high-quality images and videos to showcase your experience</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {formData.images.map((image, index) => (
            <div key={index} className="relative group">
              <img
                src={image}
                alt={`Experience ${index + 1}`}
                className="w-full h-48 object-cover rounded-lg"
              />
              <button
                onClick={() => {
                  updateFormData({
                    images: formData.images.filter((_, i) => i !== index)
                  })
                }}
                className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                type="button"
              >
                <X size={16} />
              </button>
            </div>
          ))}

          <div className="border-2 border-dashed border-gray-300 rounded-lg h-48 flex flex-col items-center justify-center hover:border-blue-600 hover:bg-blue-50 transition-colors cursor-pointer">
            <Upload className="text-gray-400 mb-2" size={24} />
            <span className="text-gray-600">Upload Media</span>
            <span className="text-sm text-gray-400">Images or Videos</span>
          </div>
        </div>
      </div>

      {/* Available Dates */}
      <div>
        <Label>Available Dates</Label>
        <p className="text-gray-500 text-sm mb-3">Add specific dates when this experience is available</p>
        <div className="flex flex-wrap gap-2 mb-3">
          {formData.availableDates.map((date, index) => (
            <Badge key={index} variant="secondary" className="flex items-center gap-2">
              <Calendar size={12} />
              {date}
              <button
                onClick={() => removeItem('availableDates', index)}
                className="text-blue-600 hover:text-blue-700"
                type="button"
              >
                <X size={12} />
              </button>
            </Badge>
          ))}
        </div>
        <div className="flex gap-2">
          <Input
            type="date"
            onChange={(e) => {
              if (e.target.value) {
                addItem('availableDates', new Date(e.target.value).toLocaleDateString())
                e.target.value = ''
              }
            }}
            className="flex-1"
          />
        </div>
      </div>
    </div>
  )

  const renderSocialStep = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Social Media Integration</h3>
        <p className="text-gray-600 mb-6">Connect your social media accounts to showcase more content (optional)</p>

        <div className="space-y-4">
          {/* Instagram */}
          <div className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg">
            <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
              <span className="text-pink-600 font-bold">IG</span>
            </div>
            <div className="flex-1">
              <Input
                placeholder="Instagram profile URL"
                value={formData.socialMedia.instagram}
                onChange={(e) => updateFormData({
                  socialMedia: { ...formData.socialMedia, instagram: e.target.value }
                })}
              />
            </div>
            <Button
              variant={formData.socialMedia.instagram ? "destructive" : "default"}
              size="sm"
              type="button"
            >
              {formData.socialMedia.instagram ? "Unlink" : "Connect"}
            </Button>
          </div>

          {/* Facebook */}
          <div className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-blue-600 font-bold">FB</span>
            </div>
            <div className="flex-1">
              <Input
                placeholder="Facebook page URL"
                value={formData.socialMedia.facebook}
                onChange={(e) => updateFormData({
                  socialMedia: { ...formData.socialMedia, facebook: e.target.value }
                })}
              />
            </div>
            <Button
              variant={formData.socialMedia.facebook ? "destructive" : "default"}
              size="sm"
              type="button"
            >
              {formData.socialMedia.facebook ? "Unlink" : "Connect"}
            </Button>
          </div>

          {/* YouTube */}
          <div className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <span className="text-red-600 font-bold">YT</span>
            </div>
            <div className="flex-1">
              <Input
                placeholder="YouTube channel URL"
                value={formData.socialMedia.youtube}
                onChange={(e) => updateFormData({
                  socialMedia: { ...formData.socialMedia, youtube: e.target.value }
                })}
              />
            </div>
            <Button
              variant={formData.socialMedia.youtube ? "destructive" : "default"}
              size="sm"
              type="button"
            >
              {formData.socialMedia.youtube ? "Unlink" : "Connect"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )

  const renderReviewStep = () => (
    <div className="space-y-6">
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Experience Preview</h3>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h4 className="text-xl font-bold text-gray-900 mb-2">
              {formData.title || 'Untitled Experience'}
            </h4>
            <div className="flex items-center gap-4 mb-3">
              <div className="flex items-center gap-1">
                <MapPin size={16} className="text-gray-500" />
                <span className="text-gray-600">{formData.location || 'No location'}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock size={16} className="text-gray-500" />
                <span className="text-gray-600">
                  {formData.duration} {formData.durationType}
                </span>
              </div>
            </div>
            <p className="text-gray-700 mb-4">
              {formData.description || 'No description provided'}
            </p>

            <div className="flex items-center gap-2 mb-4">
              {formData.category && (
                <Badge variant="default">{formData.category}</Badge>
              )}
              {formData.difficultyLevel && (
                <Badge variant="outline">{formData.difficultyLevel}</Badge>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="text-lg font-bold text-green-600">
                  ${formData.price}
                </div>
                <div className="text-gray-600">
                  Max {formData.groupSize} guests
                </div>
              </div>
            </div>
          </div>

          <div>
            <div className="space-y-3">
              <div>
                <span className="font-semibold text-gray-900">What's Included:</span>
                <ul className="text-gray-700 ml-4 mt-1">
                  {formData.included.slice(0, 3).map((item, index) => (
                    <li key={index} className="list-disc">{item}</li>
                  ))}
                  {formData.included.length > 3 && (
                    <li className="list-disc">...and {formData.included.length - 3} more</li>
                  )}
                </ul>
              </div>

              {formData.tags.length > 0 && (
                <div>
                  <span className="font-semibold text-gray-900">Tags:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {formData.tags.slice(0, 4).map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">{tag}</Badge>
                    ))}
                    {formData.tags.length > 4 && (
                      <Badge variant="outline" className="text-xs">+{formData.tags.length - 4}</Badge>
                    )}
                  </div>
                </div>
              )}

              {formData.availableDates.length > 0 && (
                <div>
                  <span className="font-semibold text-gray-900">Available Dates:</span>
                  <div className="text-gray-700 mt-1">
                    {formData.availableDates.slice(0, 2).join(', ')}
                    {formData.availableDates.length > 2 && ` ...and ${formData.availableDates.length - 2} more`}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Validation Summary */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Completeness Check</h4>

        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Check className={`${formData.title && formData.description && formData.location && formData.category ? 'text-green-600' : 'text-gray-400'}`} size={16} />
            <span className={`${formData.title && formData.description && formData.location && formData.category ? 'text-green-700' : 'text-gray-600'}`}>
              Basic Information Complete
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Check className={`${formData.price > 0 && formData.groupSize > 0 && formData.duration > 0 && formData.difficultyLevel ? 'text-green-600' : 'text-gray-400'}`} size={16} />
            <span className={`${formData.price > 0 && formData.groupSize > 0 && formData.duration > 0 && formData.difficultyLevel ? 'text-green-700' : 'text-gray-600'}`}>
              Pricing & Details Complete
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Check className={`${formData.included.length > 0 ? 'text-green-600' : 'text-gray-400'}`} size={16} />
            <span className={`${formData.included.length > 0 ? 'text-green-700' : 'text-gray-600'}`}>
              Content & Inclusions Added
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Check className={`${formData.images.length > 0 || formData.availableDates.length > 0 ? 'text-green-600' : 'text-gray-400'}`} size={16} />
            <span className={`${formData.images.length > 0 || formData.availableDates.length > 0 ? 'text-green-700' : 'text-gray-600'}`}>
              Media or Dates Added (Optional)
            </span>
          </div>
        </div>
      </div>
    </div>
  )

  const renderStepContent = () => {
    switch (currentStep) {
      case 1: return renderBasicInfoStep()
      case 2: return renderDetailsStep()
      case 3: return renderContentStep()
      case 4: return renderMediaStep()
      case 5: return renderSocialStep()
      case 6: return renderReviewStep()
      default: return null
    }
  }

  if (!isClient) {
    return <div>Loading...</div>
  }

  return (
    <div className="container max-w-none flex w-full h-screen items-start border border-solid border-gray-200">
      {/* Sidebar */}
      <div className="flex flex-col items-start gap-8 w-80 flex-shrink-0 border-r border-solid border-gray-200 bg-white px-6 py-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
            <Anchor className="text-yellow-600" size={20} />
          </div>
          <span className="text-xl font-bold text-gray-900">Ocean Travel</span>
        </div>

        <div className="flex w-full flex-col items-start gap-1">
          <Button variant="ghost" className="w-full justify-start" asChild>
            <div className="flex items-center gap-2">
              <Home size={16} />
              Dashboard
            </div>
          </Button>
        </div>

        <div className="flex w-full flex-col items-start gap-1">
          <span className="w-full text-sm font-semibold text-gray-900 mb-2">Client Management</span>
          <Button variant="ghost" className="w-full justify-start" asChild>
            <div className="flex items-center gap-2">
              <Users size={16} />
              Bookings
            </div>
          </Button>
          <Button variant="default" className="w-full justify-start" asChild>
            <div className="flex items-center gap-2">
              <Anchor size={16} />
              Experiences
            </div>
          </Button>
          <Button variant="ghost" className="w-full justify-start" asChild>
            <div className="flex items-center gap-2">
              <MessageCircle size={16} />
              Messages
            </div>
          </Button>
          <Button variant="ghost" className="w-full justify-start" asChild>
            <div className="flex items-center gap-2">
              <Calendar size={16} />
              Calendar
            </div>
          </Button>
          <Button variant="ghost" className="w-full justify-start" asChild>
            <div className="flex items-center gap-2">
              <Handshake size={16} />
              Clients
            </div>
          </Button>
        </div>

        <div className="flex w-full flex-col items-start gap-2">
          <span className="w-full text-sm font-semibold text-gray-900 mb-2">Finance</span>
          <div className="flex w-full flex-col items-start gap-1">
            <Button variant="ghost" className="w-full justify-start" asChild>
              <div className="flex items-center gap-2">
                <DollarSign size={16} />
                Sales & Payments
              </div>
            </Button>
            <Button variant="ghost" className="w-full justify-start" asChild>
              <div className="flex items-center gap-2">
                <Shapes size={16} />
                Integrations
              </div>
            </Button>
          </div>
        </div>

        <div className="flex w-full flex-col items-start gap-1">
          <span className="w-full text-sm font-semibold text-gray-900 mb-2">Workspace</span>
          <Button variant="ghost" className="w-full justify-start" asChild>
            <div className="flex items-center gap-2">
              <User size={16} />
              Account
            </div>
          </Button>
          <Button variant="ghost" className="w-full justify-start" asChild>
            <div className="flex items-center gap-2">
              <Settings size={16} />
              Settings
            </div>
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col items-start flex-1 overflow-hidden">
        {/* Header */}
        <div className="flex w-full items-center justify-between border-b border-solid border-gray-200 px-8 py-4 bg-white">
          <Input
            placeholder="Search..."
            className="w-80"
          />

          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon">
              <Bell size={16} />
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2">
                  Ocean Travel
                  <ChevronDown size={16} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto w-full">
          <div className="max-w-4xl mx-auto px-8 py-8">
            {renderProgressBar()}

            <div className="bg-white rounded-lg border border-gray-200 p-8">
              {renderStepContent()}
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-8">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 1}
                type="button"
              >
                <ChevronLeft size={16} className="mr-2" />
                Previous
              </Button>

              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  onClick={handleSaveDraft}
                  disabled={isLoading}
                  type="button"
                >
                  <Save size={16} className="mr-2" />
                  {isLoading ? 'Saving...' : 'Save Draft'}
                </Button>

                {currentStep === STEPS.length ? (
                  <Button
                    onClick={handlePublish}
                    disabled={isLoading}
                    type="button"
                  >
                    <Check size={16} className="mr-2" />
                    {isLoading ? 'Publishing...' : 'Publish Experience'}
                  </Button>
                ) : (
                  <Button
                    onClick={handleNext}
                    type="button"
                  >
                    Next
                    <ChevronRight size={16} className="ml-2" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export { CreateNewExperience as NewExperienceForm }
