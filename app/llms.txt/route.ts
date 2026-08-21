import { SITE } from '@/lib/site'
import { absoluteUrl, isIndexable } from '@/lib/seo'

/** Краткое описание сайта для языковых моделей и AI-краулеров. */
export function GET() {
  if (!isIndexable()) return new Response('Not found', { status: 404 })

  const body = [
    `# ${SITE.name}`,
    // Пустое описание не выводим вовсе: иначе на его месте
    // остаются две пустые строки подряд.
    ...(SITE.description ? [``, SITE.description] : []),
    ``,
    `## Контакты`,
    `- Телефон: ${SITE.primaryPhone.display}`,
    SITE.email ? `- Email: ${SITE.email}` : null,
    SITE.address.full ? `- Адрес: ${SITE.address.full}` : null,
    ``,
    `## Разделы`,
    `- [Главная](${absoluteUrl('/')})`,
    `- [Политика конфиденциальности](${absoluteUrl('/politika-konfidencialnosti')})`,
    `- [Публичная оферта](${absoluteUrl('/publichnaya-oferta')})`,
  ]
    .filter((line) => line !== null)
    .join('\n')

  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'public, max-age=3600' },
  })
}
