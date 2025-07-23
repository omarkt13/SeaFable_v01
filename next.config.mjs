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
  serverExternalPackages: [],
  poweredByHeader: false,
  generateEtags: false,
  compress: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production', // Remove console logs in production builds
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  serverExternalPackages: ['@supabase/supabase-js'],
  experimental: {
    allowedDevOrigins: [
      'aa5013de-d2f6-4676-a706-adf28b112eda-00-2fk2lkifgnk3d.spock.replit.dev'
    ]
  },
}

export default nextConfig