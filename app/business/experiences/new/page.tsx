"use client"

import { useState } from "react"
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

// Enhanced activity types with icons and descriptions
const ACTIVITY_TYPES = [
  { value: 'sailing', label: 'Sailing', icon: '⛵', description: 'Yacht charters, sailing lessons, and racing experiences' },
  { value: 'surfing', label: 'Surfing', icon: '🏄', description: 'Surf lessons, guided surf tours, and advanced coaching' },
  { value: 'kayaking', label: 'Kayaking', icon: '🛶', description: 'Sea kayaking, river kayaking, and wildlife tours' },
  { value: 'diving', label: 'Diving', icon: '🤿', description: 'Scuba diving, snorkeling, and underwater exploration' },
  { value: 'jet-skiing', label: 'Jet Skiing', icon: '🚤', description: 'Jet ski rentals and guided tours' },
  { value: 'fishing', label: 'Fishing', icon: '🎣', description: 'Deep sea fishing, inshore fishing, and fishing charters' },
  { value: 'whale-watching', label: 'Whale Watching', icon: '🐋', description: 'Marine wildlife observation and educational tours' },
  { value: 'paddleboarding', label: 'Paddleboarding', icon: '🏄‍♂️', description: 'Stand-up paddleboarding and SUP tours' },
  { value: 'windsurfing', label: 'Windsurfing', icon: '🏄‍♀️', description: 'Windsurfing lessons and equipment rental' },
  { value: 'snorkeling', label: 'Snorkeling', icon: '🤿', description: 'Guided snorkeling tours and equipment rental' },
]

const DIFFICULTY_LEVELS = [
  { value: "beginner", label: "Beginner", description: "No experience required, suitable for all ages" },
  { value: "intermediate", label: "Intermediate", description: "Some experience helpful, moderate fitness required" },
  { value: "advanced", label: "Advanced", description: "Significant experience required, good fitness needed" },
  { value: "expert", label: "Expert", description: "Professional level skills, excellent fitness required" },
]

const EQUIPMENT_CATEGORIES = [
  { value: 'safety', label: 'Safety Equipment', items: ['Life Jackets', 'First Aid Kit', 'Emergency Flares', 'VHF Radio'] },
  { value: 'activity', label: 'Activity Equipment', items: ['Boards', 'Paddles', 'Fishing Gear', 'Diving Equipment'] },
  { value: 'comfort', label: 'Comfort Items', items: ['Towels', 'Sunscreen', 'Shade', 'Refreshments'] },
  { value: 'navigation', label: 'Navigation', items: ['GPS', 'Compass', 'Maps', 'Communication Devices'] },
]

const WHAT_TO_BRING_OPTIONS = [
  "Swimwear", "Towel", "Sunscreen", "Hat", "Sunglasses", "Water Bottle", 
  "Camera", "Comfortable Shoes", "Light Jacket", "Personal Medication",
  "Snacks", "Change of Clothes", "Waterproof Bag", "Motion Sickness Medication"
]

export default function NewExperiencePage() {
  return (
    <BusinessProtectedRoute>
      <NewExperienceForm />
    </BusinessProtectedRoute>
  )
}

