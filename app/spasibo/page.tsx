import type { Metadata } from 'next'
import Link from 'next/link'
import { SITE } from '@/lib/site'
import { pageMeta } from '@/lib/seo'

export const metadata: Metadata = {
  ...pageMeta('/spasibo'),
  title: 'Заявка отправлена',
  // Страница благодарности не должна попадать в поиск:
  // человек может зайти на неё мимо формы и решить, что заявка ушла.
  robots: { index: false, follow: false },
}

export default function Page() {
  return (
    <main>
      <h1>Заявка отправлена</h1>
      <p>Мы свяжемся с вами в ближайшее время.</p>
      <p>
        Если вопрос срочный, звоните:{' '}
        <a href={`tel:${SITE.primaryPhone.raw}`}>{SITE.primaryPhone.display}</a>
      </p>
      <Link href="/">Вернуться на главную</Link>
    </main>
  )
}
