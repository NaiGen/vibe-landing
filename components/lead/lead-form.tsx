'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { leadSchema } from '@/lib/lead/schema'
import { maskKzPhone } from '@/lib/phone'

type Status = 'idle' | 'sending'

export function LeadForm({ source, onSuccess }: { source?: string; onSuccess?: () => void }) {
  const router = useRouter()
  const [status, setStatus] = useState<Status>('idle')
  const [phone, setPhone] = useState('')
  const [error, setError] = useState<string | null>(null)

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
      setError(parsed.error.issues[0]?.message ?? 'Проверьте поля формы')
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
        setError(result.error ?? 'Не удалось отправить. Попробуйте ещё раз.')
        return
      }

      window.dataLayer?.push({ event: 'form_submit', form_source: source })
      onSuccess?.()
      router.push('/spasibo')
    } catch {
      setError('Нет связи с сервером. Проверьте интернет.')
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
        <Input id="lead-name" name="name" required autoComplete="name" />
      </div>

      <div>
        <Label htmlFor="lead-phone">Телефон</Label>
        <Input
          id="lead-phone"
          name="phone"
          inputMode="tel"
          autoComplete="tel"
          required
          value={phone}
          onChange={(event) => setPhone(maskKzPhone(event.target.value))}
          placeholder="+7 (700) 000-00-00"
        />
      </div>

      <div>
        <Label htmlFor="lead-comment">Комментарий</Label>
        <Input id="lead-comment" name="comment" />
      </div>

      {error && <p role="alert">{error}</p>}

      <Button type="submit" disabled={status === 'sending'}>
        {status === 'sending' ? 'Отправляем…' : 'Отправить заявку'}
      </Button>
    </form>
  )
}
