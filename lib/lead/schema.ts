import { z } from 'zod'
import { parsePhone, type PhoneReason } from '@/lib/phone'

// Русская локаль zod: собственные сообщения ниже важнее и остаются как есть,
// а всё, что zod формулирует сам (не тот тип, пропущенное поле), иначе
// вылезло бы пользователю в интерфейс по-английски.
z.config(z.locales.ru())

/**
 * Тексты ошибок телефона по причине. Их видит человек в форме лендинга
 * и читает лог сервера; форма многостраничника переводит причину сама.
 * Пример в сообщении сознательно не совпадает с заглушкой телефона.
 */
export const PHONE_ERRORS: Record<PhoneReason, string> = {
  empty: 'Укажите телефон',
  short: 'В номере не хватает цифр: после +7 их должно быть 10',
  long: 'В номере лишние цифры: после +7 их должно быть 10',
  format: 'Укажите телефон в формате +7 701 234 56 78',
}

/**
 * Одна схема на клиент и сервер. Клиентская проверка — для UX,
 * серверная — потому что форму можно обойти.
 */
export const leadSchema = z.object({
  name: z.string().trim().min(2, 'Укажите имя').max(100),

  // Одна проверка на клиент и сервер. Причина едет в `params.reason`,
  // чтобы форма могла подобрать текст на языке страницы.
  phone: z.string().transform((value, ctx) => {
    const parsed = parsePhone(value)
    if (parsed.ok) return parsed.e164
    ctx.addIssue({ code: 'custom', message: PHONE_ERRORS[parsed.reason], params: { reason: parsed.reason } })
    return z.NEVER
  }),

  // Комментарий не отвергаем за длину — режем. Терять заявку из-за
  // многословности клиента нельзя. Пустая строка из формы → undefined.
  comment: z
    .string()
    .trim()
    .transform((value) => (value ? value.slice(0, 1000) : undefined))
    .optional(),

  /** Откуда пришла заявка — имя формы или секции. */
  source: z.string().trim().max(60).optional(),
})

export type Lead = z.infer<typeof leadSchema>
