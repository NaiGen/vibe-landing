import { describe, expect, it } from 'vitest'
import { leadSchema } from '@/lib/lead/schema'

describe('leadSchema', () => {
  it('принимает корректную заявку и нормализует телефон', () => {
    const parsed = leadSchema.parse({ name: 'Айгуль', phone: '8 700 123 45 67' })
    expect(parsed.phone).toBe('+77001234567')
    expect(parsed.name).toBe('Айгуль')
  })

  it('обрезает пробелы в имени', () => {
    expect(leadSchema.parse({ name: '  Иван  ', phone: '+77001234567' }).name).toBe('Иван')
  })

  it('отвергает слишком короткое имя', () => {
    expect(() => leadSchema.parse({ name: 'И', phone: '+77001234567' })).toThrow()
  })

  it('отвергает неверный телефон', () => {
    expect(() => leadSchema.parse({ name: 'Иван', phone: '123' })).toThrow()
  })

  it('обрезает слишком длинный комментарий', () => {
    const comment = 'а'.repeat(2000)
    const parsed = leadSchema.parse({ name: 'Иван', phone: '+77001234567', comment })
    expect(parsed.comment).toHaveLength(1000)
  })
})
