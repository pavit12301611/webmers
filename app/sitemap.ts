import type { MetadataRoute } from 'next';
import { getListings } from '@/lib/data';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000').replace(/\/$/, '');
  const staticPages = ['', '/marketplace', '/editor', '/privacy', '/terms', '/cookies', '/support'].map((path) => ({ url: `${baseUrl}${path || '/'}`, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: path === '' ? 1 : 0.7 }));
  const listings = await getListings();
  return [...staticPages, ...listings.map((listing) => ({ url: `${baseUrl}/listing/${listing.id}`, lastModified: listing.createdAt, changeFrequency: 'weekly' as const, priority: 0.8 }))];
}
