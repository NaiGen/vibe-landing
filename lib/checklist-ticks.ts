/**
 * Галочки чек-листа первого экрана: «я это собрал». Живут в браузере
 * посетителя и на сайт не влияют — это пометка для себя, а не данные
 * проекта. Бэкенда для них нет намеренно: чек-лист виден на статике
 * в Vercel раньше, чем ученик открывает редактор.
 *
 * Здесь нет ни одного импорта из node: модуль забирает клиентский
 * компонент, и node-модуль в его сборке всё бы уронил.
 *
 * Каждое обращение к хранилищу — в try/catch. `localStorage` бросает
 * на самом доступе к свойству в приватном окне Safari и при выключенных
 * данных сайтов, а на сервере его нет вовсе.
 */
const KEY = 'landing:checklist'

export type Ticks = Record<string, boolean>

export function readTicks(): Ticks {
  try {
    const raw = globalThis.localStorage?.getItem(KEY)
    if (!raw) return {}
    const parsed: unknown = JSON.parse(raw)
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) return {}
    return Object.fromEntries(Object.entries(parsed).map(([id, on]) => [id, on === true]))
  } catch {
    return {}
  }
}

export function writeTicks(ticks: Ticks): void {
  try {
    globalThis.localStorage?.setItem(KEY, JSON.stringify(ticks))
  } catch {
    // Хранилище недоступно — галочка просто не переживёт перезагрузку.
    // Ронять из-за этого страницу нечего: чек-лист читается и без неё.
  }
}
