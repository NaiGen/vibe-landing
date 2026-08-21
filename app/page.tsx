import type { Metadata } from 'next'
import { readBriefProgress } from '@/lib/brief'
import { PLACEHOLDER_LIST } from '@/lib/placeholders'
import { pageMeta } from '@/lib/seo'
import { SITE } from '@/lib/site'
import { TestLeadButton } from '@/components/lead/test-lead-button'

// canonical и og:url этой страницы. См. pageMeta в lib/seo.ts —
// в корневом layout адреса нет намеренно.
export const metadata: Metadata = pageMeta('/')

/**
 * Стартовая страница шаблона. Показывает, что осталось заполнить.
 * Когда всё готово — удали этот файл и собери на его месте свой лендинг.
 */
export default function Page() {
  const sections = readBriefProgress()
  const filled = sections.reduce((sum, section) => sum + section.filled.length, 0)
  const total = sections.reduce((sum, section) => sum + section.filled.length + section.empty.length, 0)

  // Панель обязана быть строже guard-теста, а не мягче: сверяем ВСЕ шесть
  // заглушек, иначе она напишет «заполнен» при красном `pnpm test`.
  // Аннотация `string[]` обязательна: SITE закрыт `as const`, поля имеют
  // литеральные типы, и без расширения сравнение со строкой — ошибка TS2367
  // ровно с того момента, как ученик заполнит site.ts.
  const siteValues: string[] = [
    SITE.domain,
    SITE.primaryPhone.display,
    SITE.whatsapp.number,
    SITE.bin,
    SITE.name,
    SITE.legalName,
  ]
  const leftInSite = PLACEHOLDER_LIST.filter((placeholder) => siteValues.includes(placeholder.value))

  return (
    <main>
      <h1>Шаблон лендинга готов к работе</h1>

      <section>
        <h2>1. Заполни бриф — {filled} из {total}</h2>
        <ul>
          {sections.map((section) => (
            <li key={section.name}>
              {section.empty.length === 0 ? '✅' : '⬜'} {section.name}
              {section.empty.length > 0 && <> — не хватает: {section.empty.join(', ')}</>}
            </li>
          ))}
        </ul>
        <p>Файл <code>brief.md</code> в корне проекта.</p>
      </section>

      <section>
        <h2>2. Перенеси данные в проект</h2>
        <p>
          {leftInSite.length === 0 ? '✅' : '⬜'} <code>lib/site.ts</code>{' '}
          {leftInSite.length === 0
            ? 'заполнен'
            : `— осталось заменить: ${leftInSite.map((placeholder) => placeholder.hint).join(', ')}`}
        </p>
        <p>Скажи Claude: <code>/brand-init</code> — он прочитает бриф и заполнит файл сам.</p>
        <p>Проверить: <code>pnpm test</code></p>
      </section>

      <section>
        <h2>3. Проверь приём заявок</h2>
        <p>Telegram пока не нужен — форма работает в демо-режиме и печатает заявку в консоль.</p>
        <TestLeadButton />
      </section>

      <section>
        <h2>Дальше</h2>
        <p>
          Когда пункты 1 и 2 зелёные — <strong>удали этот файл</strong> (<code>app/page.tsx</code>)
          и собери на его месте свой лендинг. Секции клади в <code>components/sections/</code>,
          тексты — в <code>lib/content/</code>.
        </p>
      </section>
    </main>
  )
}
