import type { MetadataRoute } from 'next'
import { SITE } from '@/lib/site'
import { absoluteUrl } from '@/lib/seo'

export default function robots(): MetadataRoute.Robots {
  // Только под платный трафик: Google Ads обязан просканировать страницу
  // для проверки качества объявления, а органическая выдача — нет.
  if (SITE.indexable === 'ads-only') {
    return {
      rules: [
        { userAgent: 'AdsBot-Google', allow: '/' },
        { userAgent: 'AdsBot-Google-Mobile', allow: '/' },
        { userAgent: '*', disallow: '/' },
      ],
    }
  }

  if (SITE.indexable === 'private') {
    return { rules: [{ userAgent: '*', disallow: '/' }] }
  }

  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/api/', '/spasibo'] }],
    sitemap: absoluteUrl('/sitemap.xml'),
  }
}
