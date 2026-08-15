/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  swcMinify: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.donghub.vip' },
      { protocol: 'https', hostname: '**.filem21.net' },
      { protocol: 'https', hostname: '**.komikindo.ch' },
      { protocol: 'https', hostname: '**.movieku.rest' },
      { protocol: 'https', hostname: '**.samehadaku.how' },
      { protocol: 'https', hostname: '**.wp.com' },
      { protocol: 'https', hostname: '**.qu.ax' },
    ],
    formats: ['image/webp', 'image/avif'],
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    config.optimization = {
      ...config.optimization,
      splitChunks: {
        chunks: 'all',
        maxInitialRequests: 25,
        maxAsyncRequests: 25,
      },
    };
    return config;
  },
  experimental: {
    serverComponentsExternalPackages: ['cheerio', 'axios', 'tough-cookie', 'fetch-cookie'],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  poweredByHeader: false,
  compress: true,
  generateEtags: true,
  httpAgentOptions: {
    keepAlive: true,
  },
  output: 'standalone',
}

module.exports = nextConfig