function NewExperienceForm() {
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useAuth()

  const [formData, setFormData] = useState({
    title: "",
    location: "",
    description: "",
    activityType: "",
    difficultyLevel: "",
    price: 50,
    duration: 120, // in minutes
    maxParticipants: 8,
    minAge: undefined as number | undefined,
    equipmentProvided: [] as string[],
    whatToBring: [] as string[],
    weatherDependency: true,
    instantBooking: false,
    tags: [] as string[],
    highlights: [] as string[],
    includedServices: [] as string[],
    excludedServices: [] as string[],
    cancellationPolicy: "",
    activitySpecificDetails: {} as Record<string, any>,
    itinerary: [{ title: "", description: "", duration: 0, order: 1 }],
  })

  const totalSteps = 5
  const progress = (currentStep / totalSteps) * 100

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleArrayToggle = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: (prev[field as keyof typeof prev] as string[]).includes(value)
        ? (prev[field as keyof typeof prev] as string[]).filter((item) => item !== value)
        : [...(prev[field as keyof typeof prev] as string[]), value],
    }))
  }

  const handleItineraryChange = (index: number, field: string, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      itinerary: prev.itinerary.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      ),
    }))
  }

  const addItineraryItem = () => {
    setFormData((prev) => ({
      ...prev,
      itinerary: [...prev.itinerary, { 
        title: "", 
        description: "", 
        duration: 0, 
        order: prev.itinerary.length + 1 
      }],
    }))
  }

  const removeItineraryItem = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      itinerary: prev.itinerary.filter((_, i) => i !== index),
    }))
  }

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(formData.title && formData.location && formData.activityType)
      case 2:
        return !!(formData.description && formData.difficultyLevel)
      case 3:
        return !!(formData.price > 0 && formData.duration > 0 && formData.maxParticipants > 0)
      case 4:
        return true
      case 5:
        return true
      default:
        return false
    }
  }

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, totalSteps))
      setError("")
    } else {
      setError("Please fill in all required fields before continuing.")
    }
  }

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1))
    setError("")
  }

  const handleSubmit = async () => {
    if (!user?.id) {
      setError("User not found. Please log in again.")
      return
    }

    setLoading(true)
    setError("")

    try {
      const experienceData = {
        host_id: user.id,
        business_id: user.id, // Assuming user ID is business ID for now
        title: formData.title,
        description: formData.description,
        location: formData.location,
        price: formData.price,
        duration: formData.duration,
        activity_type: formData.activityType,
        activity_specific_details: formData.activitySpecificDetails,
        difficulty_level: formData.difficultyLevel,
        max_participants: formData.maxParticipants,
        min_age: formData.minAge,
        equipment_provided: formData.equipmentProvided,
        what_to_bring: formData.whatToBring,
        weather_dependency: formData.weatherDependency,
        instant_booking: formData.instantBooking,
        tags: formData.tags,
        highlights: formData.highlights,
        included_services: formData.includedServices,
        excluded_services: formData.excludedServices,
        cancellation_policy: formData.cancellationPolicy,
        itinerary: formData.itinerary.filter((item) => item.title.trim() !== ""),
      }

      const result = await createExperience(experienceData)

      if (result.success) {
        toast({
          title: "Experience Created!",
          description: "Your experience has been successfully created and is now live.",
        })
        router.push("/business/experiences")
      } else {
        setError(result.error || "Failed to create experience")
      }
    } catch (error: any) {
      setError(error.message || "An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <Label htmlFor="title">Experience Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                placeholder="e.g., Sunset Sailing Cruise"
              />
            </div>

            <div>
              <Label htmlFor="location">Location *</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => handleInputChange("location", e.target.value)}
                placeholder="e.g., Marina Bay, San Diego"
              />
            </div>

            <div>
              <Label>Activity Type *</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                {ACTIVITY_TYPES.map((activity) => (
                  <div
                    key={activity.value}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      formData.activityType === activity.value
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() => handleInputChange("activityType", activity.value)}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{activity.icon}</span>
                      <div>
                        <div className="font-medium">{activity.label}</div>
                        <div className="text-xs text-gray-600">{activity.description}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                placeholder="Describe your experience in detail..."
                rows={4}
              />
            </div>

            <div>
              <Label>Difficulty Level *</Label>
              <div className="grid grid-cols-2 gap-3 mt-2">
                {DIFFICULTY_LEVELS.map((level) => (
                  <div
                    key={level.value}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      formData.difficultyLevel === level.value
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() => handleInputChange("difficultyLevel", level.value)}
                  >
                    <div className="font-medium">{level.label}</div>
                    <div className="text-xs text-gray-600">{level.description}</div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label>Highlights</Label>
              <div className="space-y-2">
                <Input
                  placeholder="Add a highlight (e.g., Breathtaking sunset views)"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                      handleArrayToggle("highlights", e.currentTarget.value.trim())
                      e.currentTarget.value = ""
                    }
                  }}
                />
                <div className="flex flex-wrap gap-2">
                  {formData.highlights.map((highlight, index) => (
                    <Badge key={index} variant="secondary" className="cursor-pointer" onClick={() => handleArrayToggle("highlights", highlight)}>
                      {highlight} ×
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Price per person *</Label>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold">$</span>
                  <Input
                    type="number"
                    value={formData.price}
                    onChange={(e) => handleInputChange("price", parseInt(e.target.value) || 0)}
                    min="0"
                  />
                </div>
              </div>

              <div>
                <Label>Duration (minutes) *</Label>
                <Input
                  type="number"
                  value={formData.duration}
                  onChange={(e) => handleInputChange("duration", parseInt(e.target.value) || 0)}
                  min="1"
                />
              </div>
            </div>

            <div>
              <Label>Max Participants: {formData.maxParticipants}</Label>
              <Slider
                value={[formData.maxParticipants]}
                onValueChange={(value) => handleInputChange("maxParticipants", value[0])}
                max={20}
                min={1}
                step={1}
                className="w-full"
              />
            </div>

            <div>
              <Label>Minimum Age: {formData.minAge || 'None'}</Label>
              <Slider
                value={[formData.minAge || 0]}
                onValueChange={(value) => handleInputChange("minAge", value[0] || undefined)}
                max={18}
                min={0}
                step={1}
                className="w-full"
              />
            </div>

            <div className="space-y-3">
              <Label>Equipment Provided</Label>
              <div className="grid grid-cols-2 gap-3">
                {EQUIPMENT_CATEGORIES.map((category) => (
                  <div key={category.value} className="space-y-2">
                    <div className="font-medium text-sm">{category.label}</div>
                    <div className="space-y-1">
                      {category.items.map((item) => (
                        <div key={item} className="flex items-center space-x-2">
                          <Checkbox
                            id={item}
                            checked={formData.equipmentProvided.includes(item)}
                            onCheckedChange={() => handleArrayToggle("equipmentProvided", item)}
                          />
                          <Label htmlFor={item} className="text-sm">{item}</Label>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            <div>
              <Label>What to Bring</Label>
              <div className="space-y-2">
                <Input
                  placeholder="Add an item (e.g., Sunscreen)"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                      handleArrayToggle("whatToBring", e.currentTarget.value.trim())
                      e.currentTarget.value = ""
                    }
                  }}
                />
                <div className="flex flex-wrap gap-2">
                  {formData.whatToBring.map((item, index) => (
                    <Badge key={index} variant="secondary" className="cursor-pointer" onClick={() => handleArrayToggle("whatToBring", item)}>
                      {item} ×
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Label>Additional Options</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="weather-dependency"
                    checked={formData.weatherDependency}
                    onCheckedChange={(checked) => handleInputChange("weatherDependency", checked)}
                  />
                  <Label htmlFor="weather-dependency">Weather dependent</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="instant-booking"
                    checked={formData.instantBooking}
                    onCheckedChange={(checked) => handleInputChange("instantBooking", checked)}
                  />
                  <Label htmlFor="instant-booking">Instant booking available</Label>
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="cancellation-policy">Cancellation Policy</Label>
              <Textarea
                id="cancellation-policy"
                value={formData.cancellationPolicy}
                onChange={(e) => handleInputChange("cancellationPolicy", e.target.value)}
                placeholder="Describe your cancellation policy..."
                rows={3}
              />
            </div>
          </div>
        )

      case 5:
        return (
          <div className="space-y-6">
            <div>
              <Label>Itinerary</Label>
              <div className="space-y-4">
                {formData.itinerary.map((item, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <Label>Title</Label>
                        <Input
                          value={item.title}
                          onChange={(e) => handleItineraryChange(index, "title", e.target.value)}
                          placeholder="Activity title"
                        />
                      </div>
                      <div>
                        <Label>Duration (minutes)</Label>
                        <Input
                          type="number"
                          value={item.duration}
                          onChange={(e) => handleItineraryChange(index, "duration", parseInt(e.target.value) || 0)}
                          min="0"
                        />
                      </div>
                      <div className="flex items-end">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeItineraryItem(index)}
                          disabled={formData.itinerary.length === 1}
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                    <div className="mt-3">
                      <Label>Description</Label>
                      <Textarea
                        value={item.description}
                        onChange={(e) => handleItineraryChange(index, "description", e.target.value)}
                        placeholder="Describe this part of the experience..."
                        rows={2}
                      />
                    </div>
                  </div>
                ))}
                <Button variant="outline" onClick={addItineraryItem}>
                  Add Itinerary Item
                </Button>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Create New Experience</h1>
          <p className="text-gray-600">Set up your aquatic adventure experience</p>
        </div>

        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Step {currentStep} of {totalSteps}</span>
            <span className="text-sm text-gray-500">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="w-full" />
        </div>

        <Card>
          <CardContent className="p-6">
            {error && (
              <Alert className="mb-6">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {renderStep()}

            <div className="flex justify-between mt-8">
              <Button
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 1}
              >
                Previous
              </Button>

              {currentStep < totalSteps ? (
                <Button onClick={nextStep}>
                  Next
                </Button>
              ) : (
                <Button onClick={handleSubmit} disabled={loading}>
                  {loading ? "Creating..." : "Create Experience"}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
