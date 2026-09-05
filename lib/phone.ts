/**
 * Телефоны зоны +7 (Казахстан и Россия): код страны 7 и десять цифр номера.
 *
 * Как люди записывают один и тот же номер и что с этим делаем:
 *   +7 700 123 45 67, +7 (700) 123-45-67, +77001234567 — код страны с плюсом
 *   8 700 123 45 67, 87001234567                       — местная запись: 8 = +7
 *   7 700 123 45 67, 77001234567                       — код страны без плюса
 *   700 123 45 67, 7001234567                          — без кода страны, 10 цифр
 *
 * Все казахстанские номера начинаются с семёрки, поэтому «7 в начале — код
 * страны или первая цифра оператора?» решает только длина: 11 цифр — с кодом,
 * 10 — без. Значит, разбирать можно лишь законченный ввод, а не каждое
 * нажатие: маски по нажатию здесь нет намеренно — она принимала `7001234567`
 * за `+7 (001) 234-56-7` и молча отрезала лишнюю цифру при вставке.
 */

/** Почему номер не разобран — форма переводит причину в текст ошибки. */
export type PhoneReason = 'empty' | 'short' | 'long' | 'format'

export type PhoneParse = { ok: true; e164: string } | { ok: false; reason: PhoneReason }

/** Цифр в номере после кода страны. */
const NATIONAL_LENGTH = 10

export function parsePhone(input: string): PhoneParse {
  const d = input.replace(/\D/g, '')
  if (d.length === 0) return { ok: false, reason: 'empty' }

  // С плюсом человек записал код страны сам — принимаем только +7.
  if (input.trim().startsWith('+')) {
    return d.startsWith('7') ? national(d.slice(1)) : { ok: false, reason: 'format' }
  }

  // 11 цифр без плюса: впереди код страны 7 или местная восьмёрка.
  if (d.length === NATIONAL_LENGTH + 1) {
    return d[0] === '7' || d[0] === '8' ? national(d.slice(1)) : { ok: false, reason: 'format' }
  }

  // 10 цифр с восьмёрки — это «8 и девять цифр», недобранный местный номер,
  // а не российский городской без восьмёрки: такой пусть пишут с +7.
  if (d.length === NATIONAL_LENGTH && d[0] === '8') return { ok: false, reason: 'short' }

  return national(d)
}

function national(digits: string): PhoneParse {
  if (digits.length < NATIONAL_LENGTH) return { ok: false, reason: 'short' }
  if (digits.length > NATIONAL_LENGTH) return { ok: false, reason: 'long' }
  return { ok: true, e164: `+7${digits}` }
}

/** Формат для показа человеку: `+7 705 123 45 67`. Без скобок — они уедут в tel:-ссылки и разметку. */
export function formatPhoneDisplay(input: string): string | null {
  const parsed = parsePhone(input)
  if (!parsed.ok) return null
  const n = parsed.e164.slice(2)
  return `+7 ${n.slice(0, 3)} ${n.slice(3, 6)} ${n.slice(6, 8)} ${n.slice(8)}`
}
