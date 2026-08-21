import type { MetadataRoute } from 'next'
import { absoluteUrl, isIndexable, LAST_UPDATED } from '@/lib/seo'

export default function sitemap(): MetadataRoute.Sitemap {
  if (!isIndexable()) return []

  // Добавляя ИНДЕКСИРУЕМУЮ страницу, добавь её сюда. Скил /new-page делает это сам.
  // Страницам с `robots: { index: false }` здесь не место: Search Console
  // ответит на них ошибкой «Отправленный URL содержит тег noindex».
  // Поэтому политики, оферты и /spasibo в списке нет.
  const paths = ['/']

  return paths.map((path) => ({
    url: absoluteUrl(path),
    lastModified: LAST_UPDATED,
    changeFrequency: 'monthly' as const,
    priority: path === '/' ? 1 : 0.5,
  }))
}
