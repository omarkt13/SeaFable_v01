"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/lib/auth-context" // Import useAuth

export default function LoginPage() {
  const { login, isLoading: authLoading } = useAuth() // Use login from AuthContext
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    const result = await login(email, password, "customer") // Call login from AuthContext

    if (result.success) {
      router.push("/dashboard")
    } else {
      setError(result.error || "Login failed. Please check your credentials.")
    }
    setIsLoading(false)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4 py-12 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-3xl font-bold">Customer Login</CardTitle>
          <CardDescription>Enter your email and password to access your customer dashboard.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            {error && <p className="text-sm text-red-500 text-center">{error}</p>}
            <Button
              type="submit"
              className="w-full bg-teal-600 hover:bg-teal-700 text-white"
              disabled={isLoading || authLoading}
            >
              {isLoading || authLoading ? "Logging in..." : "Login"}
            </Button>
            <div className="text-center text-sm text-gray-600">
              Don't have an account?{" "}
              <Link href="/register" className="font-medium text-teal-600 hover:underline">
                Register as a Customer
              </Link>
            </div>
            <div className="text-center text-sm text-gray-600">
              <Link href="/forgot-password" className="font-medium text-teal-600 hover:underline">
                Forgot password?
              </Link>
            </div>
            <div className="text-center text-sm text-gray-600">
              Business account?{" "}
              <Link href="/business/login" className="font-medium text-teal-600 hover:underline">
                Business Login
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
