import { describe, expect, it } from 'vitest'
import { maskKzPhone, normalizeKzPhone } from '@/lib/phone'

describe('maskKzPhone', () => {
  it('форматирует по мере ввода', () => {
    expect(maskKzPhone('7')).toBe('+7')
    expect(maskKzPhone('7700')).toBe('+7 (700')
    expect(maskKzPhone('77001234567')).toBe('+7 (700) 123-45-67')
  })

  it('игнорирует лишние символы и обрезает длину', () => {
    expect(maskKzPhone('+7 (700) 123-45-67abc')).toBe('+7 (700) 123-45-67')
    expect(maskKzPhone('770012345678888')).toBe('+7 (700) 123-45-67')
  })

  it('подставляет 7 вместо ведущей 8', () => {
    expect(maskKzPhone('87001234567')).toBe('+7 (700) 123-45-67')
  })

  it('пустая строка остаётся пустой', () => {
    expect(maskKzPhone('')).toBe('')
  })

  it('позволяет стереть код города: backspace не зацикливается', () => {
    // Пользователь стирает по символу. Каждый шаг обязан менять результат,
    // иначе поле «залипает» и номер нельзя исправить.
    let value = maskKzPhone('77001234567')
    const seen = new Set<string>()

    while (value !== '') {
      expect(seen.has(value), `маска зациклилась на "${value}"`).toBe(false)
      seen.add(value)
      value = maskKzPhone(value.slice(0, -1))
    }
  })
})

describe('normalizeKzPhone', () => {
  it('приводит любой валидный ввод к E.164', () => {
    expect(normalizeKzPhone('+7 (700) 123-45-67')).toBe('+77001234567')
    expect(normalizeKzPhone('8 700 123 45 67')).toBe('+77001234567')
    expect(normalizeKzPhone('77001234567')).toBe('+77001234567')
  })

  it('отвергает короткий номер', () => {
    expect(normalizeKzPhone('7700123')).toBeNull()
  })

  it('отвергает не казахстанский код', () => {
    expect(normalizeKzPhone('+1 202 555 0100')).toBeNull()
  })
})
