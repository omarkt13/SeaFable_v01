"use client"
import { CustomerLayout } from "@/components/layouts/CustomerLayout"
import { CustomerProtectedRoute } from "@/components/auth/CustomerProtectedRoute"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { OverviewTab } from "@/components/dashboard/overview-tab"
import { BookingsTab } from "@/components/dashboard/bookings-tab"
import { WishlistTab } from "@/components/dashboard/wishlist-tab"
import { ProfileTab } from "@/components/dashboard/profile-tab"
import { SettingsTab } from "@/components/dashboard/settings-tab"

// Mock data for recommendations and achievements (since they are not directly from DB yet)
const mockRecommendations = [
  {
    id: "rec_001",
    title: "Advanced Sailing Workshop",
    host: "Captain Rodriguez",
    location: "San Diego",
    price: 275,
    rating: 4.9,
    reviews: 156,
    duration: "Full Day",
    difficulty: "intermediate",
    image: "/placeholder.svg?height=200&width=300&text=Sailing",
    matchReason: "Based on your sailing experience",
    savings: 50,
  },
  {
    id: "rec_002",
    title: "Whale Watching Expedition",
    host: "Marine Wildlife Tours",
    location: "Monterey",
    price: 95,
    rating: 4.8,
    reviews: 89,
    duration: "3 hours",
    difficulty: "beginner",
    image: "/placeholder.svg?height=200&width=300&text=Whale Watching",
    isNew: true,
    matchReason: "Popular in your area",
  },
]

const mockAchievements = [
  { name: "First Adventure", icon: "🏆", earned: true, date: "2023-05-20" },
  { name: "Ocean Explorer", icon: "🌊", earned: true, date: "2023-08-15" },
  { name: "Review Master", icon: "⭐", earned: true, date: "2023-12-01" },
  { name: "Safety First", icon: "🛡️", earned: false, progress: 75 },
  { name: "Global Traveler", icon: "🌍", earned: false, progress: 60 },
]

export default function DashboardPage() {
  return (
    <CustomerProtectedRoute>
      <CustomerLayout>
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-8">Your Dashboard</h1>

          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="bookings">Bookings</TabsTrigger>
              <TabsTrigger value="wishlist">Wishlist</TabsTrigger>
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <OverviewTab />
            </TabsContent>

            <TabsContent value="bookings">
              <BookingsTab />
            </TabsContent>

            <TabsContent value="wishlist">
              <WishlistTab />
            </TabsContent>

            <TabsContent value="profile">
              <ProfileTab />
            </TabsContent>

            <TabsContent value="settings">
              <SettingsTab />
            </TabsContent>
          </Tabs>
        </div>
      </CustomerLayout>
    </CustomerProtectedRoute>
  )
}
