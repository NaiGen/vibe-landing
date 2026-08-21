import { describe, expect, it } from 'vitest'
import { buildGraph, faqGraph } from '@/components/seo/json-ld'
import { SITE } from '@/lib/site'

describe('buildGraph', () => {
  const graph = buildGraph()
  const nodes = graph['@graph'] as Array<Record<string, unknown>>
  const types = nodes.map((node) => node['@type'])

  it('содержит Organization и WebSite', () => {
    expect(types).toContain('Organization')
    expect(types).toContain('WebSite')
  })

  it('даёт Organization стабильный идентификатор', () => {
    const org = nodes.find((node) => node['@type'] === 'Organization')
    expect(org?.['@id']).toBe(`${SITE.url}#organization`)
  })

  it('не выдумывает рейтинг', () => {
    expect(JSON.stringify(graph)).not.toContain('aggregateRating')
  })

  it('добавляет LocalBusiness тогда и только тогда, когда заполнен адрес', () => {
    const hasAddress = Boolean(SITE.address.full && SITE.address.city)
    expect(types.includes('LocalBusiness')).toBe(hasAddress)
  })
})

describe('faqGraph', () => {
  const items = [
    { question: 'Сколько стоит?', answer: 'От 100 000 тенге.' },
    { question: 'Как быстро?', answer: 'От трёх дней.' },
  ]
  const graph = faqGraph(items, absoluteUrlForTest())

  function absoluteUrlForTest() {
    return `${SITE.url}/`
  }

  it('строит FAQPage', () => {
    expect(graph['@type']).toBe('FAQPage')
  })

  it('переносит каждый вопрос в mainEntity', () => {
    const entities = graph.mainEntity as Array<Record<string, unknown>>
    expect(entities).toHaveLength(2)
    expect(entities[0].name).toBe('Сколько стоит?')
    expect((entities[0].acceptedAnswer as Record<string, unknown>).text).toBe('От 100 000 тенге.')
  })
})
