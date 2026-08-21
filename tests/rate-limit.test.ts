import { beforeEach, describe, expect, it, vi } from 'vitest'
import { checkRateLimit, resetRateLimit } from '@/lib/lead/rate-limit'

describe('checkRateLimit', () => {
  beforeEach(() => {
    resetRateLimit()
    vi.useRealTimers()
  })

  it('пропускает первые три запроса и режет четвёртый', () => {
    expect(checkRateLimit('1.1.1.1')).toBe(true)
    expect(checkRateLimit('1.1.1.1')).toBe(true)
    expect(checkRateLimit('1.1.1.1')).toBe(true)
    expect(checkRateLimit('1.1.1.1')).toBe(false)
  })

  it('считает лимит отдельно для каждого адреса', () => {
    checkRateLimit('1.1.1.1')
    checkRateLimit('1.1.1.1')
    checkRateLimit('1.1.1.1')
    expect(checkRateLimit('2.2.2.2')).toBe(true)
  })

  it('разрешает снова после окончания окна', () => {
    vi.useFakeTimers()
    for (let i = 0; i < 3; i++) checkRateLimit('3.3.3.3')
    expect(checkRateLimit('3.3.3.3')).toBe(false)
    vi.advanceTimersByTime(60_001)
    expect(checkRateLimit('3.3.3.3')).toBe(true)
  })
})
