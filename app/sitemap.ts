import type { MetadataRoute } from 'next'
import { absoluteUrl, isIndexable, LAST_UPDATED } from '@/lib/seo'

export default function sitemap(): MetadataRoute.Sitemap {
  if (!isIndexable()) return []

  // Добавляя страницу, добавь её сюда. Скил /new-page делает это сам.
  const paths = ['/', '/politika-konfidencialnosti', '/publichnaya-oferta']

  return paths.map((path) => ({
    url: absoluteUrl(path),
    lastModified: LAST_UPDATED,
    changeFrequency: 'monthly' as const,
    priority: path === '/' ? 1 : 0.5,
  }))
}
