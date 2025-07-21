
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { getExperiences } from "@/lib/database";
import type { Experience } from "@/lib/database";
import { BusinessLayout } from "@/components/layouts/BusinessLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Plus,
  Search,
  Star,
  MapPin,
  Users,
  Clock,
  Euro,
  Eye,
  Edit,
  Trash2,
  AlertCircle,
  Filter
} from "lucide-react";

export default function BusinessAdventuresPage() {
  const [adventures, setAdventures] = useState<Experience[]>([]);
  const [filteredAdventures, setFilteredAdventures] = useState<Experience[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const router = useRouter();
  const { user, businessProfile, userType, isLoading: authLoading } = useAuth();

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
        loadAdventures();
      }
    }
  }, [user, businessProfile, userType, authLoading, router]);

  useEffect(() => {
    filterAdventures();
  }, [adventures, searchQuery, statusFilter]);

  const loadAdventures = async () => {
    if (!businessProfile) return;

    try {
      setIsLoading(true);
      setError(null);

      const result = await getExperiences(businessProfile.id);
      
      if (result.success) {
        setAdventures(Array.isArray(result.data) ? result.data : []);
      } else {
        setError(result.error || "Failed to load adventures");
      }
    } catch (err: any) {
      console.error("Adventures loading error:", err);
      setError(err.message || "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const filterAdventures = () => {
    let filtered = adventures;

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(adventure =>
        adventure.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        adventure.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        adventure.activity_type.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(adventure =>
        statusFilter === "active" ? adventure.is_active : !adventure.is_active
      );
    }

    setFilteredAdventures(filtered);
  };

  const getStatusBadge = (adventure: Experience) => {
    if (adventure.is_active) {
      return <Badge variant="default" className="bg-green-100 text-green-800">Active</Badge>;
    }
    return <Badge variant="secondary" className="bg-gray-100 text-gray-800">Inactive</Badge>;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'beginner':
        return 'bg-green-100 text-green-800';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800';
      case 'advanced':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
          <h2 className="text-xl font-semibold text-gray-900">Error Loading Adventures</h2>
          <p className="text-gray-600 text-center max-w-md">{error}</p>
          <Button onClick={loadAdventures} variant="outline">
            Try Again
          </Button>
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
            <h1 className="text-2xl font-bold text-gray-900">Your Adventures</h1>
            <p className="text-gray-600 mt-1">
              Manage your adventure offerings and track their performance.
            </p>
          </div>
          <Button onClick={() => router.push("/business/adventures/new")} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            New Adventure
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Adventures</p>
                  <p className="text-2xl font-bold text-gray-900">{adventures.length}</p>
                </div>
                <MapPin className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active Adventures</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {adventures.filter(a => a.is_active).length}
                  </p>
                </div>
                <Eye className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Bookings</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {adventures.reduce((sum, a) => sum + (a.total_bookings || 0), 0)}
                  </p>
                </div>
                <Users className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Avg. Rating</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {adventures.length > 0 
                      ? (adventures.reduce((sum, a) => sum + (a.rating || 0), 0) / adventures.length).toFixed(1)
                      : "0.0"
                    }
                  </p>
                </div>
                <Star className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search adventures..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant={statusFilter === "all" ? "default" : "outline"}
                  onClick={() => setStatusFilter("all")}
                  size="sm"
                >
                  All
                </Button>
                <Button
                  variant={statusFilter === "active" ? "default" : "outline"}
                  onClick={() => setStatusFilter("active")}
                  size="sm"
                >
                  Active
                </Button>
                <Button
                  variant={statusFilter === "inactive" ? "default" : "outline"}
                  onClick={() => setStatusFilter("inactive")}
                  size="sm"
                >
                  Inactive
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Adventures List */}
        <div className="space-y-4">
          {filteredAdventures.length > 0 ? (
            filteredAdventures.map((adventure) => (
              <Card key={adventure.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">
                            {adventure.title}
                          </h3>
                          <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                            <div className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              {adventure.location}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {adventure.duration_hours}h
                            </div>
                            <div className="flex items-center gap-1">
                              <Users className="h-4 w-4" />
                              Up to {adventure.max_guests} guests
                            </div>
                            <div className="flex items-center gap-1">
                              <Euro className="h-4 w-4" />
                              €{adventure.price_per_person}/person
                            </div>
                          </div>
                          <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                            {adventure.short_description || adventure.description}
                          </p>
                          <div className="flex items-center gap-2 flex-wrap">
                            {getStatusBadge(adventure)}
                            <Badge variant="outline" className={getDifficultyColor(adventure.difficulty_level)}>
                              {adventure.difficulty_level}
                            </Badge>
                            <Badge variant="outline">
                              {adventure.activity_type}
                            </Badge>
                            {adventure.rating > 0 && (
                              <div className="flex items-center gap-1 text-sm">
                                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                <span>{adventure.rating.toFixed(1)}</span>
                                <span className="text-gray-500">({adventure.total_reviews})</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => router.push(`/experience/${adventure.id}`)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => router.push(`/business/adventures/${adventure.id}/edit`)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Performance Stats */}
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <p className="text-lg font-semibold text-gray-900">{adventure.total_bookings || 0}</p>
                        <p className="text-xs text-gray-600">Total Bookings</p>
                      </div>
                      <div>
                        <p className="text-lg font-semibold text-gray-900">
                          €{((adventure.total_bookings || 0) * adventure.price_per_person).toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-600">Revenue</p>
                      </div>
                      <div>
                        <p className="text-lg font-semibold text-gray-900">{adventure.total_reviews || 0}</p>
                        <p className="text-xs text-gray-600">Reviews</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <MapPin className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {adventures.length === 0 ? "No adventures yet" : "No adventures match your filters"}
                </h3>
                <p className="text-gray-600 mb-4">
                  {adventures.length === 0 
                    ? "Get started by creating your first adventure offering."
                    : "Try adjusting your search or filter criteria."
                  }
                </p>
                {adventures.length === 0 && (
                  <Button onClick={() => router.push("/business/adventures/new")}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Adventure
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </BusinessLayout>
  );
}
