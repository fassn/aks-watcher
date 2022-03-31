/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['www.allkeyshop.com'],
  },
  experimental: { nftTracing: true }
}

module.exports = nextConfig