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
import { useToast } from "@/hooks/use-toast"
import { createExperience } from "@/lib/database"
import { useAuth } from "@/hooks/useAuth"
import { BusinessProtectedRoute } from "@/components/auth/BusinessProtectedRoute"

const ACTIVITY_TYPES = [
  "Boat Tours",
  "Diving",
  "Snorkeling",
  "Fishing",
  "Water Sports",
  "Marine Wildlife",
  "Cultural Tours",
  "Adventure",
  "Educational",
  "Photography",
]

const CATEGORIES = [
  "Adventure",
  "Wildlife",
  "Cultural",
  "Educational",
  "Photography",
  "Relaxation",
  "Family-Friendly",
  "Romantic",
  "Group Activities",
  "Solo Travel",
]

const DIFFICULTY_LEVELS = [
  { value: "beginner", label: "Beginner - No experience required" },
  { value: "intermediate", label: "Intermediate - Some experience helpful" },
  { value: "advanced", label: "Advanced - Significant experience required" },
  { value: "expert", label: "Expert - Professional level skills needed" },
]

const AMENITIES = [
  "Equipment Provided",
  "Professional Guide",
  "Transportation",
  "Meals Included",
  "Refreshments",
  "Photography Service",
  "Insurance Coverage",
  "Safety Equipment",
  "Changing Facilities",
  "Storage Lockers",
]

const WHAT_TO_BRING = [
  "Swimwear",
  "Towel",
  "Sunscreen",
  "Hat",
  "Sunglasses",
  "Water Bottle",
  "Camera",
  "Comfortable Shoes",
  "Light Jacket",
  "Personal Medication",
]

