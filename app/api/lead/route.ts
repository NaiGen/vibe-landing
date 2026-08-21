import { NextResponse } from 'next/server'
import { leadSchema } from '@/lib/lead/schema'
import { sendLead } from '@/lib/lead/providers/telegram'
import { checkRateLimit } from '@/lib/lead/rate-limit'

export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ ok: false, error: 'Некорректный запрос' }, { status: 400 })
  }

  // Ловушка для ботов: поле скрыто от человека, но заполняется автозаполнением бота.
  // Отвечаем успехом, чтобы бот не искал обход, но ничего не отправляем.
  if (typeof body === 'object' && body !== null && 'website' in body && body.website) {
    return NextResponse.json({ ok: true })
  }

  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    request.headers.get('x-real-ip') ??
    'unknown'

  if (!checkRateLimit(ip)) {
    return NextResponse.json({ ok: false, error: 'Слишком много заявок. Попробуйте через минуту.' }, { status: 429 })
  }

  const parsed = leadSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: parsed.error.issues[0]?.message ?? 'Проверьте поля формы' },
      { status: 400 },
    )
  }

  try {
    const { demo, delivered } = await sendLead(parsed.data)
    return NextResponse.json({ ok: true, demo, delivered })
  } catch (error) {
    // Заявка не должна пропасть даже при падении провайдера.
    console.error('[lead] провайдер упал:', error, parsed.data)
    return NextResponse.json({ ok: true, demo: false, delivered: false })
  }
}
