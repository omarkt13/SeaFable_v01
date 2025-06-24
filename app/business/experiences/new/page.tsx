"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { format } from "date-fns"
import { CalendarIcon, PlusIcon, TrashIcon, Loader2 } from "lucide-react"

import { BusinessLayout } from "@/components/layouts/BusinessLayout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"

const itineraryItemSchema = z.object({
  title: z.string().min(1, "Itinerary item title is required"),
  description: z.string().min(1, "Itinerary item description is required"),
})

const availabilitySlotSchema = z.object({
  available_date: z.date({ required_error: "Date is required" }),
  start_time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid start time format (HH:MM)"),
  end_time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid end time format (HH:MM)"),
  capacity: z.coerce.number().min(1, "Capacity must be at least 1"),
  price_override: z.coerce.number().nullable().optional(),
})

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  location: z.string().min(1, "Location is required"),
  price: z.coerce.number().min(0, "Price must be non-negative"),
  duration: z.coerce.number().min(1, "Duration must be at least 1 minute"),
  itinerary: z.array(itineraryItemSchema).min(1, "At least one itinerary item is required"),
  availability: z.array(availabilitySlotSchema).min(1, "At least one availability slot is required"),
})

type ExperienceFormValues = z.infer<typeof formSchema>

export default function NewExperiencePage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<ExperienceFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      location: "",
      price: 0,
      duration: 60,
      itinerary: [{ title: "", description: "" }],
      availability: [
        { available_date: new Date(), start_time: "09:00", end_time: "10:00", capacity: 1, price_override: null },
      ],
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

  async function onSubmit(values: ExperienceFormValues) {
    setIsSubmitting(true)
    try {
      // 1. Create the experience
      const experienceResponse = await fetch("/api/business/experiences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: values.title,
          description: values.description,
          location: values.location,
          price: values.price,
          duration: values.duration,
          itinerary: values.itinerary,
        }),
      })

      if (!experienceResponse.ok) {
        const errorData = await experienceResponse.json()
        throw new Error(errorData.error || "Failed to create experience")
      }

      const { experienceId } = await experienceResponse.json()

      // 2. Set availability for the new experience
      const formattedAvailability = values.availability.map((slot) => ({
        experience_id: experienceId,
        available_date: format(slot.available_date, "yyyy-MM-dd"),
        start_time: slot.start_time,
        end_time: slot.end_time,
        capacity: slot.capacity,
        price_override: slot.price_override,
      }))

      const availabilityResponse = await fetch("/api/business/availability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ availabilitySlots: formattedAvailability }),
      })

      if (!availabilityResponse.ok) {
        const errorData = await availabilityResponse.json()
        throw new Error(errorData.error || "Failed to set availability")
      }

      toast({
        title: "Experience Created!",
        description: "Your new experience and its availability have been successfully added.",
        variant: "default",
      })
      router.push("/business/experiences") // Redirect to experiences list
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <BusinessLayout>
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-6">Create New Experience</h1>
        <Card>
          <CardHeader>
            <CardTitle>Experience Details</CardTitle>
            <CardDescription>Fill in the details for your new experience listing.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Sunset Kayaking Tour" {...field} />
                        </FormControl>
                        <FormDescription>A catchy title for your experience.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Location</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Miami Beach" {...field} />
                        </FormControl>
                        <FormDescription>Where does this experience take place?</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe your experience in detail..."
                            className="min-h-[100px]"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>Provide a comprehensive description for your customers.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Base Price ($)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="e.g., 50.00" {...field} />
                        </FormControl>
                        <FormDescription>The base price per person for this experience.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="duration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Duration (minutes)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="e.g., 60" {...field} />
                        </FormControl>
                        <FormDescription>How long does the experience last?</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Itinerary Builder */}
                <Card className="mt-8">
                  <CardHeader>
                    <CardTitle>Itinerary</CardTitle>
                    <CardDescription>Outline the steps or activities involved in your experience.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {itineraryFields.map((field, index) => (
                      <div key={field.id} className="flex items-end gap-4 border p-4 rounded-md">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-grow">
                          <FormField
                            control={form.control}
                            name={`itinerary.${index}.title`}
                            render={({ field: itemField }) => (
                              <FormItem>
                                <FormLabel>Step {index + 1} Title</FormLabel>
                                <FormControl>
                                  <Input placeholder="e.g., Meet & Greet" {...itemField} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`itinerary.${index}.description`}
                            render={({ field: itemField }) => (
                              <FormItem className="md:col-span-2">
                                <FormLabel>Step {index + 1} Description</FormLabel>
                                <FormControl>
                                  <Textarea placeholder="What happens during this step?" {...itemField} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          onClick={() => removeItinerary(index)}
                          disabled={itineraryFields.length === 1}
                        >
                          <TrashIcon className="h-4 w-4" />
                          <span className="sr-only">Remove itinerary item</span>
                        </Button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => appendItinerary({ title: "", description: "" })}
                    >
                      <PlusIcon className="mr-2 h-4 w-4" /> Add Itinerary Item
                    </Button>
                    <FormMessage>{form.formState.errors.itinerary?.message}</FormMessage>
                  </CardContent>
                </Card>

                {/* Availability Configuration */}
                <Card className="mt-8">
                  <CardHeader>
                    <CardTitle>Availability</CardTitle>
                    <CardDescription>Define the dates, times, and capacity for your experience.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {availabilityFields.map((field, index) => (
                      <div key={field.id} className="flex items-end gap-4 border p-4 rounded-md">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 flex-grow">
                          <FormField
                            control={form.control}
                            name={`availability.${index}.available_date`}
                            render={({ field: dateField }) => (
                              <FormItem className="flex flex-col">
                                <FormLabel>Date</FormLabel>
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <FormControl>
                                      <Button
                                        variant={"outline"}
                                        className={cn(
                                          "w-full pl-3 text-left font-normal",
                                          !dateField.value && "text-muted-foreground",
                                        )}
                                      >
                                        {dateField.value ? format(dateField.value, "PPP") : <span>Pick a date</span>}
                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                      </Button>
                                    </FormControl>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                      mode="single"
                                      selected={dateField.value}
                                      onSelect={dateField.onChange}
                                      disabled={(date) => date < new Date()}
                                      initialFocus
                                    />
                                  </PopoverContent>
                                </Popover>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`availability.${index}.start_time`}
                            render={({ field: timeField }) => (
                              <FormItem>
                                <FormLabel>Start Time</FormLabel>
                                <FormControl>
                                  <Input type="time" {...timeField} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`availability.${index}.end_time`}
                            render={({ field: timeField }) => (
                              <FormItem>
                                <FormLabel>End Time</FormLabel>
                                <FormControl>
                                  <Input type="time" {...timeField} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`availability.${index}.capacity`}
                            render={({ field: capacityField }) => (
                              <FormItem>
                                <FormLabel>Capacity</FormLabel>
                                <FormControl>
                                  <Input type="number" placeholder="e.g., 10" {...capacityField} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`availability.${index}.price_override`}
                            render={({ field: priceField }) => (
                              <FormItem>
                                <FormLabel>Price Override ($)</FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    placeholder="Optional"
                                    {...priceField}
                                    value={priceField.value ?? ""}
                                    onChange={(e) =>
                                      priceField.onChange(e.target.value === "" ? null : Number(e.target.value))
                                    }
                                  />
                                </FormControl>
                                <FormDescription>Leave blank for base price.</FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          onClick={() => removeAvailability(index)}
                          disabled={availabilityFields.length === 1}
                        >
                          <TrashIcon className="h-4 w-4" />
                          <span className="sr-only">Remove availability slot</span>
                        </Button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() =>
                        appendAvailability({
                          available_date: new Date(),
                          start_time: "09:00",
                          end_time: "10:00",
                          capacity: 1,
                          price_override: null,
                        })
                      }
                    >
                      <PlusIcon className="mr-2 h-4 w-4" /> Add Availability Slot
                    </Button>
                    <FormMessage>{form.formState.errors.availability?.message}</FormMessage>
                  </CardContent>
                </Card>

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating Experience...
                    </>
                  ) : (
                    "Create Experience"
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </BusinessLayout>
  )
}
