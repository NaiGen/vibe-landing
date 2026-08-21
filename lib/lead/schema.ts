import { z } from 'zod'
import { normalizeKzPhone } from '@/lib/phone'

// Русская локаль zod: собственные сообщения ниже важнее и остаются как есть,
// а всё, что zod формулирует сам (не тот тип, пропущенное поле), иначе
// вылезло бы пользователю в интерфейс по-английски.
z.config(z.locales.ru())

/**
 * Одна схема на клиент и сервер. Клиентская проверка — для UX,
 * серверная — потому что форму можно обойти.
 */
export const leadSchema = z.object({
  name: z.string().trim().min(2, 'Укажите имя').max(100),

  // Пример в сообщении сознательно не совпадает дословно с заглушкой телефона.
  phone: z
    .string()
    .transform((value) => normalizeKzPhone(value))
    .refine((value): value is string => value !== null, 'Укажите телефон в формате +7 701 234 56 78'),

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
