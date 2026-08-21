import { SITE } from '@/lib/site'

/**
 * Разметка для поисковиков, собранная из lib/site.ts.
 * Идентификаторы стабильные, чтобы узлы ссылались друг на друга,
 * а не дублировали данные.
 *
 * НЕ ДОБАВЛЯТЬ aggregateRating или Review без реального
 * проверяемого источника: выдуманный рейтинг — основание
 * для ручной санкции поисковика.
 */
export function buildGraph(): Record<string, unknown> {
  const organizationId = `${SITE.url}#organization`
  const nodes: Array<Record<string, unknown>> = []

  const sameAsArray = Object.values(SITE.socials).filter(Boolean)
  const sameAs = sameAsArray.length > 0 ? sameAsArray : undefined

  nodes.push({
    '@type': 'Organization',
    '@id': organizationId,
    name: SITE.name,
    legalName: SITE.legalName || undefined,
    url: SITE.url,
    telephone: SITE.primaryPhone.raw,
    email: SITE.email || undefined,
    sameAs,
  })

  // LocalBusiness добавляем только когда адрес действительно заполнен —
  // пустая схема хуже отсутствующей.
  if (SITE.address.full && SITE.address.city) {
    nodes.push({
      '@type': 'LocalBusiness',
      '@id': `${SITE.url}#localbusiness`,
      name: SITE.name,
      parentOrganization: { '@id': organizationId },
      address: {
        '@type': 'PostalAddress',
        streetAddress: SITE.address.street,
        addressLocality: SITE.address.city,
        addressCountry: 'KZ',
      },
      geo:
        SITE.address.lat && SITE.address.lng
          ? { '@type': 'GeoCoordinates', latitude: SITE.address.lat, longitude: SITE.address.lng }
          : undefined,
      telephone: SITE.primaryPhone.raw,
      openingHours: SITE.hours || undefined,
      hasMap: SITE.mapUrl || undefined,
    })
  }

  nodes.push({
    '@type': 'WebSite',
    '@id': `${SITE.url}#website`,
    url: SITE.url,
    name: SITE.name,
    inLanguage: 'ru-KZ',
    publisher: { '@id': organizationId },
  })

  return { '@context': 'https://schema.org', '@graph': nodes }
}

export function JsonLd() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(buildGraph()) }}
    />
  )
}

export type FaqItem = { question: string; answer: string }

/**
 * FAQPage привязан к конкретной странице, поэтому он не входит в общий граф
 * из layout, а рендерится рядом с секцией FAQ — из того же массива вопросов.
 * Ответы обязаны совпадать с видимым текстом: расхождение разметки
 * и контента поисковики считают нарушением.
 */
export function faqGraph(items: FaqItem[], pageUrl: string): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    '@id': `${pageUrl}#faq`,
    isPartOf: { '@id': `${SITE.url}#website` },
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  }
}

export function FaqJsonLd({ items, pageUrl }: { items: FaqItem[]; pageUrl: string }) {
  if (items.length === 0) return null
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(faqGraph(items, pageUrl)) }}
    />
  )
}
