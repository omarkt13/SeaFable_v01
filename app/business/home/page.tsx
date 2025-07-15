"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DefaultPageLayout } from "@/ui/layouts/DefaultPageLayout";
import { IconWithBackground } from "@/ui/components/IconWithBackground";
import { FeatherLayout } from "@subframe/core";
import { Button } from "@/ui/components/Button";
import { FeatherHome } from "@subframe/core";
import { FeatherCalendar } from "@subframe/core";
import { FeatherUsers } from "@subframe/core";
import { FeatherDollarSign } from "@subframe/core";
import { FeatherSettings } from "@subframe/core";
import { TextField } from "@/ui/components/TextField";
import { IconButton } from "@/ui/components/IconButton";
import { FeatherBell } from "@subframe/core";
import { DropdownMenu } from "@/ui/components/DropdownMenu";
import { FeatherUser } from "@subframe/core";
import { FeatherLogOut } from "@subframe/core";
import * as SubframeCore from "@subframe/core";
import { FeatherChevronDown } from "@subframe/core";
import { FeatherPlus } from "@subframe/core";
import { Badge } from "@/ui/components/Badge";
import { FeatherShip, FeatherStar, FeatherBook } from "@subframe/core";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/auth-utils";
import { AlertCircle } from "lucide-react";

