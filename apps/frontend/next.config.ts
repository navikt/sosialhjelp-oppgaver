import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: 'standalone',
  basePath: '/sosialhjelp/oppgaver',
  env: {
    BACKEND_URL: process.env['BACKEND_URL'] ?? 'http://localhost:8083',
    // TODO: Erstatt med ansatt→enhet-mapping når den er på plass
    HARDCODED_ENHET: process.env['HARDCODED_ENHET'] ?? '0301',
  },
}

export default nextConfig
