"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Mail, Lock, Eye, EyeOff, Loader2, AlertCircle, CheckCircle, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { signInUser } from "@/lib/auth-client" // Corrected import

interface LoginFormProps {
  userType: string
  onSuccess?: (user: any) => void
}

export function LoginForm({ userType, onSuccess }: LoginFormProps) {
  const [formData, setFormData] = useState({ email: "", password: "" })
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [loginAttempts, setLoginAttempts] = useState(0)

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.email) {
      newErrors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email"
    }

    if (!formData.password) {
      newErrors.password = "Password is required"
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    setIsLoading(true)
    setErrors({})

    try {
      const result = await signInUser(formData.email, formData.password) // Use signInUser

      if (result.user) {
        onSuccess?.(result.user)
      } else {
        setErrors({ general: "Login failed: No user data returned." })
        setLoginAttempts((prev) => prev + 1)
        setFormData({ ...formData, password: "" })
      }
    } catch (error: any) {
      setErrors({ general: error.message || "Login failed due to network or server error." })
      setLoginAttempts((prev) => prev + 1)
      setFormData({ ...formData, password: "" })
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value })
    if (errors[field]) {
      setErrors({ ...errors, [field]: "" })
    }
  }

  const getTestCredentials = () => {
    switch (userType) {
      case "customer":
        return { email: "customer@seafable.com", label: "Customer Test Account" }
      case "host":
        return { email: "host@seafable.com", label: "Host Test Account" }
      case "business":
        return { email: "business@seafable.com", label: "Business Test Account" }
      default:
        return { email: "customer@seafable.com", label: "Test Account" }
    }
  }

  const testCreds = getTestCredentials()

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email Address</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            id="email"
            type="email"
            placeholder="your@email.com"
            value={formData.email}
            onChange={(e) => handleInputChange("email", e.target.value)}
            className={`pl-10 ${errors.email ? "border-red-500" : ""}`}
            disabled={isLoading}
          />
          {formData.email && !errors.email && <CheckCircle className="absolute right-3 top-3 h-4 w-4 text-green-500" />}
        </div>
        {errors.email && (
          <p className="text-sm text-red-600 flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            {errors.email}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password"
            value={formData.password}
            onChange={(e) => handleInputChange("password", e.target.value)}
            className={`pl-10 pr-10 ${errors.password ? "border-red-500" : ""}`}
            disabled={isLoading}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
            disabled={isLoading}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {errors.password && (
          <p className="text-sm text-red-600 flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            {errors.password}
          </p>
        )}
      </div>

      {errors.general && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{errors.general}</AlertDescription>
        </Alert>
      )}

      {loginAttempts >= 3 && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Multiple failed attempts. Please double-check your credentials or{" "}
            <Link href="/forgot-password" className="underline">
              reset your password
            </Link>
            .
          </AlertDescription>
        </Alert>
      )}

      <Button type="submit" className="w-full" disabled={isLoading || !formData.email || !formData.password}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Signing in...
          </>
        ) : (
          <>
            Sign In
            <ArrowRight className="ml-2 h-4 w-4" />
          </>
        )}
      </Button>

      {/* Test Credentials Helper */}
      <div className="mt-4 p-3 bg-blue-50 rounded-md border">
        <p className="text-sm text-blue-800 font-medium">🧪 {testCreds.label}:</p>
        <p className="text-sm text-blue-700">Email: {testCreds.email}</p>
        <p className="text-sm text-blue-700">Password: password123</p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-2 w-full"
          onClick={() => {
            setFormData({ email: testCreds.email, password: "password123" })
            setErrors({})
          }}
        >
          Fill Test Credentials
        </Button>
      </div>
    </form>
  )
}
