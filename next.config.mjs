import bundleAnalyzer from '@next/bundle-analyzer'

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone', // Recommended for Vercel deployments
  experimental: {
    outputFileTracingRoot: process.cwd(), // Recommended for Vercel deployments
    workerThreads: false, // Recommended for Vercel deployments to avoid memory issues
    cpus: 1, // Recommended for Vercel deployments to avoid memory issues
  },
  images: {
    unoptimized: true, // Keep unoptimized as per previous config, can be changed for optimization
    domains: [
      'images.unsplash.com',
      'placeholder.com',
      'via.placeholder.com',
      'your-supabase-storage-url.com'
    ],
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production', // Remove console logs in production builds
  },
  // Removed error suppression flags as per report
  // eslint: { ignoreDuringBuilds: true },
  // typescript: { ignoreBuildErrors: true },
}

export default withBundleAnalyzer(nextConfig)
