/**
 * Единственный файл конфигурации сайта.
 * Заполняется из brief.md — командой /brand-init или вручную.
 * Отсюда данные расходятся в метадату, robots, sitemap, JSON-LD,
 * юридические страницы, футер и кнопки связи.
 */

export type IndexMode =
  | 'private'   // закрыт от всех — режим разработки
  | 'public'    // обычный сайт в поиске
  | 'ads-only'  // только под платный трафик: пускает AdsBot-Google, поиск — нет

export const SITE = {
  name: 'Пример Сервис',
  legalName: 'ТОО «Пример»',
  bin: '000000000000',
  legalAddress: '',

  domain: 'example.kz',
  url: 'https://example.kz',
  locale: 'ru_KZ',

  /** Пока не заполнил сайт — держи 'private'. Иначе черновик уедет в индекс. */
  indexable: 'private' as IndexMode,

  description: '',

  /** display — для показа, raw — для tel: и wa.me. Скобки в ссылке ломают набор. */
  phones: [{ display: '+7 700 000 00 00', raw: '+77000000000' }],
  get primaryPhone() {
    return this.phones[0]
  },

  whatsapp: { number: '77000000000', text: 'Здравствуйте! Хочу узнать про…' },
  email: '',
  telegram: '',

  address: { street: '', city: '', lat: 0, lng: 0, full: '' },
  hours: '',
  mapUrl: '',

  socials: { instagram: '', youtube: '', tiktok: '' },
} as const
