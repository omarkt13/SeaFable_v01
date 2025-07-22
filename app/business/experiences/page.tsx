
"use client";

import React, { useState, useEffect } from "react";
import { 
  Anchor, 
  Home, 
  Users, 
  MessageCircle, 
  Calendar as CalendarIcon, 
  Handshake, 
  DollarSign, 
  Shapes, 
  Settings, 
  Bell, 
  User, 
  LogOut, 
  ChevronDown, 
  Plus, 
  Edit2, 
  Trash, 
  MoreHorizontal, 
  Clock, 
  ChevronLeft,
  Search
} from "lucide-react";
import { FeatherChevronRight } from "@subframe/core";
import { FeatherSearch } from "@subframe/core";
import { FeatherFilter } from "@subframe/core";
import { Loader2, AlertCircle } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { getHostExperiences, type Experience } from "@/lib/database";

const mockExperiences: Experience[] = [
  {
    id: '1',
    title: 'Mediterranean Yacht Cruise',
    description: 'Explore the stunning Greek islands on a luxurious yacht, stopping at picturesque ports and enjoying crystal-clear waters.',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1920&auto=format&fit=crop&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    category: 'Sailing Tour',
    rating: 5.0,
    price: 3500,
    spots: 12,
    duration: '7 Days',
    dates: ['June 15 2026', 'June 28 2026'],
    status: 'active'
  },
  {
    id: '2',
    title: 'Diving with Turtles',
    description: 'Embark on an underwater adventure swimming alongside majestic sea turtles in crystal clear waters.',
    image: 'https://images.unsplash.com/photo-1533577180227-45c079af1927?q=80&w=1920&auto=format&fit=crop&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    category: 'Diving Tour',
    rating: 4.8,
    price: 280,
    spots: 8,
    duration: '4 Hours',
    dates: ['July 14 2026'],
    status: 'active'
  },
  {
    id: '3',
    title: 'Safari Wildlife Adventure',
    description: 'Witness the incredible wildlife of the African savanna, tracking lions, elephants, and other magnificent creatures.',
    image: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=1920&auto=format&fit=crop&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    category: 'Wildlife Tour',
    rating: 4.9,
    price: 4200,
    spots: 10,
    duration: '10 Days',
    dates: [],
    status: 'draft'
  },
  {
    id: '4',
    title: 'Tropical Island Retreat',
    description: 'Unwind in a luxurious tropical paradise, enjoying pristine beaches, water sports, and local culture.',
    image: 'https://images.unsplash.com/photo-1530789253388-582c481c54b0?q=80&w=1920&auto=format&fit=crop&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    category: 'Beach Vacation',
    rating: 4.7,
    price: 3200,
    spots: 15,
    duration: '7 Days',
    dates: [],
    status: 'draft'
  },
  {
    id: '5',
    title: 'Road Trip Across America',
    description: 'Explore the diverse landscapes and iconic cities of the United States on an epic cross-country adventure.',
    image: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=1920&auto=format&fit=crop&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    category: 'Road Trip',
    rating: 4.6,
    price: 3600,
    spots: 6,
    duration: '14 Days',
    dates: [],
    status: 'draft'
  }
];

