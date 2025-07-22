import DOMPurify from 'isomorphic-dompurify';

// Rate limiting store (in-memory for simplicity, use Redis for production)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

export function sanitizeInput(input: string): string {
  return DOMPurify.sanitize(input, { 
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br'],
    ALLOWED_ATTR: []
  });
}

export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html);
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePhone(phone: string): boolean {
  const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
  return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
}

export interface RateLimitOptions {
  maxRequests: number;
  windowMs: number;
}

export function rateLimit(
  identifier: string, 
  options: RateLimitOptions = { maxRequests: 100, windowMs: 60000 }
): { allowed: boolean; remainingRequests: number; resetTime: number } {
  const now = Date.now();
  const windowStart = now - options.windowMs;

  // Clean up expired entries
  for (const [key, data] of rateLimitStore.entries()) {
    if (data.resetTime < now) {
      rateLimitStore.delete(key);
    }
  }

  const current = rateLimitStore.get(identifier);

  if (!current || current.resetTime < now) {
    // First request or window has reset
    const resetTime = now + options.windowMs;
    rateLimitStore.set(identifier, { count: 1, resetTime });
    return {
      allowed: true,
      remainingRequests: options.maxRequests - 1,
      resetTime
    };
  }

  if (current.count >= options.maxRequests) {
    // Rate limit exceeded
    return {
      allowed: false,
      remainingRequests: 0,
      resetTime: current.resetTime
    };
  }

  // Increment and allow
  current.count++;
  rateLimitStore.set(identifier, current);

  return {
    allowed: true,
    remainingRequests: options.maxRequests - current.count,
    resetTime: current.resetTime
  };
}

export function getRateLimitHeaders(result: ReturnType<typeof rateLimit>) {
  return {
    'X-RateLimit-Limit': '100',
    'X-RateLimit-Remaining': result.remainingRequests.toString(),
    'X-RateLimit-Reset': Math.ceil(result.resetTime / 1000).toString()
  };
}

// Validation helpers
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function validatePhone(phone: string): boolean {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/
  return phoneRegex.test(phone.replace(/\s/g, ''))
}

export function validateUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

// Password strength validation
export function validatePassword(password: string): {
  isValid: boolean
  errors: string[]
} {
  const errors: string[] = []

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long')
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter')
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter')
  }

  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number')
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character')
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

// SQL injection prevention
export function sanitizeSqlInput(input: string): string {
  // Remove common SQL injection patterns
  const sqlPatterns = [
    /(\b(union|select|insert|update|delete|drop|create|alter|exec|execute)\b)/gi,
    /(--|#|\/\*|\*\/)/g,
    /(\b(and|or)\b\s+\d+\s*=\s*\d+)/gi,
    /(\b(and|or)\b\s+['"]\w+['"]\s*=\s*['"]\w+['"])/gi,
  ]

  let sanitized = input
  sqlPatterns.forEach(pattern => {
    sanitized = sanitized.replace(pattern, '')
  })

  return sanitized.trim()
}

// XSS prevention
export function preventXSS(input: string): string {
  const xssPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
    /<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi,
    /<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi,
  ]

  let sanitized = input
  xssPatterns.forEach(pattern => {
    sanitized = sanitized.replace(pattern, '')
  })

  return sanitized
}

// CSRF token generation and validation
export function generateCSRFToken(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

export function validateCSRFToken(token: string, storedToken: string): boolean {
  return token === storedToken
}

// Content Security Policy headers
export const CSP_HEADERS = {
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https: blob:",
    "connect-src 'self' https://api.stripe.com https://*.supabase.co",
    "frame-src 'self' https://js.stripe.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; '),
}

// Security headers for API responses
export const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  ...CSP_HEADERS,
}

// Input validation for experience creation
export function validateExperienceData(data: any): {
  isValid: boolean
  errors: string[]
} {
  const errors: string[] = []

  if (!data.title || data.title.trim().length < 3) {
    errors.push('Title must be at least 3 characters long')
  }

  if (!data.description || data.description.trim().length < 10) {
    errors.push('Description must be at least 10 characters long')
  }

  if (!data.location || data.location.trim().length < 2) {
    errors.push('Location is required')
  }

  if (!data.activityType || !['sailing', 'surfing', 'kayaking', 'diving', 'jet-skiing', 'fishing', 'whale-watching', 'paddleboarding', 'windsurfing', 'snorkeling'].includes(data.activityType)) {
    errors.push('Valid activity type is required')
  }

  if (!data.difficultyLevel || !['beginner', 'intermediate', 'advanced', 'expert'].includes(data.difficultyLevel)) {
    errors.push('Valid difficulty level is required')
  }

  if (!data.price || data.price <= 0) {
    errors.push('Price must be greater than 0')
  }

  if (!data.duration || data.duration <= 0) {
    errors.push('Duration must be greater than 0')
  }

  if (!data.maxParticipants || data.maxParticipants <= 0) {
    errors.push('Maximum participants must be greater than 0')
  }

  if (data.minAge && (data.minAge < 0 || data.minAge > 18)) {
    errors.push('Minimum age must be between 0 and 18')
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

// Sanitize experience data before saving
export function sanitizeExperienceData(data: any): any {
  return {
    ...data,
    title: sanitizeInput(data.title || ''),
    description: sanitizeHtml(data.description || ''),
    location: sanitizeInput(data.location || ''),
    cancellationPolicy: sanitizeHtml(data.cancellationPolicy || ''),
    highlights: (data.highlights || []).map((h: string) => sanitizeInput(h)),
    tags: (data.tags || []).map((t: string) => sanitizeInput(t)),
    equipmentProvided: (data.equipmentProvided || []).map((e: string) => sanitizeInput(e)),
    whatToBring: (data.whatToBring || []).map((w: string) => sanitizeInput(w)),
    includedServices: (data.includedServices || []).map((s: string) => sanitizeInput(s)),
    excludedServices: (data.excludedServices || []).map((s: string) => sanitizeInput(s)),
    itinerary: (data.itinerary || []).map((item: any) => ({
      ...item,
      title: sanitizeInput(item.title || ''),
      description: sanitizeHtml(item.description || ''),
    })),
  }
}