import { describe, expect, it } from 'vitest'
import { formatPhoneDisplay, parsePhone } from '@/lib/phone'

describe('parsePhone — один номер во всех привычных записях', () => {
  it.each([
    '+7 700 123 45 67',
    '+7 (700) 123-45-67',
    '+77001234567',
    '8 700 123 45 67',
    '87001234567',
    '7 700 123 45 67',
    '77001234567',
    '700 123 45 67',
    '7001234567',
  ])('«%s» → +77001234567', (input) => {
    expect(parsePhone(input)).toEqual({ ok: true, e164: '+77001234567' })
  })

  // Зона +7 общая с Россией: мобильный без восьмёрки — те же 10 цифр.
  it('российский мобильный без восьмёрки', () => {
    expect(parsePhone('912 345 67 89')).toEqual({ ok: true, e164: '+79123456789' })
  })
})

describe('parsePhone — причина отказа', () => {
  it.each([
    ['', 'empty'],
    ['abc', 'empty'],
    ['+', 'empty'],
    ['7700123', 'short'],
    ['+7', 'short'],
    // 8 и девять цифр — недобрали, а не городской без восьмёрки.
    ['8 700 123 45 6', 'short'],
    ['770012345678', 'long'],
    // Лишняя цифра — ошибка, а не молчаливое обрезание.
    ['+7 7001 234 56 78', 'long'],
    ['+1 202 555 0100', 'format'],
    ['+996 555 11 22 33', 'format'],
    // 11 цифр, но не с 7 и не с 8.
    ['91234567890', 'format'],
  ] as const)('«%s» → %s', (input, reason) => {
    expect(parsePhone(input)).toEqual({ ok: false, reason })
  })
})

describe('formatPhoneDisplay', () => {
  it('приводит любую запись к одному виду', () => {
    expect(formatPhoneDisplay('87051234567')).toBe('+7 705 123 45 67')
    expect(formatPhoneDisplay('+7 (705) 123-45-67')).toBe('+7 705 123 45 67')
    expect(formatPhoneDisplay('7051234567')).toBe('+7 705 123 45 67')
  })

  it('неразобранный номер не форматирует', () => {
    expect(formatPhoneDisplay('7705123')).toBeNull()
    expect(formatPhoneDisplay('+996 555 11 22 33')).toBeNull()
  })
})