export default function BusinessExperiencesPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [experiences, setExperiences] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  useEffect(() => {
    if (!authLoading && user?.id) {
      fetchExperiences(user.id);
    } else if (!authLoading && !user) {
      // Use mock data if no user
      setExperiences(mockExperiences);
      setIsLoading(false);
    }
  }, [user, authLoading]);

  const fetchExperiences = async (hostId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await getHostExperiences(hostId);
      if (fetchError) {
        throw new Error(fetchError);
      }
      // If no real experiences, use mock data
      setExperiences(data && data.length > 0 ? data : mockExperiences);
    } catch (err: any) {
      console.error("Failed to fetch experiences:", err);
      setError(err.message || "Failed to load experiences.");
      // Fall back to mock data on error
      setExperiences(mockExperiences);
    } finally {
      setIsLoading(false);
    }
  };

  const categories = ['All', ...Array.from(new Set(experiences.map(exp => exp.activity_type || exp.category || 'Other')))];
  
  const filteredExperiences = experiences.filter(exp => {
    const matchesSearch = (exp.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (exp.description || '').toLowerCase().includes(searchQuery.toLowerCase());
    const expCategory = exp.activity_type || exp.category || 'Other';
    const matchesFilter = selectedFilter === 'All' || expCategory === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  const handleCreateExperience = () => {
    // Navigate to create experience page
    window.location.href = '/business/experiences/new';
  };

  const handleEditExperience = (id: string) => {
    console.log('Editing experience:', id);
    // Navigate to edit experience page
    window.location.href = `/business/experiences/edit/${id}`;
  };

  const handleArchiveExperience = (id: string) => {
    setExperiences(prev => 
      prev.map(exp => 
        exp.id === id ? { ...exp, status: 'archived' } : exp
      )
    );
  };

  const handleAddDates = (id: string) => {
    console.log('Adding dates for experience:', id);
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'draft': return 'neutral';
      case 'archived': return 'error';
      default: return 'neutral';
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0
    }).format(price);
  };

  if (isLoading) {
    return (
      <div className="container max-w-none flex items-center justify-center h-screen">
        <div className="flex items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
          <span className="text-gray-500">Loading experiences...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-none flex w-full h-screen items-start border border-solid border-neutral-border">
      {/* Sidebar */}
      <div className="flex flex-col items-start gap-8 w-80 flex-shrink-0 border-r border-solid border-neutral-border bg-default-background px-6 py-8">
        <div className="flex items-center gap-3">
          <IconWithBackground
            variant="warning"
            size="large"
            icon={<FeatherAnchor />}
            square={true}
          />
          <span className="text-heading-2 font-heading-2 text-default-font">
            Business Dashboard
          </span>
        </div>
        
        <div className="flex w-full flex-col items-start gap-1">
          <SettingsMenu.Item icon={<FeatherHome />} label="Home" />
        </div>
        
        <div className="flex w-full flex-col items-start gap-1">
          <span className="w-full text-body-bold font-body-bold text-default-font mb-2">
            Client Management
          </span>
          <SettingsMenu.Item icon={<FeatherUsers />} label="Bookings" />
          <SettingsMenu.Item
            selected={true}
            icon={<FeatherAnchor />}
            label="Experiences"
          />
          <SettingsMenu.Item icon={<FeatherMessageCircle />} label="Messages" />
          <SettingsMenu.Item icon={<FeatherCalendar />} label="Calendar" />
          <SettingsMenu.Item icon={<FeatherHandshake />} label="Clients" />
        </div>
        
        <div className="flex w-full flex-col items-start gap-2">
          <span className="w-full text-body-bold font-body-bold text-default-font mb-2">
            Finance
          </span>
          <div className="flex w-full flex-col items-start gap-1">
            <Button
              className="h-8 w-full flex-none justify-start"
              variant="neutral-tertiary"
              icon={<FeatherDollarSign />}
              onClick={() => {}}
            >
              Sales &amp; Payments
            </Button>
            <SettingsMenu.Item icon={<FeatherShapes />} label="Integrations" />
          </div>
        </div>
        
        <div className="flex w-full flex-col items-start gap-1">
          <span className="w-full text-body-bold font-body-bold text-default-font mb-2">
            Workspace
          </span>
          <SettingsMenu.Item icon={<FeatherUser />} label="Account" />
          <SettingsMenu.Item icon={<FeatherSettings />} label="Settings" />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col items-start flex-1 overflow-hidden">
        {/* Header */}
        <div className="flex w-full items-center justify-between border-b border-solid border-neutral-border px-8 py-4 bg-white">
          <div className="flex items-center gap-4">
            <TextField label="" helpText="" className="w-80">
              <TextField.Input
                placeholder="Search experiences..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </TextField>
            <IconButton
              icon={<FeatherSearch />}
              onClick={() => {}}
              aria-label="Search"
            />
          </div>
          
          <div className="flex items-center gap-4">
            <IconButton
              icon={<FeatherBell />}
              onClick={() => {}}
              aria-label="Notifications"
            />
            <SubframeCore.DropdownMenu.Root>
              <SubframeCore.DropdownMenu.Trigger asChild={true}>
                <Button
                  variant="neutral-tertiary"
                  iconRight={<FeatherChevronDown />}
                  onClick={() => {}}
                >
                  Ocean Travel
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
                    <DropdownMenu.DropdownItem icon={<FeatherUser />}>
                      Profile
                    </DropdownMenu.DropdownItem>
                    <DropdownMenu.DropdownItem icon={<FeatherSettings />}>
                      Settings
                    </DropdownMenu.DropdownItem>
                    <DropdownMenu.DropdownDivider />
                    <DropdownMenu.DropdownItem icon={<FeatherLogOut />}>
                      Logout
                    </DropdownMenu.DropdownItem>
                  </DropdownMenu>
                </SubframeCore.DropdownMenu.Content>
              </SubframeCore.DropdownMenu.Portal>
            </SubframeCore.DropdownMenu.Root>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto w-full">
          <div className="flex flex-col items-start gap-6 px-8 py-8">
            {/* Page Header */}
            <div className="flex w-full items-center justify-between">
              <div className="flex flex-col gap-2">
                <h1 className="text-heading-1 font-heading-1 text-default-font">
                  Experiences
                </h1>
                <p className="text-body text-subtext-color">
                  Manage your travel experiences and tours
                </p>
              </div>
              
              <div className="flex items-center gap-3">
                <SubframeCore.Popover.Root>
                  <SubframeCore.Popover.Trigger asChild={true}>
                    <Button
                      variant="neutral-secondary"
                      iconRight={<FeatherCalendar />}
                      onClick={() => {}}
                    >
                      Select Date Range
                    </Button>
                  </SubframeCore.Popover.Trigger>
                  <SubframeCore.Popover.Portal>
                    <SubframeCore.Popover.Content
                      side="bottom"
                      align="start"
                      sideOffset={4}
                      asChild={true}
                    >
                      <div className="flex flex-col items-start gap-1 rounded-md border border-solid border-neutral-border bg-default-background px-3 py-3 shadow-lg">
                        <Calendar
                          mode="single"
                          selected={selectedDate}
                          onSelect={setSelectedDate}
                        />
                      </div>
                    </SubframeCore.Popover.Content>
                  </SubframeCore.Popover.Portal>
                </SubframeCore.Popover.Root>
                
                <SubframeCore.DropdownMenu.Root>
                  <SubframeCore.DropdownMenu.Trigger asChild={true}>
                    <Button
                      variant="neutral-secondary"
                      iconRight={<FeatherChevronDown />}
                      icon={<FeatherFilter />}
                      onClick={() => {}}
                    >
                      {selectedFilter}
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
                        {categories.map((category) => (
                          <DropdownMenu.DropdownItem
                            key={category}
                            onClick={() => setSelectedFilter(category)}
                          >
                            {category}
                          </DropdownMenu.DropdownItem>
                        ))}
                      </DropdownMenu>
                    </SubframeCore.DropdownMenu.Content>
                  </SubframeCore.DropdownMenu.Portal>
                </SubframeCore.DropdownMenu.Root>
                
                <Button
                  icon={<FeatherPlus />}
                  onClick={handleCreateExperience}
                >
                  Create Experience
                </Button>
              </div>
            </div>

            {/* Experience Grid */}
            <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Create New Experience Card */}
              <div 
                className="flex flex-col items-center justify-center gap-4 h-32 rounded-lg border-2 border-dashed border-neutral-300 bg-neutral-50 cursor-pointer transition-all hover:border-neutral-400 hover:bg-neutral-100"
                onClick={handleCreateExperience}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && handleCreateExperience()}
              >
                <div className="flex items-center gap-2">
                  <FeatherPlus className="text-neutral-500" />
                  <span className="text-body-bold font-body-bold text-neutral-700">
                    Create New Experience
                  </span>
                </div>
                <span className="text-caption text-neutral-500">
                  Add a new travel experience or tour
                </span>
              </div>

              {/* Experience Cards */}
              {filteredExperiences.map((experience) => (
                <div
                  key={experience.id}
                  className="flex flex-col gap-4 rounded-lg bg-white border border-neutral-200 p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex gap-4">
                    <img
                      className="h-24 w-24 flex-shrink-0 rounded-md object-cover"
                      src={experience.primary_image_url || experience.image || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1920&auto=format&fit=crop'}
                      alt={experience.title}
                    />
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-heading-3 font-heading-3 text-default-font truncate">
                          {experience.title}
                        </h3>
                        
                        <div className="flex items-center gap-1 ml-2">
                          <IconButton
                            size="small"
                            icon={<FeatherEdit2 />}
                            onClick={() => handleEditExperience(experience.id)}
                            aria-label={`Edit ${experience.title}`}
                          />
                          <SubframeCore.DropdownMenu.Root>
                            <SubframeCore.DropdownMenu.Trigger asChild={true}>
                              <IconButton
                                size="small"
                                icon={<FeatherMoreHorizontal />}
                                onClick={() => {}}
                                aria-label={`More options for ${experience.title}`}
                              />
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
                                    icon={<FeatherCalendar />}
                                    onClick={() => handleAddDates(experience.id)}
                                  >
                                    Add Dates/Times
                                  </DropdownMenu.DropdownItem>
                                  <DropdownMenu.DropdownItem
                                    icon={<FeatherTrash />}
                                    onClick={() => handleArchiveExperience(experience.id)}
                                  >
                                    Archive
                                  </DropdownMenu.DropdownItem>
                                </DropdownMenu>
                              </SubframeCore.DropdownMenu.Content>
                            </SubframeCore.DropdownMenu.Portal>
                          </SubframeCore.DropdownMenu.Root>
                        </div>
                      </div>
                      
                      <p className="text-body text-subtext-color mb-3 line-clamp-2">
                        {experience.description}
                      </p>
                      
                      <div className="flex items-center gap-3 mb-2">
                        <Badge variant="warning">{experience.activity_type || experience.category || 'Other'}</Badge>
                        {(experience.status === 'active' || !experience.status) && experience.rating && (
                          <Badge variant="success">Rating {experience.rating}</Badge>
                        )}
                        <div className="flex items-center gap-1">
                          <span className="text-body-bold font-body-bold text-success-600">
                            {formatPrice(experience.price_per_person || experience.price || 0)}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between text-caption text-neutral-500">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1">
                            <FeatherUsers size={14} />
                            <span>{experience.max_participants || experience.spots || 0} spots</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <FeatherClock size={14} />
                            <span>{experience.duration_hours ? `${experience.duration_hours}h` : experience.duration || 'N/A'}</span>
                          </div>
                        </div>
                        
                        <Badge variant={getStatusVariant(experience.status || 'active')}>
                          {(experience.status || 'active').charAt(0).toUpperCase() + (experience.status || 'active').slice(1)}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-2 border-t border-neutral-100">
                    <div className="flex items-center gap-2">
                      <span className="text-caption text-neutral-500">Location:</span>
                      <span className="text-caption text-neutral-600">
                        {experience.location || 'Location not set'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="flex w-full items-center justify-between pt-6 border-t border-neutral-border">
              <div className="flex items-center gap-2">
                <span className="text-body text-subtext-color">
                  Total Experiences:
                </span>
                <span className="text-body-bold font-body-bold text-default-font">
                  {filteredExperiences.length}
                </span>
                {searchQuery && (
                  <>
                    <span className="text-body text-subtext-color">
                      (filtered from {experiences.length})
                    </span>
                  </>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                <IconButton
                  icon={<FeatherChevronLeft />}
                  onClick={() => {}}
                  disabled
                  aria-label="Previous page"
                />
                <span className="text-body text-subtext-color">
                  1 of 1
                </span>
                <IconButton
                  icon={<FeatherChevronRight />}
                  onClick={() => {}}
                  disabled
                  aria-label="Next page"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
