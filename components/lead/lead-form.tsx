'use client'

import { useState, type FocusEvent, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { leadSchema } from '@/lib/lead/schema'
import { formatPhoneDisplay } from '@/lib/phone'

type Status = 'idle' | 'sending'
type Field = 'name' | 'phone'
/** Ошибка формы: текст и, если она про конкретное поле, какое. */
type FormError = { field?: Field; text: string }

/** Текст ошибки показан под формой — поле только помечаем и связываем с ним. */
const ERROR_ID = 'lead-error'

export function LeadForm({ source, onSuccess }: { source?: string; onSuccess?: () => void }) {
  const router = useRouter()
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState<FormError | null>(null)

  // При уходе из поля показываем номер так, как его поняли: `+7 700 123 45 67`.
  // Не разобрали — оставляем как набрано; причину скажем при отправке.
  function tidyPhone(event: FocusEvent<HTMLInputElement>) {
    const text = formatPhoneDisplay(event.target.value)
    if (text) event.target.value = text
  }

  function invalid(field: Field) {
    return error?.field === field ? { 'aria-invalid': true, 'aria-describedby': ERROR_ID } : {}
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)

    const data = new FormData(event.currentTarget)
    const payload = {
      name: String(data.get('name') ?? ''),
      phone: String(data.get('phone') ?? ''),
      comment: String(data.get('comment') ?? ''),
      website: String(data.get('website') ?? ''),
      source,
    }

    // Проверяем на клиенте — чтобы ошибка показалась сразу, без запроса.
    const parsed = leadSchema.safeParse(payload)
    if (!parsed.success) {
      const issue = parsed.error.issues[0]
      const field = issue?.path[0]
      setError({
        field: field === 'name' || field === 'phone' ? field : undefined,
        text: issue?.message ?? 'Проверьте поля формы',
      })
      return
    }

    setStatus('sending')
    try {
      const response = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const result = await response.json()

      if (!response.ok || !result.ok) {
        setError({ text: result.error ?? 'Не удалось отправить. Попробуйте ещё раз.' })
        return
      }

      window.dataLayer?.push({ event: 'form_submit', form_source: source })
      onSuccess?.()
      router.push('/spasibo')
    } catch {
      setError({ text: 'Нет связи с сервером. Проверьте интернет.' })
    } finally {
      setStatus('idle')
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      {/* Ловушка для ботов: человек этого поля не видит. */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        style={{ position: 'absolute', left: '-9999px' }}
      />

      <div>
        <Label htmlFor="lead-name">Имя</Label>
        <Input id="lead-name" name="name" required autoComplete="name" {...invalid('name')} />
      </div>

      <div>
        <Label htmlFor="lead-phone">Телефон</Label>
        <Input
          id="lead-phone"
          name="phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          required
          onBlur={tidyPhone}
          // Формат номера, а не текст: переводить нечего. Не заглушка телефона
          // из lib/placeholders.ts — иначе guard-тест не позеленеет никогда.
          placeholder="+7 701 234 56 78"
          {...invalid('phone')}
        />
      </div>

      <div>
        <Label htmlFor="lead-comment">Комментарий</Label>
        <Input id="lead-comment" name="comment" />
      </div>

      {error && (
        <p id={ERROR_ID} role="alert">
          {error.text}
        </p>
      )}

      <Button type="submit" disabled={status === 'sending'}>
        {status === 'sending' ? 'Отправляем…' : 'Отправить заявку'}
      </Button>
    </form>
  )
}
