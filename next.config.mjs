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
      { protocol: 'https', hostname: 'fonts.gstatic.com' },
    ],
    formats: ['image/avif', 'image/webp'],
  },
  async headers() {
    const scriptPolicy = process.env.NODE_ENV === 'development'
      ? "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://accounts.google.com https://checkout.razorpay.com"
      : "script-src 'self' 'unsafe-inline' https://accounts.google.com https://checkout.razorpay.com";
    const CSP = [
      "default-src 'self'",
      scriptPolicy,
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "img-src 'self' data: https: blob:",
      "media-src 'self' https: blob:",
      "font-src 'self' data: https://fonts.gstatic.com",
      "connect-src 'self' https://accounts.google.com https://fonts.googleapis.com https://fonts.gstatic.com https://api.razorpay.com",
      "frame-src https://api.razorpay.com https://checkout.razorpay.com",
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
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=()' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
          { key: 'Cross-Origin-Resource-Policy', value: 'same-origin' },
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
