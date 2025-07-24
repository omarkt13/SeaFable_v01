
import { useState, useEffect, useCallback, useRef } from 'react'

interface FetchState<T> {
  data: T | null
  loading: boolean
  error: string | null
}

interface FetchOptions {
  enabled?: boolean
  refetchInterval?: number
  staleTime?: number
}

export function useOptimizedFetch<T>(
  fetchFn: () => Promise<T>,
  deps: React.DependencyList = [],
  options: FetchOptions = {}
) {
  const { enabled = true, refetchInterval, staleTime = 0 } = options
  const [state, setState] = useState<FetchState<T>>({
    data: null,
    loading: false,
    error: null
  })
  
  const cacheRef = useRef<{ data: T; timestamp: number } | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  const fetch = useCallback(async () => {
    if (!enabled) return

    // Check cache first
    if (cacheRef.current && staleTime > 0) {
      const isStale = Date.now() - cacheRef.current.timestamp > staleTime
      if (!isStale) {
        setState(prev => ({ ...prev, data: cacheRef.current!.data, loading: false }))
        return
      }
    }

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    abortControllerRef.current = new AbortController()
    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      const data = await fetchFn()
      
      // Update cache
      cacheRef.current = { data, timestamp: Date.now() }
      
      setState({ data, loading: false, error: null })
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
        setState(prev => ({ 
          ...prev, 
          loading: false, 
          error: error.message 
        }))
      }
    }
  }, [fetchFn, enabled, staleTime])

  useEffect(() => {
    fetch()
    
    let intervalId: NodeJS.Timeout | undefined
    if (refetchInterval && refetchInterval > 0) {
      intervalId = setInterval(fetch, refetchInterval)
    }

    return () => {
      if (intervalId) clearInterval(intervalId)
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, deps)

  const refetch = useCallback(() => {
    cacheRef.current = null // Clear cache on manual refetch
    fetch()
  }, [fetch])

  return { ...state, refetch }
}
