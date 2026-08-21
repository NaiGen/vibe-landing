import { readBriefProgress } from '@/lib/brief'
import { PLACEHOLDER } from '@/lib/placeholders'
import { SITE } from '@/lib/site'
import { TestLeadButton } from '@/components/lead/test-lead-button'

/**
 * Стартовая страница шаблона. Показывает, что осталось заполнить.
 * Когда всё готово — удали этот файл и собери на его месте свой лендинг.
 */
export default function Page() {
  const sections = readBriefProgress()
  const filled = sections.reduce((sum, section) => sum + section.filled.length, 0)
  const total = sections.reduce((sum, section) => sum + section.filled.length + section.empty.length, 0)

  // Приведение к string обязательно: SITE закрыт `as const`, поля имеют
  // литеральные типы, и сравнение без него — ошибка TS2367 «типы не пересекаются»
  // ровно с того момента, как ученик заполнит site.ts.
  const siteReady =
    (SITE.domain as string) !== PLACEHOLDER.domain && (SITE.name as string) !== PLACEHOLDER.name

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
          {siteReady ? '✅' : '⬜'} <code>lib/site.ts</code>{' '}
          {siteReady ? 'заполнен' : 'ещё содержит заглушки'}
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
