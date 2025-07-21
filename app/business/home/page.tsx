"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { getHostDashboardData } from "@/lib/database";
import type { BusinessDashboardData } from "@/lib/database";
import { BusinessLayout } from "@/components/layouts/BusinessLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Calendar,
  TrendingUp,
  Users,
  Star,
  Plus,
  Euro,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  MapPin
} from "lucide-react";

interface DashboardData {
  overview: {
    totalRevenue: number;
    activeBookings: number;
    totalExperiences: number;
    averageRating: number;
    revenueGrowth: number;
    bookingGrowth: number;
    paymentsReceived: number;
    bookingsMade: number;
    bookingsFulfilled: number;
  };
  recentBookings: Array<{
    id: string;
    customerName: string;
    experienceTitle: string;
    date: string;
    amount: number;
    guests: number;
    avatar: string;
    status: string;
  }>;
  upcomingBookings: Array<{
    id: string;
    customerName: string;
    experienceTitle: string;
    date: string;
    time: string;
    guests: number;
    specialRequests?: string;
    phone?: string;
  }>;
  notifications: Array<{
    id: string;
    type: 'booking' | 'payment' | 'review' | 'alert';
    message: string;
    time: string;
    unread: boolean;
  }>;
}

export default function BusinessHomePage() {
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { user, businessProfile, userType, isLoading: authLoading, signOut } = useAuth();

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push("/business/login");
        return;
      }
      if (userType !== "business") {
        router.push("/login");
        return;
      }
      if (businessProfile) {
        loadDashboardData();
      }
    }
  }, [user, businessProfile, userType, authLoading, router]);

  const loadDashboardData = async () => {
    if (!businessProfile) return;

    try {
      setIsLoading(true);
      setError(null);

      console.log("Loading dashboard data for host:", businessProfile.id);

      const result = await getHostDashboardData(businessProfile.id);

      if (result.success && result.data) {
        const data = result.data;

        // Transform the data to match our component interface
        const transformedData: DashboardData = {
          overview: {
            totalRevenue: data.overview.totalRevenue,
            activeBookings: data.overview.activeBookings,
            totalExperiences: data.overview.totalExperiences,
            averageRating: data.overview.averageRating,
            revenueGrowth: data.overview.revenueGrowth,
            bookingGrowth: data.overview.bookingGrowth,
            paymentsReceived: data.overview.totalRevenue,
            bookingsMade: data.overview.activeBookings,
            bookingsFulfilled: Math.floor(data.overview.activeBookings * 0.8),
          },
          recentBookings: data.recentBookings,
          upcomingBookings: data.upcomingBookings,
          notifications: [
            {
              id: '1',
              type: 'booking',
              message: 'New booking received for tomorrow',
              time: '2 hours ago',
              unread: true
            },
            {
              id: '2',
              type: 'payment',
              message: 'Payment received for last week\'s adventure',
              time: '1 day ago',
              unread: false
            }
          ]
        };

        setDashboardData(transformedData);
      } else {
        setError(result.error || "Failed to load dashboard data");
      }
    } catch (err: any) {
      console.error("Dashboard loading error:", err);
      setError(err.message || "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return 'text-green-600 bg-green-50';
      case 'pending':
        return 'text-yellow-600 bg-yellow-50';
      case 'completed':
        return 'text-blue-600 bg-blue-50';
      case 'cancelled':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return <CheckCircle className="h-4 w-4" />;
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  if (authLoading || isLoading) {
    return (
      <BusinessLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </BusinessLayout>
    );
  }

  if (error) {
    return (
      <BusinessLayout>
        <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
          <AlertCircle className="h-12 w-12 text-red-500" />
          <h2 className="text-xl font-semibold text-gray-900">Error Loading Dashboard</h2>
          <p className="text-gray-600 text-center max-w-md">{error}</p>
          <Button onClick={loadDashboardData} variant="outline">
            Try Again
          </Button>
        </div>
      </BusinessLayout>
    );
  }

  if (!dashboardData) {
    return (
      <BusinessLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No Data Available</h2>
            <p className="text-gray-600">Unable to load dashboard data.</p>
          </div>
        </div>
      </BusinessLayout>
    );
  }

  return (
    <BusinessLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome back, {businessProfile?.name || businessProfile?.business_name}!
            </h1>
            <p className="text-gray-600 mt-1">
              Here's what's happening with your adventures today.
            </p>
          </div>
          <Button onClick={() => router.push("/business/adventures/new")} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            New Adventure
          </Button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">
                    €{dashboardData.overview.totalRevenue.toLocaleString()}
                  </p>
                </div>
                <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Euro className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center">
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-sm text-green-600">
                  +{dashboardData.overview.revenueGrowth.toFixed(1)}% from last month
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active Bookings</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {dashboardData.overview.activeBookings}
                  </p>
                </div>
                <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center">
                <TrendingUp className="h-4 w-4 text-blue-500 mr-1" />
                <span className="text-sm text-blue-600">
                  +{dashboardData.overview.bookingGrowth.toFixed(1)}% from last month
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Adventures</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {dashboardData.overview.totalExperiences}
                  </p>
                </div>
                <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <MapPin className="h-6 w-6 text-purple-600" />
                </div>
              </div>
              <div className="mt-4">
                <span className="text-sm text-gray-600">
                  Active adventures
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Average Rating</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {dashboardData.overview.averageRating.toFixed(1)}
                  </p>
                </div>
                <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Star className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
              <div className="mt-4">
                <span className="text-sm text-gray-600">
                  From customer reviews
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Bookings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Recent Bookings
                <Button variant="outline" size="sm" onClick={() => router.push("/business/bookings")}>
                  View All
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dashboardData.recentBookings.length > 0 ? (
                  dashboardData.recentBookings.map((booking) => (
                    <div key={booking.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                          <Users className="h-5 w-5 text-gray-500" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{booking.customerName}</p>
                          <p className="text-sm text-gray-600">{booking.experienceTitle}</p>
                          <p className="text-xs text-gray-500">{booking.date}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">€{booking.amount}</p>
                        <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                          {getStatusIcon(booking.status)}
                          {booking.status}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Calendar className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                    <p>No recent bookings</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Bookings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Upcoming Bookings
                <Button variant="outline" size="sm" onClick={() => router.push("/business/calendar")}>
                  View Calendar
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dashboardData.upcomingBookings.length > 0 ? (
                  dashboardData.upcomingBookings.map((booking) => (
                    <div key={booking.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-blue-600">
                            {new Date(booking.date).getDate()}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{booking.customerName}</p>
                          <p className="text-sm text-gray-600">{booking.experienceTitle}</p>
                          <p className="text-xs text-gray-500">{booking.date} at {booking.time}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">{booking.guests} guests</p>
                        <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-50 text-green-600">
                          <CheckCircle className="h-3 w-3" />
                          Confirmed
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Clock className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                    <p>No upcoming bookings</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button 
                variant="outline" 
                className="h-20 flex flex-col items-center justify-center space-y-2"
                onClick={() => router.push("/business/adventures/new")}
              >
                <Plus className="h-6 w-6" />
                <span className="text-sm">New Adventure</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-20 flex flex-col items-center justify-center space-y-2"
                onClick={() => router.push("/business/bookings")}
              >
                <Calendar className="h-6 w-6" />
                <span className="text-sm">View Bookings</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-20 flex flex-col items-center justify-center space-y-2"
                onClick={() => router.push("/business/earnings")}
              >
                <Euro className="h-6 w-6" />
                <span className="text-sm">Earnings</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-20 flex flex-col items-center justify-center space-y-2"
                onClick={() => router.push("/business/settings")}
              >
                <Users className="h-6 w-6" />
                <span className="text-sm">Settings</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </BusinessLayout>
  );
}