"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Loader2 } from "lucide-react"

const getTestCredentials = (userType: string) => {
  // Only show in development environment
  if (process.env.NODE_ENV !== "development") {
    return null
  }

  switch (userType) {
    case "customer":
      return {
        email: process.env.NEXT_PUBLIC_TEST_CUSTOMER_EMAIL || "customer@seafable.com",
        label: "Customer Test Account",
      }
    case "host":
      return { email: process.env.NEXT_PUBLIC_TEST_HOST_EMAIL || "host@seafable.com", label: "Host Test Account" }
    case "business":
      return {
        email: process.env.NEXT_PUBLIC_TEST_BUSINESS_EMAIL || "business@seafable.com",
        label: "Business Test Account",
      }
    default:
      return null
  }
}

export default function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [userType, setUserType] = useState("customer") // 'customer', 'host', 'business'
  const { login, isLoading, authError } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const result = await login(email, password, userType)
    if (result.success) {
      if (userType === "business" || userType === "host") {
        router.push("/business/dashboard")
      } else {
        router.push("/dashboard")
      }
    }
  }

  const testCreds = getTestCredentials(userType)

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl">Sign In</CardTitle>
        <CardDescription>Choose your account type and enter your credentials</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="userType">Account Type</Label>
            <RadioGroup
              defaultValue="customer"
              value={userType}
              onValueChange={setUserType}
              className="flex justify-center space-x-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="customer" id="customer" />
                <Label htmlFor="customer">Customer</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="host" id="host" />
                <Label htmlFor="host">Host</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="business" id="business" />
                <Label htmlFor="business">Business</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="m@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {authError && <p className="text-red-500 text-sm text-center">{authError}</p>}

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing In...
              </>
            ) : (
              "Sign In"
            )}
          </Button>
        </form>

        {process.env.NODE_ENV === "development" && testCreds && (
          <div className="mt-4 p-3 bg-blue-50 rounded-md border border-blue-200 text-sm text-blue-800">
            <p className="font-semibold mb-1">Development Test Account:</p>
            <p>
              Email: <span className="font-mono">{testCreds.email}</span>
            </p>
            <p>
              Password: <span className="font-mono">password</span>
            </p>
            <p className="mt-2">
              <Button
                variant="link"
                size="sm"
                className="p-0 h-auto text-blue-800"
                onClick={() => {
                  setEmail(testCreds.email)
                  setPassword("password")
                }}
              >
                Auto-fill
              </Button>
            </p>
          </div>
        )}

        <div className="mt-4 text-center text-sm">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="underline">
            Sign Up
          </Link>
        </div>
        <div className="mt-2 text-center text-sm">
          <Link href="/forgot-password" className="underline">
            Forgot password?
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
