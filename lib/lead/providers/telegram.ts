import type { Lead } from '@/lib/lead/schema'
import { SITE } from '@/lib/site'

function escapeHtml(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

/**
 * Отправка заявки. Провайдер сменный: чтобы уводить заявки в почту или CRM,
 * положи рядом второй файл с такой же сигнатурой и импортируй его в роуте.
 *
 * Без токенов работает демо-режим: заявка печатается в консоль,
 * форма отвечает успехом. Это нужно, чтобы проверять форму
 * до того, как заведён бот.
 */
export async function sendLead(lead: Lead): Promise<{ delivered: boolean; demo: boolean }> {
  const token = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_CHAT_ID

  if (!token || !chatId) {
    console.info('[lead] демо-режим, Telegram не настроен:', lead)
    return { delivered: false, demo: true }
  }

  const text = [
    `<b>Новая заявка — ${escapeHtml(SITE.name)}</b>`,
    ``,
    `Имя: ${escapeHtml(lead.name)}`,
    `Телефон: ${escapeHtml(lead.phone)}`,
    lead.comment ? `Комментарий: ${escapeHtml(lead.comment)}` : null,
    lead.source ? `Форма: ${escapeHtml(lead.source)}` : null,
  ]
    .filter(Boolean)
    .join('\n')

  const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML', disable_web_page_preview: true }),
  })

  if (!response.ok) {
    // Заявку терять нельзя: пишем целиком, чтобы достать из логов Vercel.
    console.error('[lead] Telegram отверг сообщение:', response.status, await response.text().catch(() => ''), lead)
    return { delivered: false, demo: false }
  }

  return { delivered: true, demo: false }
}
