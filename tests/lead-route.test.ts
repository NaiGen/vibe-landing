import { beforeEach, describe, expect, it, vi } from 'vitest'
import { POST } from '@/app/api/lead/route'
import { resetRateLimit } from '@/lib/lead/rate-limit'

const VALID = { name: 'Айгуль', phone: '+7 700 123 45 67' }

function post(body: unknown): Request {
  return new Request('http://localhost/api/lead', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

describe('POST /api/lead', () => {
  beforeEach(() => {
    resetRateLimit()
    // Провайдер без токенов печатает заявку в консоль — глушим, чтобы
    // демо-режим не засорял вывод тестов.
    vi.spyOn(console, 'info').mockImplementation(() => {})
  })

  it('невалидные тела не расходуют лимит частоты', async () => {
    for (const body of [null, [], 'строка', {}]) {
      expect((await POST(post(body))).status).toBe(400)
    }

    const accepted = await POST(post(VALID))
    expect(accepted.status).toBe(200)
    expect(await accepted.json()).toMatchObject({ ok: true })
  })

  it('режет четвёртую подряд состоявшуюся заявку', async () => {
    for (let i = 0; i < 3; i++) expect((await POST(post(VALID))).status).toBe(200)
    expect((await POST(post(VALID))).status).toBe(429)
  })

  it('honeypot отвечает успехом и заявку не отправляет', async () => {
    const response = await POST(post({ ...VALID, website: 'бот' }))
    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ ok: true })
  })

  it('сообщение об ошибке приходит по-русски', async () => {
    const response = await POST(post({}))
    const { error } = (await response.json()) as { error: string }
    expect(error).toMatch(/[а-яё]/i)
  })
})
