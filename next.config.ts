import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 强制忽略 Node.js 模块在边缘运行时的 bundle
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        async_hooks: false,
        fs: false,
        path: false,
      };
    }
    return config;
  },
  experimental: {
    // 确保没有开启 instrumentationHook
    instrumentationHook: false,
  },
};

export default nextConfig;
