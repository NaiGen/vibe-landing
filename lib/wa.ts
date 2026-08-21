import { SITE } from '@/lib/site'

/** Ссылка на WhatsApp с преднаполненным сообщением. */
export function waLink(text: string = SITE.whatsapp.text): string {
  return `https://wa.me/${SITE.whatsapp.number}?text=${encodeURIComponent(text)}`
}
