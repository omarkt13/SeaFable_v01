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
  },
  // Configure allowed development origins for Replit
  async headers() {
    return [
      {
        source: '/_next/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization',
          },
        ],
      },
    ];
  },
  poweredByHeader: false,
  generateEtags: false,
  compress: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production', // Remove console logs in production builds
  },
}

export default nextConfig
