'use client'

import PhoneInput from 'react-phone-number-input/max'
import 'react-phone-number-input/style.css'
import ru from 'react-phone-number-input/locale/ru.json'
import { Input } from '@/components/ui/input'
import { DEFAULT_COUNTRY, trimTrunkDigit } from '@/lib/phone'

/**
 * Поле телефона с выбором страны: флаг, код страны подставляется сам,
 * номер форматируется по мере набора, наружу уходит E.164 (`+77001234567`)
 * или пустая строка. Страна по умолчанию — Казахстан, но не зашита:
 * посетитель выбирает любую, формат и проверка подстраиваются.
 * Привычка дописывать «7» или «8» перед номером поверх уже подставленного
 * кода страны снимается тем же `trimTrunkDigit`, что и на сервере.
 *
 * Само поле ввода — наш `Input` из components/ui, чтобы выглядело как
 * остальные; раскладку «флаг + поле» даёт style.css библиотеки. Подписи
 * и названия стран в селекторе — по-русски (`labels={ru}`) на обеих
 * языковых версиях: казахской локали у библиотеки нет.
 * Флаг грузится картинкой с CDN библиотеки (country-flag-icons на GitHub
 * Pages) — без сети пропадёт только картинка, поле работает.
 */
export function PhoneField({
  id,
  value,
  onChange,
  invalid,
  describedBy,
}: {
  id: string
  value: string
  onChange: (value: string) => void
  invalid?: boolean
  describedBy?: string
}) {
  return (
    <PhoneInput
      international
      defaultCountry={DEFAULT_COUNTRY}
      labels={ru}
      value={value}
      onChange={(next) => onChange(trimTrunkDigit(next ?? ''))}
      inputComponent={Input}
      numberInputProps={{
        id,
        name: 'phone',
        required: true,
        autoComplete: 'tel',
        'aria-invalid': invalid || undefined,
        'aria-describedby': invalid ? describedBy : undefined,
      }}
    />
  )
}
