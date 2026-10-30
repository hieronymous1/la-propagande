const isDev = process.env.NODE_ENV !== 'production';

/*
 * Content-Security-Policy, REPORT-ONLY for now: violations are logged in the
 * browser console but nothing is blocked. Watch production/preview consoles,
 * then promote it to an enforcing `Content-Security-Policy` header.
 *
 * Origins below come from a grep of app/, components/ and lib/:
 * - Fonts, the home video, cursors and artwork are self-hosted under /public.
 * - Remote images normally load through next/image (/_next/image, i.e. 'self');
 *   Shopify rich HTML can still embed <img> straight from the image hosts that
 *   images.remotePatterns allows below.
 * - Blog posts can embed an Instagram post/reel iframe (components/blog/InstagramPost.tsx).
 * - The Next App Router injects inline bootstrap scripts and inline styles, so
 *   'unsafe-inline' is needed until nonces are introduced; dev mode also needs eval.
 * - vercel.live is the Vercel preview toolbar (preview deployments only).
 */
// Mirrors images.remotePatterns below.
const IMAGE_HOSTS = ['https://cdn.shopify.com', 'https://*.myshopify.com', 'https://framerusercontent.com'];

const reportOnlyCsp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''} https://vercel.live`,
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' data: blob: ${IMAGE_HOSTS.join(' ')} https://www.instagram.com https://vercel.live`,
  "font-src 'self' data: https://vercel.live",
  "media-src 'self' blob:",
  `connect-src 'self'${isDev ? ' ws: wss:' : ''} https://vercel.live`,
  'frame-src https://www.instagram.com https://vercel.live',
  "worker-src 'self' blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join('; ');

const securityHeaders = [
  // Clickjacking: enforced now (the full CSP above is report-only).
  { key: 'Content-Security-Policy', value: "frame-ancestors 'none'" },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), accelerometer=(), gyroscope=(), magnetometer=(), browsing-topics=()',
  },
  { key: 'Content-Security-Policy-Report-Only', value: reportOnlyCsp },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  },
  images: {
    // Keep IMAGE_HOSTS (CSP) in sync with these patterns.
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.myshopify.com',
      },
      {
        protocol: 'https',
        hostname: 'cdn.shopify.com',
      },
      {
        protocol: 'https',
        hostname: 'framerusercontent.com',
      },
    ],
  },
};

export default nextConfig;
