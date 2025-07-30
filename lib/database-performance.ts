
import { createClient } from '@/lib/supabase/client'

// Connection pooling and query optimization
export const optimizedSupabaseClient = () => {
  const client = createClient()
  
  // Add query timeouts
  const queryWithTimeout = async (query: any, timeoutMs = 10000) => {
    return Promise.race([
      query,
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Query timeout')), timeoutMs)
      )
    ])
  }

  return {
    client,
    queryWithTimeout
  }
}

// Cached queries for frequently accessed data
export const getCachedUserProfile = (() => {
  const cache = new Map()
  const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

  return async (userId: string) => {
    const cacheKey = `profile_${userId}`
    const cached = cache.get(cacheKey)
    
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.data
    }

    const { client } = optimizedSupabaseClient()
    const { data, error } = await client
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (!error && data) {
      cache.set(cacheKey, {
        data,
        timestamp: Date.now()
      })
    }

    return { data, error }
  }
})()
