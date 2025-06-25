"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { BusinessLayout } from "@/components/layouts/BusinessLayout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { useAuth } from "@/lib/auth-context"
import { createExperience } from "@/lib/supabase-business"
import { Loader2, PlusCircle, XCircle, Save } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"

const itineraryItemSchema = z.object({
  time: z.string().min(1, "Time is required."),
  activity: z.string().min(1, "Activity is required."),
})

const availabilitySlotSchema = z.object({
  date: z.string().min(1, "Date is required."),
  startTime: z.string().min(1, "Start time is required."),
  endTime: z.string().min(1, "End time is required."),
  availableCapacity: z.coerce.number().min(1, "Capacity must be at least 1."),
  priceOverride: z.coerce.number().min(0, "Price override cannot be negative.").optional().nullable(),
  notes: z.string().optional(),
  weatherDependent: z.boolean().default(false),
  isRecurring: z.boolean().default(false),
  recurringPattern: z.string().optional(),
})

const experienceSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters.").max(100, "Title cannot exceed 100 characters."),
  description: z.string().min(20, "Description must be at least 20 characters."),
  short_description: z.string().max(250, "Short description cannot exceed 250 characters.").optional(),
  location: z.string().min(3, "Location is required."),
  specific_location: z.string().optional(),
  country: z.string().optional(),
  activity_type: z.string().min(1, "Activity type is required."),
  category: z.array(z.string()).min(1, "At least one category is required."),
  duration_hours: z.coerce.number().min(0.5, "Duration must be at least 0.5 hours."),
  duration_display: z.string().optional(),
  max_guests: z.coerce.number().min(1, "Maximum guests must be at least 1."),
  min_guests: z.coerce.number().min(1, "Minimum guests must be at least 1."),
  price_per_person: z.coerce.number().min(0, "Price cannot be negative."),
  difficulty_level: z.string().min(1, "Difficulty level is required."),
  primary_image_url: z.string().url("Must be a valid URL.").optional().or(z.literal("")),
  weather_contingency: z.string().optional(),
  included_amenities: z.array(z.string()).optional(),
  what_to_bring: z.array(z.string()).optional(),
  min_age: z.coerce.number().min(0, "Minimum age cannot be negative.").optional().nullable(),
  max_age: z.coerce.number().min(0, "Maximum age cannot be negative.").optional().nullable(),
  age_restriction_details: z.string().optional(),
  activity_specific_details: z.any().optional(), // Consider a more specific schema if structure is known
  tags: z.array(z.string()).optional(),
  seasonal_availability: z.array(z.string()).optional(),
  is_active: z.boolean().default(true),
  itinerary: z.array(itineraryItemSchema).optional(),
  availability: z.array(availabilitySlotSchema).optional(),
})

type ExperienceFormValues = z.infer<typeof experienceSchema>

