/**
 * Единственное место, где объявлены заглушки шаблона. Кто угодно, кому
 * нужно то же значение — guard-тест (tests/placeholders.test.ts), чек-лист
 * первого экрана (components/dashboard/onboarding-panel.tsx), настройка
 * (setup.mjs) — берёт его отсюда, а не набирает строку заново. Одно место
 * правки вместо нескольких синхронных копий.
 *
 * Сам этот файл заглушки не «забывает заменить» — он их определяет,
 * поэтому guard-тест сканирует lib/, но явно пропускает именно его
 * (см. EXCLUDE_FILES в tests/placeholders.test.ts).
 */
export const PLACEHOLDER = {
  domain: 'example.kz',
  phoneDisplay: '+7 700 000 00 00',
  whatsapp: '77000000000',
  bin: '000000000000',
  name: 'Пример Сервис',
  legalName: 'ТОО «Пример»',
} as const

/** Тот же набор — списком для guard-теста: значение и подсказка по-русски. */
export const PLACEHOLDER_LIST: Array<{ value: string; hint: string }> = [
  { value: PLACEHOLDER.domain, hint: 'домен' },
  { value: PLACEHOLDER.phoneDisplay, hint: 'телефон' },
  { value: PLACEHOLDER.whatsapp, hint: 'телефон для WhatsApp/tel:' },
  { value: PLACEHOLDER.bin, hint: 'БИН' },
  { value: PLACEHOLDER.name, hint: 'название компании' },
  { value: PLACEHOLDER.legalName, hint: 'юридическое лицо' },
]
