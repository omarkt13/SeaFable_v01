"use client";

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
  Home,
  Users,
  MessageCircle,
  Calendar,
  Handshake,
  DollarSign,
  Settings,
  Bell,
  ChevronDown,
  CheckCircle,
  Shield,
  CreditCard,
  Plus,
  Cloud,
  ChevronLeft,
  ChevronRight,
  Edit2,
  Eye,
  User,
  LogOut,
  Search
} from 'lucide-react';
import { getHostDashboardData } from '@/lib/database';

// Adapted Types for SeaFable Schema
interface Booking {
  id: string;
  user_id: string;
  experience_id: string;
  host_id: string;
  booking_date: string;
  departure_time: string;
  number_of_guests: number;
  total_price: number;
  booking_status: 'pending' | 'confirmed' | 'cancelled_user' | 'cancelled_host' | 'completed' | 'rescheduled';
  created_at: string;
  updated_at: string;
  experiences?: {
    title: string;
    duration_hours: number;
    max_guests: number;
  };
  users?: {
    first_name: string;
    last_name: string;
  };
}

interface Stats {
  revenue: number;
  active_bookings: number;
  total_clients: number;
  total_experiences: number;
}

interface WeeklyBookings {
  [key: string]: Booking[];
}

interface HostProfile {
  id: string;
  name: string;
  bio?: string;
  rating: number;
  total_reviews: number;
}

const BusinessDashboard = () => {
  const [stats, setStats] = useState<Stats>({
    revenue: 0,
    active_bookings: 0,
    total_clients: 0,
    total_experiences: 0
  });
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
  const [weeklyBookings, setWeeklyBookings] = useState<WeeklyBookings>({});
  const [hostProfile, setHostProfile] = useState<HostProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentWeek, setCurrentWeek] = useState('March 18 - 24');
  const [searchQuery, setSearchQuery] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  // Get current host profile
  useEffect(() => {
    getCurrentHost();
  }, []);

  // Fetch dashboard data when host is loaded
  useEffect(() => {
    if (hostProfile) {
      fetchDashboardData();
    }
  }, [hostProfile]);

  const getCurrentHost = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError('No authenticated user found');
        setLoading(false);
        return;
      }

      const { data: profile, error } = await supabase
        .from('host_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching host profile:', error);
        setError(`Error fetching host profile: ${error.message}`);
        setLoading(false);
        return;
      }

      setHostProfile(profile);
    } catch (error) {
      console.error('Error in getCurrentHost:', error);
      setError('Failed to get current host');
      setLoading(false);
    }
  };

  const fetchDashboardData = async () => {
    if (!hostProfile) return;

    try {
      const result = await getHostDashboardData(hostProfile.id);

      if (result.success && result.data) {
        const dashboardData = result.data;

        // Update stats
        setStats({
          revenue: dashboardData.overview.totalRevenue,
          active_bookings: dashboardData.overview.activeBookings,
          total_clients: 0, // Calculate from bookings
          total_experiences: dashboardData.overview.totalExperiences
        });

        // Update recent bookings
        const formattedBookings = dashboardData.recentBookings.map(booking => ({
          id: booking.id,
          user_id: '',
          experience_id: '',
          host_id: hostProfile.id,
          booking_date: booking.date,
          departure_time: '',
          number_of_guests: booking.guests,
          total_price: booking.amount,
          booking_status: booking.status as any,
          created_at: '',
          updated_at: '',
          experiences: {
            title: booking.experienceTitle,
            duration_hours: 0,
            max_guests: 0
          },
          users: {
            first_name: booking.customerName.split(' ')[0] || '',
            last_name: booking.customerName.split(' ')[1] || ''
          }
        }));

        setRecentBookings(formattedBookings);
      } else {
        setError(result.error || 'Failed to fetch dashboard data');
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <h2 className="font-bold">Error</h2>
            <p>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-400 hover:text-gray-500">
                <Bell className="h-6 w-6" />
              </button>
              <div className="relative">
                <button 
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center space-x-2 text-gray-700 hover:text-gray-900"
                >
                  <User className="h-8 w-8 rounded-full bg-gray-200 p-1" />
                  <span>{hostProfile?.name || 'Host'}</span>
                  <ChevronDown className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">€{stats.revenue.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Bookings</p>
                <p className="text-2xl font-bold text-gray-900">{stats.active_bookings}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Clients</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total_clients}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <Handshake className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Experiences</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total_experiences}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Bookings */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Recent Bookings</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Experience
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Guests
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentBookings.map((booking) => (
                  <tr key={booking.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                            <User className="h-5 w-5 text-gray-500" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {booking.users?.first_name} {booking.users?.last_name}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{booking.experiences?.title}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{booking.booking_date}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{booking.number_of_guests}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">€{booking.total_price}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        booking.booking_status === 'confirmed' 
                          ? 'bg-green-100 text-green-800'
                          : booking.booking_status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {booking.booking_status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button className="w-full flex items-center px-4 py-2 text-sm text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100">
                <Plus className="h-4 w-4 mr-2" />
                Add New Experience
              </button>
              <button className="w-full flex items-center px-4 py-2 text-sm text-green-600 bg-green-50 rounded-md hover:bg-green-100">
                <Calendar className="h-4 w-4 mr-2" />
                View Calendar
              </button>
              <button className="w-full flex items-center px-4 py-2 text-sm text-purple-600 bg-purple-50 rounded-md hover:bg-purple-100">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </button>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Performance</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Average Rating</span>
                <span className="text-sm font-medium">{hostProfile?.rating || 0}/5</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Total Reviews</span>
                <span className="text-sm font-medium">{hostProfile?.total_reviews || 0}</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Weather</h3>
            <div className="flex items-center">
              <Cloud className="h-8 w-8 text-blue-500" />
              <div className="ml-3">
                <p className="text-sm text-gray-600">Today's conditions</p>
                <p className="text-lg font-medium">Partly Cloudy</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default BusinessDashboard;