interface DashboardData {
  overview: {
    totalRevenue: number;
    activeBookings: number;
    totalExperiences: number;
    averageRating: number;
    revenueGrowth: number;
    bookingGrowth: number;
    bookingsMade: number;
    paymentsReceived: number;
    bookingsFulfilled: number;
  };
  recentBookings: Array<{
    id: string;
    customerName: string;
    experienceTitle: string;
    date: string;
    status: string;
    amount: number;
    guests: number;
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
  earnings: {
    thisMonth: number;
    lastMonth: number;
    pending: number;
    nextPayout: {
      amount: number;
      date: string;
    };
  };
  analytics: {
    conversionRate: number;
    customerSatisfaction: number;
    repeatCustomerRate: number;
    marketplaceVsDirectRatio: number;
  };
  notifications: Array<{
    id: string;
    message: string;
    type: "info" | "warning" | "success" | "error";
    timestamp: string;
  }>;
}

export default function BusinessHomePage() {
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
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

      // Initialize default values
      let totalRevenue = 0;
      let activeBookings = 0;
      let totalExperiences = 0;
      let averageRating = 0;
      let bookingsMade = 0;
      let paymentsReceived = 0;
      let bookingsFulfilled = 0;
      let recentBookings: any[] = [];
      let upcomingBookings: any[] = [];
      let notifications: any[] = [];

      // Get experiences
      try {
        const { data: experiences, error: expError } = await supabase
          .from("experiences")
          .select("id, title, rating")
          .eq("host_id", businessProfile.id)
          .eq("is_active", true);

        if (!expError && experiences) {
          totalExperiences = experiences.length;
          if (experiences.length > 0) {
            const totalRating = experiences.reduce((sum, exp) => sum + (Number(exp.rating) || 0), 0);
            averageRating = totalRating / experiences.length;
          }
          console.log("Experiences loaded:", totalExperiences);
        } else {
          console.log("Experiences error:", expError?.message);
        }
      } catch (error) {
        console.error("Error loading experiences:", error);
      }

      // Get bookings
      try {
        const today = new Date().toISOString().split("T")[0];
        const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split("T")[0];

        const { data: bookings, error: bookingsError } = await supabase
          .from("bookings")
          .select(`
            id,
            total_price,
            booking_status,
            booking_date,
            number_of_guests,
            departure_time,
            special_requests,
            created_at,
            payment_status,
            users!bookings_user_id_fkey(first_name, last_name),
            experiences!bookings_experience_id_fkey(title)
          `)
          .eq("host_id", businessProfile.id);

        if (!bookingsError && bookings) {
          console.log("Total bookings found:", bookings.length);

          // Monthly Stats
          const currentMonthBookings = bookings.filter((b) => b.created_at >= startOfMonth && b.created_at <= today);
          bookingsMade = currentMonthBookings.length;
          paymentsReceived = currentMonthBookings
            .filter((b) => b.payment_status === "paid" || b.payment_status === "completed")
            .reduce((sum, b) => sum + (Number(b.total_price) || 0), 0);
          bookingsFulfilled = currentMonthBookings.filter((b) => b.booking_status === "completed").length;

          // Active bookings (future confirmed/pending)
          activeBookings = bookings.filter(
            (b) => (b.booking_status === "confirmed" || b.booking_status === "pending") && b.booking_date >= today,
          ).length;

          // Calculate total revenue from all confirmed bookings (for overall earnings)
          totalRevenue = bookings
            .filter((b) => b.booking_status === "confirmed")
            .reduce((sum, booking) => {
              return sum + (Number(booking.total_price) || 0);
            }, 0);

          // Apply platform fee (approximate net revenue)
          totalRevenue = Math.round(totalRevenue * 0.85); // 15% platform fee

          // Recent bookings
          recentBookings = bookings
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
            .slice(0, 5)
            .map((booking) => ({
              id: booking.id,
              customerName: booking.users
                ? `${booking.users.first_name || "Unknown"} ${booking.users.last_name || "Customer"}`
                : "Unknown Customer",
              experienceTitle: booking.experiences?.title || "Water Activity",
              date: booking.booking_date,
              status: booking.booking_status,
              amount: Number(booking.total_price || 0),
              guests: booking.number_of_guests || 1,
            }));

          // Upcoming bookings
          upcomingBookings = bookings
            .filter((b) => b.booking_status === "confirmed" && b.booking_date >= today)
            .sort((a, b) => new Date(a.booking_date).getTime() - new Date(b.booking_date).getTime())
            .slice(0, 5)
            .map((booking) => ({
              id: booking.id,
              customerName: booking.users
                ? `${booking.users.first_name || "Unknown"} ${booking.users.last_name || "Customer"}`
                : "Unknown Customer",
              experienceTitle: booking.experiences?.title || "Water Activity",
              date: booking.booking_date,
              time: booking.departure_time || "09:00",
              guests: booking.number_of_guests || 1,
              specialRequests: booking.special_requests,
              phone: booking.users?.phone || "N/A",
            }));

          console.log("Active bookings:", activeBookings, "Revenue:", totalRevenue, "Fulfilled:", bookingsFulfilled);
        } else {
          console.log("Bookings error:", bookingsError?.message);
        }
      } catch (error) {
        console.error("Error loading bookings:", error);
      }

      // Placeholder Notifications
      notifications = [
        {
          id: "1",
          message: "New booking confirmed for 'Sunset Kayak Tour' on 2024-07-15.",
          type: "success",
          timestamp: "2 hours ago",
        },
        {
          id: "2",
          message: "Your 'Diving Expedition' experience is low on availability for next week.",
          type: "warning",
          timestamp: "1 day ago",
        },
        { id: "3", message: "Payment received for booking #12345.", type: "info", timestamp: "3 days ago" },
        {
          id: "4",
          message: "Review your business settings for optimal performance.",
          type: "info",
          timestamp: "5 days ago",
        },
      ];

      // Build dashboard data
      const data: DashboardData = {
        overview: {
          totalRevenue: Math.round(totalRevenue),
          activeBookings,
          totalExperiences,
          averageRating: Math.round(averageRating * 10) / 10,
          revenueGrowth: 12, // Placeholder
          bookingGrowth: 8, // Placeholder
          bookingsMade,
          paymentsReceived: Math.round(paymentsReceived),
          bookingsFulfilled,
        },
        recentBookings,
        upcomingBookings,
        earnings: {
          thisMonth: Math.round(paymentsReceived), // Use paymentsReceived for thisMonth earnings
          lastMonth: 0, // Placeholder
          pending: Math.round(totalRevenue * 0.3), // Placeholder
          nextPayout: {
            amount: Math.round(totalRevenue * 0.3), // Placeholder
            date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
          },
        },
        analytics: {
          conversionRate: 68, // Placeholder
          customerSatisfaction: averageRating,
          repeatCustomerRate: 34, // Placeholder
          marketplaceVsDirectRatio: 60, // Placeholder
        },
        notifications,
      };

      setDashboardData(data);
      console.log("Dashboard data loaded successfully");
    } catch (error) {
      console.error("Error loading dashboard:", error);
      setError(error instanceof Error ? error.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "confirmed":
      case "completed":
        return "success";
      case "pending":
        return "warning";
      case "cancelled_user":
      case "cancelled_host":
        return "error";
      default:
        return "neutral";
    }
  };

  const handleLogout = async () => {
    await signOut();
    router.push("/business/login");
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading your business dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Dashboard</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <div className="space-y-2">
            <Button onClick={() => loadDashboardData()}>Try Again</Button>
            <Button variant="neutral-secondary" onClick={() => router.push("/business/experiences")}>
              Manage Experiences
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return null;
  }

