/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer, dev }) => {
    if (!isServer && dev) {
      config.devtool = 'eval-source-map'
    }
    return config
  },
}

module.exports = nextConfig

