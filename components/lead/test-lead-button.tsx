'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'

export function TestLeadButton() {
  const [result, setResult] = useState<string | null>(null)

  async function send() {
    setResult('Отправляем…')
    try {
      const response = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Проверка', phone: '+77001234567', source: 'приборная панель' }),
      })
      const data = await response.json()
      setResult(
        !data.ok
          ? `❌ ${data.error ?? 'Не удалось отправить'}`
          : data.demo
            ? '✅ Форма работает. Демо-режим: заявка напечатана в консоль, где запущен pnpm dev.'
            : data.delivered
              ? '✅ Форма работает, заявка доставлена в Telegram.'
              : '⚠️ Форма работает, но Telegram не подтвердил доставку. Заявка не потеряна — она в логах, где запущен pnpm dev. Проверь TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID и что бот добавлен в чат.',
      )
    } catch {
      setResult('❌ Нет связи с сервером')
    }
  }

  return (
    <div>
      <Button type="button" onClick={send}>Отправить тестовую заявку</Button>
      {result && <p role="status">{result}</p>}
    </div>
  )
}
