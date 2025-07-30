
"use client"
import { useState } from "react"
import type React from "react"
import { signUpBusiness } from "@/app/actions/auth"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowRight, Building, Lock, Briefcase, Mail } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function BusinessRegisterPage() {
  const [step, setStep] = useState<'register' | 'confirm'>('register')
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [businessName, setBusinessName] = useState("")
  const [contactName, setContactName] = useState("")
  const [phone, setPhone] = useState("")
  const [location, setLocation] = useState("")
  const [confirmationCode, setConfirmationCode] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const formData = new FormData()
      formData.append('email', email)
      formData.append('password', password)
      formData.append('businessName', businessName)
      formData.append('contactName', contactName)
      formData.append('phone', phone)
      formData.append('location', location)

      const result = await signUpBusiness(formData)

      if (result.success) {
        setStep('confirm')
      } else {
        setError(result.error || 'Registration failed')
      }
    } catch (error: any) {
      setError(error.message || "An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  const handleConfirmation = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()

      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token: confirmationCode,
        type: 'signup'
      })

      if (error) {
        setError(error.message)
        return
      }

      if (data.user) {
        // Redirect to business home page
        router.push('/business/home')
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
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()

      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email
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

  if (step === 'confirm') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
              <Mail className="h-6 w-6 text-blue-600" />
            </div>
            <CardTitle className="text-2xl font-bold">Check Your Email</CardTitle>
            <CardDescription>
              We've sent a confirmation code to {email}. Enter the 6-digit code below to verify your account.
            </CardDescription>
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
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
            <Building className="h-6 w-6 text-blue-600" />
          </div>
          <CardTitle className="text-2xl font-bold">Create Business Account</CardTitle>
          <CardDescription>Join our platform and start offering experiences to customers.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div>
              <Label htmlFor="businessName">Business Name</Label>
              <Input
                id="businessName"
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div>
              <Label htmlFor="contactName">Contact Name</Label>
              <Input
                id="contactName"
                type="text"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="City, State/Province"
                required
                disabled={loading}
              />
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                minLength={6}
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Creating Account..." : "Create Account"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>

            <div className="text-center">
              <span className="text-sm text-gray-600">
                Already have an account?{" "}
                <Link href="/business/login" className="text-blue-600 hover:text-blue-500">
                  Sign in
                </Link>
              </span>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
