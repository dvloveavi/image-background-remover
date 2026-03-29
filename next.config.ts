/** @type {import('next').NextConfig} */
const nextConfig = {
  // 强制 Webpack 忽略服务器端的 Node.js 钩子
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        async_hooks: false,
      };
    }
    return config;
  },
  // 禁用可能引起冲突的实验性功能
  experimental: {
    instrumentationHook: false,
  },
};

export default nextConfig;
