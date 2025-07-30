"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { createClient } from '@/lib/supabase/client'

export function CustomerRegisterForm() {
  const [step, setStep] = useState<'register' | 'confirm'>('register')
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [confirmationCode, setConfirmationCode] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setError("")
  }

  const validateForm = () => {
    if (!formData.firstName.trim()) {
      setError("First name is required")
      return false
    }
    if (!formData.lastName.trim()) {
      setError("Last name is required")
      return false
    }
    if (!formData.email.trim()) {
      setError("Email is required")
      return false
    }
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setError("Please enter a valid email address")
      return false
    }
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long")
      return false
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      return false
    }
    return true
  }

  const createUserProfile = async (user: any) => {
    const supabase = createClient()
    const { error: profileError } = await supabase.from("user_profiles").insert([
      {
        id: user.id,
        email: user.email,
        first_name: formData.firstName,
        last_name: formData.lastName,
        user_type: "customer",
      },
    ])

    if (profileError) {
      console.error("Error creating user profile:", profileError)
      setError("Account created but profile setup failed. Please contact support.")
      return false
    }
    return true
  }

  const handleConfirmation = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const supabase = createClient()
      const { data, error } = await supabase.auth.verifyOtp({
        email: formData.email,
        token: confirmationCode,
        type: 'signup'
      })

      if (error) {
        setError(error.message)
        return
      }

      if (data.user) {
        await createUserProfile(data.user)
        router.push('/dashboard')
      }
    } catch (error: any) {
      setError(error.message || "Confirmation failed")
    } finally {
      setLoading(false)
    }
  }

  const resendConfirmation = async () => {
    setLoading(true)
    setError("")

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: formData.email
      })

      if (error) {
        setError(error.message)
      } else {
        setError("Confirmation email sent!")
      }
    } catch (error: any) {
      setError(error.message || "Failed to resend email")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setLoading(true)
    setError("")

    try {
      const supabase = createClient()
    const { data, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            first_name: formData.firstName,
            last_name: formData.lastName,
          },
        },
      })

      if (signUpError) {
        setError(signUpError.message)
        return
      }

      if (data.user && !data.session) {
        // User created but needs email confirmation
        setStep('confirm')
      } else if (data.user && data.session) {
        // User is already confirmed (shouldn't happen with email confirmation enabled)
        await createUserProfile(data.user)
        router.push("/dashboard")
      }
    } catch (error: any) {
      setError(error.message || "An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  if (step === 'confirm') {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Check Your Email</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleConfirmation} className="space-y-4">
            {error && (
              <Alert variant={error === "Confirmation email sent!" ? "default" : "destructive"}>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div>
              <Label htmlFor="confirmationCode">Confirmation Code</Label>
              <Input
                id="confirmationCode"
                type="text"
                value={confirmationCode}
                onChange={(e) => setConfirmationCode(e.target.value)}
                placeholder="Enter 6-digit code"
                maxLength={6}
                required
                disabled={loading}
                className="text-center text-lg tracking-widest"
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Verifying..." : "Verify Account"}
            </Button>

            <div className="text-center">
              <button
                type="button"
                onClick={resendConfirmation}
                disabled={loading}
                className="text-sm text-blue-600 hover:text-blue-500 disabled:opacity-50"
              >
                Didn't receive the code? Resend
              </button>
            </div>

            <div className="text-center">
              <button
                type="button"
                onClick={() => setStep('register')}
                className="text-sm text-gray-600 hover:text-gray-500"
              >
                ← Back to registration
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Create Customer Account</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                type="text"
                value={formData.firstName}
                onChange={(e) => handleInputChange("firstName", e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div>
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                type="text"
                value={formData.lastName}
                onChange={(e) => handleInputChange("lastName", e.target.value)}
                required
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => handleInputChange("password", e.target.value)}
              required
              disabled={loading}
              minLength={6}
            />
          </div>

          <div>
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Creating Account..." : "Create Account"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

export default CustomerRegisterForm