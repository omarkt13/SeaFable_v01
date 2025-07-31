
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    allowedDevOrigins: [
      'aa5013de-d2f6-4676-a706-adf28b112eda-00-2fk2lkifgnk3d.spock.replit.dev',
      'aa5013de-d2f6-4676-a706-adf28b112eda-00-2fk2lkifgnk3d.spock.replit.dev:5000',
      'stable-omarkt13s-projects.vercel.app',
      'v0-sea-fable-cursor-v1.vercel.app',
      'seafable.com',
      'www.seafable.com'
    ],
    serverActions: {
      allowedOrigins: [
        'aa5013de-d2f6-4676-a706-adf28b112eda-00-2fk2lkifgnk3d.spock.replit.dev',
        'aa5013de-d2f6-4676-a706-adf28b112eda-00-2fk2lkifgnk3d.spock.replit.dev:5000',
        'stable-omarkt13s-projects.vercel.app',
        'v0-sea-fable-cursor-v1.vercel.app',
        'seafable.com',
        'www.seafable.com'
      ]
    }
  },
  async headers() {
    return [
      {
        source: '/(.*)',
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
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
        ],
      },
    ]
  },
}

export default nextConfig
