import type { NextConfig } from 'next'

const config: NextConfig = {
  // Cache Components (Next.js 16): enables "use cache", cacheTag(), cacheLife().
  cacheComponents: true,

  // Tenant sites may reference images from Supabase Storage public buckets.
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
}

export default config
