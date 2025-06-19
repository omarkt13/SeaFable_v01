interface RateLimitConfig {
  interval: number // Time window in milliseconds
  maxRequests: number // Max requests per window
}

const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

export function createRateLimit(config: RateLimitConfig) {
  return (identifier: string): { success: boolean; remaining: number; resetTime: number } => {
    const now = Date.now()
    const key = identifier
    const current = rateLimitStore.get(key)

    // Reset if window expired
    if (!current || now >= current.resetTime) {
      rateLimitStore.set(key, {
        count: 1,
        resetTime: now + config.interval,
      })
      return {
        success: true,
        remaining: config.maxRequests - 1,
        resetTime: now + config.interval,
      }
    }

    // Check if limit exceeded
    if (current.count >= config.maxRequests) {
      return {
        success: false,
        remaining: 0,
        resetTime: current.resetTime,
      }
    }

    // Increment counter
    current.count++
    rateLimitStore.set(key, current)

    return {
      success: true,
      remaining: config.maxRequests - current.count,
      resetTime: current.resetTime,
    }
  }
}

// Usage in API routes
export const searchRateLimit = createRateLimit({
  interval: 60000, // 1 minute
  maxRequests: 30, // 30 requests per minute
})

export const authRateLimit = createRateLimit({
  interval: 900000, // 15 minutes
  maxRequests: 5, // 5 login attempts per 15 minutes
})
