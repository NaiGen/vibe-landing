/**
 * Телефон в форме заявки. Разбор и проверка — libphonenumber-js: справочник
 * номеров всех стран с длинами и кодами операторов. Метаданные `min` —
 * те же, что у поля react-phone-number-input на клиенте, поэтому клиент
 * и сервер согласны в каждом случае.
 *
 * Страна по умолчанию — Казахстан: номер без кода страны читается как
 * местный (`8 700 123 45 67`, `700 123 45 67`, `7 700 123 45 67`);
 * с плюсом — любая страна.
 *
 * Своей маски и своего разбора нет намеренно. Все казахстанские номера
 * начинаются с семёрки, и посреди набора нельзя отличить код страны от
 * первой цифры оператора — самодельная маска на этом ломалась. Справочник
 * знает и длину, и коды операторов; цена — новый код оператора, которого
 * справочник ещё не знает, будет отвергнут: тогда обновить `libphonenumber-js`.
 */
import { parsePhoneNumberFromString, validatePhoneNumberLength, type CountryCode } from 'libphonenumber-js/min'

/** Страна для номера без кода страны — и в поле формы, и на сервере. */
export const DEFAULT_COUNTRY: CountryCode = 'KZ'

/** Почему номер не разобран — форма переводит причину в текст ошибки. */
export type PhoneReason = 'empty' | 'short' | 'long' | 'format'

export type PhoneParse = { ok: true; e164: string } | { ok: false; reason: PhoneReason }

export function parsePhone(input: string): PhoneParse {
  if (!/\d/.test(input)) return { ok: false, reason: 'empty' }

  const length = validatePhoneNumberLength(input, DEFAULT_COUNTRY)
  if (length === 'TOO_SHORT') return { ok: false, reason: 'short' }
  if (length === 'TOO_LONG') return { ok: false, reason: 'long' }

  // Длина в норме, но код страны или оператора справочнику неизвестен.
  const parsed = parsePhoneNumberFromString(input, DEFAULT_COUNTRY)
  return parsed?.isValid() ? { ok: true, e164: parsed.number } : { ok: false, reason: 'format' }
}
