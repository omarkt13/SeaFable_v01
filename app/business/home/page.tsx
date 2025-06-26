"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  Calendar,
  DollarSign,
  Package,
  Star,
  Activity,
  MapPin,
  MessageSquare,
  Edit,
  Plus,
  TrendingUp,
  TrendingDown,
  User,
  LogOut,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarTrigger,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { BusinessLayout } from "@/components/layouts/BusinessLayout"
import { useAuth } from "@/lib/auth-context"
import {
  getHostDashboardData,
  getBusinessBookings,
  getBusinessExperiences,
  updateBusinessProfile,
} from "@/lib/database"
import type { BusinessDashboardData } from "@/lib/database"
import Link from "next/link"

// Overview Tab Component
interface OverviewTabProps {
  dashboardData: BusinessDashboardData | null
  isLoading: boolean
}

const OverviewTab = ({ dashboardData, isLoading }: OverviewTabProps) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="h-24 w-full bg-gray-200 animate-pulse rounded-md"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const { overview, recentBookings, experiences, recentActivity } = dashboardData || {
    overview: {},
    recentBookings: [],
    experiences: [],
    recentActivity: [],
  }

  const stats = [
    {
      name: "Total Revenue",
      value: `$${(overview?.totalRevenue || 0).toLocaleString()}`,
      icon: DollarSign,
      color: "text-green-600",
      bg: "bg-green-100",
      growth: overview?.revenueGrowth,
    },
    {
      name: "Active Bookings",
      value: overview?.activeBookings || 0,
      icon: Calendar,
      color: "text-blue-600",
      bg: "bg-blue-100",
      growth: overview?.bookingGrowth,
    },
    {
      name: "Total Experiences",
      value: overview?.totalExperiences || 0,
      icon: Package,
      color: "text-purple-600",
      bg: "bg-purple-100",
    },
    {
      name: "Average Rating",
      value: `${(overview?.averageRating || 0).toFixed(1)} / 5`,
      icon: Star,
      color: "text-yellow-600",
      bg: "bg-yellow-100",
    },
  ]

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.name}>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${stat.bg}`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-sm text-gray-500">{stat.name}</p>
                </div>
                {stat.growth !== undefined && (
                  <div
                    className={`ml-auto flex items-center text-sm font-medium ${
                      stat.growth >= 0 ? "text-green-500" : "text-red-500"
                    }`}
                  >
                    {stat.growth >= 0 ? (
                      <TrendingUp className="h-4 w-4 mr-1" />
                    ) : (
                      <TrendingDown className="h-4 w-4 mr-1" />
                    )}
                    {Math.abs(stat.growth)}%
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Bookings & Experience Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentBookings && recentBookings.length > 0 ? (
                recentBookings.map((booking) => (
                  <div key={booking.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={booking.avatar || "/placeholder.svg"} />
                        <AvatarFallback>{booking.customerName.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{booking.customerName}</p>
                        <p className="text-sm text-gray-500">{booking.experienceTitle}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">${booking.amount.toFixed(2)}</p>
                      <Badge
                        variant={
                          booking.status === "confirmed"
                            ? "default"
                            : booking.status === "pending"
                              ? "secondary"
                              : "outline"
                        }
                      >
                        {booking.status}
                      </Badge>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center">No recent bookings.</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Experience Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {experiences && experiences.length > 0 ? (
                experiences.slice(0, 5).map((exp) => (
                  <div key={exp.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{exp.title}</p>
                      <p className="text-sm text-gray-500">
                        {exp.bookings} bookings • ${exp.revenue.toFixed(2)} revenue
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Star className="h-4 w-4 text-yellow-400" />
                      <span className="text-sm font-medium">{exp.rating.toFixed(1)}</span>
                      <Badge variant={exp.status === "active" ? "default" : "secondary"}>{exp.status}</Badge>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center">No experiences found.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivity && recentActivity.length > 0 ? (
              recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className={`h-2 w-2 rounded-full ${activity.color}`}></div>
                  <p className="text-sm text-gray-700 flex-1">{activity.description}</p>
                  <span className="text-xs text-gray-500">{activity.time}</span>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center">No recent activity.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Bookings Tab Component
interface BookingsTabProps {
  businessId: string
}

const BookingsTab = ({ businessId }: BookingsTabProps) => {
  const [bookings, setBookings] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchBookings = async () => {
      setIsLoading(true)
      setError(null)
      const { data, error } = await getBusinessBookings(businessId)
      if (error) {
        setError(error)
        console.error("Error fetching business bookings:", error)
      } else {
        setBookings(data || [])
      }
      setIsLoading(false)
    }
    if (businessId) {
      fetchBookings()
    }
  }, [businessId])

  if (isLoading) {
    return <div className="text-center py-8">Loading bookings...</div>
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">Error: {error}</div>
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">All Bookings</h2>
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Experience
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date & Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Guests
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {bookings.length > 0 ? (
                  bookings.map((booking) => (
                    <tr key={booking.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{booking.experience_name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{booking.customer_name}</div>
                        <div className="text-sm text-gray-500">{booking.customer_email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {new Date(booking.booking_date).toLocaleDateString()}
                        </div>
                        <div className="text-sm text-gray-500">{booking.departure_time || "N/A"}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{booking.number_of_guests}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ${booking.total_price?.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge
                          variant={
                            booking.status === "confirmed"
                              ? "default"
                              : booking.status === "pending"
                                ? "secondary"
                                : "outline"
                          }
                        >
                          {booking.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Button variant="outline" size="sm" className="mr-2">
                          <MessageSquare className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                      No bookings found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Experiences Tab Component
interface ExperiencesTabProps {
  businessId: string
}

const ExperiencesTab = ({ businessId }: ExperiencesTabProps) => {
  const [experiences, setExperiences] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchExperiences = async () => {
      setIsLoading(true)
      setError(null)
      const { data, error } = await getBusinessExperiences(businessId)
      if (error) {
        setError(error)
        console.error("Error fetching business experiences:", error)
      } else {
        setExperiences(data || [])
      }
      setIsLoading(false)
    }
    if (businessId) {
      fetchExperiences()
    }
  }, [businessId])

  if (isLoading) {
    return <div className="text-center py-8">Loading experiences...</div>
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">Error: {error}</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">My Experiences</h2>
        <Button asChild>
          <Link href="/business/experiences/new">
            <Plus className="h-4 w-4 mr-2" />
            Add New Experience
          </Link>
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {experiences.length > 0 ? (
          experiences.map((experience) => (
            <Card key={experience.id} className="overflow-hidden">
              <img
                src={experience.primary_image_url || "/placeholder.svg?height=200&width=300&text=Experience"}
                alt={experience.title}
                className="w-full h-48 object-cover"
              />
              <CardContent className="p-4">
                <h3 className="font-semibold text-gray-900 mb-2">{experience.title}</h3>
                <p className="text-sm text-gray-600 flex items-center mb-2">
                  <MapPin className="h-3 w-3 mr-1" />
                  {experience.location}
                </p>
                <div className="flex items-center justify-between text-sm mb-3">
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-400 mr-1" />
                    <span>
                      {experience.rating?.toFixed(1) || "N/A"} ({experience.total_reviews || 0} reviews)
                    </span>
                  </div>
                  <Badge variant={experience.is_active ? "default" : "secondary"}>
                    {experience.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold">${experience.price_per_person?.toFixed(2)}</span>
                  <Button asChild size="sm">
                    <Link href={`/business/experiences/${experience.id}`}>View Details</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <p className="text-gray-500 text-center col-span-full py-4">
            No experiences created yet. Click "Add New Experience" to get started!
          </p>
        )}
      </div>
    </div>
  )
}

// Settings Tab Component
const SettingsTab = () => {
  const { businessProfile, user, refreshProfile } = useAuth()
  const [isSaving, setIsSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState<string | null>(null)

  const [contactName, setContactName] = useState(businessProfile?.contact_name || "")
  const [phone, setPhone] = useState(businessProfile?.phone || "")
  const [location, setLocation] = useState(businessProfile?.location || "")
  const [businessType, setBusinessType] = useState(businessProfile?.business_type || "")
  const [businessName, setBusinessName] = useState(businessProfile?.business_name || "")
  const [logoUrl, setLogoUrl] = useState(businessProfile?.logo_url || "")
  const [onboardingCompleted, setOnboardingCompleted] = useState(businessProfile?.onboarding_completed || false)
  const [marketplaceEnabled, setMarketplaceEnabled] = useState(businessProfile?.marketplace_enabled || false)

  useEffect(() => {
    if (businessProfile) {
      setContactName(businessProfile.contact_name || "")
      setPhone(businessProfile.phone || "")
      setLocation(businessProfile.location || "")
      setBusinessType(businessProfile.business_type || "")
      setBusinessName(businessProfile.business_name || "")
      setLogoUrl(businessProfile.logo_url || "")
      setOnboardingCompleted(businessProfile.onboarding_completed || false)
      setMarketplaceEnabled(businessProfile.marketplace_enabled || false)
    }
  }, [businessProfile])

  const handleSaveChanges = async () => {
    if (!user?.id) return

    setIsSaving(true)
    setSaveMessage(null)

    const updates = {
      contact_name: contactName,
      phone: phone,
      location: location,
      business_type: businessType,
      business_name: businessName,
      logo_url: logoUrl,
      onboarding_completed: onboardingCompleted,
      marketplace_enabled: marketplaceEnabled,
    }

    try {
      const { success, error } = await updateBusinessProfile(user.id, updates)
      if (success) {
        setSaveMessage("Profile updated successfully!")
        refreshProfile() // Refresh auth context to get updated profile
      } else {
        setSaveMessage(`Failed to update profile: ${error}`)
      }
    } catch (err: any) {
      setSaveMessage(`An error occurred: ${err.message}`)
    } finally {
      setIsSaving(false)
      setTimeout(() => setSaveMessage(null), 3000)
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Business Settings</h2>

      <Card>
        <CardHeader>
          <CardTitle>Business Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-4">
            <Avatar className="w-20 h-20">
              <AvatarImage src={logoUrl || "/placeholder-logo.svg"} />
              <AvatarFallback>{businessName?.charAt(0) || "B"}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-lg font-semibold">{businessName || "Your Business Name"}</h3>
              <p className="text-gray-600">{user?.email}</p>
              <Badge variant="secondary">Business Account</Badge>
            </div>
          </div>

          <div>
            <label htmlFor="businessName" className="block text-sm font-medium text-gray-700 mb-1">
              Business Name
            </label>
            <input
              id="businessName"
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="contactName" className="block text-sm font-medium text-gray-700 mb-1">
              Contact Name
            </label>
            <input
              id="contactName"
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
              Phone
            </label>
            <input
              id="phone"
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
              Location
            </label>
            <input
              id="location"
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="businessType" className="block text-sm font-medium text-gray-700 mb-1">
              Business Type
            </label>
            <input
              id="businessType"
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              value={businessType}
              onChange={(e) => setBusinessType(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="logoUrl" className="block text-sm font-medium text-gray-700 mb-1">
              Logo URL
            </label>
            <input
              id="logoUrl"
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="onboardingCompleted"
              checked={onboardingCompleted}
              onChange={(e) => setOnboardingCompleted(e.target.checked)}
              className="h-4 w-4"
            />
            <label htmlFor="onboardingCompleted" className="text-sm text-gray-700">
              Onboarding Completed
            </label>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="marketplaceEnabled"
              checked={marketplaceEnabled}
              onChange={(e) => setMarketplaceEnabled(e.target.checked)}
              className="h-4 w-4"
            />
            <label htmlFor="marketplaceEnabled" className="text-sm text-gray-700">
              Enable Marketplace Listing
            </label>
          </div>

          <Button onClick={handleSaveChanges} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
          {saveMessage && (
            <p className={`text-sm ${saveMessage.includes("Failed") ? "text-red-500" : "text-green-500"}`}>
              {saveMessage}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// Main Business Dashboard Component
export default function BusinessHomePage() {
  const [activeTab, setActiveTab] = useState("overview")
  const { user, businessProfile, userType, isLoading, signOut } = useAuth()
  const router = useRouter()
  const [dashboardData, setDashboardData] = useState<BusinessDashboardData | null>(null)
  const [dataLoading, setDataLoading] = useState(true)

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/business/login")
    } else if (!isLoading && user && userType === "customer") {
      // If a customer tries to access business dashboard, redirect
      router.push("/dashboard")
    }
  }, [isLoading, user, userType, router])

  useEffect(() => {
    const fetchData = async () => {
      if (user?.id && userType === "business") {
        setDataLoading(true)
        const { success, data, error } = await getHostDashboardData(user.id)
        if (success && data) {
          setDashboardData(data)
        } else {
          console.error("Failed to fetch dashboard data:", error)
          setDashboardData(null) // Clear data on error
        }
        setDataLoading(false)
      }
    }
    if (!isLoading && user && userType === "business") {
      fetchData()
    }
  }, [isLoading, user, userType])

  if (isLoading || dataLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user || userType !== "business") {
    return null // Should be redirected by useEffect
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case "overview":
        return <OverviewTab dashboardData={dashboardData} isLoading={dataLoading} />
      case "bookings":
        return <BookingsTab businessId={user.id} />
      case "experiences":
        return <ExperiencesTab businessId={user.id} />
      case "settings":
        return <SettingsTab />
      default:
        return <OverviewTab dashboardData={dashboardData} isLoading={dataLoading} />
    }
  }

  const handleSignOut = async () => {
    await signOut()
    router.push("/business/login")
  }

  const navigationItems = [
    { id: "overview", name: "Overview", icon: Activity },
    { id: "bookings", name: "Bookings", icon: Calendar },
    { id: "experiences", name: "Experiences", icon: Package },
    { id: "settings", name: "Settings", icon: User },
  ]

  return (
    <BusinessLayout>
      <SidebarProvider defaultOpen={true}>
        <Sidebar className="hidden md:flex" collapsible="icon">
          <SidebarHeader>
            <div className="flex items-center justify-center p-2">
              <img src="/placeholder-logo.svg" alt="SeaFable Logo" className="h-8 w-8 mr-2" />
              <span className="text-xl font-bold text-gray-900 group-data-[state=collapsed]:hidden">SeaFable</span>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Business Dashboard</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navigationItems.map((item) => (
                    <SidebarMenuItem key={item.id}>
                      <SidebarMenuButton
                        onClick={() => setActiveTab(item.id)}
                        isActive={activeTab === item.id}
                        tooltip={item.name}
                      >
                        <item.icon />
                        <span>{item.name}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={handleSignOut}>
                  <LogOut />
                  <span>Sign Out</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
          <SidebarRail />
        </Sidebar>

        <div className="flex-1 flex flex-col">
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 md:hidden">
            <SidebarTrigger className="-ml-1" />
            <h1 className="text-xl font-bold text-gray-900">
              {navigationItems.find((item) => item.id === activeTab)?.name}
            </h1>
          </header>
          <div className="flex-1 p-4 sm:p-6 overflow-auto">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Welcome, {businessProfile?.business_name || businessProfile?.name || user?.email}!
              </h1>
              <p className="text-lg text-gray-600 mb-6">Manage your experiences, bookings, and business settings.</p>
            </div>
            {renderTabContent()}
          </div>
        </div>
      </SidebarProvider>
    </BusinessLayout>
  )
}
