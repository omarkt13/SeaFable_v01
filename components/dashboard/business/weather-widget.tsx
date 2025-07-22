"use client"

import type React from "react"

import { Cloud, Sun, CloudRain, Wind, Waves } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// import { mockBusinessData } from "@/lib/mock-data" // Not available

export function WeatherWidget() {
  const getWeatherIcon = (condition: string) => {
    const icons: { [key: string]: React.ElementType } = {
      sunny: Sun,
      partly_cloudy: Cloud,
      cloudy: Cloud,
      rain: CloudRain,
      windy: Wind,
    }
    return icons[condition] || Sun
  }

  const weather = mockBusinessData.weather

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Cloud className="h-5 w-5 mr-2" />
          Weather Conditions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold">{weather.current.temp}°F</p>
              <p className="text-sm text-gray-500 capitalize">{weather.current.condition}</p>
            </div>
            {(() => {
              const WeatherIcon = getWeatherIcon(weather.current.condition)
              return <WeatherIcon className="h-8 w-8 text-yellow-500" />
            })()}
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center">
              <Wind className="h-4 w-4 mr-2 text-gray-400" />
              <span>{weather.current.windSpeed} mph</span>
            </div>
            <div className="flex items-center">
              <Waves className="h-4 w-4 mr-2 text-gray-400" />
              <span>{weather.current.waveHeight} ft</span>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">3-Day Forecast</p>
            {weather.forecast.map((day: any, index: number) => {
              const DayIcon = getWeatherIcon(day.condition)
              return (
                <div key={index} className="flex items-center justify-between text-sm">
                  <span className="w-20">{day.date}</span>
                  <DayIcon className="h-4 w-4 text-gray-400" />
                  <span>
                    {day.high}°/{day.low}°
                  </span>
                  <span className="text-gray-500">{day.windSpeed} mph</span>
                </div>
              )
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}