import type { NextConfig } from 'next'

const config: NextConfig = {
  // Cache Components (Next.js 16): enables "use cache", cacheTag(), cacheLife().
  cacheComponents: true,

  // Tenant sites may reference images from R2 (assets.lattiz.app) or, until the bucket is retired, Supabase Storage.
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'assets.lattiz.app', pathname: '/**' },
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
}

export default config
