"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Filter, X } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

export interface SearchFilters {
  activityType: string[]
  location: string
  dateRange: [Date, Date] | null
  priceRange: [number, number]
  difficultyLevel: string[]
  maxParticipants: number
  minAge: number
  equipmentProvided: boolean
  instantBooking: boolean
  weatherIndependent: boolean
}

interface SearchFiltersProps {
  filters: SearchFilters
  onFiltersChange: (filters: SearchFilters) => void
  onClearFilters: () => void
}

const ACTIVITY_TYPES = [
  { value: 'sailing', label: 'Sailing', icon: '⛵' },
  { value: 'surfing', label: 'Surfing', icon: '🏄' },
  { value: 'kayaking', label: 'Kayaking', icon: '🛶' },
  { value: 'diving', label: 'Diving', icon: '🤿' },
  { value: 'jet-skiing', label: 'Jet Skiing', icon: '🚤' },
  { value: 'fishing', label: 'Fishing', icon: '🎣' },
  { value: 'whale-watching', label: 'Whale Watching', icon: '🐋' },
  { value: 'paddleboarding', label: 'Paddleboarding', icon: '🏄‍♂️' },
  { value: 'windsurfing', label: 'Windsurfing', icon: '🏄‍♀️' },
  { value: 'snorkeling', label: 'Snorkeling', icon: '🤿' },
]

const DIFFICULTY_LEVELS = [
  { value: 'beginner', label: 'Beginner', color: 'bg-green-100 text-green-800' },
  { value: 'intermediate', label: 'Intermediate', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'advanced', label: 'Advanced', color: 'bg-orange-100 text-orange-800' },
  { value: 'expert', label: 'Expert', color: 'bg-red-100 text-red-800' },
]

export function SearchFilters({ filters, onFiltersChange, onClearFilters }: SearchFiltersProps) {
  const [isOpen, setIsOpen] = useState(false)

  const updateFilters = (updates: Partial<SearchFilters>) => {
    onFiltersChange({ ...filters, ...updates })
  }

  const toggleActivityType = (activityType: string) => {
    const newActivityTypes = filters.activityType.includes(activityType)
      ? filters.activityType.filter(type => type !== activityType)
      : [...filters.activityType, activityType]
    updateFilters({ activityType: newActivityTypes })
  }

  const toggleDifficultyLevel = (difficulty: string) => {
    const newDifficultyLevels = filters.difficultyLevel.includes(difficulty)
      ? filters.difficultyLevel.filter(level => level !== difficulty)
      : [...filters.difficultyLevel, difficulty]
    updateFilters({ difficultyLevel: newDifficultyLevels })
  }

  const hasActiveFilters = () => {
    return (
      filters.activityType.length > 0 ||
      filters.location ||
      filters.dateRange ||
      filters.priceRange[0] > 0 ||
      filters.priceRange[1] < 1000 ||
      filters.difficultyLevel.length > 0 ||
      filters.maxParticipants < 20 ||
      filters.minAge > 0 ||
      filters.equipmentProvided ||
      filters.instantBooking ||
      filters.weatherIndependent
    )
  }

  return (
    <div className="space-y-4">
      {/* Filter Toggle Button */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2"
        >
          <Filter className="h-4 w-4" />
          Filters
          {hasActiveFilters() && (
            <Badge variant="secondary" className="ml-2">
              {Object.values(filters).filter(v => 
                Array.isArray(v) ? v.length > 0 : v !== '' && v !== null && v !== false
              ).length}
            </Badge>
          )}
        </Button>
        
        {hasActiveFilters() && (
          <Button variant="ghost" size="sm" onClick={onClearFilters}>
            <X className="h-4 w-4 mr-1" />
            Clear
          </Button>
        )}
      </div>

      {/* Filter Panel */}
      {isOpen && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Search Filters</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Activity Types */}
            <div className="space-y-3">
              <h3 className="font-medium">Activity Types</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
                {ACTIVITY_TYPES.map((activity) => (
                  <Button
                    key={activity.value}
                    variant={filters.activityType.includes(activity.value) ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleActivityType(activity.value)}
                    className="justify-start"
                  >
                    <span className="mr-2">{activity.icon}</span>
                    {activity.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Location */}
            <div className="space-y-3">
              <h3 className="font-medium">Location</h3>
              <input
                type="text"
                placeholder="Enter location..."
                value={filters.location}
                onChange={(e) => updateFilters({ location: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Date Range */}
            <div className="space-y-3">
              <h3 className="font-medium">Date Range</h3>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !filters.dateRange && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filters.dateRange ? (
                      `${format(filters.dateRange[0], "LLL dd, y")} - ${format(filters.dateRange[1], "LLL dd, y")}`
                    ) : (
                      "Select date range"
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    initialFocus
                    mode="range"
                    selected={filters.dateRange ? { from: filters.dateRange[0], to: filters.dateRange[1] } : undefined}
                    onSelect={(range) => {
                      if (range?.from && range?.to) {
                        updateFilters({ dateRange: [range.from, range.to] })
                      }
                    }}
                    numberOfMonths={2}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Price Range */}
            <div className="space-y-3">
              <h3 className="font-medium">Price Range</h3>
              <div className="px-2">
                <Slider
                  value={filters.priceRange}
                  onValueChange={(value) => updateFilters({ priceRange: value as [number, number] })}
                  max={1000}
                  min={0}
                  step={10}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-gray-600 mt-2">
                  <span>${filters.priceRange[0]}</span>
                  <span>${filters.priceRange[1]}</span>
                </div>
              </div>
            </div>

            {/* Difficulty Levels */}
            <div className="space-y-3">
              <h3 className="font-medium">Difficulty Level</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {DIFFICULTY_LEVELS.map((difficulty) => (
                  <Button
                    key={difficulty.value}
                    variant={filters.difficultyLevel.includes(difficulty.value) ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleDifficultyLevel(difficulty.value)}
                    className={cn(
                      "justify-start",
                      filters.difficultyLevel.includes(difficulty.value) && difficulty.color
                    )}
                  >
                    {difficulty.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Max Participants */}
            <div className="space-y-3">
              <h3 className="font-medium">Max Participants: {filters.maxParticipants}</h3>
              <Slider
                value={[filters.maxParticipants]}
                onValueChange={(value) => updateFilters({ maxParticipants: value[0] })}
                max={20}
                min={1}
                step={1}
                className="w-full"
              />
            </div>

            {/* Min Age */}
            <div className="space-y-3">
              <h3 className="font-medium">Minimum Age: {filters.minAge}</h3>
              <Slider
                value={[filters.minAge]}
                onValueChange={(value) => updateFilters({ minAge: value[0] })}
                max={18}
                min={0}
                step={1}
                className="w-full"
              />
            </div>

            {/* Checkboxes */}
            <div className="space-y-3">
              <h3 className="font-medium">Additional Options</h3>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="equipment-provided"
                    checked={filters.equipmentProvided}
                    onCheckedChange={(checked) => updateFilters({ equipmentProvided: checked as boolean })}
                  />
                  <label htmlFor="equipment-provided" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Equipment Provided
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="instant-booking"
                    checked={filters.instantBooking}
                    onCheckedChange={(checked) => updateFilters({ instantBooking: checked as boolean })}
                  />
                  <label htmlFor="instant-booking" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Instant Booking Available
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="weather-independent"
                    checked={filters.weatherIndependent}
                    onCheckedChange={(checked) => updateFilters({ weatherIndependent: checked as boolean })}
                  />
                  <label htmlFor="weather-independent" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Weather Independent
                  </label>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
