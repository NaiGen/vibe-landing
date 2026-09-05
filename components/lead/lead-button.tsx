'use client'

import type { ReactNode } from 'react'
import { openLeadModal } from '@/components/lead/modal-controller'

/**
 * Кнопка заявки для содержимого страниц. Открывает ту же модалку, что
 * и StickyCta, через общую событийную шину — без своего состояния
 * и без обращения к API формы.
 *
 * `source` уходит в заявку отметкой, откуда пришёл посетитель
 * (см. lib/lead/schema.ts) — по нему видно, какая секция приводит заявки.
 * Оформления нет: свой вид добавь классами, когда будешь делать дизайн.
 */
export function LeadButton({ source, children }: { source?: string; children: ReactNode }) {
  return (
    <button type="button" onClick={() => openLeadModal(source)}>
      {children}
    </button>
  )
}
