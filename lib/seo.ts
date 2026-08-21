import type { Metadata } from 'next'
import { SITE } from '@/lib/site'

/**
 * Дата последнего значимого изменения сайта.
 * Правится вручную. НЕ подставлять сюда new Date():
 * тогда при каждой сборке все страницы объявляются изменёнными,
 * и поисковик перестаёт доверять этому сигналу.
 */
export const LAST_UPDATED = '2026-08-21'

/** Канонический адрес: https, без www, без хвостового слеша. */
export function absoluteUrl(path: string): string {
  const withLeadingSlash = path.startsWith('/') ? path : `/${path}`
  const trimmed = withLeadingSlash.length > 1 ? withLeadingSlash.replace(/\/+$/, '') : ''
  return `${SITE.url}${trimmed}`
}

/**
 * Адрес страницы для метадаты: canonical и og:url всегда один и тот же.
 * Ставится НА КАЖДОЙ странице — в корневом layout его быть не может,
 * layout наследуется всеми, и адрес главной молча достался бы остальным.
 *
 * Общие поля openGraph повторены здесь, а не оставлены в layout, потому
 * что Next сливает метадату ПОВЕРХНОСТНО: объект openGraph страницы
 * заменяет layout'овский целиком. Объяви страница один только url —
 * og:site_name, og:locale и og:type пропадут из её HTML.
 *
 * По той же причине страница с pageMeta не наследует общую картинку
 * из app/opengraph-image.tsx: она подмешивается только туда, где свой
 * openGraph не объявлен (resolve-metadata.js, mergeStaticMetadata).
 * Главной это не мешает — файл лежит в её сегменте. Нужна картинка
 * на другой странице — см. скил new-page, шаг 3.
 */
export function pageMeta(path: string): Metadata {
  const url = absoluteUrl(path)
  return {
    alternates: { canonical: url },
    openGraph: { type: 'website', locale: SITE.locale, siteName: SITE.name, url },
  }
}

/** Пускать ли в органическую выдачу. */
export function isIndexable(): boolean {
  return SITE.indexable === 'public'
}

export function robotsMeta(): { index: boolean; follow: boolean } {
  const allowed = isIndexable()
  return { index: allowed, follow: allowed }
}
