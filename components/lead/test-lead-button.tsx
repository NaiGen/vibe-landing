'use client'

import { useState } from 'react'
import { TEST_LEAD } from '@/lib/content/dashboard'
import { Button } from '@/components/ui/button'

/**
 * Кнопка чек-листа (`components/dashboard/onboarding-panel.tsx`): проверяет,
 * доходит ли заявка. Живёт внутри первого экрана и исчезает вместе с ним.
 * Текст — в `lib/content/dashboard.ts` (правило 2) и без слова «терминал»:
 * кнопку жмут на задеплоенном сайте, где никакой команды не запущено.
 */
export function TestLeadButton() {
  const [result, setResult] = useState<string | null>(null)

  async function send() {
    setResult(TEST_LEAD.sending)
    try {
      const response = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: TEST_LEAD.name, phone: '+77001234567', source: 'checklist' }),
      })
      const data = await response.json()
      setResult(
        !data.ok
          ? `❌ ${data.error ?? TEST_LEAD.failedDefault}`
          : data.demo
            ? TEST_LEAD.demoOk
            : data.delivered
              ? TEST_LEAD.deliveredOk
              : TEST_LEAD.deliveredWarn,
      )
    } catch {
      setResult(TEST_LEAD.offline)
    }
  }

  return (
    <div>
      <Button type="button" onClick={send}>{TEST_LEAD.button}</Button>
      {result && <p role="status">{result}</p>}
    </div>
  )
}
