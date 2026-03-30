import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Disable Turbopack for Cloudflare Pages compatibility
  experimental: {
    // Optional: disable if needed
  },
};

export default nextConfig;
