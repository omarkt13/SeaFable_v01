"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { onCLS, onFID, onLCP, onFCP, onTTFB, type ReportCallback, type Metric } from "web-vitals"

interface PerformanceMetrics {
  lcp?: Metric
  fid?: Metric
  cls?: Metric
  fcp?: Metric
  ttfb?: Metric
  memory?: {
    jsHeapSizeLimit: number
    totalJSHeapSize: number
    usedJSHeapSize: number
  }
  network?: {
    downlink?: number
    effectiveType?: string
    rtt?: number
    saveData?: boolean
  }
  renderCount?: number
  renderTime?: number
}

interface UsePerformanceOptions {
  logToConsole?: boolean
  sendToAnalytics?: (metrics: PerformanceMetrics) => void
  trackRenderPerformance?: boolean
  componentName?: string
}

/**
 * Custom hook for comprehensive performance monitoring.
 * Tracks Web Vitals (LCP, FID, CLS, FCP, TTFB), memory usage, network status,
 * and optionally render performance of the component it's used in.
 *
 * @param options - Configuration options for the hook.
 *   - logToConsole: If true, logs performance metrics to the console.
 *   - sendToAnalytics: A callback function to send metrics to an analytics service.
 *   - trackRenderPerformance: If true, tracks the render count and time of the component.
 *   - componentName: The name of the component for better logging.
 */
export function usePerformance(options?: UsePerformanceOptions) {
  const {
    logToConsole = process.env.NODE_ENV === "development", // Log to console by default in dev
    sendToAnalytics,
    trackRenderPerformance = false,
    componentName,
  } = options || {}

  const [metrics, setMetrics] = useState<PerformanceMetrics>({})
  const renderCountRef = useRef(0)
  const renderStartTimeRef = useRef<number | null>(null)
  const componentNameRef = useRef(componentName)

  // Function to update metrics state and optionally log/send to analytics
  const updateMetric = useCallback(
    (key: keyof PerformanceMetrics, value: any) => {
      setMetrics((prev) => {
        const newMetrics = { ...prev, [key]: value }
        if (logToConsole) {
          console.log(`Performance Metric - ${String(key)}:`, value)
        }
        if (sendToAnalytics) {
          sendToAnalytics(newMetrics) // Send updated metrics
        }
        return newMetrics
      })
    },
    [logToConsole, sendToAnalytics],
  )

  // Web Vitals tracking
  useEffect(() => {
    const reportHandler: ReportCallback = (metric) => {
      updateMetric(metric.name.toLowerCase() as keyof PerformanceMetrics, metric)
    }

    onLCP(reportHandler)
    onFID(reportHandler)
    onCLS(reportHandler)
    onFCP(reportHandler)
    onTTFB(reportHandler)

    // Cleanup function to stop observing when component unmounts
    return () => {
      // Web Vitals library doesn't provide explicit "unobserve" methods for individual metrics
      // but the callback will stop being called once the component unmounts.
      // For a more robust solution in a large app, consider a dedicated Web Vitals provider.
    }
  }, [updateMetric])

  // Memory usage tracking
  useEffect(() => {
    if (typeof window !== "undefined" && "performance" in window) {
      const measureMemory = () => {
        if ("memory" in performance && typeof (performance as any).memory === "object") {
          const memoryInfo = (performance as any).memory
          updateMetric("memory", {
            jsHeapSizeLimit: memoryInfo.jsHeapSizeLimit,
            totalJSHeapSize: memoryInfo.totalJSHeapSize,
            usedJSHeapSize: memoryInfo.usedJSHeapSize,
          })
        }
      }

      // Measure initially and then periodically
      measureMemory()
      const intervalId = setInterval(measureMemory, 5000) // Every 5 seconds

      return () => clearInterval(intervalId)
    }
  }, [updateMetric])

  // Network status tracking
  useEffect(() => {
    if (typeof navigator !== "undefined" && "connection" in navigator) {
      const connection = (navigator as any).connection
      const updateNetworkInfo = () => {
        updateMetric("network", {
          downlink: connection.downlink,
          effectiveType: connection.effectiveType,
          rtt: connection.rtt,
          saveData: connection.saveData,
        })
      }

      updateNetworkInfo()
      connection.addEventListener("change", updateNetworkInfo)

      return () => {
        connection.removeEventListener("change", updateNetworkInfo)
      }
    }
  }, [updateMetric])

  // Render performance tracking (optional)
  useEffect(() => {
    if (trackRenderPerformance) {
      // Increment render count on every render
      renderCountRef.current++

      // Start timer on first render or after a reset
      if (renderStartTimeRef.current === null) {
        renderStartTimeRef.current = performance.now()
      }

      // Use a ref to store the component's display name for logging
      const renderEndTime = performance.now()
      if (renderStartTimeRef.current !== null) {
        const renderTime = renderEndTime - renderStartTimeRef.current
        updateMetric("renderTime", renderTime)
        updateMetric("renderCount", renderCountRef.current)
      }
      // Reset start time for next render cycle if needed, or for a single measurement
      renderStartTimeRef.current = performance.now()
    }
  })

  // Expose a function to manually set component name for better logging
  const setComponentName = useCallback((name: string) => {
    componentNameRef.current = name
  }, [])

  return { metrics, setComponentName }
}
