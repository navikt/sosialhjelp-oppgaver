import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: 'standalone',
  basePath: '/sosialhjelp/oppgaver',
  serverExternalPackages: ['@navikt/oasis', 'prom-client'],
}

export default nextConfig
