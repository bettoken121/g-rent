/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
  },
  transpilePackages: ['@g-rent/types', '@g-rent/utils'],
};

module.exports = nextConfig;
