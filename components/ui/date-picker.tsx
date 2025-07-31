"use client"

import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"

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
  const [showDatePicker, setShowDatePicker] = React.useState(false)
  const [currentMonth, setCurrentMonth] = React.useState(new Date())

  // Helper function to get days until weekend
  const getDaysUntilWeekend = () => {
    const today = new Date()
    const dayOfWeek = today.getDay() // 0 = Sunday, 6 = Saturday
    if (dayOfWeek === 0) return 6 // If today is Sunday, next Saturday is 6 days away
    if (dayOfWeek === 6) return 0 // If today is Saturday, it's already weekend
    return 6 - dayOfWeek // Days until Saturday
  }

  // Helper function to generate calendar days
  const getCalendarDays = () => {
    const year = currentMonth.getFullYear()
    const monthIndex = currentMonth.getMonth()

    const firstDay = new Date(year, monthIndex, 1)
    const lastDay = new Date(year, monthIndex + 1, 0)
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - firstDay.getDay())

    const days = []
    const current = new Date(startDate)

    for (let i = 0; i < 42; i++) { // 6 weeks * 7 days
      days.push({
        date: current.toISOString().split('T')[0],
        day: current.getDate(),
        inCurrentMonth: current.getMonth() === monthIndex
      })
      current.setDate(current.getDate() + 1)
    }

    return days
  }

  // Helper function to handle date selection
  const handleDateSelect = (selectedDate: string) => {
    const newDate = new Date(selectedDate + 'T00:00:00')
    onDateChange?.(newDate)
    setShowDatePicker(false)
  }

  // Helper function to navigate to next month
  const navigateMonth = (direction: 'prev' | 'next') => {
    const newMonth = new Date(currentMonth)
    if (direction === 'prev') {
      newMonth.setMonth(newMonth.getMonth() - 1)
    } else {
      newMonth.setMonth(newMonth.getMonth() + 1)
    }
    setCurrentMonth(newMonth)
  }

  // Close date picker when clicking outside
  React.useEffect(() => {
    if (typeof window === 'undefined') return

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      if (showDatePicker && !target.closest('.date-picker-container')) {
        setShowDatePicker(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showDatePicker])

  return (
    <div className={cn("relative", className)}>
      <CalendarIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 z-10" />
      <div className="relative date-picker-container">
        <Input
          type="text"
          value={date ? new Date(date.getTime() + date.getTimezoneOffset() * 60000).toLocaleDateString('en-US', { 
            weekday: 'short', 
            month: 'short', 
            day: 'numeric',
            year: 'numeric'
          }) : ''}
          readOnly
          disabled={disabled}
          onClick={() => !disabled && setShowDatePicker(!showDatePicker)}
          className="w-full pl-12 pr-4 py-4 h-auto border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none text-gray-700 cursor-pointer"
          placeholder={placeholder}
        />

        {showDatePicker && (
          <div className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-xl z-50 p-4 w-80 sm:w-96">
            {/* Quick Date Options */}
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Quick select:</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: 'Today', days: 0 },
                  { label: 'Tomorrow', days: 1 },
                  { label: 'This Weekend', days: getDaysUntilWeekend() },
                  { label: 'Next Week', days: 7 }
                ].map((option) => (
                  <button
                    key={option.label}
                    type="button"
                    onClick={() => {
                      const optionDate = new Date()
                      optionDate.setDate(optionDate.getDate() + option.days)
                      handleDateSelect(optionDate.toISOString().split('T')[0])
                    }}
                    className="px-3 py-2 text-sm bg-gray-50 hover:bg-blue-50 hover:text-blue-700 text-gray-700 rounded-lg transition-all duration-200 border border-gray-200 hover:border-blue-200"
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Calendar Grid */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-900">
                  {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </h3>
                <div className="flex space-x-1">
                  <button
                    type="button"
                    onClick={() => navigateMonth('prev')}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <ChevronRight className="h-4 w-4 rotate-180" />
                  </button>
                  <button
                    type="button"
                    onClick={() => navigateMonth('next')}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Days of week header */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                  <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar days */}
              <div className="grid grid-cols-7 gap-1">
                {getCalendarDays().map((day, index) => {
                  const isToday = day.date === new Date().toISOString().split('T')[0]
                  const isSelected = date && day.date === date.toISOString().split('T')[0]
                  const isPast = new Date(day.date).getTime() < new Date().setHours(0, 0, 0, 0)

                  return (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleDateSelect(day.date)}
                      disabled={isPast && day.inCurrentMonth}
                      className={`
                        p-2 text-sm rounded-lg transition-all duration-200 
                        ${!day.inCurrentMonth 
                          ? 'text-gray-300 cursor-not-allowed' 
                          : isPast 
                            ? 'text-gray-300 cursor-not-allowed' 
                            : isSelected 
                              ? 'bg-blue-600 text-white font-semibold' 
                              : isToday 
                                ? 'bg-blue-50 text-blue-600 border border-blue-200 font-medium hover:bg-blue-100' 
                                : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                        }
                      `}
                    >
                      {day.day}
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-gray-200">
              <button
                type="button"
                onClick={() => setShowDatePicker(false)}
                className="w-full px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}