const SEASONAL_AVAILABILITY = ["Spring", "Summer", "Autumn", "Winter", "Year-round"]

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
  const { userProfile } = useAuth()

  const [formData, setFormData] = useState({
    title: "",
    location: "",
    specificLocation: "",
    country: "",
    activityType: "",
    categories: [] as string[],
    difficultyLevel: "",
    description: "",
    shortDescription: "",
    durationHours: 2,
    pricePerPerson: 50,
    maxGuests: 8,
    minGuests: 1,
    includedAmenities: [] as string[],
    whatToBring: [] as string[],
    minAge: undefined as number | undefined,
    maxAge: undefined as number | undefined,
    ageRestrictionDetails: "",
    tags: [] as string[],
    seasonalAvailability: [] as string[],
    itinerary: [{ time: "", activity: "", description: "" }],
  })

  const totalSteps = 6
  const progress = (currentStep / totalSteps) * 100

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleArrayToggle = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field as keyof typeof prev].includes(value)
        ? (prev[field as keyof typeof prev] as string[]).filter((item) => item !== value)
        : [...(prev[field as keyof typeof prev] as string[]), value],
    }))
  }

  const handleItineraryChange = (index: number, field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      itinerary: prev.itinerary.map((item, i) => (i === index ? { ...item, [field]: value } : item)),
    }))
  }

  const addItineraryItem = () => {
    setFormData((prev) => ({
      ...prev,
      itinerary: [...prev.itinerary, { time: "", activity: "", description: "" }],
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
        return !!(formData.categories.length > 0 && formData.difficultyLevel)
      case 3:
        return !!(formData.description && formData.shortDescription)
      case 4:
        return !!(formData.durationHours > 0 && formData.pricePerPerson > 0)
      case 5:
        return true // Optional step
      case 6:
        return true // Review step
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
    if (!userProfile?.id) {
      setError("User profile not found. Please log in again.")
      return
    }

    setLoading(true)
    setError("")

    try {
      const experienceData = {
        host_id: userProfile.id,
        title: formData.title,
        description: formData.description,
        short_description: formData.shortDescription,
        location: formData.location,
        specific_location: formData.specificLocation || undefined,
        country: formData.country || "Portugal",
        activity_type: formData.activityType,
        category: formData.categories,
        duration_hours: formData.durationHours,
        max_guests: formData.maxGuests,
        min_guests: formData.minGuests,
        price_per_person: formData.pricePerPerson,
        difficulty_level: formData.difficultyLevel,
        included_amenities: formData.includedAmenities,
        what_to_bring: formData.whatToBring,
        min_age: formData.minAge,
        max_age: formData.maxAge,
        age_restriction_details: formData.ageRestrictionDetails || undefined,
        activity_specific_details: {},
        tags: formData.tags,
        seasonal_availability: formData.seasonalAvailability,
        itinerary: formData.itinerary.filter((item) => item.activity.trim() !== ""),
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
                placeholder="e.g., Dolphin Watching Boat Tour"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="location">Location *</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => handleInputChange("location", e.target.value)}
                placeholder="e.g., Lagos, Algarve"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="specificLocation">Specific Location</Label>
              <Input
                id="specificLocation"
                value={formData.specificLocation}
                onChange={(e) => handleInputChange("specificLocation", e.target.value)}
                placeholder="e.g., Marina de Lagos, Dock 15"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                value={formData.country}
                onChange={(e) => handleInputChange("country", e.target.value)}
                placeholder="Portugal"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="activityType">Activity Type *</Label>
              <Select value={formData.activityType} onValueChange={(value) => handleInputChange("activityType", value)}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select activity type" />
                </SelectTrigger>
                <SelectContent>
                  {ACTIVITY_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <Label>Categories * (Select all that apply)</Label>
              <div className="grid grid-cols-2 gap-3 mt-2">
                {CATEGORIES.map((category) => (
                  <div key={category} className="flex items-center space-x-2">
                    <Checkbox
                      id={category}
                      checked={formData.categories.includes(category)}
                      onCheckedChange={() => handleArrayToggle("categories", category)}
                    />
                    <Label htmlFor={category} className="text-sm">
                      {category}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label>Difficulty Level *</Label>
              <RadioGroup
                value={formData.difficultyLevel}
                onValueChange={(value) => handleInputChange("difficultyLevel", value)}
                className="mt-2"
              >
                {DIFFICULTY_LEVELS.map((level) => (
                  <div key={level.value} className="flex items-center space-x-2">
                    <RadioGroupItem value={level.value} id={level.value} />
                    <Label htmlFor={level.value} className="text-sm">
                      {level.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <Label htmlFor="shortDescription">Short Description * (Max 150 characters)</Label>
              <Input
                id="shortDescription"
                value={formData.shortDescription}
                onChange={(e) => handleInputChange("shortDescription", e.target.value)}
                placeholder="Brief description for search results"
                maxLength={150}
                className="mt-1"
              />
              <p className="text-sm text-gray-500 mt-1">{formData.shortDescription.length}/150</p>
            </div>

            <div>
              <Label htmlFor="description">Full Description *</Label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                placeholder="Detailed description of your experience..."
                rows={6}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <Label htmlFor="tags">Tags (comma-separated)</Label>
              <Input
                id="tags"
                value={formData.tags.join(", ")}
                onChange={(e) =>
                  handleInputChange(
                    "tags",
                    e.target.value
                      .split(",")
                      .map((tag) => tag.trim())
                      .filter(Boolean),
                  )
                }
                placeholder="e.g., dolphins, boat tour, family-friendly"
                className="mt-1"
              />
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            <div>
              <Label>Duration: {formData.durationHours} hours</Label>
              <Slider
                value={[formData.durationHours]}
                onValueChange={(value) => handleInputChange("durationHours", value[0])}
                max={12}
                min={0.5}
                step={0.5}
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="pricePerPerson">Price per Person (€)</Label>
              <Input
                id="pricePerPerson"
                type="number"
                value={formData.pricePerPerson}
                onChange={(e) => handleInputChange("pricePerPerson", Number(e.target.value))}
                min={1}
                className="mt-1"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="minGuests">Minimum Guests</Label>
                <Input
                  id="minGuests"
                  type="number"
                  value={formData.minGuests}
                  onChange={(e) => handleInputChange("minGuests", Number(e.target.value))}
                  min={1}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="maxGuests">Maximum Guests</Label>
                <Input
                  id="maxGuests"
                  type="number"
                  value={formData.maxGuests}
                  onChange={(e) => handleInputChange("maxGuests", Number(e.target.value))}
                  min={1}
                  className="mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="minAge">Minimum Age</Label>
                <Input
                  id="minAge"
                  type="number"
                  value={formData.minAge || ""}
                  onChange={(e) => handleInputChange("minAge", e.target.value ? Number(e.target.value) : undefined)}
                  min={0}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="maxAge">Maximum Age</Label>
                <Input
                  id="maxAge"
                  type="number"
                  value={formData.maxAge || ""}
                  onChange={(e) => handleInputChange("maxAge", e.target.value ? Number(e.target.value) : undefined)}
                  min={0}
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="ageRestrictionDetails">Age Restriction Details</Label>
              <Input
                id="ageRestrictionDetails"
                value={formData.ageRestrictionDetails}
                onChange={(e) => handleInputChange("ageRestrictionDetails", e.target.value)}
                placeholder="e.g., Children under 12 must be accompanied by an adult"
                className="mt-1"
              />
            </div>
          </div>
        )

      case 5:
        return (
          <div className="space-y-6">
            <div>
              <Label>Included Amenities</Label>
              <div className="grid grid-cols-2 gap-3 mt-2">
                {AMENITIES.map((amenity) => (
                  <div key={amenity} className="flex items-center space-x-2">
                    <Checkbox
                      id={amenity}
                      checked={formData.includedAmenities.includes(amenity)}
                      onCheckedChange={() => handleArrayToggle("includedAmenities", amenity)}
                    />
                    <Label htmlFor={amenity} className="text-sm">
                      {amenity}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label>What to Bring</Label>
              <div className="grid grid-cols-2 gap-3 mt-2">
                {WHAT_TO_BRING.map((item) => (
                  <div key={item} className="flex items-center space-x-2">
                    <Checkbox
                      id={item}
                      checked={formData.whatToBring.includes(item)}
                      onCheckedChange={() => handleArrayToggle("whatToBring", item)}
                    />
                    <Label htmlFor={item} className="text-sm">
                      {item}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label>Seasonal Availability</Label>
              <div className="grid grid-cols-3 gap-3 mt-2">
                {SEASONAL_AVAILABILITY.map((season) => (
                  <div key={season} className="flex items-center space-x-2">
                    <Checkbox
                      id={season}
                      checked={formData.seasonalAvailability.includes(season)}
                      onCheckedChange={() => handleArrayToggle("seasonalAvailability", season)}
                    />
                    <Label htmlFor={season} className="text-sm">
                      {season}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label>Itinerary</Label>
              <div className="space-y-4 mt-2">
                {formData.itinerary.map((item, index) => (
                  <div key={index} className="grid grid-cols-12 gap-2 items-end">
                    <div className="col-span-2">
                      <Input
                        placeholder="Time"
                        value={item.time}
                        onChange={(e) => handleItineraryChange(index, "time", e.target.value)}
                      />
                    </div>
                    <div className="col-span-3">
                      <Input
                        placeholder="Activity"
                        value={item.activity}
                        onChange={(e) => handleItineraryChange(index, "activity", e.target.value)}
                      />
                    </div>
                    <div className="col-span-6">
                      <Input
                        placeholder="Description"
                        value={item.description}
                        onChange={(e) => handleItineraryChange(index, "description", e.target.value)}
                      />
                    </div>
                    <div className="col-span-1">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeItineraryItem(index)}
                        disabled={formData.itinerary.length === 1}
                      >
                        ×
                      </Button>
                    </div>
                  </div>
                ))}
                <Button type="button" variant="outline" onClick={addItineraryItem}>
                  Add Itinerary Item
                </Button>
              </div>
            </div>
          </div>
        )

      case 6:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Review Your Experience</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-2">Basic Information</h4>
                <p>
                  <strong>Title:</strong> {formData.title}
                </p>
                <p>
                  <strong>Location:</strong> {formData.location}
                </p>
                <p>
                  <strong>Activity Type:</strong> {formData.activityType}
                </p>
                <p>
                  <strong>Categories:</strong> {formData.categories.join(", ")}
                </p>
                <p>
                  <strong>Difficulty:</strong> {formData.difficultyLevel}
                </p>
              </div>

              <div>
                <h4 className="font-medium mb-2">Pricing & Capacity</h4>
                <p>
                  <strong>Duration:</strong> {formData.durationHours} hours
                </p>
                <p>
                  <strong>Price:</strong> €{formData.pricePerPerson} per person
                </p>
                <p>
                  <strong>Capacity:</strong> {formData.minGuests}-{formData.maxGuests} guests
                </p>
                {(formData.minAge || formData.maxAge) && (
                  <p>
                    <strong>Age Range:</strong> {formData.minAge || "No min"} - {formData.maxAge || "No max"}
                  </p>
                )}
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-2">Description</h4>
              <p className="text-sm text-gray-600">{formData.description}</p>
            </div>

            {formData.includedAmenities.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Included Amenities</h4>
                <p className="text-sm">{formData.includedAmenities.join(", ")}</p>
              </div>
            )}

            {formData.whatToBring.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">What to Bring</h4>
                <p className="text-sm">{formData.whatToBring.join(", ")}</p>
              </div>
            )}
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Create New Experience</h1>
        <p className="text-gray-600">
          Step {currentStep} of {totalSteps}
        </p>
        <Progress value={progress} className="mt-2" />
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>
            {currentStep === 1 && "Basic Information"}
            {currentStep === 2 && "Categories & Difficulty"}
            {currentStep === 3 && "Description & Details"}
            {currentStep === 4 && "Pricing & Capacity"}
            {currentStep === 5 && "Amenities & Itinerary"}
            {currentStep === 6 && "Review & Submit"}
          </CardTitle>
        </CardHeader>
        <CardContent>{renderStep()}</CardContent>
      </Card>

      <div className="flex justify-between mt-6">
        <Button variant="outline" onClick={prevStep} disabled={currentStep === 1}>
          Previous
        </Button>

        {currentStep < totalSteps ? (
          <Button onClick={nextStep}>Next</Button>
        ) : (
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Creating Experience..." : "Create Experience"}
          </Button>
        )}
      </div>
    </div>
  )
}
