/**
 * Телефон в форме заявки. Разбор и проверка — libphonenumber-js: справочник
 * номеров всех стран с длинами и кодами операторов. Метаданные `max` (точные
 * коды; `min` принимал несуществующие) — те же, что у поля
 * react-phone-number-input/max на клиенте, поэтому клиент и сервер согласны.
 *
 * Номер без плюса читается как номер зоны +7 (Казахстан и Россия):
 * `8 700 123 45 67`, `700 123 45 67`, `7 700 123 45 67`, `7 906 403 26 80`.
 * С плюсом — любая страна.
 *
 * Своей маски и своего разбора нет намеренно. Все казахстанские номера
 * начинаются с семёрки, и посреди набора нельзя отличить код страны от
 * первой цифры оператора — самодельная маска на этом ломалась. Справочник
 * знает и длину, и коды операторов; цена — новый код оператора, которого
 * справочник ещё не знает, будет отвергнут: тогда обновить `libphonenumber-js`.
 */
import { parsePhoneNumberFromString, type CountryCode } from 'libphonenumber-js/max'

/** Флаг по умолчанию в поле формы. Разбор на страну не опирается. */
export const DEFAULT_COUNTRY: CountryCode = 'KZ'

/** Зона +7: номер без плюса читается как местный. */
const DEFAULT_CALLING_CODE = '7'

/** Цифр в номере зоны +7 после кода страны. */
const NATIONAL_LENGTH = 10

/** Почему номер не разобран — форма переводит причину в текст ошибки. */
export type PhoneReason = 'empty' | 'short' | 'long' | 'format'

export type PhoneParse = { ok: true; e164: string } | { ok: false; reason: PhoneReason }

/**
 * Привычка зоны +7 — набирать «8 700…» или «7 700…», даже когда `+7` уже
 * стоит в поле. Одиннадцать цифр после +7, первая 8 или 7, а без неё номер
 * настоящий — значит, это лишняя ведущая цифра, убираем. Десять цифр не
 * трогаем: `+7 812…` бывает настоящим питерским городским. Если без первой
 * цифры номер не настоящий — оставляем как есть: пусть ошибка скажет «лишние».
 */
export function trimTrunkDigit(e164: string): string {
  if (!/^\+7[78]\d{10}$/.test(e164)) return e164
  const shorter = `+7${e164.slice(3)}`
  return parsePhoneNumberFromString(shorter)?.isValid() ? shorter : e164
}

export function parsePhone(input: string): PhoneParse {
  if (!/\d/.test(input)) return { ok: false, reason: 'empty' }

  // С плюсом — сводим к E.164 и снимаем лишнюю ведущую цифру; без плюса
  // справочник сам снимет местную восьмёрку или код зоны.
  const text = input.trim().startsWith('+') ? trimTrunkDigit(`+${input.replace(/\D/g, '')}`) : input
  const parsed = parsePhoneNumberFromString(text, { defaultCallingCode: DEFAULT_CALLING_CODE })
  if (!parsed) return { ok: false, reason: 'format' }
  if (parsed.isValid()) return { ok: true, e164: parsed.number }

  // Номер зоны +7 не признан — скажем точнее, чем «не распознан».
  if (parsed.countryCallingCode !== DEFAULT_CALLING_CODE) return { ok: false, reason: 'format' }
  const digits = parsed.nationalNumber
  // «8 и девять цифр» — недобранный местный номер, а не городской с кодом 8xx:
  // настоящие 8xx справочник признал бы строкой выше.
  const national = digits.length === NATIONAL_LENGTH && digits.startsWith('8') ? digits.slice(1) : digits
  if (national.length < NATIONAL_LENGTH) return { ok: false, reason: 'short' }
  if (national.length > NATIONAL_LENGTH) return { ok: false, reason: 'long' }
  return { ok: false, reason: 'format' }
}
