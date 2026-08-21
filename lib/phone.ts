/**
 * Телефоны Казахстана: 11 цифр, начинаются с 7.
 * Ввод «8…» — привычная местная запись, приводим к «7…».
 */
const LENGTH = 11

function digits(input: string): string {
  const raw = input.replace(/\D/g, '')
  const withCountryCode = raw.startsWith('8') ? `7${raw.slice(1)}` : raw
  return withCountryCode.slice(0, LENGTH)
}

export function maskKzPhone(input: string): string {
  const d = digits(input)
  if (!d) return ''

  const parts = [
    '+7',
    d.length > 1 ? ` (${d.slice(1, 4)}` : '',
    d.length >= 4 ? ')' : '',
    d.length > 4 ? ` ${d.slice(4, 7)}` : '',
    d.length > 7 ? `-${d.slice(7, 9)}` : '',
    d.length > 9 ? `-${d.slice(9, 11)}` : '',
  ]
  return parts.join('')
}

export function normalizeKzPhone(input: string): string | null {
  const d = digits(input)
  if (d.length !== LENGTH || !d.startsWith('7')) return null
  return `+${d}`
}
