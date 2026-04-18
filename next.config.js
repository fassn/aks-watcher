/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['www.allkeyshop.com, res.cloudinary.com'],
  },
  output: 'standalone',
}

module.exports = nextConfig