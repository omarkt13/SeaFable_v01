"use client";

import React, { useState, useEffect } from 'react';
import { BusinessLayout } from "@/components/layouts/BusinessLayout";
import {
  Search,
  Filter,
  Calendar,
  Phone,
  Mail,
  MessageCircle,
  Edit2,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  MoreHorizontal,
  Download,
  RefreshCw,
  MapPin,
  Clock,
  Users,
  DollarSign
} from 'lucide-react';
import { useAuth } from "@/lib/auth-context";
import { getHostBookings, type Booking } from "@/lib/database";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BusinessProtectedRoute } from "@/components/auth/BusinessProtectedRoute";

interface BookingFilters {
  search: string;
  status: string;
  dateRange: {
    start: string;
    end: string;
  };
  activityType: string;
}

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalBookings: number;
  bookingsPerPage: number;
}

const BusinessBookingsPage = () => {
  const { user, businessProfile, isLoading: authLoading } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filters and search
  const [filters, setFilters] = useState<BookingFilters>({
    search: '',
    status: 'all',
    dateRange: {
      start: '',
      end: ''
    },
    activityType: 'all'
  });

  // Pagination
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    totalPages: 1,
    totalBookings: 0,
    bookingsPerPage: 10
  });

  // UI State
  const [selectedBookings, setSelectedBookings] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!authLoading && user?.id) {
      fetchBookings();
    } else if (!authLoading && !user) {
      setError("You must be logged in as a business user to view bookings.");
      setLoading(false);
    }
  }, [user, authLoading, pagination.currentPage, filters]);

  const fetchBookings = async () => {
    if (!user?.id) return;

    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await getHostBookings(user.id);
      if (fetchError) {
        throw new Error(fetchError);
      }

      let filteredBookings = data || [];

      // Apply filters
      if (filters.status !== 'all') {
        filteredBookings = filteredBookings.filter(booking => booking.booking_status === filters.status);
      }

      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        filteredBookings = filteredBookings.filter(booking =>
          booking.experiences?.title?.toLowerCase().includes(searchLower) ||
          `${booking.users?.first_name} ${booking.users?.last_name}`.toLowerCase().includes(searchLower) ||
          booking.users?.email?.toLowerCase().includes(searchLower)
        );
      }

      // Update pagination info
      const totalBookings = filteredBookings.length;
      const totalPages = Math.ceil(totalBookings / pagination.bookingsPerPage);

      // Apply pagination
      const startIndex = (pagination.currentPage - 1) * pagination.bookingsPerPage;
      const paginatedBookings = filteredBookings.slice(startIndex, startIndex + pagination.bookingsPerPage);

      setBookings(paginatedBookings);
      setPagination(prev => ({
        ...prev,
        totalBookings,
        totalPages
      }));
    } catch (err: any) {
      console.error("Failed to fetch bookings:", err);
      setError(err.message || "Failed to load bookings.");
    } finally {
      setLoading(false);
    }
  };

  const refreshBookings = async () => {
    setRefreshing(true);
    await fetchBookings();
    setRefreshing(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric'
    });
  };

  const formatTime = (timeString?: string) => {
    if (!timeString) return 'TBD';
    return timeString.slice(0, 5); // HH:MM format
  };

  const getClientName = (booking: Booking) => {
    if (booking.users) {
      return `${booking.users.first_name} ${booking.users.last_name}`;
    }
    return 'Unknown Client';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-100">Confirmed</Badge>;
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pending</Badge>;
      case 'completed':
        return <Badge variant="default" className="bg-blue-100 text-blue-800 hover:bg-blue-100">Completed</Badge>;
      case 'cancelled_user':
      case 'cancelled_host':
        return <Badge variant="destructive" className="bg-red-100 text-red-800 hover:bg-red-100">Cancelled</Badge>;
      case 'rescheduled':
        return <Badge variant="outline" className="bg-purple-100 text-purple-800 hover:bg-purple-100">Rescheduled</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const generateBookingReference = (booking: Booking) => {
    return booking.id.slice(0, 8).toUpperCase();
  };

  const handleSelectBooking = (bookingId: string) => {
    const newSelected = new Set(selectedBookings);
    if (newSelected.has(bookingId)) {
      newSelected.delete(bookingId);
    } else {
      newSelected.add(bookingId);
    }
    setSelectedBookings(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedBookings.size === bookings.length) {
      setSelectedBookings(new Set());
    } else {
      setSelectedBookings(new Set(bookings.map(b => b.id)));
    }
  };

  const totalSales = bookings.reduce((sum, booking) => sum + (booking.total_price || 0), 0);

  const Skeleton = ({ className }: { className?: string }) => (
    <div className={`animate-pulse bg-gray-200 rounded ${className}`} />
  );

  if (loading) {
    return (
      <BusinessLayout>
        <div className="flex items-center justify-center h-96">
          <div className="flex items-center gap-2">
            <RefreshCw className="h-8 w-8 animate-spin text-gray-500" />
            <span className="text-gray-500">Loading bookings...</span>
          </div>
        </div>
      </BusinessLayout>
    );
  }

  if (error) {
    return (
      <BusinessLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="text-red-500 mb-4">Error Loading Bookings</div>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={() => user?.id && fetchBookings()}>Try Again</Button>
          </div>
        </div>
      </BusinessLayout>
    );
  }

  return (
    <BusinessProtectedRoute>
      <BusinessLayout>
        <div className="flex flex-col h-screen bg-gray-50">
          {/* Header */}
          <div className="bg-white border-b border-gray-200 px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Bookings Overview</h1>
                <p className="text-gray-600 mt-1">Manage your customer bookings and reservations</p>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  onClick={refreshBookings}
                  disabled={refreshing}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
                <Button variant="outline" className="flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  Export
                </Button>
              </div>
            </div>
          </div>

          {/* Filters Bar */}
          <div className="bg-white border-b border-gray-200 px-8 py-4">
            <div className="flex items-center gap-4">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="text"
                  placeholder="Search bookings..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="pl-10"
                />
              </div>

              {/* Status Filter */}
              <Select value={filters.status} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled_user">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-hidden">
            <div className="h-full flex flex-col">
              {/* Bookings Table */}
              <div className="flex-1 overflow-auto">
                <Card className="m-8 shadow-sm">
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                          <tr>
                            <th className="px-6 py-4 text-left">
                              <input
                                type="checkbox"
                                checked={selectedBookings.size === bookings.length && bookings.length > 0}
                                onChange={handleSelectAll}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              />
                            </th>
                            <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                              Experience
                            </th>
                            <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                              Client
                            </th>
                            <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                              Reference
                            </th>
                            <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                              Date & Time
                            </th>
                            <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                              Guests
                            </th>
                            <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                              Contact
                            </th>
                            <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                              Amount
                            </th>
                            <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                              Status
                            </th>
                            <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {bookings.length > 0 ? (
                            bookings.map((booking) => (
                              <tr key={booking.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4">
                                  <input
                                    type="checkbox"
                                    checked={selectedBookings.has(booking.id)}
                                    onChange={() => handleSelectBooking(booking.id)}
                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                  />
                                </td>
                                <td className="px-6 py-4">
                                  <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-teal-500 rounded-lg flex-shrink-0"></div>
                                    <div>
                                      <div className="font-medium text-gray-900">{booking.experiences?.title || 'Unknown Experience'}</div>
                                      <div className="text-sm text-gray-500">
                                        <MapPin className="inline w-3 h-3 mr-1" />
                                        {booking.experiences?.location || 'Location TBD'}
                                      </div>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="font-medium text-gray-900">{getClientName(booking)}</div>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="text-gray-900 font-mono text-sm">{generateBookingReference(booking)}</div>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="text-gray-900">{formatDate(booking.booking_date)}</div>
                                  <div className="text-sm text-gray-500">{formatTime(booking.departure_time)}</div>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="flex items-center text-gray-900">
                                    <Users className="w-4 h-4 mr-1" />
                                    {booking.number_of_guests}
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="space-y-1">
                                    <div className="flex items-center text-sm text-gray-600">
                                      <Mail className="w-3 h-3 mr-1" />
                                      {booking.users?.email || 'No email'}
                                    </div>
                                    <div className="flex items-center text-sm text-gray-600">
                                      <Phone className="w-3 h-3 mr-1" />
                                      {booking.users?.phone || 'No phone'}
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="font-medium text-green-600">
                                    {formatCurrency(booking.total_price || 0)}
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  {getStatusBadge(booking.booking_status)}
                                </td>
                                <td className="px-6 py-4">
                                  <div className="flex items-center gap-2">
                                    <Button variant="ghost" size="sm">
                                      <MessageCircle className="w-4 h-4" />
                                    </Button>
                                    <Button variant="ghost" size="sm">
                                      <Edit2 className="w-4 h-4" />
                                    </Button>
                                  </div>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={10} className="px-6 py-12 text-center">
                                <div className="flex flex-col items-center">
                                  <Calendar className="w-12 h-12 text-gray-400 mb-4" />
                                  <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings found</h3>
                                  <p className="text-gray-500">When customers make bookings, they'll appear here.</p>
                                </div>
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Footer with Summary and Pagination */}
              <div className="bg-white border-t border-gray-200 px-8 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-8 text-sm text-gray-600">
                    <span>Total Bookings: <strong>{pagination.totalBookings}</strong></span>
                    <span>Total Sales: <strong className="text-green-600">{formatCurrency(totalSales)}</strong></span>
                  </div>

                  {/* Pagination */}
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPagination(prev => ({ ...prev, currentPage: Math.max(1, prev.currentPage - 1) }))}
                      disabled={pagination.currentPage === 1}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>

                    <span className="px-4 py-2 text-sm text-gray-700">
                      {pagination.currentPage} of {pagination.totalPages}
                    </span>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPagination(prev => ({ ...prev, currentPage: Math.min(prev.totalPages, prev.currentPage + 1) }))}
                      disabled={pagination.currentPage === pagination.totalPages}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </BusinessLayout>
    </BusinessProtectedRoute>
  );
};

export default BusinessBookingsPage;