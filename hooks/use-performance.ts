"use client"

import { useEffect, useRef, useCallback } from "react"

interface PerformanceMetrics {
  renderTime: number
  componentName: string
  timestamp: number
}

interface WebVitals {
  FCP?: number  // First Contentful Paint
  LCP?: number  // Largest Contentful Paint
  FID?: number  // First Input Delay
  CLS?: number  // Cumulative Layout Shift
  TTFB?: number // Time to First Byte
}

// Hook to measure component render performance
export function useRenderPerformance(componentName: string) {
  const renderStartTime = useRef<number>(0)

  useEffect(() => {
    renderStartTime.current = performance.now()
  })

  useEffect(() => {
    const renderTime = performance.now() - renderStartTime.current
    
    if (renderTime > 16) { // Only log if render takes longer than one frame (16ms)
      console.log(`🐌 Slow render detected: ${componentName} took ${renderTime.toFixed(2)}ms`)
      
      // Log to performance monitoring service in production
      if (process.env.NODE_ENV === "production") {
        logPerformanceMetric({
          renderTime,
          componentName,
          timestamp: Date.now(),
        })
      }
    }
  })
}

// Hook to measure and log web vitals
export function useWebVitals() {
  useEffect(() => {
    // Only run in browser environment
    if (typeof window === "undefined") return

    const vitals: WebVitals = {}

    // Measure First Contentful Paint (FCP)
    const measureFCP = () => {
      const observer = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries()
        const fcpEntry = entries.find(entry => entry.name === "first-contentful-paint")
        if (fcpEntry) {
          vitals.FCP = fcpEntry.startTime
          logWebVital("FCP", fcpEntry.startTime)
        }
      })
      observer.observe({ entryTypes: ["paint"] })
    }

    // Measure Largest Contentful Paint (LCP)
    const measureLCP = () => {
      const observer = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries()
        const lcpEntry = entries[entries.length - 1] // Get the latest LCP
        if (lcpEntry) {
          vitals.LCP = lcpEntry.startTime
          logWebVital("LCP", lcpEntry.startTime)
        }
      })
      observer.observe({ entryTypes: ["largest-contentful-paint"] })
    }

    // Measure First Input Delay (FID)
    const measureFID = () => {
      const observer = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries()
        entries.forEach((entry: any) => {
          vitals.FID = entry.processingStart - entry.startTime
          logWebVital("FID", entry.processingStart - entry.startTime)
        })
      })
      observer.observe({ entryTypes: ["first-input"] })
    }

    // Measure Cumulative Layout Shift (CLS)
    const measureCLS = () => {
      let clsScore = 0
      const observer = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries()
        entries.forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsScore += entry.value
            vitals.CLS = clsScore
            logWebVital("CLS", clsScore)
          }
        })
      })
      observer.observe({ entryTypes: ["layout-shift"] })
    }

    // Initialize measurements
    try {
      measureFCP()
      measureLCP()
      measureFID()
      measureCLS()
    } catch (error) {
      console.warn("Performance measurement not supported:", error)
    }

    // Cleanup function
    return () => {
      // Observer cleanup is handled automatically when component unmounts
    }
  }, [])
}

// Hook to monitor memory usage
export function useMemoryMonitoring() {
  useEffect(() => {
    if (typeof window === "undefined" || !("memory" in performance)) return

    const checkMemoryUsage = () => {
      const memory = (performance as any).memory
      if (memory) {
        const usedJSHeapSize = memory.usedJSHeapSize / 1048576 // Convert to MB
        const totalJSHeapSize = memory.totalJSHeapSize / 1048576 // Convert to MB
        const limit = memory.jsHeapSizeLimit / 1048576 // Convert to MB

        // Log warning if memory usage is high
        if (usedJSHeapSize > limit * 0.8) {
          console.warn(`⚠️ High memory usage: ${usedJSHeapSize.toFixed(2)}MB / ${limit.toFixed(2)}MB`)
        }

        // Log to monitoring service
        if (process.env.NODE_ENV === "production") {
          logMemoryUsage({
            used: usedJSHeapSize,
            total: totalJSHeapSize,
            limit: limit,
            timestamp: Date.now(),
          })
        }
      }
    }

    // Check memory usage every 30 seconds
    const interval = setInterval(checkMemoryUsage, 30000)

    return () => clearInterval(interval)
  }, [])
}

// Hook to detect slow network conditions
export function useNetworkMonitoring() {
  useEffect(() => {
    if (typeof window === "undefined" || !("connection" in navigator)) return

    const connection = (navigator as any).connection
    if (connection) {
      const logNetworkChange = () => {
        console.log("Network change:", {
          effectiveType: connection.effectiveType,
          downlink: connection.downlink,
          rtt: connection.rtt,
          saveData: connection.saveData,
        })

        // Warn about slow connections
        if (connection.effectiveType === "slow-2g" || connection.effectiveType === "2g") {
          console.warn("🐌 Slow network detected, consider optimizing for low bandwidth")
        }
      }

      connection.addEventListener("change", logNetworkChange)
      
      // Log initial state
      logNetworkChange()

      return () => {
        connection.removeEventListener("change", logNetworkChange)
      }
    }
  }, [])
}

// Combined performance monitoring hook
export function usePerformanceMonitoring(componentName?: string) {
  if (componentName) {
    useRenderPerformance(componentName)
  }
  useWebVitals()
  useMemoryMonitoring()
  useNetworkMonitoring()
}

// Utility functions for logging
function logPerformanceMetric(metric: PerformanceMetrics) {
  // In production, send to your analytics service
  console.log("Performance metric:", metric)
}

function logWebVital(name: string, value: number) {
  console.log(`Web Vital - ${name}: ${value.toFixed(2)}ms`)
  
  // Warn about poor performance
  const thresholds = {
    FCP: 1800, // Good: < 1.8s
    LCP: 2500, // Good: < 2.5s
    FID: 100,  // Good: < 100ms
    CLS: 0.1,  // Good: < 0.1
  }

  if (name !== "CLS" && value > thresholds[name as keyof typeof thresholds]) {
    console.warn(`⚠️ Poor ${name} performance: ${value.toFixed(2)}ms`)
  } else if (name === "CLS" && value > thresholds.CLS) {
    console.warn(`⚠️ Poor ${name} performance: ${value.toFixed(3)}`)
  }
}

function logMemoryUsage(memory: {
  used: number
  total: number
  limit: number
  timestamp: number
}) {
  // In production, send to your monitoring service
  console.log("Memory usage:", memory)
}

// Development helper to manually measure function performance
export function measureFunction<T extends (...args: any[]) => any>(
  fn: T,
  name: string
): T {
  return ((...args: Parameters<T>) => {
    const start = performance.now()
    const result = fn(...args)
    const end = performance.now()
    
    console.log(`Function ${name} took ${(end - start).toFixed(2)}ms`)
    
    return result
  }) as T
}

// React component performance profiler
export function ProfiledComponent({ 
  children, 
  id 
}: { 
  children: React.ReactNode
  id: string 
}) {
  const onRenderCallback = useCallback(
    (id: string, phase: "mount" | "update", actualDuration: number) => {
      if (actualDuration > 16) {
        console.log(`Profiler - ${id} (${phase}): ${actualDuration.toFixed(2)}ms`)
      }
    },
    []
  )

  return (
    <React.Profiler id={id} onRender={onRenderCallback}>
      {children}
    </React.Profiler>
  )
}
