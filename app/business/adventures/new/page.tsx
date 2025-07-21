
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { BusinessLayout } from "@/components/layouts/BusinessLayout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Save } from "lucide-react"
import Link from "next/link"

export default function NewAdventurePage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    price_per_person: "",
    max_guests: "",
    activity_type: "",
    difficulty_level: "",
    duration_hours: "",
    includes: "",
    requirements: "",
    cancellation_policy: ""
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      // TODO: Implement adventure creation API call
      console.log("Creating adventure:", formData)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      router.push("/business/adventures")
    } catch (error) {
      console.error("Error creating adventure:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <BusinessLayout>
      <div className="space-y-6 max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/business/adventures">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Adventures
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Create New Adventure</h1>
            <p className="text-gray-600 mt-1">Add a new adventure to your offerings</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Adventure Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    placeholder="e.g. Sunset Sailing Adventure"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="location">Location *</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => handleInputChange("location", e.target.value)}
                    placeholder="e.g. Miami Beach, FL"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  placeholder="Describe your adventure in detail..."
                  rows={4}
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* Adventure Details */}
          <Card>
            <CardHeader>
              <CardTitle>Adventure Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="activity_type">Activity Type *</Label>
                  <Select value={formData.activity_type} onValueChange={(value) => handleInputChange("activity_type", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select activity type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sailing">Sailing</SelectItem>
                      <SelectItem value="fishing">Fishing</SelectItem>
                      <SelectItem value="diving">Diving</SelectItem>
                      <SelectItem value="snorkeling">Snorkeling</SelectItem>
                      <SelectItem value="boat_tour">Boat Tour</SelectItem>
                      <SelectItem value="water_sports">Water Sports</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="difficulty_level">Difficulty Level *</Label>
                  <Select value={formData.difficulty_level} onValueChange={(value) => handleInputChange("difficulty_level", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                      <SelectItem value="expert">Expert</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="duration_hours">Duration (hours) *</Label>
                  <Input
                    id="duration_hours"
                    type="number"
                    value={formData.duration_hours}
                    onChange={(e) => handleInputChange("duration_hours", e.target.value)}
                    placeholder="4"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price_per_person">Price per Person ($) *</Label>
                  <Input
                    id="price_per_person"
                    type="number"
                    value={formData.price_per_person}
                    onChange={(e) => handleInputChange("price_per_person", e.target.value)}
                    placeholder="150"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="max_guests">Maximum Guests *</Label>
                  <Input
                    id="max_guests"
                    type="number"
                    value={formData.max_guests}
                    onChange={(e) => handleInputChange("max_guests", e.target.value)}
                    placeholder="8"
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Additional Information */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="includes">What's Included</Label>
                <Textarea
                  id="includes"
                  value={formData.includes}
                  onChange={(e) => handleInputChange("includes", e.target.value)}
                  placeholder="Equipment, refreshments, instructor..."
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="requirements">Requirements</Label>
                <Textarea
                  id="requirements"
                  value={formData.requirements}
                  onChange={(e) => handleInputChange("requirements", e.target.value)}
                  placeholder="Swimming ability, age restrictions, fitness level..."
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="cancellation_policy">Cancellation Policy</Label>
                <Textarea
                  id="cancellation_policy"
                  value={formData.cancellation_policy}
                  onChange={(e) => handleInputChange("cancellation_policy", e.target.value)}
                  placeholder="Free cancellation up to 24 hours before..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end gap-4">
            <Button variant="outline" type="button" asChild>
              <Link href="/business/adventures">Cancel</Link>
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Create Adventure
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </BusinessLayout>
  )
}
