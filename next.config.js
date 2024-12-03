/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
    };

    return config;
  },
  images: {
    domains: ['images.unsplash.com', 'assets.aceternity.com'],
  },
}

module.exports = nextConfig
