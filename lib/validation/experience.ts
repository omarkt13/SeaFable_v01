import { z } from "zod"

// Improved validation schema with better error messages
export const experienceSchema = z
  .object({
    title: z
      .string()
      .min(5, "Title must be at least 5 characters")
      .max(100, "Title cannot exceed 100 characters")
      .regex(/^[a-zA-Z0-9\s\-.,!?()]+$/, "Title contains invalid characters"),

    description: z
      .string()
      .min(20, "Description must be at least 20 characters")
      .max(2000, "Description cannot exceed 2000 characters"),

    short_description: z.string().max(250, "Short description cannot exceed 250 characters").optional(),

    location: z.string().min(3, "Location is required").max(100, "Location cannot exceed 100 characters"),

    activity_type: z.enum(["water_sport", "land_adventure", "cultural", "food_tour", "wildlife"], {
      errorMap: () => ({ message: "Please select a valid activity type" }),
    }),

    category: z.array(z.string()).min(1, "At least one category is required").max(5, "Maximum 5 categories allowed"),

    duration_hours: z
      .number()
      .min(0.5, "Duration must be at least 0.5 hours")
      .max(24, "Duration cannot exceed 24 hours"),

    max_guests: z
      .number()
      .int("Maximum guests must be a whole number")
      .min(1, "Maximum guests must be at least 1")
      .max(100, "Maximum guests cannot exceed 100"),

    min_guests: z.number().int("Minimum guests must be a whole number").min(1, "Minimum guests must be at least 1"),

    price_per_person: z.number().min(0, "Price cannot be negative").max(10000, "Price cannot exceed €10,000"),

    difficulty_level: z.enum(["easy", "moderate", "challenging", "expert"], {
      errorMap: () => ({ message: "Please select a valid difficulty level" }),
    }),

    primary_image_url: z.string().url("Must be a valid URL").optional().or(z.literal("")),

    min_age: z
      .number()
      .int("Age must be a whole number")
      .min(0, "Age cannot be negative")
      .max(120, "Age cannot exceed 120")
      .nullable()
      .optional(),

    max_age: z
      .number()
      .int("Age must be a whole number")
      .min(0, "Age cannot be negative")
      .max(120, "Age cannot exceed 120")
      .nullable()
      .optional(),

    // Additional fields...
    included_amenities: z.array(z.string()).optional(),
    what_to_bring: z.array(z.string()).optional(),
    tags: z.array(z.string()).optional(),
    seasonal_availability: z.array(z.string()).optional(),
    is_active: z.boolean().default(true),
  })
  .refine((data) => data.min_guests <= data.max_guests, {
    message: "Minimum guests cannot exceed maximum guests",
    path: ["min_guests"],
  })
  .refine((data) => !data.min_age || !data.max_age || data.min_age <= data.max_age, {
    message: "Minimum age cannot exceed maximum age",
    path: ["min_age"],
  })

export type ExperienceFormValues = z.infer<typeof experienceSchema>
