import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  serverExternalPackages: ['ioredis'],
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Don't include ioredis on the client side
      config.resolve.fallback = {
        ...config.resolve.fallback,
        ioredis: false,
      };
    }
    return config;
  },
};

export default nextConfig;
