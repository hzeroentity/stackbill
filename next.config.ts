import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig: NextConfig = {
  outputFileTracingRoot: __dirname,
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()'
          }
        ]
      },
      // Specific headers for auth pages to indicate legitimacy
      {
        source: '/(login|signup|confirm-email)',
        headers: [
          {
            key: 'X-Purpose',
            value: 'legitimate-authentication'
          },
          {
            key: 'X-Business-Type', 
            value: 'saas-productivity-tool'
          }
        ]
      }
    ]
  }
};

export default withNextIntl(nextConfig);
