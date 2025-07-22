export const mockBusinessData = {
  businessProfile: {
    name: "SeaFable Adventures",
    type: "Tour Operator",
    email: "info@seafable.com",
    phone: "+1 (555) 123-4567",
    address: "123 Ocean Drive, Coastal City, CA 90210",
    description: "Providing unforgettable marine experiences.",
    logoUrl: "/placeholder-logo.png",
  },
  dashboardStats: {
    totalBookings: 120,
    totalRevenue: 25000,
    averageRating: 4.8,
    upcomingBookings: 15,
  },
  recentActivity: [
    { id: "1", type: "New Booking", description: "John Doe booked 'Sunset Cruise'", time: "2 hours ago" },
    {
      id: "2",
      type: "Review",
      description: "Jane Smith left a 5-star review for 'Dolphin Watching'",
      time: "1 day ago",
    },
    { id: "3", type: "Experience Added", description: "'Deep Sea Fishing' experience created", time: "3 days ago" },
  ],
  earningsSummary: {
    monthly: [
      { month: "Jan", earnings: 1500 },
      { month: "Feb", earnings: 2000 },
      { month: "Mar", earnings: 2800 },
      { month: "Apr", earnings: 3500 },
      { month: "May", earnings: 4200 },
      { month: "Jun", earnings: 5000 },
    ],
    yearly: 25000,
  },
  performanceMetrics: {
    bookingConversionRate: "5.2%",
    customerRetentionRate: "78%",
    websiteTraffic: "15,000",
  },
  quickActions: [
    { name: "Add New Experience", href: "/business/experiences/new" },
    { name: "View Bookings", href: "/business/bookings" },
    { name: "Manage Team", href: "/business/team" },
  ],
  recentBookings: [
    {
      id: "b1",
      customerName: "Alice Wonderland",
      experience: "Coral Reef Snorkel",
      date: "2024-07-10",
      status: "Confirmed",
    },
    {
      id: "b2",
      customerName: "Bob The Builder",
      experience: "Deep Sea Fishing",
      date: "2024-07-08",
      status: "Pending",
    },
    { id: "b3", customerName: "Charlie Chaplin", experience: "Sunset Cruise", date: "2024-07-05", status: "Completed" },
  ],
  upcomingBookings: [
    {
      id: "u1",
      customerName: "David Copperfield",
      experience: "Dolphin Watching",
      date: "2024-07-20",
      time: "10:00 AM",
    },
    {
      id: "u2",
      customerName: "Eve Harrington",
      experience: "Kayaking Adventure",
      date: "2024-07-22",
      time: "02:00 PM",
    },
  ],
  experiencePerformance: [
    { id: "e1", name: "Sunset Cruise", bookings: 50, revenue: 10000, rating: 4.9 },
    { id: "e2", name: "Dolphin Watching", bookings: 35, revenue: 7000, rating: 4.7 },
    { id: "e3", name: "Coral Reef Snorkel", bookings: 20, revenue: 4000, rating: 4.8 },
  ],
}
