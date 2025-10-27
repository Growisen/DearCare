import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  productionBrowserSourceMaps: false,
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb'
    }
  },
  images: {
    domains: ['localhost', '127.0.0.1'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
};

export default nextConfig;
