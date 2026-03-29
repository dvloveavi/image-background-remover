import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 告知 Next.js 不要将 async_hooks 打包进 Edge runtime
  serverExternalPackages: ['async_hooks'],
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = [...(config.externals || []), 'async_hooks'];
    }
    return config;
  },
};

export default nextConfig;