export default function NewExperiencePage() {
  const { user, businessProfile, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const form = useForm<ExperienceFormValues>({
    resolver: zodResolver(experienceSchema),
    defaultValues: {
      title: "",
      description: "",
      short_description: "",
      location: "",
      activity_type: "",
      category: [],
      duration_hours: 1,
      max_guests: 1,
      min_guests: 1,
      price_per_person: 0,
      difficulty_level: "",
      primary_image_url: "",
      included_amenities: [],
      what_to_bring: [],
      tags: [],
      seasonal_availability: [],
      is_active: true,
      itinerary: [],
      availability: [],
      min_age: null, // Explicitly set to null for number fields that can be empty
      max_age: null, // Explicitly set to null for number fields that can be empty
    },
  })

  const {
    fields: itineraryFields,
    append: appendItinerary,
    remove: removeItinerary,
  } = useFieldArray({
    control: form.control,
    name: "itinerary",
  })

  const {
    fields: availabilityFields,
    append: appendAvailability,
    remove: removeAvailability,
  } = useFieldArray({
    control: form.control,
    name: "availability",
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!authLoading && !user) {
      toast({
        title: "Authentication Required",
        description: "You must be logged in to create a new experience.",
        variant: "destructive",
      })
      router.push("/business/login")
    } else if (!authLoading && user && !businessProfile) {
      toast({
        title: "Business Profile Required",
        description: "Please complete your business profile before creating experiences.",
        variant: "destructive",
      })
      router.push("/business/onboarding") // Redirect to onboarding if business profile is missing
    }
  }, [authLoading, user, businessProfile, router, toast])

  const onSubmit = async (values: ExperienceFormValues) => {
    if (!businessProfile?.id) {
      toast({
        title: "Error",
        description: "Business profile not found. Cannot create experience.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    try {
      const newExperience = await createExperience({
        host_id: businessProfile.id,
        ...values,
        // Ensure arrays are not undefined if optional
        category: values.category || [],
        included_amenities: values.included_amenities || [],
        what_to_bring: values.what_to_bring || [],
        tags: values.tags || [],
        seasonal_availability: values.seasonal_availability || [],
        itinerary: values.itinerary || [],
        // Ensure nullable number fields are correctly passed as null if empty string
        min_age: values.min_age === null ? null : values.min_age,
        max_age: values.max_age === null ? null : values.max_age,
      })

      // If availability is provided, set it for the new experience
      if (values.availability && values.availability.length > 0) {
        // This would typically be a separate API call to set host_availability
        // For now, we'll just log it or handle it as part of the experience creation if the schema supports it.
        // In a real app, you'd call setHostAvailability here, linking it to the new experience ID.
        console.log("Availability to set:", values.availability)
      }

      toast({
        title: "Success",
        description: `Experience "${newExperience.title}" created successfully!`,
        variant: "default",
      })
      router.push(`/business/experiences`) // Redirect to experiences list
    } catch (error: any) {
      console.error("Error creating experience:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to create experience.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (authLoading || (!user && !authLoading) || (!businessProfile && user && !authLoading)) {
    return (
      <BusinessLayout>
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
          <span className="ml-2 text-gray-500">Loading...</span>
        </div>
      </BusinessLayout>
    )
  }

  return (
    <BusinessLayout>
      <div>
        <h1 className="text-3xl font-bold mb-6">Create New Experience</h1>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>Details about your experience.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Sunset Kayaking Tour" {...field} value={String(field.value || "")} />
                      </FormControl>
                      <FormDescription>A catchy and descriptive title for your experience.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="short_description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Short Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="A brief summary of the experience..."
                          {...field}
                          value={String(field.value || "")}
                        />
                      </FormControl>
                      <FormDescription>A concise summary (max 250 characters).</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Provide a detailed description of what participants will do, see, and experience."
                          className="min-h-[120px]"
                          {...field}
                          value={String(field.value || "")}
                        />
                      </FormControl>
                      <FormDescription>A comprehensive overview of your experience.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>General Location</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Miami, Florida" {...field} value={String(field.value || "")} />
                        </FormControl>
                        <FormDescription>City, State/Region where the experience takes place.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="specific_location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Specific Meeting Point</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., South Beach Marina" {...field} value={String(field.value || "")} />
                        </FormControl>
                        <FormDescription>Exact address or meeting instructions.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="activity_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Activity Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select an activity type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="water_sport">Water Sport</SelectItem>
                            <SelectItem value="land_adventure">Land Adventure</SelectItem>
                            <SelectItem value="cultural">Cultural</SelectItem>
                            <SelectItem value="food_tour">Food Tour</SelectItem>
                            <SelectItem value="wildlife">Wildlife</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>The primary type of activity.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="difficulty_level"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Difficulty Level</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select difficulty" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="easy">Easy</SelectItem>
                            <SelectItem value="moderate">Moderate</SelectItem>
                            <SelectItem value="challenging">Challenging</SelectItem>
                            <SelectItem value="expert">Expert</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>How challenging is this experience?</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="category"
                  render={() => (
                    <FormItem>
                      <FormLabel>Categories</FormLabel>
                      <div className="flex flex-wrap gap-2">
                        {["Kayaking", "Snorkeling", "Diving", "Fishing", "Hiking", "City Tour", "Cooking Class"].map(
                          (category) => (
                            <FormField
                              key={category}
                              control={form.control}
                              name="category"
                              render={({ field }) => {
                                return (
                                  <FormItem key={category} className="flex flex-row items-start space-x-2 space-y-0">
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value?.includes(category)}
                                        onCheckedChange={(checked) => {
                                          return checked
                                            ? field.onChange([...field.value, category])
                                            : field.onChange(field.value?.filter((value) => value !== category))
                                        }}
                                      />
                                    </FormControl>
                                    <FormLabel className="font-normal">{category}</FormLabel>
                                  </FormItem>
                                )
                              }}
                            />
                          ),
                        )}
                      </div>
                      <FormDescription>Select all relevant categories for your experience.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Pricing & Capacity</CardTitle>
                <CardDescription>Set the price and guest limits.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="price_per_person"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price per Person (€)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="0.00"
                            {...field}
                            value={field.value == null ? "" : String(field.value)} // Ensure value is always a string
                            onChange={(e) =>
                              field.onChange(e.target.value === "" ? null : Number.parseFloat(e.target.value))
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="min_guests"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Minimum Guests</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="1"
                            {...field}
                            value={field.value == null ? "" : String(field.value)} // Ensure value is always a string
                            onChange={(e) =>
                              field.onChange(e.target.value === "" ? null : Number.parseInt(e.target.value))
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="max_guests"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Maximum Guests</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="10"
                            {...field}
                            value={field.value == null ? "" : String(field.value)} // Ensure value is always a string
                            onChange={(e) =>
                              field.onChange(e.target.value === "" ? null : Number.parseInt(e.target.value))
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="duration_hours"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duration (Hours)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.5"
                          placeholder="1.0"
                          {...field}
                          value={field.value == null ? "" : String(field.value)} // Ensure value is always a string
                          onChange={(e) =>
                            field.onChange(e.target.value === "" ? null : Number.parseFloat(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormDescription>How long does the experience last?</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="duration_display"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duration Display Text (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., 3-4 hours, Full day" {...field} value={String(field.value || "")} />
                      </FormControl>
                      <FormDescription>Custom text for displaying duration on your listing.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Itinerary</CardTitle>
                <CardDescription>Outline the schedule of activities for your experience.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {itineraryFields.map((item, index) => (
                  <div key={item.id} className="flex items-end gap-4">
                    <FormField
                      control={form.control}
                      name={`itinerary.${index}.time`}
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormLabel>Time</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., 9:00 AM" {...field} value={String(field.value || "")} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`itinerary.${index}.activity`}
                      render={({ field }) => (
                        <FormItem className="flex-2">
                          <FormLabel>Activity</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g., Meet at marina, Kayak to island"
                              {...field}
                              value={String(field.value || "")}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="button" variant="destructive" size="icon" onClick={() => removeItinerary(index)}>
                      <XCircle className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button type="button" variant="outline" onClick={() => appendItinerary({ time: "", activity: "" })}>
                  <PlusCircle className="mr-2 h-4 w-4" /> Add Itinerary Item
                </Button>
                <FormField
                  control={form.control}
                  name="itinerary"
                  render={() => (
                    <FormItem>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Availability & Capacity Slots</CardTitle>
                <CardDescription>Define specific dates, times, and capacities for your experience.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {availabilityFields.map((item, index) => (
                  <div key={item.id} className="border p-4 rounded-md space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name={`availability.${index}.date`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Date</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} value={String(field.value || "")} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`availability.${index}.startTime`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Start Time</FormLabel>
                            <FormControl>
                              <Input type="time" {...field} value={String(field.value || "")} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`availability.${index}.endTime`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>End Time</FormLabel>
                            <FormControl>
                              <Input type="time" {...field} value={String(field.value || "")} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name={`availability.${index}.availableCapacity`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Available Capacity</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="10"
                                {...field}
                                value={field.value == null ? "" : String(field.value)} // Ensure value is always a string
                                onChange={(e) =>
                                  field.onChange(e.target.value === "" ? null : Number.parseInt(e.target.value))
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`availability.${index}.priceOverride`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Price Override (€)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="Optional"
                                {...field}
                                value={field.value == null ? "" : String(field.value)} // Ensure value is always a string
                                onChange={(e) =>
                                  field.onChange(e.target.value === "" ? null : Number.parseFloat(e.target.value))
                                }
                              />
                            </FormControl>
                            <FormDescription>Override default price for this slot.</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={form.control}
                      name={`availability.${index}.notes`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Notes (Optional)</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Any specific notes for this slot..."
                              {...field}
                              value={String(field.value || "")}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <FormField
                          control={form.control}
                          name={`availability.${index}.weatherDependent`}
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-2 space-y-0">
                              <FormControl>
                                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                              </FormControl>
                              <FormLabel className="font-normal">Weather Dependent</FormLabel>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`availability.${index}.isRecurring`}
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-2 space-y-0">
                              <FormControl>
                                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                              </FormControl>
                              <FormLabel className="font-normal">Is Recurring</FormLabel>
                            </FormItem>
                          )}
                        />
                      </div>
                      <Button type="button" variant="destructive" size="sm" onClick={() => removeAvailability(index)}>
                        Remove Slot
                      </Button>
                    </div>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    appendAvailability({
                      date: "",
                      startTime: "",
                      endTime: "",
                      availableCapacity: 1,
                      weatherDependent: false,
                      isRecurring: false,
                      priceOverride: null, // Ensure default is null for optional number fields
                    })
                  }
                >
                  <PlusCircle className="mr-2 h-4 w-4" /> Add Availability Slot
                </Button>
                <FormField
                  control={form.control}
                  name="availability"
                  render={() => (
                    <FormItem>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Additional Details</CardTitle>
                <CardDescription>Other important information for participants.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="primary_image_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Primary Image URL</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://example.com/image.jpg"
                          {...field}
                          value={String(field.value || "")}
                        />
                      </FormControl>
                      <FormDescription>URL of the main image for your experience.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="weather_contingency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Weather Contingency</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="What happens if there's bad weather?"
                          className="min-h-[80px]"
                          {...field}
                          value={String(field.value || "")}
                        />
                      </FormControl>
                      <FormDescription>Plan for adverse weather conditions.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="included_amenities"
                  render={() => (
                    <FormItem>
                      <FormLabel>Included Amenities</FormLabel>
                      <div className="flex flex-wrap gap-2">
                        {["Equipment", "Snacks", "Drinks", "Guide", "Transportation"].map((amenity) => (
                          <FormField
                            key={amenity}
                            control={form.control}
                            name="included_amenities"
                            render={({ field }) => {
                              return (
                                <FormItem key={amenity} className="flex flex-row items-start space-x-2 space-y-0">
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(amenity)}
                                      onCheckedChange={(checked) => {
                                        return checked
                                          ? field.onChange([...field.value, amenity])
                                          : field.onChange(field.value?.filter((value) => value !== amenity))
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="font-normal">{amenity}</FormLabel>
                                </FormItem>
                              )
                            }}
                          />
                        ))}
                      </div>
                      <FormDescription>What is provided during the experience?</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="what_to_bring"
                  render={() => (
                    <FormItem>
                      <FormLabel>What to Bring</FormLabel>
                      <div className="flex flex-wrap gap-2">
                        {["Swimsuit", "Towel", "Sunscreen", "Water Bottle", "Camera", "Comfortable Shoes"].map(
                          (item) => (
                            <FormField
                              key={item}
                              control={form.control}
                              name="what_to_bring"
                              render={({ field }) => {
                                return (
                                  <FormItem key={item} className="flex flex-row items-start space-x-2 space-y-0">
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value?.includes(item)}
                                        onCheckedChange={(checked) => {
                                          return checked
                                            ? field.onChange([...field.value, item])
                                            : field.onChange(field.value?.filter((value) => value !== item))
                                        }}
                                      />
                                    </FormControl>
                                    <FormLabel className="font-normal">{item}</FormLabel>
                                  </FormItem>
                                )
                              }}
                            />
                          ),
                        )}
                      </div>
                      <FormDescription>Items participants should bring.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="min_age"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Minimum Age</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="0"
                            {...field}
                            value={field.value == null ? "" : String(field.value)} // Ensure value is always a string
                            onChange={(e) =>
                              field.onChange(e.target.value === "" ? null : Number.parseInt(e.target.value))
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="max_age"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Maximum Age</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="99"
                            {...field}
                            value={field.value == null ? "" : String(field.value)} // Ensure value is always a string
                            onChange={(e) =>
                              field.onChange(e.target.value === "" ? null : Number.parseInt(e.target.value))
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="age_restriction_details"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Age Restriction Details</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="e.g., Children under 12 must be accompanied by an adult."
                          className="min-h-[80px]"
                          {...field}
                          value={String(field.value || "")}
                        />
                      </FormControl>
                      <FormDescription>Any specific rules regarding age.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="is_active"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-2 space-y-0">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Active Experience</FormLabel>
                        <FormDescription>If checked, this experience will be visible to customers.</FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" /> Create Experience
                </>
              )}
            </Button>
          </form>
        </Form>
      </div>
    </BusinessLayout>
  )
}
