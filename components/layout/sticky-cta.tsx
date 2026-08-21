'use client'

import { Phone, MessageCircle } from 'lucide-react'
import { SITE } from '@/lib/site'
import { waLink } from '@/lib/wa'
import { openLeadModal } from '@/components/lead/modal-controller'

/**
 * Панель связи. Оформления нет — только рабочие ссылки.
 * Свой вид добавь классами Tailwind, когда будешь делать дизайн.
 */
export function StickyCta() {
  return (
    <div role="group" aria-label="Связаться">
      <a href={`tel:${SITE.primaryPhone.raw}`} data-cta="phone">
        <Phone aria-hidden="true" />
        Позвонить
      </a>

      <a href={waLink()} target="_blank" rel="noopener noreferrer" data-cta="whatsapp">
        <MessageCircle aria-hidden="true" />
        WhatsApp
      </a>

      <button type="button" onClick={() => openLeadModal('sticky-cta')}>
        Оставить заявку
      </button>
    </div>
  )
}
