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

/** Пускать ли в органическую выдачу. */
export function isIndexable(): boolean {
  return SITE.indexable === 'public'
}

export function robotsMeta(): { index: boolean; follow: boolean } {
  const allowed = isIndexable()
  return { index: allowed, follow: allowed }
}
