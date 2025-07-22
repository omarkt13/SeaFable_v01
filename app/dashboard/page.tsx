"use client"

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { EmptyState } from '@/components/ui/empty-state'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Star, 
  MapPin, 
  Calendar, 
  Heart,
  Search,
  Filter,
  Compass
} from 'lucide-react'
import { Experience, Booking } from '@/types/business'
import { supabase } from '@/lib/supabase'
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  Clock,
  Users,
  Edit,
  Plus,
  MessageSquare,
  Target,
  Sun,
  CreditCard,
  LogOut,
  Loader2,
} from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { CustomerLayout } from "@/components/layouts/CustomerLayout"
import { getUserDashboardData, type Review } from "@/lib/database"
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
import { signOutAndRedirect } from "@/lib/auth-utils"
import type { UserProfile } from "@/types/auth"
import { useActionState } from "react"
import { updateUserProfile } from "@/app/actions/user"
import { useToast } from "@/hooks/use-toast"
import { Input } from "@/components/ui/input"

interface ExperienceWithHost extends Experience {
  host_profiles?: {
    name: string
    business_name: string
    avatar_url: string
  }
}

export default function CustomerDashboardPage() {
  const { user, userProfile, isLoading } = useAuth()
  const [loading, setLoading] = useState(true)
  const [experiences, setExperiences] = useState<ExperienceWithHost[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [wishlist, setWishlist] = useState<string[]>([])
  const router = useRouter()
  const [dashboardData, setDashboardData] = useState<{
    user: UserProfile | null
    bookings: Booking[]
    reviews: Review[]
  } | null>(null)
  const [dataLoading, setDataLoading] = useState(true)

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
    }
  }, [isLoading, user, router])

  useEffect(() => {
    if (user) {
      fetchDashboardData()
    }
  }, [user])

  useEffect(() => {
    const fetchData = async () => {
      if (user?.id) {
        setDataLoading(true)
        const { success, data } = await getUserDashboardData(user.id)
        if (success && data) {
          setDashboardData(data)
        } else {
          setDashboardData({ user: userProfile, bookings: [], reviews: [] })
        }
        setDataLoading(false)
      }
    }
    if (!isLoading && user) {
      fetchData()
    }
  }, [isLoading, user, userProfile])

  async function fetchDashboardData() {
    try {
      setLoading(true)

      const { data: experiencesData, error: experiencesError } = await supabase
        .from('experiences')
        .select(`
          *,
          host_profiles (
            name,
            business_name,
            avatar_url
          )
        `)
        .eq('marketplace_enabled', true)
        .limit(8)
        .order('created_at', { ascending: false })

      if (experiencesError) throw experiencesError

      let bookingsData = []
      if (user) {
        const { data, error: bookingsError } = await supabase
          .from('bookings')
          .select(`
            *,
            experiences (
              title,
              location
            )
          `)
          .eq('customer_id', user.id)
          .order('booking_date', { ascending: false })

        if (bookingsError) throw bookingsError
        bookingsData = data || []
      }

      let wishlistData = []
      if (user) {
        const { data, error: wishlistError } = await supabase
          .from('user_wishlist')
          .select('experience_id')
          .eq('user_id', user.id)

        if (!wishlistError && data) {
          wishlistData = data.map(item => item.experience_id)
        }
      }

      setExperiences(experiencesData || [])
      setBookings(bookingsData)
      setWishlist(wishlistData)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  async function toggleWishlist(experienceId: string) {
    if (!user) return

    try {
      if (wishlist.includes(experienceId)) {
        const { error } = await supabase
          .from('user_wishlist')
          .delete()
          .eq('user_id', user.id)
          .eq('experience_id', experienceId)

        if (error) throw error
        setWishlist(wishlist.filter(id => id !== experienceId))
      } else {
        const { error } = await supabase
          .from('user_wishlist')
          .insert({
            user_id: user.id,
            experience_id: experienceId
          })

        if (error) throw error
        setWishlist([...wishlist, experienceId])
      }
    } catch (error) {
      console.error('Error updating wishlist:', error)
    }
  }

  function formatDuration(minutes: number): string {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60

    if (hours > 0 && mins > 0) {
      return `${hours}h ${mins}m`
    } else if (hours > 0) {
      return `${hours}h`
    } else {
      return `${mins}m`
    }
  }

  const upcomingBookings = bookings.filter(booking => 
    new Date(booking.booking_date) > new Date() && booking.status !== 'cancelled'
  )

  const pastBookings = bookings.filter(booking => 
    new Date(booking.booking_date) <= new Date() || booking.status === 'completed'
  )

  if (isLoading || loading || dataLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const ExperienceCard = ({ experience }: { experience: ExperienceWithHost }) => (
    <Card className="group hover:shadow-lg transition-shadow">
      <CardContent className="p-0">
        <div className="relative">
          <div className="aspect-video bg-gray-200 rounded-t-lg flex items-center justify-center">
            <Compass className="h-12 w-12 text-gray-400" />
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-2 right-2 h-8 w-8 p-0"
            onClick={() => toggleWishlist(experience.id)}
          >
            <Heart 
              className={`h-4 w-4 ${
                wishlist.includes(experience.id) 
                  ? 'fill-red-500 text-red-500' 
                  : 'text-white'
              }`} 
            />
          </Button>
          {experience.instantBooking && (
            <Badge className="absolute bottom-2 left-2">
              Instant Booking
            </Badge>
          )}
        </div>

        <div className="p-4 space-y-3">
          <div>
            <h3 className="font-semibold text-lg line-clamp-1">{experience.title}</h3>
            <p className="text-sm text-gray-600 flex items-center mt-1">
              <MapPin className="h-3 w-3 mr-1" />
              {experience.location}
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <Avatar className="h-6 w-6">
              <AvatarImage src={experience.host_profiles?.avatar_url} />
              <AvatarFallback>
                {experience.host_profiles?.business_name?.charAt(0) || 'H'}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm text-gray-600">
              {experience.host_profiles?.business_name || experience.host_profiles?.name}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1">
              <Star className="h-4 w-4 text-yellow-400 fill-current" />
              <span className="text-sm font-medium">
                {experience.average_rating ? experience.average_rating.toFixed(1) : 'New'}
              </span>
            </div>
            <div className="text-right">
              <div className="font-semibold">${experience.price}</div>
              <div className="text-xs text-gray-500">
                {formatDuration(experience.duration)}
              </div>
            </div>
          </div>

          <Button asChild className="w-full">
            <a href={`/experience/${experience.id}`}>
              View Details
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  )

  const navigationItems = [
    { id: "discover", name: "Discover", icon: Compass },
    { id: "bookings", name: "My Bookings", icon: Calendar },
    { id: "wishlist", name: "Wishlist", icon: Heart },
    { id: "profile", name: "Profile", icon: Users },
    { id: "settings", name: "Settings & Payment", icon: CreditCard },
  ]

  const handleSignOut = async () => {
    await signOutAndRedirect("customer")
  }

  const ProfileTab = ({ userProfile, userEmail }: { userProfile: UserProfile | null, userEmail: string }) => {
    const { toast } = useToast()
  
    const [firstName, setFirstName] = useState(userProfile?.first_name || "")
    const [lastName, setLastName] = useState(userProfile?.last_name || "")
    const [email, setEmail] = useState(userProfile?.email || userEmail)
    const [phone, setPhone] = useState(userProfile?.phone || "")
  
    const [state, formAction, isPending] = useActionState(async (prevState: any, formData: FormData) => {
      const updatedFirstName = formData.get("firstName") as string
      const updatedLastName = formData.get("lastName") as string
      const updatedEmail = formData.get("email") as string
      const updatedPhone = formData.get("phone") as string
  
      if (!userProfile?.id) {
        toast({
          title: "Error",
          description: "User ID not found. Cannot update profile.",
          variant: "destructive",
        })
        return { success: false, error: "User ID not found." }
      }
  
      const result = await updateUserProfile({
        userId: userProfile.id,
        firstName: updatedFirstName,
        lastName: updatedLastName,
        email: updatedEmail,
        phone: updatedPhone,
      })
  
      if (result.success) {
        toast({
          title: "Success",
          description: "Profile updated successfully!",
          variant: "default",
        })
        setFirstName(updatedFirstName)
        setLastName(updatedLastName)
        setEmail(updatedEmail)
        setPhone(updatedPhone)
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to update profile.",
          variant: "destructive",
        })
      }
      return result
    }, null)
    const mockCustomerData = {
      totalSpent: 2850,
      totalBookings: 8,
      membershipLevel: "Explorer",
    }
  
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">Profile Settings</h2>
  
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4">
                <Avatar className="w-20 h-20">
                  <AvatarImage src={userProfile?.avatar_url || "/placeholder.svg"} />
                  <AvatarFallback>
                    {firstName?.charAt(0) || userEmail.charAt(0)}
                    {lastName?.charAt(0) || userEmail.charAt(1)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-semibold">
                    {firstName} {lastName}
                  </h3>
                  <p className="text-gray-600">{email}</p>
                  <Badge variant="secondary">{mockCustomerData.membershipLevel} Member</Badge>
                </div>
              </div>
              <form action={formAction} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                      First Name
                    </label>
                    <Input
                      id="firstName"
                      name="firstName"
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      disabled={isPending}
                    />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name
                    </label>
                    <Input
                      id="lastName"
                      name="lastName"
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      disabled={isPending}
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isPending}
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="Optional"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    disabled={isPending}
                  />
                </div>
                <Button type="submit" disabled={isPending}>
                  {isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
  
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Account Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Spent</span>
                  <span className="font-semibold">${mockCustomerData.totalSpent.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Bookings</span>
                  <span className="font-semibold">{mockCustomerData.totalBookings}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Member Since</span>
                  <span className="font-semibold">
                    {userProfile?.created_at ? new Date(userProfile.created_at).getFullYear() : "N/A"}
                  </span>
                </div>
              </CardContent>
            </Card>
  
            <Card>
              <CardHeader>
                <CardTitle>Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty Level</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-md">
                    <option value="beginner">Beginner</option>
                    <option value="intermediate" >
                      Intermediate
                    </option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Group Size</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-md">
                    <option value="solo">Solo</option>
                    <option value="small" >
                      Small (2-6 people)
                    </option>
                    <option value="large">Large (7+ people)</option>
                  </select>
                </div>
                <Button
                  variant="outline"
                  className="w-full bg-transparent"
                  onClick={() => console.log("Update Preferences clicked")}
                >
                  Update Preferences
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  const SettingsTab = () => {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">Settings & Payment</h2>
  
        <Card>
          <CardHeader>
            <CardTitle>Account Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <Button asChild variant="outline">
                <Link href="/forgot-password">Change Password</Link>
              </Button>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Notifications</label>
              <div className="flex items-center space-x-2">
                <input type="checkbox" id="email-notifications" className="h-4 w-4" />
                <label htmlFor="email-notifications" className="text-sm text-gray-700">
                  Receive email updates
                </label>
              </div>
            </div>
            <Button variant="destructive" onClick={() => console.log("Delete Account clicked")}>
              Delete Account
            </Button>
          </CardContent>
        </Card>
  
        <Card>
          <CardHeader>
            <CardTitle>Payment Methods</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600">No payment methods on file.</p>
            <Button onClick={() => console.log("Add Payment Method clicked")}>
              <Plus className="h-4 w-4 mr-2" />
              Add Payment Method
            </Button>
            <div className="border-t pt-4 mt-4">
              <h3 className="text-lg font-semibold mb-2">Billing History</h3>
              <p className="text-gray-600">No billing history available.</p>
              <Button
                variant="outline"
                className="mt-2 bg-transparent"
                onClick={() => console.log("View All Transactions clicked")}
              >
                View All Transactions
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const renderTabContent = () => {
    const currentDashboardData = dashboardData || { user: userProfile, bookings: [], reviews: [] }

    switch (activeTab) {
      case "discover":
        return (
          <TabsContent value="discover">
            <div>
              <h2 className="text-xl font-semibold mb-4">Recommended Experiences</h2>
              {experiences.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {experiences.map((experience) => (
                    <ExperienceCard key={experience.id} experience={experience} />
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={<Compass className="h-16 w-16" />}
                  title="No experiences available"
                  description="Check back soon for amazing marine adventures!"
                  action={{
                    label: "Browse All Experiences",
                    onClick: () => window.location.href = "/search"
                  }}
                />
              )}
            </div>
          </TabsContent>
        )
      case "bookings":
        return (
          <TabsContent value="bookings">
            <div className="space-y-6">
              {upcomingBookings.length > 0 && (
                <div>
                  <h2 className="text-xl font-semibold mb-4">Upcoming Bookings</h2>
                  <div className="space-y-4">
                    {upcomingBookings.map((booking) => (
                      <Card key={booking.id}>
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-semibold">{booking.experiences?.title}</h3>
                              <p className="text-sm text-gray-600 flex items-center mt-1">
                                <MapPin className="h-3 w-3 mr-1" />
                                {booking.experiences?.location}
                              </p>
                              <p className="text-sm text-gray-600 flex items-center mt-1">
                                <Calendar className="h-3 w-3 mr-1" />
                                {new Date(booking.booking_date).toLocaleDateString()} at {booking.start_time}
                              </p>
                            </div>
                            <Badge>{booking.status}</Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
  
              {pastBookings.length > 0 && (
                <div>
                  <h2 className="text-xl font-semibold mb-4">Past Bookings</h2>
                  <div className="space-y-4">
                    {pastBookings.slice(0, 5).map((booking) => (
                      <Card key={booking.id}>
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-semibold">{booking.experiences?.title}</h3>
                              <p className="text-sm text-gray-600 flex items-center mt-1">
                                <Calendar className="h-3 w-3 mr-1" />
                                {new Date(booking.booking_date).toLocaleDateString()}
                              </p>
                            </div>
                            <Badge variant="secondary">{booking.status}</Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
  
              {bookings.length === 0 && (
                <EmptyState
                  icon={<Calendar className="h-16 w-16" />}
                  title="No bookings yet"
                  description="When you book experiences, they'll appear here."
                  action={{
                    label: "Explore Experiences",
                    onClick: () => window.location.href = "/search"
                  }}
                />
              )}
            </div>
          </TabsContent>
        )
      case "wishlist":
        return (
          <TabsContent value="wishlist">
            {wishlist.length > 0 ? (
              <div>
                <h2 className="text-xl font-semibold mb-4">Your Wishlist</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {experiences
                    .filter(exp => wishlist.includes(exp.id))
                    .map((experience) => (
                      <ExperienceCard key={experience.id} experience={experience} />
                    ))}
                </div>
              </div>
            ) : (
              <EmptyState
                icon={<Heart className="h-16 w-16" />}
                title="Your wishlist is empty"
                description="Save experiences you're interested in by clicking the heart icon."
                action={{
                  label: "Browse Experiences",
                  onClick: () => window.location.href = "/search"
                }}
              />
            )}
          </TabsContent>
        )
      case "profile":
        return <ProfileTab userProfile={currentDashboardData.user} userEmail={user.email || "Guest"} />
      case "settings":
        return <SettingsTab />
      default:
        return (
          <TabsContent value="discover">
            <div>
              <h2 className="text-xl font-semibold mb-4">Recommended Experiences</h2>
              {experiences.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {experiences.map((experience) => (
                    <ExperienceCard key={experience.id} experience={experience} />
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={<Compass className="h-16 w-16" />}
                  title="No experiences available"
                  description="Check back soon for amazing marine adventures!"
                  action={{
                    label: "Browse All Experiences",
                    onClick: () => window.location.href = "/search"
                  }}
                />
              )}
            </div>
          </TabsContent>
        )
    }
  }

  const setActiveTab = (tabId: string) => {
    setActiveTabState(tabId)
  }

  const [activeTabState, setActiveTabState] = useState("discover")

  return (
    <CustomerLayout>
      <SidebarProvider defaultOpen={true}>
        <Sidebar className="hidden md:flex" collapsible="icon">
          <SidebarHeader>
            <div className="flex items-center justify-center p-2">
              <Compass className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900 group-data-[state=collapsed]:hidden">SeaFable</span>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Navigation</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navigationItems.map((item) => (
                    <SidebarMenuItem key={item.id}>
                      <SidebarMenuButton
                        onClick={() => setActiveTab(item.id)}
                        isActive={activeTabState === item.id}
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
              {navigationItems.find((item) => item.id === activeTabState)?.name}
            </h1>
          </header>
          <div className="flex-1 p-4 sm:p-6 overflow-auto">
            <div className="p-6 space-y-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                <div>
                  <h1 className="text-3xl font-bold">
                    Welcome back{userProfile?.first_name ? `, ${userProfile.first_name}` : ''}!
                  </h1>
                  <p className="text-gray-600">Discover amazing marine experiences</p>
                </div>
                <div className="flex space-x-3">
                  <Button variant="outline" asChild>
                    <a href="/search">
                      <Search className="h-4 w-4 mr-2" />
                      Browse All
                    </a>
                  </Button>
                </div>
              </div>

              <Tabs defaultValue="discover" className="space-y-6">
                <TabsList>
                  <TabsTrigger value="discover">Discover</TabsTrigger>
                  <TabsTrigger value="bookings">My Bookings</TabsTrigger>
                  <TabsTrigger value="wishlist">Wishlist</TabsTrigger>
                  <TabsTrigger value="profile">Profile</TabsTrigger>
                  <TabsTrigger value="settings">Settings & Payment</TabsTrigger>
                </TabsList>
                {renderTabContent()}
              </Tabs>
            </div>
          </div>
        </div>
      </SidebarProvider>
    </CustomerLayout>
  )
}