import type { MetadataRoute } from 'next';
import { getSiteOrigin } from '@/lib/runtime';

export default function robots(): MetadataRoute.Robots {
  const base = getSiteOrigin();

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: '/archive',
    },
    sitemap: `${base}/sitemap.xml`,
  };
}
