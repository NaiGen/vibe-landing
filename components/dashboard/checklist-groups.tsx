'use client'

import { useEffect, useState } from 'react'
import type { ChecklistGroup } from '@/lib/checklist'
import { readTicks, writeTicks, type Ticks } from '@/lib/checklist-ticks'
import { DASHBOARD } from '@/lib/content/dashboard'

/**
 * Список пунктов чек-листа. Классы оформления здесь есть — это то самое
 * исключение из правила «дизайна в шаблоне нет», объяснённое в
 * `onboarding-panel.tsx`: отступы, размер чекбокса и приглушённая
 * подпись у уже записанного. Ни цветов, ни новых токенов.
 *
 * Одиночное поле, заполненное в брифе, отмечено и заблокировано: данные
 * пришли, собирать нечего. Всё остальное — живой чекбокс «я это собрал»,
 * его состояние лежит в localStorage (`lib/checklist-ticks.ts`).
 * У свёрнутого пункта рядом стоит, сколько единиц уже записано: сам он
 * не отмечается, потому что «сколько нужно» знает только человек —
 * см. `foldSection` в `lib/checklist.ts`.
 */
export function ChecklistGroups({ groups }: { groups: ChecklistGroup[] }) {
  const [ticks, setTicks] = useState<Ticks>({})

  // Хранилище читается ТОЛЬКО после монтирования. Компонент статически
  // пререндерен: прочитай мы localStorage в первом рендере — разметка
  // сервера и клиента разошлись бы, и React перерисовал бы дерево целиком.
  useEffect(() => setTicks(readTicks()), [])

  function toggle(id: string, on: boolean): void {
    const next = { ...ticks, [id]: on }
    setTicks(next)
    writeTicks(next)
  }

  return (
    <div className="space-y-5">
      {groups.map((group) => (
        <section key={group.name}>
          <h3 className="mb-2 font-semibold">{group.name}</h3>
          <ul className="space-y-1.5">
            {group.items.map((item) => (
              <li key={item.id}>
                <label className="flex items-start gap-2.5">
                  <input
                    type="checkbox"
                    className="mt-1 size-4 shrink-0"
                    checked={item.done || ticks[item.id] === true}
                    disabled={item.done}
                    onChange={(event) => toggle(item.id, event.target.checked)}
                  />
                  <span className={item.done ? 'opacity-60' : undefined}>
                    {item.label}
                    {item.done ? <span className="text-sm">{DASHBOARD.fromBrief}</span> : null}
                    {item.inBrief > 0 ? (
                      <span className="text-sm opacity-70">{DASHBOARD.inBrief(item.inBrief)}</span>
                    ) : null}
                  </span>
                </label>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  )
}
