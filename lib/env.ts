import { z } from "zod"

const envSchema = z.object({
  // Supabase
  NEXT_PUBLIC_SUPABASE_URL: z.string().url("Invalid Supabase URL"),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, "Supabase anon key is required"),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, "Supabase service role key is required"),

  // Database
  POSTGRES_URL: z.string().url("Invalid Postgres URL"),
  POSTGRES_PRISMA_URL: z.string().url("Invalid Postgres Prisma URL"),
  POSTGRES_URL_NON_POOLING: z.string().url("Invalid Postgres non-pooling URL"),
  POSTGRES_USER: z.string().min(1, "Postgres user is required"),
  POSTGRES_PASSWORD: z.string().min(1, "Postgres password is required"),
  POSTGRES_DATABASE: z.string().min(1, "Postgres database is required"),
  POSTGRES_HOST: z.string().min(1, "Postgres host is required"),

  // Authentication
  NEXTAUTH_SECRET: z.string().min(32, "NextAuth secret must be at least 32 characters"),
  JWT_SECRET: z.string().min(32, "JWT secret must be at least 32 characters"),
  JWT_REFRESH_SECRET: z.string().min(32, "JWT refresh secret must be at least 32 characters"),

  // Application
  NEXT_PUBLIC_APP_URL: z.string().url("Invalid app URL"),

  // Optional
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default("info"),
})

export type Env = z.infer<typeof envSchema>

function validateEnv(): Env {
  try {
    return envSchema.parse(process.env)
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.errors.map((err) => `${err.path.join(".")}: ${err.message}`)
      throw new Error(`Environment validation failed:\n${errorMessages.join("\n")}`)
    }
    throw error
  }
}

export const env = validateEnv()
