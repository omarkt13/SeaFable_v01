"use client"
import { useState } from "react"
import type React from "react"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Building, Mail, Lock, ArrowRight } from "lucide-react"

export default function BusinessLoginPage() {
  const { login } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const result = await login(email, password, "business")

      if (result.success) {
        console.log("Business login successful")
        // Check if onboarding is complete first
        if (result.profile?.onboarding_completed) {
          router.push("/business/dashboard")
        } else {
          router.push("/business/onboarding")
        }
      } else {
        setError(result.error || "Login failed")
      }
    } catch (error: any) {
      console.error("Login error:", error)
      setError(error.message || "An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

        

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <Building className="w-8 h-8 text-teal-600 mr-2" />
              <span className="text-2xl font-bold text-gray-900">SeaFable Business</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome Back, Host!</h1>
            <p className="text-gray-600">Sign in to your business account</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-6">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-gray-700 text-sm font-bold mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  id="email"
                  placeholder="your@business.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 pr-3 py-2 w-full border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  required
                />
              </div>
            </div>
            <div>
              <label htmlFor="password" className="block text-gray-700 text-sm font-bold mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="password"
                  id="password"
                  placeholder="********"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-3 py-2 w-full border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="bg-teal-600 text-white py-2 px-4 rounded-lg hover:bg-teal-700 transition-colors w-full"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                </div>
              ) : (
                <>
                  Sign In <ArrowRight className="ml-2 h-4 w-4 inline-block" />
                </>
              )}
            </button>
          </form>

          {/* Footer Links */}
          <div className="mt-6 text-sm">
            <Link href="/business/forgot-password" className="text-teal-600 hover:underline">
              Forgot Password?
            </Link>
            <p className="mt-2">
              Don't have a business account?{" "}
              <Link href="/business/register" className="text-teal-600 hover:underline">
                Register your business
              </Link>
            </p>
            <p className="mt-2 text-gray-500">
              Customer account?{" "}
              <Link href="/login" className="text-teal-600 hover:underline">
                Customer Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
