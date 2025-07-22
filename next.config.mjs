/** @type {import('next').NextConfig} */
const nextConfig = {
  
  images: {
    unoptimized: true,
    domains: [
      'images.unsplash.com',
      'placeholder.com',
      'via.placeholder.com', // Added for common placeholder services
      'your-supabase-storage-url.com' // Placeholder for your Supabase storage URL if you use it
    ],
  },
  experimental: {
    gzipSize: true,
    workerThreads: false,
    cpus: 1,
    allowedDevOrigins: [
      '*.replit.dev',
      '*.spock.replit.dev',
      /.*\.replit\.dev$/,
      /.*\.spock\.replit\.dev$/
    ],
  },
  poweredByHeader: false,
  generateEtags: false,
  compress: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production', // Remove console logs in production builds
  },
}

export default nextConfig
