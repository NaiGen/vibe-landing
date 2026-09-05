import { describe, expect, it } from 'vitest'
import { leadSchema, PHONE_ERRORS } from '@/lib/lead/schema'

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

  it('принимает номер без кода страны', () => {
    expect(leadSchema.parse({ name: 'Иван', phone: '7001234567' }).phone).toBe('+77001234567')
  })

  // Решение владельца, пересмотренное им же: номер любой страны с плюсом
  // принимается, Казахстан — страна по умолчанию, а не ограничение.
  it('иностранный номер с плюсом принимается', () => {
    expect(leadSchema.parse({ name: 'Иван', phone: '+996 555 112233' }).phone).toBe('+996555112233')
  })

  // Форма многостраничника переводит причину сама — ей нужен код, не текст.
  // Не «770012345678» (11 лишних цифр вместо 10 положенных): справочник
  // считает это неизвестной длиной для всех стран зоны +7 и даёт format,
  // а не long — настоящий long только на числах, невозможных ни для одной
  // страны в принципе.
  it('причина ошибки телефона едет в params', () => {
    const result = leadSchema.safeParse({ name: 'Иван', phone: '700123456789012345' })
    const issue = result.success ? undefined : result.error.issues[0]
    expect(issue?.code === 'custom' ? issue.params?.reason : undefined).toBe('long')
    expect(issue?.message).toBe(PHONE_ERRORS.long)
  })

  it('обрезает слишком длинный комментарий', () => {
    const comment = 'а'.repeat(2000)
    const parsed = leadSchema.parse({ name: 'Иван', phone: '+77001234567', comment })
    expect(parsed.comment).toHaveLength(1000)
  })

  // Свои сообщения важнее локали: их видит человек в форме.
  it('свои сообщения не перебиты локалью zod', () => {
    expect(message({ name: 'И', phone: '+77001234567' })).toBe('Укажите имя')
    expect(message({ name: 'Иван', phone: '123' })).toBe('В номере не хватает цифр')
  })

  // Всё, что zod формулирует сам, по умолчанию по-английски,
  // а это сообщение уходит пользователю в интерфейс.
  it('сообщения самого zod по-русски', () => {
    expect(message(null)).toMatch(/[а-яё]/i)
    expect(message({})).toMatch(/[а-яё]/i)
  })
})

function message(input: unknown): string | undefined {
  const result = leadSchema.safeParse(input)
  return result.success ? undefined : result.error.issues[0]?.message
}
