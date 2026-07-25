/**
 * Optimized Next.js config
 * - Allows external images/videos from spec assets
 * - Tight CSP but permits required external media/fonts
 * - Optimized headers for caching
 */

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.higgs.ai' },
      { protocol: 'https', hostname: 'd8j0ntlcm91z4.cloudfront.net' },
      { protocol: 'https', hostname: 'soft-zoom-63098134.figma.site' },
      { protocol: 'https', hostname: 'fonts.gstatic.com' },
    ],
    formats: ['image/avif', 'image/webp'],
  },
  async headers() {
    const isProd = process.env.NODE_ENV === 'production';

    const CSP = [
      "default-src 'self'",
      // 'unsafe-eval' is only needed by the dev-mode React refresh runtime.
      // Allowing it in production defeats much of the point of a CSP.
      isProd
        ? "script-src 'self' 'unsafe-inline' https://accounts.google.com"
        : "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://accounts.google.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "img-src 'self' data: https: blob:",
      "media-src 'self' https: blob:",
      "font-src 'self' data: https://fonts.gstatic.com",
      "connect-src 'self' https://accounts.google.com https://fonts.googleapis.com https://fonts.gstatic.com",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self' https://accounts.google.com",
      "object-src 'none'",
    ].join('; ');

    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'Content-Security-Policy', value: CSP },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()' },
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          // HSTS is only meaningful over HTTPS, so it is production-only.
          ...(isProd
            ? [{
                key: 'Strict-Transport-Security',
                value: 'max-age=63072000; includeSubDomains; preload',
              }]
            : []),
        ],
      },
      {
        source: '/fonts/:path*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
    ];
  },
};

export default nextConfig;
