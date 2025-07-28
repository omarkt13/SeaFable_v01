
"use client"

import { useState, useEffect, useCallback, useRef } from 'react'

interface FetchState<T> {
  data: T | null
  loading: boolean
  error: Error | null
  retry: () => void
  refresh: () => void
}

interface FetchOptions {
  enabled?: boolean
  retryAttempts?: number
  retryDelay?: number
  cacheTime?: number
  staleTime?: number
}

// Simple in-memory cache
const cache = new Map<string, { data: any; timestamp: number; staleTime: number }>()

export function useOptimizedFetch<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: FetchOptions = {}
): FetchState<T> {
  const {
    enabled = true,
    retryAttempts = 3,
    retryDelay = 1000,
    cacheTime = 5 * 60 * 1000, // 5 minutes
    staleTime = 1 * 60 * 1000,  // 1 minute
  } = options

  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Check cache first
  const getCachedData = useCallback((): T | null => {
    const cached = cache.get(key)
    if (cached && Date.now() - cached.timestamp < cached.staleTime) {
      return cached.data
    }
    return null
  }, [key])

  // Set cache
  const setCachedData = useCallback((newData: T) => {
    cache.set(key, {
      data: newData,
      timestamp: Date.now(),
      staleTime: cacheTime
    })
  }, [key, cacheTime])

  // Fetch with retry logic
  const fetchWithRetry = useCallback(async (attempt: number = 1): Promise<T> => {
    try {
      // Cancel previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }

      abortControllerRef.current = new AbortController()
      
      const result = await fetcher()
      return result
    } catch (err) {
      if (attempt < retryAttempts) {
        console.warn(`Fetch attempt ${attempt}/${retryAttempts} failed:`, err)
        
        // Exponential backoff
        const delay = retryDelay * Math.pow(2, attempt - 1)
        await new Promise(resolve => {
          retryTimeoutRef.current = setTimeout(resolve, delay)
        })
        
        return fetchWithRetry(attempt + 1)
      }
      throw err
    }
  }, [fetcher, retryAttempts, retryDelay])

  // Main fetch function
  const executeFetch = useCallback(async (useCache: boolean = true) => {
    if (!enabled) return

    // Check cache first if using cache
    if (useCache) {
      const cachedData = getCachedData()
      if (cachedData) {
        setData(cachedData)
        setError(null)
        return
      }
    }

    setLoading(true)
    setError(null)

    try {
      const result = await fetchWithRetry()
      setData(result)
      setCachedData(result)
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Fetch failed')
      setError(error)
      console.error(`Failed to fetch ${key}:`, error)
    } finally {
      setLoading(false)
    }
  }, [enabled, key, fetchWithRetry, getCachedData, setCachedData])

  // Retry function (bypasses cache)
  const retry = useCallback(() => {
    executeFetch(false)
  }, [executeFetch])

  // Refresh function (bypasses cache and clears existing data)
  const refresh = useCallback(() => {
    cache.delete(key)
    setData(null)
    executeFetch(false)
  }, [key, executeFetch])

  // Initial fetch
  useEffect(() => {
    executeFetch()
  }, [executeFetch])

  // Cleanup
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current)
      }
    }
  }, [])

  return {
    data,
    loading,
    error,
    retry,
    refresh,
  }
}

// Helper hook for dashboard data
export function useDashboardData(businessId?: string) {
  return useOptimizedFetch(
    `dashboard-${businessId || 'current'}`,
    async () => {
      const url = businessId 
        ? `/api/business/dashboard?businessId=${businessId}`
        : '/api/business/dashboard'
        
      const response = await fetch(url)
      
      if (!response.ok) {
        throw new Error(`Dashboard fetch failed: ${response.statusText}`)
      }
      
      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || 'Dashboard fetch failed')
      }
      
      return result.data
    },
    {
      retryAttempts: 3,
      retryDelay: 1000,
      staleTime: 30 * 1000, // 30 seconds
      cacheTime: 5 * 60 * 1000, // 5 minutes
    }
  )
}
