import { describe, expect, it } from 'vitest'
import { absoluteUrl } from '@/lib/seo'
import { SITE } from '@/lib/site'

describe('absoluteUrl', () => {
  it('склеивает путь с доменом', () => {
    expect(absoluteUrl('/uslugi')).toBe(`${SITE.url}/uslugi`)
  })

  it('срезает хвостовой слеш', () => {
    expect(absoluteUrl('/uslugi/')).toBe(`${SITE.url}/uslugi`)
  })

  it('корень отдаёт без слеша на конце', () => {
    expect(absoluteUrl('/')).toBe(SITE.url)
  })

  it('добавляет ведущий слеш, если его забыли', () => {
    expect(absoluteUrl('kontakty')).toBe(`${SITE.url}/kontakty`)
  })
})
