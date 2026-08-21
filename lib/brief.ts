import { readFileSync } from 'node:fs'
import { join } from 'node:path'

export type BriefSection = { name: string; filled: string[]; empty: string[] }

/** Поле брифа: `- **Название:** значение`. Двоеточие ВНУТРИ жирного — обязательно. */
const FIELD = /^-\s\*\*(.+?):\*\*\s*(.*)$/
const SECTION = /^##\s+(.+)$/
/** Подводка к таблице или списку: `**Преимущества (5–7 пунктов):**`. Даёт им имя. */
const LEAD_IN = /^\*\*(.+?)\*\*/
/** Строка таблицы: `| ячейка | ячейка |`. */
const TABLE_ROW = /^\s*\|(.+)\|\s*$/
/** Ячейка разделителя шапки: `---`, `:--`, `--:`. */
const RULE_CELL = /^[\s:-]+$/
/** Пункт нумерованного списка: `1. текст`. Текст может быть пустым. */
const LIST_ITEM = /^(\d+)\.\s*(.*)$/
/** Поле внутри пункта списка: `1. **Вопрос:** текст`. */
const ITEM_FIELD = /^\*\*(.+?):\*\*\s*(.*)$/
/** Продолжение пункта с отступом и без дефиса: `   **Ответ:**`. */
const NESTED_FIELD = /^\s+\*\*(.+?):\*\*\s*(.*)$/

/**
 * Считает не только поля `- **Название:**`, но и содержимое таблиц
 * и нумерованных списков: основной объём брифа (услуги, преимущества, FAQ,
 * отзывы, кейсы) лежит именно в них. Считались бы одни поля — раздел
 * «Контент» закрывался бы одной строкой при пустом по существу брифе,
 * а `/new-section` потом переспрашивал бы то, что должно быть в файле.
 *
 * Вопрос и ответ FAQ — ДВЕ разные единицы: `1. **Вопрос:**` и строка
 * `   **Ответ:**` под ним считаются по отдельности. Иначе бриф с вопросами
 * и пустыми ответами показывал бы «готово», а `/new-section` пришёл бы
 * за ответами, не нашёл их и начал выдумывать — при том что правило
 * проекта требует держать ответы FAQ прямо в HTML.
 */
export function parseBrief(text: string): BriefSection[] {
  const sections: BriefSection[] = []
  let current: BriefSection | null = null
  /** Имя ближайшей подводки — им называются строки таблиц и пункты списков. */
  let label = ''
  /** Имя последнего пункта списка — к нему привязываются строки-продолжения. */
  let lastItem = ''
  /** `head` — шапка таблицы ещё не закрыта разделителем, `body` — уже. */
  let table: { name: string; stage: 'head' | 'body'; rows: number } | null = null

  function add(name: string, value: string): void {
    if (!current) return
    if (value.trim()) current.filled.push(name)
    else current.empty.push(name)
  }

  /**
   * Таблица из одной шапки и разделителя — это «не заполнено», а не «нечего
   * считать»: иначе она молча выпадала бы из счёта и раздел выглядел готовым.
   */
  function closeTable(): void {
    if (table && table.stage === 'body' && table.rows === 0) add(table.name, '')
    table = null
  }

  function named(index: string | number): string {
    return label ? `${label} №${index}` : `пункт ${index}`
  }

  for (const line of text.split('\n')) {
    const heading = line.match(SECTION)
    if (heading) {
      closeTable()
      current = { name: heading[1].trim(), filled: [], empty: [] }
      sections.push(current)
      label = ''
      lastItem = ''
      continue
    }

    const row = line.match(TABLE_ROW)
    if (row) {
      const cells = row[1].split('|')
      if (cells.every((cell) => RULE_CELL.test(cell) && cell.includes('-'))) {
        if (table) table.stage = 'body'
        continue
      }
      if (!table) {
        table = { name: label, stage: 'head', rows: 0 }
        continue // первая строка — шапка, её не считаем
      }
      if (table.stage === 'head') continue
      table.rows += 1
      // Строка заполнена, если непуста хоть одна ячейка.
      add(table.name ? `${table.name} №${table.rows}` : `строка ${table.rows}`, cells.join(''))
      continue
    }
    closeTable()

    const field = line.match(FIELD)
    if (field) {
      add(field[1], field[2])
      lastItem = ''
      continue
    }

    const item = line.match(LIST_ITEM)
    if (item) {
      lastItem = named(item[1])
      const inner = item[2].match(ITEM_FIELD)
      add(inner ? `${lastItem}: ${inner[1]}` : lastItem, inner ? inner[2] : item[2])
      continue
    }

    // Строка-продолжение пункта: `**Ответ:**` под `1. **Вопрос:**`.
    const nested = line.match(NESTED_FIELD)
    if (nested) {
      add(lastItem ? `${lastItem}: ${nested[1]}` : nested[1], nested[2])
      continue
    }

    const lead = line.match(LEAD_IN)
    if (lead) {
      label = lead[1].replace(/[\s:]+$/, '')
      lastItem = ''
    }
  }
  closeTable()

  // Разделы без единого пункта в счёт не идут: иначе они печатались бы
  // как «✅ … — 0/0» и выглядели готовыми.
  return sections.filter((section) => section.filled.length + section.empty.length > 0)
}

/** Читает brief.md из корня проекта. Только для сервера и скриптов. */
export function readBriefProgress(): BriefSection[] {
  try {
    return parseBrief(readFileSync(join(process.cwd(), 'brief.md'), 'utf8'))
  } catch {
    return []
  }
}
