/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['mongoose']
  }
}

// Fix OpenSSL compatibility on Windows
process.env.NODE_OPTIONS = '--openssl-legacy-provider'

module.exports = nextConfig