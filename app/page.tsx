import type { Metadata } from 'next'
import { HOME } from '@/lib/content/home'
import { pageMeta } from '@/lib/seo'
import { SITE } from '@/lib/site'
import { LeadButton } from '@/components/lead/lead-button'
import { OnboardingPanel } from '@/components/dashboard/onboarding-panel'

// canonical и og:url этой страницы. См. pageMeta в lib/seo.ts —
// в корневом layout адреса нет намеренно.
export const metadata: Metadata = pageMeta('/')

/**
 * Главная. Каркас нарочно пустой: название, описание и кнопка заявки —
 * всё остальное автор сайта собирает сам из `components/sections/`.
 *
 * `<OnboardingPanel/>` рендерится НАД содержимым, пока в `lib/site.ts`
 * остаются заглушки шаблона: это чек-лист того, что собрать до начала
 * работы (см. его doc-комментарий). Удалять этот файл не нужно и не надо —
 * панель исчезает сама, как только заглушек не остаётся.
 */
export default function Page() {
  return (
    <>
      <OnboardingPanel />
      <main>
        <h1>{SITE.name}</h1>
        {SITE.description ? <p>{SITE.description}</p> : null}
        <LeadButton source="home">{HOME.lead}</LeadButton>
      </main>
    </>
  )
}
