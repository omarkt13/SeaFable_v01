/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
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
    optimizeCss: true,
    gzipSize: true,
    workerThreads: false, // Recommended for Vercel deployments to avoid memory issues
    cpus: 1, // Recommended for Vercel deployments to avoid memory issues
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production', // Remove console logs in production builds
  },
}

export default nextConfig
