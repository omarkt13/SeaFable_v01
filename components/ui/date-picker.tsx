
"use client"

import * as React from "react"
import { Calendar, ChevronLeft, ChevronRight, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface DatePickerProps {
  date?: Date
  onDateChange?: (date: Date | undefined) => void
  placeholder?: string
  className?: string
  disabled?: boolean
}

export function DatePicker({
  date,
  onDateChange,
  placeholder = "Select date",
  className,
  disabled = false
}: DatePickerProps) {
  const [selectedDate, setSelectedDate] = React.useState<Date | null>(date || null)
  const [currentMonth, setCurrentMonth] = React.useState(new Date())
  const [isOpen, setIsOpen] = React.useState(false)
  const dropdownRef = React.useRef<HTMLDivElement>(null)
  const triggerRef = React.useRef<HTMLButtonElement>(null)

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node) &&
          triggerRef.current && !triggerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // Update selectedDate when date prop changes
  React.useEffect(() => {
    setSelectedDate(date || null)
  }, [date])

  // Get current date and calculate suggestions
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(today.getDate() + 1)

  // Calculate this weekend (Saturday)
  const thisWeekend = new Date(today)
  const daysUntilSaturday = (6 - today.getDay()) % 7
  if (daysUntilSaturday === 0 && today.getDay() !== 6) {
    thisWeekend.setDate(today.getDate() + 7) // Next Saturday if today is Sunday
  } else {
    thisWeekend.setDate(today.getDate() + daysUntilSaturday)
  }

  // Calculate next weekend (next Saturday)
  const nextWeekend = new Date(today)
  nextWeekend.setDate(today.getDate() + daysUntilSaturday + 7)

  // Quick suggestion options
  const suggestions = [
    { label: 'Today', date: today, available: true },
    { label: 'Tomorrow', date: tomorrow, available: true },
    { label: 'This Weekend', date: thisWeekend, available: true },
    { label: 'Next Weekend', date: nextWeekend, available: true },
  ]

  // Format date for display
  const formatDate = (date: Date | null) => {
    if (!date) return placeholder
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
    }
    return date.toLocaleDateString('en-US', options)
  }

  // Generate calendar days
  const generateCalendarDays = () => {
    const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - firstDay.getDay())

    const days = []
    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate)
      date.setDate(startDate.getDate() + i)
      days.push(date)
    }
    return days
  }

  const calendarDays = generateCalendarDays()

  // Check if date is selectable (not in the past)
  const isSelectableDate = (date: Date) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const checkDate = new Date(date)
    checkDate.setHours(0, 0, 0, 0)
    return checkDate >= today
  }

  // Check if date is selected
  const isSelectedDate = (date: Date) => {
    if (!selectedDate) return false
    return date.toDateString() === selectedDate.toDateString()
  }

  // Check if date is in current month
  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentMonth.getMonth()
  }

  // Handle date selection
  const handleDateSelect = (date: Date) => {
    if (isSelectableDate(date)) {
      setSelectedDate(date)
      onDateChange?.(date)
      setIsOpen(false)
    }
  }

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: { label: string; date: Date; available: boolean }) => {
    if (suggestion.available) {
      setSelectedDate(suggestion.date)
      onDateChange?.(suggestion.date)
      setIsOpen(false)
    }
  }

  // Navigate months
  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))
  }

  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))
  }

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  return (
    <div className={cn("relative", className)}>
      {/* Date Picker Dropdown */}
      <div className="relative">
        {/* Dropdown Trigger */}
        <button
          ref={triggerRef}
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className={`w-full p-3 border rounded-lg text-left bg-white transition-all duration-200 ${
            disabled 
              ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed' 
              : isOpen
              ? 'border-blue-500 ring-2 ring-blue-500 ring-opacity-20'
              : 'border-gray-300 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Calendar className="h-5 w-5 text-gray-400 mr-3" />
              <span className={selectedDate ? 'text-gray-900' : 'text-gray-500'}>
                {selectedDate ? formatDate(selectedDate) : placeholder}
              </span>
            </div>
            <ChevronDown className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${
              isOpen ? 'rotate-180' : ''
            }`} />
          </div>
        </button>

        {/* Dropdown Content */}
        {isOpen && (
          <div 
            ref={dropdownRef}
            className="absolute z-50 mt-2 p-4 bg-white border border-gray-200 rounded-lg shadow-xl w-full min-w-[320px] max-h-96 overflow-y-auto"
          >
            {/* Quick Suggestions */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleSuggestionClick(suggestion)}
                  disabled={!suggestion.available}
                  className={`p-2 text-sm font-medium rounded-lg border transition-all duration-200 ${
                    suggestion.available
                      ? 'border-gray-200 hover:border-blue-500 hover:bg-blue-50 text-gray-700 hover:text-blue-700'
                      : 'border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed'
                  } ${
                    selectedDate && suggestion.date.toDateString() === selectedDate.toDateString()
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : ''
                  }`}
                >
                  <div className="font-semibold text-xs">{suggestion.label}</div>
                  <div className="text-xs mt-1">
                    {suggestion.available ? formatDate(suggestion.date) : 'Unavailable'}
                  </div>
                </button>
              ))}
            </div>

            {/* Calendar Header */}
            <div className="flex items-center justify-between mb-4">
              <button
                type="button"
                onClick={goToPreviousMonth}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
              >
                <ChevronLeft className="h-5 w-5 text-gray-600" />
              </button>
              <h3 className="font-semibold text-gray-900">
                {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
              </h3>
              <button
                type="button"
                onClick={goToNextMonth}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
              >
                <ChevronRight className="h-5 w-5 text-gray-600" />
              </button>
            </div>

            {/* Day names */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {dayNames.map(day => (
                <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar days */}
            <div className="grid grid-cols-7 gap-1 mb-4">
              {calendarDays.map((date, index) => {
                const isSelectable = isSelectableDate(date)
                const isSelected = isSelectedDate(date)
                const isInCurrentMonth = isCurrentMonth(date)

                return (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleDateSelect(date)}
                    disabled={!isSelectable}
                    className={`
                      h-8 w-8 text-sm rounded-lg transition-all duration-150
                      ${isSelected 
                        ? 'bg-blue-600 text-white hover:bg-blue-700' 
                        : isSelectable && isInCurrentMonth
                        ? 'hover:bg-blue-50 text-gray-900'
                        : isSelectable && !isInCurrentMonth
                        ? 'hover:bg-gray-50 text-gray-400'
                        : 'text-gray-300 cursor-not-allowed'
                      }
                      ${date.toDateString() === today.toDateString() && !isSelected
                        ? 'bg-gray-100 font-semibold'
                        : ''
                      }
                    `}
                  >
                    {date.getDate()}
                  </button>
                )
              })}
            </div>

            {/* Footer */}
            <div className="flex justify-between items-center pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 rounded hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedDate(today)
                  onDateChange?.(today)
                  setIsOpen(false)
                }}
                className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
              >
                Today
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
