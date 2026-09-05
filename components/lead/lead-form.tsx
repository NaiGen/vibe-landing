'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { PhoneField } from '@/components/lead/phone-field'
import { leadSchema } from '@/lib/lead/schema'

type Status = 'idle' | 'sending'
type Field = 'name' | 'phone'
/** Ошибка формы: текст и, если она про конкретное поле, какое. */
type FormError = { field?: Field; text: string }

/** Текст ошибки показан под своим полем или под формой — поле только помечаем и связываем с ним. */
const ERROR_ID = 'lead-error'

export function LeadForm({ source, onSuccess }: { source?: string; onSuccess?: () => void }) {
  const router = useRouter()
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState<FormError | null>(null)
  const [phone, setPhone] = useState('')

  function invalid(field: Field) {
    return error?.field === field ? { 'aria-invalid': true, 'aria-describedby': ERROR_ID } : {}
  }

  function fieldError(field: Field) {
    return error?.field === field ? <p id={ERROR_ID} role="alert">{error.text}</p> : null
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)

    const data = new FormData(event.currentTarget)
    const payload = {
      name: String(data.get('name') ?? ''),
      // В поле лежит форматированная строка для показа — наружу нужен E.164
      // из состояния формы, а не то, что лежит в самом <input>.
      phone,
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
        <Input
          id="lead-name"
          name="name"
          required
          autoComplete="name"
          onChange={() => {
            if (error?.field === 'name') setError(null)
          }}
          {...invalid('name')}
        />
        {fieldError('name')}
      </div>

      <div>
        <Label htmlFor="lead-phone">Телефон</Label>
        <PhoneField
          id="lead-phone"
          value={phone}
          onChange={(next) => {
            setPhone(next)
            if (error?.field === 'phone') setError(null)
          }}
          invalid={error?.field === 'phone'}
          describedBy={ERROR_ID}
        />
        {fieldError('phone')}
      </div>

      <div>
        <Label htmlFor="lead-comment">Комментарий</Label>
        <Textarea id="lead-comment" name="comment" rows={3} />
      </div>

      {error && !error.field && (
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