  return (
    <DefaultPageLayout>
      <div className="flex h-full w-full items-start">
        <div className="flex w-64 flex-none flex-col items-start gap-8 self-stretch border-r border-solid border-neutral-border bg-brand-50 px-6 py-8">
          <div className="flex items-center gap-2">
            <IconWithBackground
              size="large"
              icon={<FeatherLayout />}
              square={true}
            />
            <span className="text-heading-2 font-heading-2 text-default-font">
              {businessProfile?.businessName || "Dashboard"}
            </span>
          </div>
          <div className="flex w-full flex-col items-start gap-2">
            <Button
              className="h-8 w-full flex-none justify-start"
              variant="brand-primary"
              icon={<FeatherHome />}
              onClick={() => router.push("/business/home")}
            >
              Home
            </Button>
            <Button
              className="h-8 w-full flex-none justify-start"
              variant="neutral-tertiary"
              icon={<FeatherCalendar />}
              onClick={() => router.push("/business/calendar")}
            >
              Calendar
            </Button>
            <Button
              className="h-8 w-full flex-none justify-start"
              variant="neutral-tertiary"
              icon={<FeatherUsers />}
              onClick={() => router.push("/business/clients")}
            >
              Clients
            </Button>
            <Button
              className="h-8 w-full flex-none justify-start"
              variant="neutral-tertiary"
              icon={<FeatherDollarSign />}
              onClick={() => router.push("/business/sales")}
            >
              Finance
            </Button>
            <Button
              className="h-8 w-full flex-none justify-start"
              variant="neutral-tertiary"
              icon={<FeatherBook />}
              onClick={() => router.push("/business/experiences")}
            >
              Experiences
            </Button>
            <Button
              className="h-8 w-full flex-none justify-start"
              variant="neutral-tertiary"
              icon={<FeatherSettings />}
              onClick={() => router.push("/business/settings")}
            >
              Settings
            </Button>
          </div>
        </div>
        <div className="flex flex-col items-start grow">
          <div className="flex w-full items-center justify-between border-b border-solid border-neutral-border px-8 py-4">
            <TextField label="" helpText="">
              <TextField.Input
                placeholder="Search..."
                value={searchQuery}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                  setSearchQuery(event.target.value);
                }}
              />
            </TextField>
            <div className="flex items-center gap-4">
              <IconButton
                icon={<FeatherBell />}
                onClick={() => {}}
              />
              <SubframeCore.DropdownMenu.Root>
                <SubframeCore.DropdownMenu.Trigger asChild={true}>
                  <Button
                    variant="neutral-tertiary"
                    iconRight={<FeatherChevronDown />}
                    onClick={() => {}}
                  >
                    {businessProfile?.businessName || businessProfile?.name || "Business Owner"}
                  </Button>
                </SubframeCore.DropdownMenu.Trigger>
                <SubframeCore.DropdownMenu.Portal>
                  <SubframeCore.DropdownMenu.Content
                    side="bottom"
                    align="end"
                    sideOffset={4}
                    asChild={true}
                  >
                    <DropdownMenu>
                      <DropdownMenu.DropdownItem 
                        icon={<FeatherUser />}
                        onClick={() => router.push("/business/settings")}
                      >
                        Profile
                      </DropdownMenu.DropdownItem>
                      <DropdownMenu.DropdownItem 
                        icon={<FeatherSettings />}
                        onClick={() => router.push("/business/settings")}
                      >
                        Settings
                      </DropdownMenu.DropdownItem>
                      <DropdownMenu.DropdownDivider />
                      <DropdownMenu.DropdownItem 
                        icon={<FeatherLogOut />}
                        onClick={handleLogout}
                      >
                        Logout
                      </DropdownMenu.DropdownItem>
                    </DropdownMenu>
                  </SubframeCore.DropdownMenu.Content>
                </SubframeCore.DropdownMenu.Portal>
              </SubframeCore.DropdownMenu.Root>
            </div>
          </div>
          <div className="flex w-full flex-col items-start gap-8 px-8 py-8 overflow-auto">
            <div className="flex w-full flex-wrap items-start gap-4">
              <div className="flex grow shrink-0 basis-0 flex-col items-start gap-2 rounded-md border border-solid border-neutral-border bg-default-background px-6 py-6">
                <div className="flex w-full items-center justify-between">
                  <IconWithBackground icon={<FeatherShip />} />
                  <span className="text-caption font-caption text-subtext-color">
                    Total
                  </span>
                </div>
                <span className="text-heading-1 font-heading-1 text-default-font">
                  {dashboardData.overview.totalExperiences}
                </span>
                <span className="text-body font-body text-subtext-color">
                  Experiences
                </span>
              </div>
              <div className="flex grow shrink-0 basis-0 flex-col items-start gap-2 rounded-md border border-solid border-neutral-border bg-default-background px-6 py-6">
                <div className="flex w-full items-center justify-between">
                  <IconWithBackground
                    variant="success"
                    icon={<FeatherCalendar />}
                  />
                  <span className="text-caption font-caption text-subtext-color">
                    Active
                  </span>
                </div>
                <span className="text-heading-1 font-heading-1 text-default-font">
                  {dashboardData.overview.activeBookings}
                </span>
                <span className="text-body font-body text-subtext-color">
                  Bookings
                </span>
              </div>
              <div className="flex grow shrink-0 basis-0 flex-col items-start gap-2 rounded-md border border-solid border-neutral-border bg-default-background px-6 py-6">
                <div className="flex w-full items-center justify-between">
                  <IconWithBackground
                    variant="error"
                    icon={<FeatherDollarSign />}
                  />
                  <span className="text-caption font-caption text-subtext-color">
                    This month
                  </span>
                </div>
                <span className="text-heading-1 font-heading-1 text-default-font">
                  €{dashboardData.overview.paymentsReceived.toLocaleString()}
                </span>
                <span className="text-body font-body text-subtext-color">
                  Revenue
                </span>
              </div>
              <div className="flex grow shrink-0 basis-0 flex-col items-start gap-2 rounded-md border border-solid border-neutral-border bg-default-background px-6 py-6">
                <div className="flex w-full items-center justify-between">
                  <IconWithBackground
                    variant="warning"
                    icon={<FeatherStar />}
                  />
                  <span className="text-caption font-caption text-subtext-color">
                    Average
                  </span>
                </div>
                <span className="text-heading-1 font-heading-1 text-default-font">
                  {dashboardData.overview.averageRating.toFixed(1)}
                </span>
                <span className="text-body font-body text-subtext-color">
                  Rating
                </span>
              </div>
            </div>
            <div className="flex w-full flex-col items-start gap-4">
              <div className="flex w-full items-center justify-between">
                <span className="text-heading-2 font-heading-2 text-default-font">
                  Upcoming Bookings
                </span>
                <Button
                  icon={<FeatherPlus />}
                  onClick={() => router.push("/business/experiences/new")}
                >
                  New Experience
                </Button>
              </div>
              <div className="flex w-full flex-col items-start gap-2 rounded-md border border-solid border-neutral-border bg-default-background px-6 py-6">
                {dashboardData.upcomingBookings.length > 0 ? (
                  dashboardData.upcomingBookings.map((booking, index) => (
                    <div 
                      key={booking.id}
                      className={`flex w-full items-center gap-4 ${
                        index < dashboardData.upcomingBookings.length - 1 ? "border-b border-solid border-neutral-border pb-4" : ""
                      }`}
                    >
                      <div className="flex h-12 w-12 flex-none items-center justify-center rounded-md bg-brand-50">
                        <span className="text-heading-2 font-heading-2 text-brand-600">
                          {new Date(booking.date).getDate().toString().padStart(2, '0')}
                        </span>
                      </div>
                      <div className="flex flex-col items-start grow">
                        <span className="text-body-bold font-body-bold text-default-font">
                          {booking.customerName}
                        </span>
                        <span className="text-body font-body text-subtext-color">
                          {booking.experienceTitle} - {booking.time}
                        </span>
                        <span className="text-caption font-caption text-subtext-color">
                          {booking.guests} guests • {new Date(booking.date).toLocaleDateString()}
                        </span>
                      </div>
                      <Badge variant="success">Confirmed</Badge>
                    </div>
                  ))
                ) : (
                  <div className="flex w-full items-center justify-center py-8">
                    <div className="text-center">
                      <FeatherCalendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <span className="text-body font-body text-subtext-color">
                        No upcoming bookings
                      </span>
                      <div className="mt-2">
                        <Button
                          variant="neutral-secondary"
                          onClick={() => router.push("/business/experiences")}
                        >
                          Set Your Availability
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            {dashboardData.recentBookings.length > 0 && (
              <div className="flex w-full flex-col items-start gap-4">
                <span className="text-heading-2 font-heading-2 text-default-font">
                  Recent Bookings
                </span>
                <div className="flex w-full flex-col items-start gap-2 rounded-md border border-solid border-neutral-border bg-default-background px-6 py-6">
                  {dashboardData.recentBookings.map((booking, index) => (
                    <div 
                      key={booking.id}
                      className={`flex w-full items-center gap-4 ${
                        index < dashboardData.recentBookings.length - 1 ? "border-b border-solid border-neutral-border pb-4" : ""
                      }`}
                    >
                      <div className="flex h-12 w-12 flex-none items-center justify-center rounded-md bg-brand-50">
                        <span className="text-heading-2 font-heading-2 text-brand-600">
                          {new Date(booking.date).getDate().toString().padStart(2, '0')}
                        </span>
                      </div>
                      <div className="flex flex-col items-start grow">
                        <span className="text-body-bold font-body-bold text-default-font">
                          {booking.customerName}
                        </span>
                        <span className="text-body font-body text-subtext-color">
                          {booking.experienceTitle}
                        </span>
                        <span className="text-caption font-caption text-subtext-color">
                          {booking.guests} guests • €{booking.amount}
                        </span>
                      </div>
                      <Badge variant={getStatusBadgeVariant(booking.status)}>
                        {booking.status.replace("_", " ")}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DefaultPageLayout>
  );
}
