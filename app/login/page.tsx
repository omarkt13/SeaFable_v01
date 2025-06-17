"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { User, UserCheck, Building, Anchor, ArrowRight, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DatabaseStatus } from "@/components/database-status"
import { LoginForm } from "@/components/login-form"
import { useAuth } from "@/lib/auth-context"

export default function LoginPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("customer")
  const { user, isAuthenticated, logout } = useAuth()

  const handleLoginSuccess = (userData: any) => {
    console.log("Login successful:", userData)

    // Route based on user type
    switch (userData.role) {
      case "user":
        router.push("/dashboard")
        break
      case "host":
        if (userData.businessProfile) {
          router.push("/business/dashboard")
        } else {
          router.push("/host/dashboard")
        }
        break
      case "admin":
        router.push("/admin/dashboard")
        break
      default:
        router.push("/dashboard")
    }
  }

  if (isAuthenticated && user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </div>
              <CardTitle>Welcome Back, {user.firstName}!</CardTitle>
              <CardDescription>You are successfully logged in to SeaFable</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Account Details:</h4>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium">Name:</span> {user.firstName} {user.lastName}
                  </div>
                  <div>
                    <span className="font-medium">Email:</span> {user.email}
                  </div>
                  <div>
                    <span className="font-medium">Role:</span> {user.role}
                  </div>
                  {user.hostProfile && (
                    <div>
                      <span className="font-medium">Host Type:</span> {user.hostProfile.hostType}
                    </div>
                  )}
                  {user.businessProfile && (
                    <div>
                      <span className="font-medium">Business:</span> {user.businessProfile.companyName}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-3">
                <Button onClick={() => handleLoginSuccess(user)} className="flex-1">
                  Go to Dashboard
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button variant="outline" onClick={logout}>
                  Sign Out
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center items-center gap-3 mb-4">
            <Anchor className="h-8 w-8 text-teal-600" />
            <h1 className="text-3xl font-bold text-gray-900">SeaFable</h1>
          </div>
          <p className="text-gray-600">Sign in to your account and dive into adventure</p>
        </div>

        {/* Database Status */}
        <DatabaseStatus />

        {/* Login Interface */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Account Type Selection */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Account Type</CardTitle>
                <CardDescription>Choose your account type to sign in</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <button
                  onClick={() => setActiveTab("customer")}
                  className={`w-full p-4 rounded-lg border-2 transition-all ${
                    activeTab === "customer" ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <User className="h-6 w-6 text-blue-600" />
                    <div className="text-left">
                      <div className="font-medium">Customer</div>
                      <div className="text-sm text-gray-500">Book water adventures</div>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => setActiveTab("host")}
                  className={`w-full p-4 rounded-lg border-2 transition-all ${
                    activeTab === "host" ? "border-green-500 bg-green-50" : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <UserCheck className="h-6 w-6 text-green-600" />
                    <div className="text-left">
                      <div className="font-medium">Host/Guide</div>
                      <div className="text-sm text-gray-500">Offer experiences</div>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => setActiveTab("business")}
                  className={`w-full p-4 rounded-lg border-2 transition-all ${
                    activeTab === "business"
                      ? "border-purple-500 bg-purple-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Building className="h-6 w-6 text-purple-600" />
                    <div className="text-left">
                      <div className="font-medium">Business</div>
                      <div className="text-sm text-gray-500">Manage operations</div>
                    </div>
                  </div>
                </button>
              </CardContent>
            </Card>
          </div>

          {/* Login Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>
                  Sign In as {activeTab === "customer" ? "Customer" : activeTab === "host" ? "Host/Guide" : "Business"}
                </CardTitle>
                <CardDescription>Enter your credentials to access your SeaFable account</CardDescription>
              </CardHeader>
              <CardContent>
                <LoginForm userType={activeTab} onSuccess={handleLoginSuccess} />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
